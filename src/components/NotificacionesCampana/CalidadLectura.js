import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert } from 'antd';
import axios from 'axios';
import { FiExternalLink } from 'react-icons/fi';

const CalidadLectura = ({ onAlertaChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    noLeidos: 0,
    fallidos: 0,
    conErrores: 0,
    estadoLectura: '',
  });
  const [lastUpdated, setLastUpdated] = useState(null);

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

      const total = completeData.length;
      let estadoLectura = '';

      if (noLeidos / total > 0.3 || fallidos / total > 0.3 || conErrores / total > 0.3) {
        estadoLectura = '⚠️ Alerta';
        onAlertaChange?.(true);
      } else {
        estadoLectura = '✔️ Aceptable';
        onAlertaChange?.(false);
      }

      setData(completeData);
      setSummary({ noLeidos, fallidos, conErrores, estadoLectura });
      setLastUpdated(new Date().toLocaleString());
      setLoading(false);
    } catch (err) {
      setError('Error al obtener los datos de las calificaciones');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}><Alert message={error} type="error" showIcon /></div>;
  }

  // Extraer solo el texto para dar estilo condicional
  const esAlerta = summary.estadoLectura.includes('Alerta');

  return (
    <div>
      <span style={{ fontWeight: 'bold' }}>
        <span style={{ color: esAlerta ? 'red' : 'inherit' }}>
          {summary.estadoLectura}
        </span>{' '}
        <a href="/forms100" target="_blank" rel="noopener noreferrer" title="Ir a detalles">
          <FiExternalLink />
        </a>
      </span>
      <div style={{ marginTop: 10, fontSize: '0.9em', color: '#888' }}>
        Última actualización: {lastUpdated}
      </div>
    </div>
  );
};

export default CalidadLectura;
