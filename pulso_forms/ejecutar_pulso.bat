@echo off
set SCRIPT_DIR=%~dp0
powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "%SCRIPT_DIR%pulso.ps1"
exit
