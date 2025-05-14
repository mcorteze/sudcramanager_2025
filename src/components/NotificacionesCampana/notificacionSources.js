// Este archivo define qué notificaciones mostrar
const notificacionSources = [
    {
      id: 'pendientes_aprobacion',
      label: 'Secciones pendientes de aprobación',
      apiUrl: 'http://localhost:3001/api/informes/pendientes',
      redirectUrl: '/pendientes',
    },
    {
      id: 'mail_seccion_pendientes',
      label: 'Mail de sección pendientes',
      apiUrl: 'http://localhost:3001/api/informes/pendientes-mail',
      redirectUrl: '/pendientes',
    },
    {
        id: 'mail_alumnos_pendientes',
        label: 'Mail de alumnos pendientes',
        apiUrl: 'http://localhost:3001/api/informes/pendientes-mail-alumnos',
        redirectUrl: '/pendientes',
    },
    {
        id: 'secciones_sininscritos',
        label: 'Secciones sin inscritos',
        apiUrl: 'http://localhost:3001/api/secciones_sin_inscritos',
        redirectUrl: '/pendientes',
    },
      {
        id: 'listado_tickets',
        label: 'Tickets',
        apiUrl: 'http://localhost:3001/api/solicitudes_abierto',
        redirectUrl: '/tickets',
    },
  ];
  
  export default notificacionSources;
  