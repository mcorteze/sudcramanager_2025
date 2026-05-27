import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';
import './UltimasLecturasFormsTable.css';

const UltimasLecturasFormsTable = ({ selectedDate, onDateChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ultimosResponse = await axios.get('http://localhost:3001/api/ultimo-id-recepcionado');
        const programasUltimos = ultimosResponse.data;

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
            marcatemporal: marcatemporalFormatted.format('HH:mm:ss'),
            daysAgoText,
            isOld,
          };
        });

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

        const payload = allProgramas.map(p => ({ programa: p.cod_programa, id_upload: p.id_upload }));
        const idsResponse = await axios.post('http://localhost:3001/api/ids-restantes-lote', payload);

        const finalData = allProgramas.map(item => {
          const foundRestantes = idsResponse.data.find(
            r => r.programa === item.cod_programa && Number(r.id_upload) === Number(item.id_upload)
          );
          return { ...item, ids_restantes: foundRestantes ? foundRestantes.ids_restantes : null };
        });

        setData(finalData);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error al obtener los datos');
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 20000);
    return () => clearInterval(intervalId);
  }, []);

  const getClassForFaltante = (item) => {
    if (item.ids_restantes === null) return 'texto-sin-datos';
    if (item.ids_restantes >= 50) return 'faltante-rojo-fondo';
    if (item.ids_restantes >= 20) return 'faltante-rojo';
    if (item.ids_restantes > 0)  return 'faltante-naranjo';
    return 'faltante-normal';
  };

  const columns = [
    { title: 'Programa',               dataIndex: 'cod_programa',          key: 'cod_programa',          width: 50 },
    { title: 'Último ID Recepcionado', dataIndex: 'ultimo_id_recepcionado', key: 'ultimo_id_recepcionado', width: 110,
      render: v => v !== null ? v : <span className="texto-sin-datos">—</span> },
    { title: 'Último ID Upload calificado', dataIndex: 'id_upload',         key: 'id_upload',             width: 110,
      render: v => v > 0 ? v : <span className="texto-sin-datos">—</span> },
    { title: 'Marca Temporal Calificación', key: 'marcatemporal',           width: 140,
      render: (_, r) => r.marcatemporal
        ? <>{r.marcatemporal} <span className={r.isOld ? 'marca-temporal-antigua' : ''}>({r.daysAgoText})</span></>
        : <span className="texto-sin-datos">—</span> },
    { title: 'IDs Restantes', dataIndex: 'ids_restantes', key: 'ids_restantes', width: 80,
      render: (_, r) => r.ids_restantes !== null
        ? <span className={getClassForFaltante(r)}>{r.ids_restantes}</span>
        : <span className="texto-sin-datos">—</span> },
  ];

  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <div className="ultimas-lecturas-card">
      {/* Header del card: título + datepicker + última actualización */}
      <div className="ultimas-lecturas-header">
        <span className="ultimas-lecturas-titulo">Último id_upload calificado</span>
        <div className="ultimas-lecturas-meta">
          {onDateChange && (
            <input
              type="date"
              className="ultimas-lecturas-dateinput"
              value={selectedDate?.format?.('YYYY-MM-DD') || ''}
              onChange={e => onDateChange(dayjs(e.target.value))}
            />
          )}
          <span className="ultimas-lecturas-fecha">
            {lastUpdated ? `${dayjs(lastUpdated).format('HH:mm:ss')} · 20s` : '…'}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '16px 0', textAlign: 'center' }}><Spin size="small" /></div>
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
