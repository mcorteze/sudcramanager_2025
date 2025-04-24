import React, { useEffect, useState } from 'react'; 
import { Table, Spin } from 'antd';
import axios from 'axios';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom'; // Asegúrate de tener esto para el redireccionamiento

const RutLecturas = ({ rut }) => {  
  const navigate = useNavigate();  // Hook para redirección
  const [lecturasData, setLecturasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para obtener datos cuando el parámetro rut cambia
  useEffect(() => {
    if (!rut) {
      setError('El parámetro rut es obligatorio');
      setLoading(false);
      return;
    }

    // Función para obtener los datos de las lecturas
    const fetchLecturasData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/rut_lecturas/${rut}`);
        console.log('Datos obtenidos:', response.data); // Verificamos los datos en la consola
        if (response.data.data) {
          setLecturasData(response.data.data);  // Establecemos los datos correctamente
        } else {
          setError('No se encontraron datos para el RUT proporcionado');
        }
      } catch (err) {
        console.error('Error al obtener los datos:', err);
        setError('Error al obtener los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchLecturasData();
  }, [rut]);  // Se ejecuta cada vez que el parámetro rut cambie

  // Funciones para redirigir a las páginas correspondientes
  const handleVerLectura = (idArchivoleido, lineaLeida) => {
    navigate(`/lectura/${idArchivoleido}/${lineaLeida}`);
  };

  const handleVerErrores = (idArchivoleido, lineaLeida) => {
    navigate(`/errores/${idArchivoleido}/${lineaLeida}`);
  };

  // Definimos las columnas para la tabla
  const lecturasColumns = [
    { title: 'Programa', dataIndex: 'programa', key: 'programa' },
    { title: 'Código Asignatura', dataIndex: 'cod_asig', key: 'cod_asig' },
    { title: 'Número de Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
    { 
      title: 'Reproceso', 
      dataIndex: 'reproceso', 
      key: 'reproceso',
      render: (reproceso) => reproceso ? 'Sí' : 'No'  // Mostrar "Sí" o "No"
    },
    { title: 'Imagen', dataIndex: 'imagen', key: 'imagen' },
    { 
      title: 'Instante Forms', 
      dataIndex: 'instante_forms', 
      key: 'instante_forms',
      render: (text) => {
        const date = new Date(text);
        const pad = (n) => n.toString().padStart(2, '0');
        const formattedDate = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
        const formattedTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return `${formattedDate}, ${formattedTime}`;
      }
    },
    { title: 'ID Upload', dataIndex: 'id_upload', key: 'id_upload' },

    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, record) => {
        const [idUpload, ...rest] = record.imagen.split('_');
        const nombre_imagen = rest.join('_'); // Por si hay más de un "_" en el nombre
    
        const url = `https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/imgenes20251/Attachments/${idUpload}/${nombre_imagen}`;
        const lecturaUrl = `/lectura/${record.id_archivoleido}/${record.linea_leida}`;
        const erroresUrl = `/errores/${record.id_archivoleido}/${record.linea_leida}`;
    
        return (
          <div>
            <a href={lecturaUrl} target="_blank" rel="noopener noreferrer" style={{ marginRight: 10 }}>
              Ver lectura
            </a>
            <a href={erroresUrl} target="_blank" rel="noopener noreferrer" style={{ marginRight: 10 }}>
              Ver errores
            </a>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Ver imagen
            </a>
          </div>
        );
      }
    }
    


    
    

  ];

  return (
    <div>
      <Typography.Title level={4}>Lecturas</Typography.Title>

      {loading ? (
        <Spin size="large" />  // Cargando mientras obtenemos los datos
      ) : (
        <Table
          columns={lecturasColumns}
          dataSource={lecturasData}
          rowKey="id_archivoleido"  // Definimos el identificador único de la fila
          pagination={false}  // Paginación para las filas
        />
      )}
    </div>
  );
};

export default RutLecturas;
