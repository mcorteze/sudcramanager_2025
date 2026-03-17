@echo off
setlocal enabledelayedexpansion

:: Obtener la ruta de la carpeta actual
set SCRIPT_DIR=%~dp0
if "%SCRIPT_DIR:~-1%"=="\" set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

set CONFIG_FILE=%SCRIPT_DIR%\config.ini
set XML_TEMPLATE=%SCRIPT_DIR%\pulso_sharepoint.xml.template
set XML_FINAL=%SCRIPT_DIR%\pulso_sharepoint.xml

echo ====================================================
echo   INSTALADOR DE PULSO - ACTUALIZA SHAREPOINT ID
echo ====================================================
echo .

:: 1. Verificar archivos esenciales
if not exist "%CONFIG_FILE%" ( echo [ERROR] No se encuentra 'config.ini'. & pause & exit )
if not exist "%XML_TEMPLATE%" ( echo [ERROR] No se encuentra 'pulso_sharepoint.xml.template'. & pause & exit )

echo Procesando configuracion...

:: 2. Procesar el XML reemplazando variables (usando PowerShell en una sola linea para evitar errores)
powershell -Command "$config=@{}; Get-Content '%CONFIG_FILE%' | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { $config[$matches[1].Trim()] = $matches[2].Trim() } }; (Get-Content '%XML_TEMPLATE%') -replace 'BASE_PATH', '%SCRIPT_DIR%' -replace 'INTERVALO_PULSO', $config['INTERVALO'] -replace 'PULSO_NAME', $config['NOMBRE_PULSO'] | Set-Content '%XML_FINAL%'"

:: 3. Obtener el nombre para el registro de la tarea
set PULSO_NAME=pulso_sharepoint
for /f "tokens=2 delims==" %%a in ('findstr /i "NOMBRE_PULSO" "%CONFIG_FILE%"') do set PULSO_NAME=%%a
set PULSO_NAME=%PULSO_NAME: =%

echo Registrando pulso '%PULSO_NAME%' en el sistema...
schtasks /create /xml "%XML_FINAL%" /tn "%PULSO_NAME%" /f

if %errorlevel% equ 0 (
    echo.
    echo ====================================================
    echo   ¡PULSO INSTALADO EXITOSAMENTE!
    echo   Nombre: %PULSO_NAME%
    echo   El proceso correra en segundo plano.
    echo ====================================================
) else (
    echo.
    echo [ERROR] No se pudo instalar. Intenta ejecutar como ADMINISTRADOR.
)

pause
