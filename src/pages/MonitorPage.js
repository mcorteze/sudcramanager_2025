import React from 'react';
import { FormOutlined, DownloadOutlined, SlidersOutlined, WindowsOutlined, ApartmentOutlined, BuildOutlined, ProfileOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './AccesosPage.css';

export default function AccesosPage() {
  // Datos específicos para las tarjetas
  const cardsData = [
    {
        title: "Rastrear hoja de respuesta",
        subtitle: "Hojas de respuestas",
        description: "Ver registros de imágenes por id de subida presentes en la BBDD.",
        icon: <FileImageOutlined />,
        link: "/imagenes",
    },
    {
        title: "Listado lecturas HR con filtros",
        subtitle: "Hojas de respuestas",
        description: "Ver listado de imágenes por id correlativo presentes en la BBDD.",
        icon: <FileImageOutlined />,
        link: "/monitoreo_lista",
    },
    {
        title: "Listado de las últimas 30 lecturas HR",
        subtitle: "Calidad Forms30",
        description: "Ver listado de las últimas 30 lecturas de imágenes",
        icon: <FileImageOutlined />,
        link: "/forms100",
    },
    {
      title: "Buscar planillas leídas",
      subtitle: "Planillas",
      description: "Ver registros de planillas a partir del nombre del archivo.",
      icon: <FileExcelOutlined />,
      link: "/seguimientoplanilla",
    },
    {
      title: "Explorar resultados por Asignatura",
      subtitle: "Explorar",
      description: "Navegar en estructura académica.",
      icon: <ApartmentOutlined />,
      link: "/monitorasig",
    },
    {
      title: "Explorar resultados por Sede",
      subtitle: "Explorar",
      description: "Navegar en estructura académica.",
      icon: <ApartmentOutlined />,
      link: "/monitorsede",
    },
    {
      title: "Filtro de registros por error",
      subtitle: "Registros de error",
      description: "Permite buscar lecturas con error usando criterios.",
      icon: <ApartmentOutlined />,
      link: "/errores_lista",
    },
  ];

  return (
    <div className="page-full">
      <h1>Recursos de monitoreo</h1>
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
