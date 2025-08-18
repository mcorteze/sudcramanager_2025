// LogActualizacionPage.jsx (versión mínima)
import React, { useEffect, useState } from 'react';
import { Table, Tag, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const normalizeEstado = (estado) => {
  if (estado == null) return 'Null';
  const v = String(estado).trim().toLowerCase();
  if (v.includes('terminado')) return 'Terminado';
  if (v.includes('proceso')) return 'En proceso';
  if (v === 'null' || v === '' || v === '0') return 'Null';
  return String(estado);
};
const estadoToTag = (estado) => {
  const n = normalizeEstado(estado);
  if (n === 'Terminado') return { color: 'success', text: 'Terminado' };
  if (n === 'En proceso') return { color: 'processing', text: 'En proceso' };
  return { color: 'default', text: 'Null' };
};

const normalizeCarga = (carga) => {
  if (carga == null) return 'No ejecutada';
  const v = String(carga).trim().toLowerCase();
  if (v.includes('complet')) return 'Completada';
  if (v.includes('interrump')) return 'Interrumpida';
  if (v.includes('fall')) return 'Fallida';
  if (v === 'null' || v === '') return 'No ejecutada';
  return String(carga);
};
const cargaToTag = (carga) => {
  const n = normalizeCarga(carga);
  if (n === 'Completada') return { color: 'success', text: 'Completada' };
  if (n === 'Interrumpida') return { color: 'warning', text: 'Interrumpida' };
  if (n === 'Fallida') return { color: 'error', text: 'Fallida' };
  return { color: 'default', text: 'No ejecutada' };
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
      title: 'Estado de datos preparados',
      dataIndex: 'estado',
      width: 170,
      render: (estado) => {
        const { color, text } = estadoToTag(estado);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ejecución de carga final',
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
        tableLayout="fixed"     /* layout estable, sin cálculos raros */
        // sin scroll.x, sin sorters, sin filters → menos ResizeObserver interno
      />
    </div>
  );
}
