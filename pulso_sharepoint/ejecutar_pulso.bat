@echo off
set SCRIPT_DIR=%~dp0
powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "%SCRIPT_DIR%actualiza_sharepoint_id.ps1"
exit
