import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert, Typography } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';

const { Title } = Typography;

const UltimasLecturasFormsTable = () => {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/ultimas-lecturas-form');

        const formattedData = response.data.map(item => {
          const marcatemporalFormatted = moment(item.marcatemporal);
          const now = moment();
          const diffHours = now.diff(marcatemporalFormatted, 'hours');
          const diffDays = Math.floor(diffHours / 24);

          let daysAgoText = '';
          let isOld = false;

          if (diffHours < 24) {
            daysAgoText = 'hoy';
          } else {
            daysAgoText = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
            isOld = true;
          }

          return {
            ...item,
            marcatemporalRaw: marcatemporalFormatted,
            marcatemporal: marcatemporalFormatted.format('HH:mm:ss'),
            daysAgoText,
            isOld,
          };
        });

        setData(formattedData);
        setLoading(false);
        setLastUpdated(new Date()); // Actualizamos la hora de la última actualización
      } catch (err) {
        setError('Hubo un error al obtener los datos');
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 20000); // Polling cada 20 segundos
    
    return () => clearInterval(intervalId); // Limpiar el intervalo cuando el componente se desmonte
  }, []);

  const columns = [
    {
      title: 'Programa',
      dataIndex: 'cod_programa',
      key: 'cod_programa',
      width: '60px',
    },
    {
      title: 'ID Upload',
      dataIndex: 'imagen',
      key: 'imagen',
      width: '80px',
    },
    {
      title: 'Marca Temporal',
      key: 'marcatemporal',
      width: '150px',
      render: (_, record) => (
        <>
          {record.marcatemporal}{' '}
          <span style={{ color: record.isOld ? 'red' : 'inherit' }}>
            ({record.daysAgoText})
          </span>
        </>
      ),
    },
  ];

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div style={{ height: '210px' }}>
      <Title level={5} style={{ marginBottom: '0px' }}>Resumen de últimos procesos</Title>
      
      {/* Mostrar mensaje de última actualización */}
      <div style={{ fontSize: '12px', marginBottom: '12px' }} >
        {lastUpdated
          ? `Última actualización: ${dayjs(lastUpdated).format('HH:mm:ss')}, Polling (20s)`
          : 'Actualizando...'}
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id_archivoleido"
          pagination={false}
          size="small"
        />
      )}
    </div>
  );
};

export default UltimasLecturasFormsTable;
