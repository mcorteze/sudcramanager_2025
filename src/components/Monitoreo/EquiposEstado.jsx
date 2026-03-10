import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tag, Typography, Tooltip } from 'antd';
import { MdLaptopChromebook } from "react-icons/md";
import { TbBrandOnedrive } from "react-icons/tb";
import dayjs from 'dayjs';
import './EquiposEstado.css';

const { Title } = Typography;

const EquiposEstado = () => {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const obtenerDatos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/equipos_estado');
      const data = response.data;

      const equiposFiltrados = Object.values(
        data.reduce((acc, equipo) => {
          const existente = acc[equipo.nombre_equipo];
          const nuevaFecha = new Date(equipo.marca_temporal);
          if (!existente || new Date(existente.marca_temporal) < nuevaFecha) {
            acc[equipo.nombre_equipo] = equipo;
          }
          return acc;
        }, {})
      );

      setEquipos(equiposFiltrados);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response) {
        setError(`Error del servidor: ${err.response.status} - ${err.response.data}`);
      } else if (err.request) {
        setError('No se recibió respuesta del servidor. Verifica que el backend esté corriendo.');
      } else {
        setError(`Error al configurar la solicitud: ${err.message}`);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
    const interval = setInterval(() => {
      obtenerDatos();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const esEnLinea = (marcaTemporal) => {
    const seisMinutosAtras = new Date(new Date().getTime() - 6 * 60 * 1000);
    return new Date(marcaTemporal) >= seisMinutosAtras;
  };

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="equipos-error">{error}</p>;

  return (
    <div className="equipos-wrapper">
      <Title level={5} style={{ marginBottom: '0px' }}>
        Monitor de red de equipos
      </Title>
      <Typography.Paragraph className="equipos-actualizacion">
        {lastUpdated
          ? `Última actualización: ${dayjs(lastUpdated).format('HH:mm:ss')}, Polling (5s) | PC Input (5m)`
          : 'Actualizando...'}
      </Typography.Paragraph>

      <div className="equipos-contenedor">
        {equipos.map((equipo, index) => {
          const enLinea = esEnLinea(equipo.marca_temporal);
          const nombreMinuscula = equipo.nombre_equipo.toLowerCase();

          let Icono = MdLaptopChromebook;
          if (nombreMinuscula.startsWith('onedrive')) {
            Icono = TbBrandOnedrive;
          }

          const tooltipContent = (
            <div>
              <div>Estado: {enLinea ? 'Online' : 'Offline'}</div>
              <div>Staging area: {equipo.imagenes_pendientes_1}</div>
            </div>
          );

          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={tooltipContent}>
              <div
                className={`equipos-rectangulo ${
                  enLinea ? 'equipos-rectangulo-online' : 'equipos-rectangulo-offline'
                }`}
              >
                <Icono className={`equipos-icono ${enLinea ? 'equipos-icono-online' : 'equipos-icono-offline'}`}/>
                
                <div className={`equipos-nombre ${enLinea ? 'equipos-nombre-online' : 'equipos-nombre-offline'}`}>
                  {equipo.nombre_equipo}
                </div>
                
              </div>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquiposEstado;
