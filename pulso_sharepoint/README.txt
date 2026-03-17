Actualiza Sharepoint ID - Pulso PowerShell
==========================================

Este paquete reemplaza la version de Python para evitar dependencias en otros equipos. Utiliza PowerShell nativo y psql de la instalacion de PostgreSQL local.

CONTENIDO DE LA CARPETA:
------------------------
1. config.ini          : ARCHIVO DE CONFIGURACION. Configura aqui la ruta del TXT de OneDrive y los datos de la DB.
2. actualiza_sharepoint_id.ps1 : Script de logica (Extrae ID del TXT y lo inserta en la DB).
3. ejecutar_pulso.bat  : Lanzador invisible (opcional para pruebas manuales).
4. instalar_pulso.bat  : Instalador automatico que registra el pulso en Windows.
5. pulso_sharepoint.xml.template : Plantilla para el Programador de Tareas.
6. log.txt             : Registro de ejecuciones (una linea por pulso).

PASOS PARA EL DESPLIEGUE:
-------------------------
1. EDITAR CONFIG.INI:
   - PATH_TXT_ORAL: Ruta completa al archivo 'idlista.txt' en OneDrive.
   - NOMBRE_EQUIPO: Identificador (por defecto 'sudcra').
   - PATH_PSQL: Ruta a psql.exe (ej: C:\Program Files\PostgreSQL\17\bin\psql.exe).

2. INSTALAR:
   - Haz clic derecho sobre 'instalar_pulso.bat' y selecciona "EJECUTAR COMO ADMINISTRADOR".
   - Esto configurara las rutas y activara el pulso en segundo plano.

VERIFICACION:
-------------
- Revisa 'log.txt' para confirmar que el ID se esta extrayendo e insertando correctamente.
- El formato del TXT debe ser el de Power Automate: string(triggerBody()?['358']) 4.Save
- En el Programador de Tareas de Windows el proceso aparece oculto (Hidden).
