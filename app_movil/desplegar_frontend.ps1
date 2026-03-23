# Script para desplegar el frontend a GitHub Pages
$ErrorActionPreference = "Stop"

$clientPath = "c:\ProyectosAnalista\sudcra_manager_2025_0320\app_movil\sudcrareositorioapp\client"

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor DarkCyan
Write-Host "INICIANDO DESPLIEGUE A GH-PAGES" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor DarkCyan
Write-Host ""

try {
    # 1. Navegar al directorio del cliente
    if (-not (Test-Path $clientPath)) {
        throw "No se encontró el directorio: $clientPath"
    }
    Set-Location $clientPath
    Write-Host "[1/4] Carpeta actual: $(Get-Location)" -ForegroundColor Gray

    # 2. Verificar estado de Git
    Write-Host "[2/4] Verificando estado de Git..." -ForegroundColor Gray
    $remote = git remote get-url origin
    Write-Host "      Remote actual: $remote" -ForegroundColor DarkGray

    # 3. Asegurarse de que las dependencias estén instaladas
    Write-Host "[3/4] Instalando dependencias necesarias..." -ForegroundColor Gray
    npm install

    # 4. Ejecutar el comando de despliegue
    Write-Host "[4/4] Iniciando build y despliegue..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "El build de npm falló." }
    
    Write-Host "      Subiendo a GitHub (rama gh-pages)..." -ForegroundColor Yellow
    npx gh-pages -d dist
    if ($LASTEXITCODE -ne 0) { throw "El comando gh-pages falló. Revisa tus credenciales." }

    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor DarkCyan
    Write-Host "¡DESPLIEGUE COMPLETADO CON EXITO!" -ForegroundColor Green
    Write-Host "URL: https://mcorteze.github.io/sudcrarepositorioapp_client" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor DarkCyan
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "[ERROR] El proceso fallo: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "POSIBLES SOLUCIONES:" -ForegroundColor Yellow
    Write-Host "1. Asegurate de tener conexion a Internet."
    Write-Host "2. RECOMENDACION: Hemos cambiado el remote a HTTPS para mayor facilidad."
    Write-Host "3. URL: https://github.com/mcorteze/sudcrarepositorioapp_client.git"
}
