@echo off
setlocal enabledelayedexpansion

:: Obtener la ruta de la carpeta donde esta el script
set SCRIPT_DIR=%~dp0
:: Quitar la barra final de la ruta si existe
if "%SCRIPT_DIR:~-1%"=="\" set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

set XML_TEMPLATE=%SCRIPT_DIR%\tarea_pulso.xml.template
set XML_FINAL=%SCRIPT_DIR%\tarea_pulso.xml

echo ====================================================
echo   INSTALADOR DE TAREA PROGRAMADA - SUDCRA PULSO
echo ====================================================
echo.

:: 1. Verificar si el template existe
if not exist "%XML_TEMPLATE%" (
    echo [ERROR] No se encuentra el archivo tarea_pulso.xml.template.
    pause
    exit
)

echo Preparando configuracion de tarea para la ruta:
echo %SCRIPT_DIR%
echo.

:: 2. Crear el XML final reemplazando BASE_PATH por la ruta actual
:: Usamos PowerShell para el reemplazo ya que es mas robusto con rutas
powershell -Command "(Get-Content '%XML_TEMPLATE%') -replace 'BASE_PATH', '%SCRIPT_DIR%' | Set-Content '%XML_FINAL%'"

echo Registrando tarea 'Pulso_SUDCRA' en el sistema...
echo.

:: 3. Comando para crear la tarea importando el XML final (/f para sobreescribir si ya existe)
schtasks /create /xml "%XML_FINAL%" /tn "Pulso_SUDCRA" /f

if %errorlevel% equ 0 (
    echo.
    echo ====================================================
    echo   ¡TAREA INSTALADA EXITOSAMENTE!
    echo   Ubicacion: %SCRIPT_DIR%
    echo   La tarea se ejecutara de forma invisible cada 5 min.
    echo ====================================================
) else (
    echo.
    echo [ERROR] No se pudo instalar la tarea. 
    echo Asegurate de ejecutar este archivo como ADMINISTRADOR.
    echo.
)

pause
