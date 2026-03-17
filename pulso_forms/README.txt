SUDCRA Pulso - Monitor de Estado de Equipos (V2 Centralizada)
==============================================================

Este paquete monitorea la actividad de los equipos y envía reportes automáticos a la base de datos central cada 5 minutos de forma invisible.

CONTENIDO DE LA CARPETA:
------------------------
1. config.ini          : ARCHIVO PRINCIPAL. Aquí se definen todas las variables y rutas.
2. pulso.ps1           : Script de lógica (lee config.ini y envía datos).
3. ejecutar_pulso.bat  : Lanzador invisible para la tarea programada.
4. instalar_tarea.bat  : Instalador automático (reemplaza la configuración manual del XML).
5. tarea_pulso.xml.template : Plantilla base para el programador de tareas.
6. log.txt             : Registro histórico de ejecuciones (una línea por pulso).

INSTRUCCIONES DE DESPLIEGUE (3 PASOS):
--------------------------------------
1. COPIAR: Copia esta carpeta 'pulso' a cualquier ubicación del equipo.

2. CONFIGURAR (config.ini):
   - Abre 'config.ini' con el Bloc de notas.
   - NOMBRE_EQUIPO: Pon el nombre identificador del equipo.
   - PATH_PSQL: Verifica la ruta de instalación de PostgreSQL (ej: Versión 17).
   - RUTAS: Verifica que PATH_ID_LISTA, PATH_PROCESO y PATH_TRANSFER existan.
   - DB: Los datos de conexión a la base de datos ya vienen pre-configurados.

3. INSTALAR (instalar_tarea.bat):
   - Haz clic derecho sobre 'instalar_tarea.bat' y selecciona "EJECUTAR COMO ADMINISTRADOR".
   - El instalador detectará automáticamente la ubicación actual de la carpeta, configurará el XML y activará la tarea cada 5 minutos.

MONITOREO:
----------
- Para verificar que todo funcione, abre 'log.txt'. 
- Una línea "OK" significa que los datos ya están en la base de datos central.
- Una línea "ERROR" te dirá exactamente qué variable o conexión está fallando.

REQUISITOS:
-----------
- PostgreSQL instalado en el equipo.
- Ejecutar el instalador con permisos de Administrador.
