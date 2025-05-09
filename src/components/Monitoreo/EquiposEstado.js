import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { Tag, Typography } from 'antd';
import { MdLaptopChromebook } from "react-icons/md";
import dayjs from 'dayjs';

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

  const estilos = {
    contenedor: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      justifyContent: 'center',
      padding: '0px',
    },
    rectangulo: {
      width: 150,
      height: 150,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      border: '1px solid #ccc',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      padding: '10px',
    },
    iconoLaptop: (enLinea) => ({
      fontSize: '36px',
      color: enLinea ? 'green' : 'red',
      marginBottom: '8px',
    }),
    nombre: {
      fontSize: '13px',
      fontWeight: 'bold',
      marginBottom: '6px',
      textAlign: 'center',
    },
    tag: {
      fontSize: '11px',
    },
  };

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <Title level={5} style = {{ marginBottom: '0px' }} >Monitor de red de equipos Forms</Title>
      <Typography.Paragraph style={{ fontSize: '12px', color: 'red', marginBottom: '12px' }}>
        {lastUpdated
          ? `Última actualización: ${dayjs(lastUpdated).format('HH:mm:ss')},  Polling (5s) | PC Input (5m)`
          : 'Actualizando...'}
      </Typography.Paragraph>

      
      <div style={estilos.contenedor}>
        {equipos.map((equipo, index) => {
          const enLinea = esEnLinea(equipo.marca_temporal);
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={estilos.rectangulo}>
                <MdLaptopChromebook style={estilos.iconoLaptop(enLinea)} />
                <div style={estilos.nombre}>{equipo.nombre_equipo}</div>
                <Tag color={enLinea ? 'green' : 'red'} style={estilos.tag}>
                  {enLinea ? 'Online' : 'Offline'}
                </Tag>
                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                  <div>Staging area: {equipo.imagenes_pendientes_1}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquiposEstado;
