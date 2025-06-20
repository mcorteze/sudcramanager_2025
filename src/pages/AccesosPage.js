import React from 'react';
import { FormOutlined, DownloadOutlined, SlidersOutlined, WindowsOutlined, ApartmentOutlined, BuildOutlined, ProfileOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './AccesosPage.css';

export default function AccesosPage() {
  // Datos específicos para las tarjetas
  const cardsData = [
    {
      title: "Ver tablas de especificaciones cargadas",
      subtitle: "Tabla de especificaciones",
      description: "Permite ver todas las tablas de especificaciones cargadas en el SUDCRA.",
      icon: <ProfileOutlined />,
      link: "/tablas_cargadas",
    },
    {
      title: "Cargar tablas de especificaciones",
      subtitle: "Cargar tabla de especificaciones",
      description: "Permite cargar tablas de especificaciones.",
      icon: <ProfileOutlined />,
      link: "/cargar_tablas",
    },
    {
      title: "Rastrear planilla",
      subtitle: "Planillas",
      description: "Ver registros de planillas a partir del nombre del archivo.",
      icon: <FileExcelOutlined />,
      link: "/seguimientoplanilla",
    },
    {
      title: "Rastrear hoja de respuesta",
      subtitle: "Hojas de respuestas",
      description: "Ver registros de imágenes a partir id de subida en la lista de sharepoint.",
      icon: <FileImageOutlined />,
      link: "/imagenes",
    },
    {
      title: "Apps",
      subtitle: "Enlaces",
      description: "Aplicaciones de Microsoft de SUDCRA",
      icon: <WindowsOutlined />,
      link: "/enlaces",
    },
    {
      title: "Apuntes",
      subtitle: "Notas importantes",
      description: "Apuntes funcionamiento SUDCRA",
      icon: <FormOutlined />,
      link: "/apuntes",
    },
    {
      title: "Monitor por Asignatura",
      subtitle: "Explorar",
      description: "Navegar en estructura académica.",
      icon: <ApartmentOutlined />,
      link: "/monitorasig",
    },
    {
      title: "Monitor por Sede",
      subtitle: "Explorar",
      description: "Navegar en estructura académica.",
      icon: <ApartmentOutlined />,
      link: "/monitorsede",
    },
    {
      title: "Descargar calificaciones",
      subtitle: "Descargas",
      description: "Descarga de calificaciones por programa y asignatura.",
      icon: <DownloadOutlined />,
      link: "/extraernotas",
    },
    {
      title: "Mapa de Boxplots",
      subtitle: "Visualización",
      description: "Boxplots de calificaciones por programa/evaluaciones",
      icon: <SlidersOutlined />,
      link: "/estadisticas",
    },
    {
      title: "Dashboard",
      subtitle: "Visualización",
      description: "Dashboard de monitoreo.",
      icon: <SlidersOutlined />,
      link: "/dashboard",
    },
    {
      title: "Tareas",
      subtitle: "Gestión",
      description: "Gestion de tareas.",
      icon: <FormOutlined />,
      link: "/tareas",
    },
    {
      title: "Zona de pruebas",
      subtitle: "Desarrollo",
      description: "Seccion para desarrollar nuevos componentes.",
      icon: <BuildOutlined />,
      link: "/pruebas",
    },
    {
      title: "Resumen procesamiento",
      subtitle: "Visualización",
      description: "Tablas de resumen de procesos.",
      icon: <BuildOutlined />,
      link: "/resumen_procesos",
    },
    {
      title: "Asignar docentes masivo",
      subtitle: "Modificar registros",
      description: "Permite asignar rut de docente a seccion a partir de .xlsx",
      icon: <FormOutlined />,
      link: "/subirdocenteseccionmasivo",
    },
    {
      title: "Leer tickets",
      subtitle: "Tickets",
      description: "Permite leer información resumida de SUDCRA Tickets (Polling 5m)",
      icon: <FormOutlined />,
      link: "/tickets",
    },
    {
      title: "Crea estructura de carpetas",
      subtitle: "Estructura de carpetas",
      description: "Permite crear una estructura de carpetas para administrar imágenes de escáner.",
      icon: <FormOutlined />,
      link: "/crea_estructura_carpetas",
    },
  ];

  return (
    <div className="page-full">
      <h1>Acceso a recursos</h1>
      <div className="muro">
        <div className="fbcards-container">
          {cardsData.map((card, index) => (
            <Link to={card.link} key={index} className="fbcards-card"> {/* Envolvemos la tarjeta con Link */}
              <div className="fbcards-card-header">
                <span className="fbcards-card-subtitle">{card.subtitle}</span>
                <span className="fbcards-card-icon">{card.icon}</span>
              </div>
              <h3 className="fbcards-card-title">{card.title}</h3>
              <p className="fbcards-card-description">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
