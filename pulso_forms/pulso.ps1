# Función para leer el archivo config.ini de forma simple
function Get-IniContent {
    param([string]$filePath)
    $ini = @{}
    if (Test-Path $filePath) {
        foreach ($line in Get-Content $filePath) {
            $line = $line.Trim()
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

# Cargar configuración
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$configPath = Join-Path $scriptPath "config.ini"
$config = Get-IniContent $configPath

# Variables desde el archivo de configuración
$pathIdLista = $config["PATH_ID_LISTA"]
$pathProceso = $config["PATH_PROCESO"]
$pathTransfer = $config["PATH_TRANSFER"]
$nombreEquipo = $config["NOMBRE_EQUIPO"]
$pathPsql = $config["PATH_PSQL"]

# Configuración de Base de Datos
$dbHost = $config["DB_HOST"]
$dbName = $config["DB_NAME"]
$dbUser = $config["DB_USER"]
$dbPass = $config["DB_PASS"]
$dbPort = $config["DB_PORT"]

$logFile = Join-Path $scriptPath "log.txt"

# Función para escribir en el log (UNA SOLA LINEA)
function Write-SimpleLog {
    param([string]$Status, [string]$Detail)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp | $Status | $Detail"
    Write-Host $logEntry
    $logEntry | Out-File -FilePath $logFile -Append -Encoding UTF8
}

if (-not $config.Count) {
    Write-SimpleLog "ERROR" "No se pudo cargar config.ini o esta vacio"
    exit
}

try {
    # 1. Leer ID Lista
    if (Test-Path $pathIdLista) {
        $idLista = Get-Content $pathIdLista -Raw
        $idLista = $idLista.Trim()
        if ($idLista -notmatch '^\d+$') {
            Write-SimpleLog "ERROR" "ID no valido en $pathIdLista"
            exit
        }
    }
    else {
        Write-SimpleLog "ERROR" "No existe $pathIdLista"
        exit
    }

    # 2. Contar archivos SOLO en la carpeta principal
    $cantidadImagenes = 0
    if (Test-Path $pathProceso) {
        $cantidadImagenes = (
            Get-ChildItem -Path $pathProceso -File |
            Where-Object { $_.Extension -match '^\.(jpg|jpeg)$' }
        ).Count
    }

    $cantidadTransfer = 0
    if (Test-Path $pathTransfer) {
        $cantidadTransfer = (Get-ChildItem -Path $pathTransfer -File).Count
    }

    # 3. Enviar a Base de Datos
    $env:PGPASSWORD = $dbPass
    $sqlQuery = "INSERT INTO pulsos_log (nombre_equipo, ruta_carpeta, imagenes_preparacion, archivos_transfer, marca_temporal, id_lista) VALUES ('$nombreEquipo', '$pathProceso', $cantidadImagenes, $cantidadTransfer, NOW(), $idLista);"
    
    $psqlOutput = & $pathPsql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "$sqlQuery" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-SimpleLog "OK" "ID:$idLista | ImgPrep:$cantidadImagenes | Transf:$cantidadTransfer | Host:$nombreEquipo"
    }
    else {
        Write-SimpleLog "ERROR" "psql falló: $($psqlOutput -join ' ')"
    }

}
catch {
    Write-SimpleLog "CRITICAL" $($_.Exception.Message)
}
finally {
    $env:PGPASSWORD = $null
}