# sincronizar_nube.ps1
# VERSION COMPLETA - CLONACION TOTAL DE DATA PARA LOGSPAGE

function Get-IniContent {
    param([string]$filePath)
    $ini = @{}
    if (Test-Path $filePath) {
        foreach ($line in Get-Content $filePath) {
            $line = $line.Trim()
            if ($line -and -not $line.StartsWith("#") -and -not $line.StartsWith("[")) {
                $key, $value = $line -split '=', 2
                if ($key -and $value) { $ini[$key.Trim()] = $value.Trim() }
            }
        }
    }
    return $ini
}

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$config = Get-IniContent (Join-Path $scriptPath "config.ini")

$psql = $config["PATH_PSQL"]
$lH, $lU, $lD, $lP = $config["DB_HOST"], $config["DB_USER"], $config["DB_NAME"], $config["DB_PASS"]
$cH, $cU, $cD, $cP = $config["CLOUD_HOST"], $config["CLOUD_USER"], $config["CLOUD_DB"], $config["CLOUD_PASS"]

Write-Host "--- Sincronización Total en Progreso ---" -ForegroundColor Cyan

# 0. FORZAR ESQUEMA (Solo una vez si cambian tipos de datos)
# $env:PGPASSWORD = $cP; & $psql -h $cH -U $cU -d $cD -c "DROP TABLE IF EXISTS nube_logs, nube_pendientes, nube_lecturas_form;" | Out-Null

# 1. TABLAS EN LA NUBE (Schema)
$env:PGPASSWORD = $cP
$sqlSchema = "
CREATE TABLE IF NOT EXISTS nube_logs (id_log SERIAL PRIMARY KEY, nombre_equipo TEXT, marca_temporal TIMESTAMPTZ, imagenes_preparacion INT, archivos_transfer TEXT, tickets_pendientes INT, tickets_hora TIMESTAMPTZ, id_lista_sharepoint TEXT, id_lista_sharepoint_hora TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS nube_pendientes (id INT PRIMARY KEY, pend_aprob INT, pend_mail_secc INT, pend_mail_alum INT, sin_inscritos INT, actualizado_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS nube_id_lista (cod_programa TEXT PRIMARY KEY, id_lista INT);
CREATE TABLE IF NOT EXISTS nube_lecturas_form (cod_programa TEXT PRIMARY KEY, imagen_recepcionada TEXT, imagen_calificada TEXT, marca_temporal_calificacion TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS nube_actividad (id SERIAL PRIMARY KEY, tipo TEXT, hora TEXT, total INT);
"
& $psql -h $cH -U $cU -d $cD -c "$sqlSchema" | Out-Null

# Función para añadir zona horaria si falta
function Fix-TS {
    param($ts)
    if (-not $ts) { return "NULL" }
    if ($ts -match "[\+\-]\d{2}(:\d{2})?$") { return "'$ts'" }
    return "'$ts-03'"
}

# 2. EXTRACCION LOCAL
$env:PGPASSWORD = $lP

# A. Pendientes
$sqlPend = "SELECT (SELECT count(*) FROM informes_secciones as iss JOIN eval e ON e.id_eval = iss.id_eval JOIN secciones s ON s.id_seccion = iss.id_seccion JOIN docentes d ON s.rut_docente = d.rut_docente WHERE iss.mail_enviado = false AND d.mail_doc <> 'no_mail' AND e.maildisponible = false), (SELECT count(*) FROM informes_secciones WHERE mail_enviado = false), (SELECT count(*) FROM informe_alumnos WHERE marca_temporal IS NOT NULL AND mail_enviado = FALSE), (SELECT count(*) FROM (SELECT s.id_seccion FROM secciones s LEFT JOIN inscripcion i ON s.id_seccion = i.id_seccion GROUP BY s.id_seccion HAVING COUNT(i.id_inscripcion) = 0) as sin);"
$resPend = & $psql -h $lH -U $lU -d $lD -t -A -F "|" -c "$sqlPend"

# B. Logs (Últimos 30)
$sqlLogsRaw = "SELECT nombre_equipo, marca_temporal, imagenes_preparacion, archivos_transfer, tickets_pendientes, tickets_hora, id_lista_sharepoint, id_lista_sharepoint_hora FROM pulsos_log ORDER BY id DESC LIMIT 30;"
$resLogs = & $psql -h $lH -U $lU -d $lD -t -A -F "|" -c "$sqlLogsRaw"

# C. ID Lista
$sqlIdL = "SELECT asig.cod_programa, MAX(img.id_lista) FROM (SELECT cod_asig, MAX(id_lista) as id_lista FROM imagenes WHERE id_lista <= 19000 GROUP BY cod_asig) img JOIN asignaturas asig ON asig.cod_asig = img.cod_asig GROUP BY asig.cod_programa;"
$resIdL = & $psql -h $lH -U $lU -d $lD -t -A -F "|" -c "$sqlIdL"

# D. Lecturas Form
$sqlForm = "WITH RankedPrograms AS (SELECT asig.cod_programa, me.imagen, al.marcatemporal, ROW_NUMBER() OVER (PARTITION BY asig.cod_programa ORDER BY al.marcatemporal DESC) AS rn FROM matricula_eval me JOIN archivosleidos al ON al.id_archivoleido = me.id_archivoleido JOIN eval e ON e.id_eval = me.id_eval JOIN asignaturas asig ON asig.cod_asig = e.cod_asig WHERE al.tipoarchivo = '.txt'), imagenes_ordenadas AS (SELECT asig.cod_programa, i.id_lista AS imagen_recepcionada, ROW_NUMBER() OVER (PARTITION BY asig.cod_programa ORDER BY i.id_lista DESC) AS rn FROM imagenes i JOIN asignaturas asig ON asig.cod_asig = i.cod_asig WHERE i.id_lista <= 19000) SELECT io.cod_programa, io.imagen_recepcionada, CASE WHEN rp.imagen ~ '^[0-9]+_' THEN REGEXP_SUBSTR(rp.imagen, '^[0-9]+') ELSE NULL END, rp.marcatemporal FROM imagenes_ordenadas io LEFT JOIN RankedPrograms rp ON io.cod_programa = rp.cod_programa AND rp.rn = 1 WHERE io.rn = 1;"
$resForm = & $psql -h $lH -U $lU -d $lD -t -A -F "|" -c "$sqlForm"

# E. Actividad
$sqlCal = "WITH c AS (SELECT date_trunc('hour', lectura_fecha) + INTERVAL '10 min' * FLOOR(EXTRACT(MINUTE FROM lectura_fecha) / 10) AS s, COUNT(*) as t FROM calificaciones_obtenidas WHERE lectura_fecha >= CURRENT_DATE GROUP BY 1) SELECT to_char(s, 'HH24:MI'), t FROM c;"
$resCal = & $psql -h $lH -U $lU -d $lD -t -A -F "|" -c "$sqlCal"
$sqlInf = "WITH c AS (SELECT date_trunc('hour', marca_temp_mail) + INTERVAL '10 min' * FLOOR(EXTRACT(MINUTE FROM marca_temp_mail) / 10) AS s, COUNT(*) as t FROM informes_secciones WHERE marca_temp_mail >= CURRENT_DATE GROUP BY 1) SELECT to_char(s, 'HH24:MI'), t FROM c;"
$resInf = & $psql -h $lH -U $lU -d $lD -t -A -F "|" -c "$sqlInf"

# 3. CARGA A LA NUBE
$env:PGPASSWORD = $cP
Write-Host "Cargando datos a Neon..." -ForegroundColor Yellow

# Pendientes
$v = $resPend.Trim() -split '\|'
& $psql -h $cH -U $cU -d $cD -c "TRUNCATE nube_pendientes; INSERT INTO nube_pendientes (id, pend_aprob, pend_mail_secc, pend_mail_alum, sin_inscritos) VALUES (1, $($v[0]), $($v[1]), $($v[2]), $($v[3]));" | Out-Null

# Logs
& $psql -h $cH -U $cU -d $cD -c "TRUNCATE nube_logs;" | Out-Null
foreach ($l in $resLogs) {
    if ($l -match "\|") {
        $f = $l -split '\|' | ForEach-Object { $_.Trim() }
        $sql = "INSERT INTO nube_logs (nombre_equipo, marca_temporal, imagenes_preparacion, archivos_transfer, tickets_pendientes, tickets_hora, id_lista_sharepoint, id_lista_sharepoint_hora) VALUES ('$($f[0])', $(Fix-TS $f[1]), $(if($f[2]){$f[2]}else{"NULL"}), $(if($f[3]){"'$($f[3])'"}else{"NULL"}), $(if($f[4]){$f[4]}else{"NULL"}), $(Fix-TS $f[5]), $(if($f[6]){"'$($f[6])'"}else{"NULL"}), $(Fix-TS $f[7]));"
        & $psql -h $cH -U $cU -d $cD -c "$sql" | Out-Null
    }
}

# ID Lista
& $psql -h $cH -U $cU -d $cD -c "TRUNCATE nube_id_lista;" | Out-Null
foreach ($l in $resIdL) {
    if ($l -match "\|") {
        $f = $l -split '\|'
        & $psql -h $cH -U $cU -d $cD -c "INSERT INTO nube_id_lista (cod_programa, id_lista) VALUES ('$($f[0].Trim())', $($f[1].Trim()));" | Out-Null
    }
}

# Lecturas Form
& $psql -h $cH -U $cU -d $cD -c "TRUNCATE nube_lecturas_form;" | Out-Null
foreach ($l in $resForm) {
    if ($l -match "\|") {
        $f = $l -split '\|' | ForEach-Object { $_.Trim() }
        $sql = "INSERT INTO nube_lecturas_form (cod_programa, imagen_recepcionada, imagen_calificada, marca_temporal_calificacion) VALUES ('$($f[0])', '$($f[1])', $(if($f[2]){"'$($f[2])'"}else{"NULL"}), $(Fix-TS $f[3]));"
        & $psql -h $cH -U $cU -d $cD -c "$sql" | Out-Null
    }
}

# Actividad
& $psql -h $cH -U $cU -d $cD -c "TRUNCATE nube_actividad;" | Out-Null
foreach ($l in $resCal) {
    if ($l -match "\|") { $f = $l -split '\|'; & $psql -h $cH -U $cU -d $cD -c "INSERT INTO nube_actividad (tipo, hora, total) VALUES ('calificaciones', '$($f[0].Trim())', $($f[1].Trim()));" | Out-Null }
}
foreach ($l in $resInf) {
    if ($l -match "\|") { $f = $l -split '\|'; & $psql -h $cH -U $cU -d $cD -c "INSERT INTO nube_actividad (tipo, hora, total) VALUES ('informes', '$($f[0].Trim())', $($f[1].Trim()));" | Out-Null }
}

Write-Host "Sincronización Total Exitosa." -ForegroundColor Green
