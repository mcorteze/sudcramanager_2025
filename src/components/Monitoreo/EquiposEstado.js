import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { Tag } from 'antd';
import { MdLaptopChromebook } from "react-icons/md";

const EquiposEstado = () => {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener los datos
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
    obtenerDatos(); // Cargar los datos inicialmente

    // Configurar el intervalo para refrescar los datos cada 10 segundos
    const interval = setInterval(() => {
      obtenerDatos();
    }, 10000); // 10000 ms = 10 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  const esEnLinea = (marcaTemporal) => {
    const seisMinutosAtras = new Date(new Date().getTime() - 6 * 60 * 1000);
    return new Date(marcaTemporal) >= seisMinutosAtras;
  };

  // 🎨 ESTILOS EN OBJETOS
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
    tabla: {
      marginLeft: '20px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '5px',
      fontSize: '12px',
    },
    celda: {
      padding: '5px',
      textAlign: 'center',
      borderBottom: '1px solid #ddd',
    },
    fila: {
      display: 'flex',
      justifyContent: 'space-between',
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
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
                {/* Mostrar la marca temporal y la cantidad de imágenes pendientes */}
                <div style={{ fontSize: '10px' }}>
                  {(() => {
                    const date = new Date(equipo.marca_temporal);
                    const pad = (n) => n.toString().padStart(2, '0');
                    const formattedDate = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
                    const formattedTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
                    return `${formattedDate}, ${formattedTime}`;
                  })()}
                </div>
                <div>Staging area: {equipo.imagenes_pendientes_1}</div>
              </div>
            </div>
          </div>
        );        
      })}
    </div>
  );
};

export default EquiposEstado;
