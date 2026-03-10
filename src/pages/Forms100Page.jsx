import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert } from 'antd';
import axios from 'axios';

const Forms100Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    noLeidos: 0,
    fallidos: 0,
    conErrores: 0,
    estadoLectura: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/forms100');
        const rawData = response.data;

        const ids = rawData.map(item => item.id_upload);
        const minId = Math.min(...ids);
        const maxId = Math.max(...ids);

        const dataById = rawData.reduce((acc, item) => {
          acc[item.id_upload] = item;
          return acc;
        }, {});

        const completeData = [];
        let noLeidos = 0;
        let fallidos = 0;
        let conErrores = 0;

        for (let id = minId; id <= maxId; id++) {
          const item = dataById[id] || {
            id_upload: id,
            total_calificaciones_si: 0,
            total_calificaciones_no: 0,
            total_calificaciones_completas: 0,
          };

          if (item.total_calificaciones_completas === 0) {
            noLeidos++;
          } else if (item.total_calificaciones_si === 0) {
            fallidos++;
          } else if (
            item.total_calificaciones_si / item.total_calificaciones_completas < 0.5
          ) {
            conErrores++;
          }

          completeData.push(item);
        }

        // Calcular estado general de lectura
        const total = completeData.length;
        let estadoLectura = '';

        if (noLeidos / total > 0.3) {
          estadoLectura = '⚠️ Alta cantidad de registros no leídos';
        } else if (fallidos / total > 0.3) {
          estadoLectura = '⚠️ Alta cantidad de registros fallidos';
        } else if (conErrores / total > 0.3) {
          estadoLectura = '⚠️ Alta cantidad de registros con errores';
        } else {
          estadoLectura = '✔️ Estado general aceptable';
        }

        setData(completeData);
        setSummary({ noLeidos, fallidos, conErrores, estadoLectura });
        setLoading(false);
      } catch (err) {
        setError('Error al obtener los datos de las calificaciones');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'ID Upload',
      dataIndex: 'id_upload',
      key: 'id_upload',
    },
    {
      title: 'Total Calificaciones Sí',
      dataIndex: 'total_calificaciones_si',
      key: 'total_calificaciones_si',
    },
    {
      title: 'Total Calificaciones No',
      dataIndex: 'total_calificaciones_no',
      key: 'total_calificaciones_no',
    },
    {
      title: 'Total Calificaciones Completas',
      dataIndex: 'total_calificaciones_completas',
      key: 'total_calificaciones_completas',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="page-full">
      <h1>Resumen de las últimas 30 lecturas de forms</h1>

      <div style={{ marginBottom: 20 }}>
        <strong>Resumen de calidad de la lectura:</strong>
        <ul>
          <li><strong>No leídos (sin descarga):</strong> {summary.noLeidos}</li>
          <li><strong>Fallidos (0 resultados con calificación):</strong> {summary.fallidos}</li>
          <li><strong>Con errores (menos de 0.5 de resultados con calificación):</strong> {summary.conErrores}</li>
        </ul>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Calidad de lectura:</strong> {summary.estadoLectura}
        <p>Bajo 30% en cualquiera de sus indicadores.</p>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id_upload"
        pagination={false}
      />
    </div>
  );
};

export default Forms100Page;
