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
        const response = await axios.get('http://localhost:3001/api/ultimas-lecturas-form-2');

        const formattedData = response.data.map(item => {
          const marcaTemporal = item.marca_temporal_calificacion
            ? moment(item.marca_temporal_calificacion)
            : null;

          let isOld = false;
          let daysAgoText = '';
          let marcatemporalFormatted = null;

          if (marcaTemporal) {
            const now = moment();

            const diffHours = now.diff(marcaTemporal, 'hours');
            isOld = diffHours >= 24;

            if (now.isSame(marcaTemporal, 'day')) {
              daysAgoText = 'hoy';
            } else if (now.subtract(1, 'day').isSame(marcaTemporal, 'day')) {
              daysAgoText = 'ayer';
            } else {
              const diffDays = now.diff(marcaTemporal, 'days');
              daysAgoText = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
            }

            marcatemporalFormatted = marcaTemporal.format('HH:mm:ss');
          }

          return {
            ...item,
            marcatemporalRaw: marcaTemporal,
            marcatemporal: marcatemporalFormatted,
            daysAgoText,
            isOld,
          };
        });

        setData(formattedData);
        setLoading(false);
        setLastUpdated(new Date());
      } catch (err) {
        setError('Hubo un error al obtener los datos');
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 20000);
    return () => clearInterval(intervalId);
  }, []);

  // Función para formatear números con separador de miles (Chile)
const formatNumberCL = (num) => {
  return num != null && !isNaN(num)
    ? Number(num).toLocaleString('es-CL')
    : '-';
};


  const getFaltanteClass = (faltante) => {
    if (faltante >= 50) {
      return 'faltante-rojo-fondo';
    } else if (faltante >= 20) {
      return 'faltante-rojo';
    } else if (faltante >= 10) {
      return 'faltante-naranjo';
    } else {
      return 'faltante-normal';
    }
  };

  const columns = [
    {
      title: 'Prog',
      dataIndex: 'cod_programa',
      key: 'cod_programa',
      width: '40px',
    },
    {
      title: 'Recepcionado',
      dataIndex: 'imagen_recepcionada',
      key: 'imagen_recepcionada',
      width: '100px',
      render: (value) =>
        value != null
          ? <span>{formatNumberCL(value)}</span>
          : <span className="texto-sin-datos">-</span>,
    },
    {
      title: 'Calificado',
      dataIndex: 'imagen_calificada',
      key: 'imagen_calificada',
      width: '180px',
      render: (_, record) => {
        const calificada = record.imagen_calificada;
        const recepcionada = record.imagen_recepcionada;

        if (calificada == null) {
          return <span className="texto-sin-datos">-</span>;
        }

        const faltante = recepcionada - calificada;

        if (faltante <= 0) {
          return <span>{formatNumberCL(calificada)}</span>;
        }

        const className = getFaltanteClass(faltante);

        return (
          <>
            <span>{formatNumberCL(calificada)}</span>{' '}
            <span className={className}>(faltan: {formatNumberCL(faltante)})</span>
          </>
        );
      },
    },
    {
      title: 'Marca Temporal Calificación',
      key: 'marcatemporal',
      width: '180px',
      render: (_, record) => {
        if (!record.marcatemporal) {
          return <span className="texto-sin-datos">-</span>;
        }
        return (
          <>
            {record.marcatemporal}{' '}
            <span className={record.isOld ? 'marca-temporal-antigua' : ''}>
              ({record.daysAgoText})
            </span>
          </>
        );
      }
    },
  ];

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div className="ultimas-lecturas-container">
      <Title level={5} className="ultimas-lecturas-titulo">
        Últimos ID Upload
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
          rowKey={(record) =>
            `${record.cod_programa}_${record.imagen_recepcionada}`
          }
          pagination={false}
          size="small"
        />
      )}
    </div>
  );
};

export default UltimasLecturasFormsTable;
