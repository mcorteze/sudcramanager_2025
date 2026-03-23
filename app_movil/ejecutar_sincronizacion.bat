@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "sincronizar_nube.ps1"
pause
