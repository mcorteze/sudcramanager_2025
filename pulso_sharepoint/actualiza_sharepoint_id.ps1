# Función para leer config.ini
function Get-IniContent {
    param([string]$filePath)
    $ini = @{}
    if (Test-Path $filePath) {
        foreach ($line in Get-Content $filePath) {
            $line = $line.Trim()
            # Ignorar vacíos, comentarios [ ]
            if ($line -and -not $line.StartsWith("#") -and -not $line.StartsWith("[")) {
                $key, $value = $line -split '=', 2
                if ($key -and $value) { 
                    $ini[$key.Trim()] = $value.Trim() 
                }
            }
        }
    }
    return $ini
}

# 1. Cargar Configuración
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$configPath = Join-Path $scriptPath "config.ini"

if (-not (Test-Path $configPath)) {
    # Si no hay log.txt aun, intentamos crearlo en la carpeta del script
    $logFile = Join-Path $scriptPath "log.txt"
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | CRITICAL | No se encuentra el archivo config.ini" | Out-File $logFile -Append
    exit
}

$config = Get-IniContent $configPath
$logFile = Join-Path $scriptPath "log.txt"

function Write-SimpleLog {
    param([string]$Status, [string]$Detail)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp | $Status | $Detail" | Out-File -FilePath $logFile -Append -Encoding UTF8
}

try {
    # 2. Extraer ID de Sharepoint
    $pathTxt = $config["PATH_TXT_ORAL"]
    $idSharepoint = "NULL"
    
    if ($null -ne $pathTxt -and $pathTxt -ne "") {
        if (Test-Path $pathTxt) {
            $contenido = Get-Content $pathTxt -Raw
            if ($contenido -match "\['(\d+)'\]") {
                $idSharepoint = $matches[1]
            } else {
                Write-SimpleLog "WARN" "Formato de ID no valido en TXT: $contenido"
            }
        } else {
            Write-SimpleLog "WARN" "No se encuentra el archivo de ID: $pathTxt"
        }
    } else {
        Write-SimpleLog "ERROR" "La variable PATH_TXT_ORAL no esta definida en config.ini"
    }

    # 3. Extraer Tickets Pendientes
    $pathTickets = $config["PATH_TICKETS"]
    $ticketsPendientes = "NULL"
    
    if ($null -ne $pathTickets -and $pathTickets -ne "") {
        if (Test-Path $pathTickets) {
            $contTickets = Get-Content $pathTickets -Raw
            if ($contTickets -match "outputs\('(\d+)'\)") {
                $ticketsPendientes = $matches[1]
            } else {
                Write-SimpleLog "WARN" "Formato de Tickets no valido en TXT: $contTickets"
            }
        } else {
            Write-SimpleLog "WARN" "No se encuentra el archivo de Tickets: $pathTickets"
        }
    } else {
        Write-SimpleLog "ERROR" "La variable PATH_TICKETS no esta definida en config.ini"
    }

    # 4. Enviar a Base de Datos
    $dbPass = $config["DB_PASS"]
    if ($null -eq $dbPass) { $dbPass = "fec4a5n5" } # Fallback por si acaso
    
    $env:PGPASSWORD = $dbPass
    $nombreEquipo = $config["NOMBRE_EQUIPO"]
    if ($null -eq $nombreEquipo) { $nombreEquipo = "sudcra" }

    # Manejo de timestamps
    $spHora = if ($idSharepoint -ne "NULL") { "NOW()" } else { "NULL" }
    $tkHora = if ($ticketsPendientes -ne "NULL") { "NOW()" } else { "NULL" }

    $sqlQuery = "INSERT INTO pulsos_log (nombre_equipo, id_lista_sharepoint, id_lista_sharepoint_hora, tickets_pendientes, tickets_hora) VALUES ('$nombreEquipo', $idSharepoint, $spHora, $ticketsPendientes, $tkHora);"
    
    $pathPsql = $config["PATH_PSQL"]
    if ($null -eq $pathPsql) { $pathPsql = "psql" }

    $output = & $pathPsql -h $config["DB_HOST"] -p $config["DB_PORT"] -U $config["DB_USER"] -d $config["DB_NAME"] -c "$sqlQuery" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-SimpleLog "OK" "ID SP: $idSharepoint | Tickets: $ticketsPendientes"
    } else {
        Write-SimpleLog "ERROR" "DB Error: $($output -join ' ')"
    }
} catch {
    Write-SimpleLog "CRITICAL" $_.Exception.Message
} finally {
    $env:PGPASSWORD = $null
}
