import React, { useEffect, useState } from 'react';
import { Table, Tag, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const estadoToTag = (estado) => {
  const value = String(estado ?? '').trim();
  if (value.toLowerCase() === 'completado') {
    return { color: 'success', text: 'Completado' };
  }
  return { color: 'blue', text: value || '—' }; // por defecto azul
};

const cargaToTag = (carga) => {
  const value = String(carga ?? '').trim().toLowerCase();

  if (value === 'completado') return { color: 'success', text: 'Completado' };
  if (value === 'preparado') return { color: 'blue', text: 'Preparado' };
  if (value === 'sin archivo') return { color: 'default', text: 'sin archivo' };

  return { color: 'orange', text: carga || '—' }; // por defecto naranja
};

export default function LogActualizacionPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/log_actualizacion?limit=200&order=desc');
      const rows = await res.json();
      setData(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error('Error al cargar log_actualizacion:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 90 },
    { title: 'Mes', dataIndex: 'mes', width: 110 },
    { title: 'Dia', dataIndex: 'dia', width: 110 },
    { title: 'Inicio', dataIndex: 'hora_inicio', width: 110 },
    { title: 'Fin', dataIndex: 'hora_fin', width: 110 },
    {
      title: 'Estado Descargas',
      dataIndex: 'estado',
      width: 170,
      render: (estado) => {
        const { color, text } = estadoToTag(estado);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actualización BBDD',
      dataIndex: 'carga',
      width: 180,
      render: (carga) => {
        const { color, text } = cargaToTag(carga);
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className='page-full'>
      <h1>Historial de actualizaciones</h1>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          Recargar
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 20 }}
        tableLayout="fixed"
      />
    </div>
  );
}
