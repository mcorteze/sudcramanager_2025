import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert } from 'antd';
import axios from 'axios';

const UltimoIdLista = () => {
  const [data, setData] = useState(null); // Para almacenar los datos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Manejo de errores

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/ultimo_idlista'); // Solicitar datos del backend
        setData(response.data);
        setLoading(false); // Finalizar carga
      } catch (err) {
        setError('Error al cargar los datos.');
        setLoading(false); // Finalizar carga aunque haya error
      }
    };

    fetchData();
  }, []); // Ejecutar solo una vez al montar el componente

  // Definir columnas de la tabla
  const columns = [
    {
      title: 'Programa',
      dataIndex: 'cod_programa',
      key: 'cod_programa',
    },
    {
      title: 'Último ID Lista',
      dataIndex: 'id_lista',
      key: 'id_lista',
    },
  ];

  // Renderizar componente
  return (
    <div>
      <h2>Último ID en lista de imágenes con calificación</h2>
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message={error} type="error" showIcon />
      ) : (
        <Table
          dataSource={data} // Datos de la API
          columns={columns} // Columnas definidas
          rowKey="cod_programa" // Clave única por fila
          className="buscar-seccion-table1" // Clase personalizada
          pagination = {false}
        />
      )}
    </div>
  );
};

export default UltimoIdLista;
