import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert, Typography } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';
import './UltimasLecturasFormsTable.css';

const { Title } = Typography;

const UltimasLecturasFormsTable = () => {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Paso 1: traer último id recepcionado (todos los programas)
        const ultimosResponse = await axios.get(
          'http://localhost:3001/api/ultimo-id-recepcionado'
        );

        const programasUltimos = ultimosResponse.data;

        // Paso 2: traer lecturas form
        const response = await axios.get('http://localhost:3001/api/ultimas-lecturas-form');
        
        const lecturasData = response.data.map(item => {
          const marcatemporalFormatted = moment(item.marcatemporal);
          const now = moment();

          const diffHours = now.diff(marcatemporalFormatted, 'hours');
          const isOld = diffHours >= 24;

          let daysAgoText = '';
          if (now.isSame(marcatemporalFormatted, 'day')) {
            daysAgoText = 'hoy';
          } else if (now.subtract(1, 'day').isSame(marcatemporalFormatted, 'day')) {
            daysAgoText = 'ayer';
          } else {
            const diffDays = now.diff(marcatemporalFormatted, 'days');
            daysAgoText = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
          }

          return {
            ...item,
            marcatemporalRaw: marcatemporalFormatted,
            marcatemporal: marcatemporalFormatted.format('HH:mm:ss'),
            daysAgoText,
            isOld,
          };
        });

        // Paso 3: fusionar para construir payload
        const allProgramas = programasUltimos.map(prog => {
          const found = lecturasData.find(d => d.cod_programa === prog.cod_programa);
          return {
            cod_programa: prog.cod_programa,
            ultimo_id_recepcionado: prog.imagen_recepcionada,
            id_upload: found ? found.imagen : 0,
            marcatemporal: found?.marcatemporal || null,
            daysAgoText: found?.daysAgoText || null,
            isOld: found?.isOld || false,
          };
        });

        // Paso 4: construir payload para ids-restantes
        const payload = allProgramas.map(p => ({
          programa: p.cod_programa,
          id_upload: p.id_upload
        }));

        // Paso 5: traer ids restantes
        const idsResponse = await axios.post(
          'http://localhost:3001/api/ids-restantes-lote',
          payload
        );

        // Paso 6: mergear ids restantes
        const finalData = allProgramas.map(item => {
          const foundRestantes = idsResponse.data.find(
            r => r.programa === item.cod_programa && Number(r.id_upload) === Number(item.id_upload)
          );

          return {
            ...item,
            ids_restantes: foundRestantes ? foundRestantes.ids_restantes : null,
          };
        });

        setData(finalData);
        setLastUpdated(new Date());
        setLoading(false);

      } catch (err) {
        console.error(err);
        setError('Hubo un error al obtener los datos');
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 20000);
    return () => clearInterval(intervalId);
  }, []);

  const getClassForFaltante = (item) => {
  if (item.ids_restantes === null) {
    return 'texto-sin-datos';
  }

  if (item.ids_restantes >= 50) {
    return 'faltante-rojo-fondo';
  } else if (item.ids_restantes >= 20) {
    return 'faltante-rojo';
  } else if (item.ids_restantes > 0) {
    return 'faltante-naranjo';
  } else {
    return 'faltante-normal';
  }
};


  const columns = [
    {
      title: 'Programa',
      dataIndex: 'cod_programa',
      key: 'cod_programa',
      width: '60px',
    },
    {
      title: 'Último ID Recepcionado',
      dataIndex: 'ultimo_id_recepcionado',
      key: 'ultimo_id_recepcionado',
      width: '100px',
      render: (value) =>
        value !== null ? value : <span className="texto-sin-datos">—</span>,
    },
    {
      title: 'Último ID Upload calificado',
      dataIndex: 'id_upload',
      key: 'id_upload',
      width: '100px',
      render: (value) =>
        value > 0 ? value : <span className="texto-sin-datos">—</span>,
    },
    {
      title: 'Marca Temporal Calificación',
      key: 'marcatemporal',
      width: '150px',
      render: (_, record) => (
        record.marcatemporal
          ? <>
              {record.marcatemporal}{' '}
              <span className={record.isOld ? 'marca-temporal-antigua' : ''}>
                ({record.daysAgoText})
              </span>
            </>
          : <span className="texto-sin-datos">—</span>
      ),
    },
    {
      title: 'IDs Restantes',
      dataIndex: 'ids_restantes',
      key: 'ids_restantes',
      width: '80px',
      render: (_, record) => {
        const className = getClassForFaltante(record);
        return record.ids_restantes !== null
          ? <span className={className}>{record.ids_restantes}</span>
          : <span className="texto-sin-datos">—</span>;
      },
    }
  ];

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div style={{ height: '300px' }}>
      <Title level={5} className="ultimas-lecturas-titulo">
        Último id_upload calificado
      </Title>

      <div className="ultimas-lecturas-fecha">
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
          rowKey="cod_programa"
          pagination={false}
          size="small"
        />
      )}
    </div>
  );
};

export default UltimasLecturasFormsTable;
