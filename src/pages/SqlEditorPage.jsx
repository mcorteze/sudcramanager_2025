import { useState, useEffect } from 'react';
import { Button, Table, Typography, Tag, Space, Tooltip } from 'antd';
import { PlayCircleOutlined, DeleteOutlined, DownloadOutlined, BookOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';

const { Text } = Typography;
const HISTORIAL_KEY = 'sql_historial';
const MAX_HISTORIAL = 20;

const CONSULTAS_FRECUENTES = [
  {
    nombre: 'Reprocesar eval txt',
    sql: `select
  al.archivoleido,
  me.linea_leida
from matricula_eval me
join archivosleidos al on al.id_archivoleido = me.id_archivoleido
where me.id_eval = 'id_eval'`,
  },
];

export default function SqlEditorPage() {
  const [query, setQuery] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORIAL_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
  }, [historial]);

  const ejecutar = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await axios.post('http://localhost:3001/api/sql/ejecutar', { query });
      setResultado(res.data);
      setHistorial(prev => {
        const nuevo = [query, ...prev.filter(q => q !== query)];
        return nuevo.slice(0, MAX_HISTORIAL);
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al ejecutar');
    } finally {
      setLoading(false);
    }
  };

  const descargarXlsx = () => {
    const ahora = new Date();
    const pad = n => String(n).padStart(2, '0');
    const nombre = `consulta_${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}_${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}.xlsx`;
    const ws = XLSX.utils.json_to_sheet(resultado.rows, { header: resultado.fields });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Consulta');
    XLSX.writeFile(wb, nombre);
  };

  const columns = resultado?.fields?.map(f => ({
    title: f,
    dataIndex: f,
    key: f,
    ellipsis: true,
    render: (val) => val === null ? <Text type="secondary">null</Text> : String(val),
  })) || [];

  return (
    <div style={{ display: 'flex', gap: 16, padding: 24, alignItems: 'flex-start' }}>

      {/* Panel principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ marginTop: 0 }}>SQL Editor</h2>

        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') ejecutar(); }}
          placeholder="Escribe tu consulta SELECT aquí... (Ctrl+Enter para ejecutar)"
          style={{
            width: '100%', height: 160, fontFamily: 'monospace', fontSize: 13,
            padding: 10, borderRadius: 6, border: '1px solid #d9d9d9',
            resize: 'vertical', marginBottom: 10, boxSizing: 'border-box',
          }}
        />

        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlayCircleOutlined />} loading={loading} onClick={ejecutar}>
            Ejecutar
          </Button>
          <Button icon={<DeleteOutlined />} onClick={() => { setQuery(''); setResultado(null); setError(null); }}>
            Limpiar
          </Button>
          <Text type="secondary" style={{ fontSize: 12 }}>Solo SELECT permitido</Text>
        </Space>

        {error && (
          <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 6, padding: '8px 12px', marginBottom: 16, color: '#cf1322', fontFamily: 'monospace', fontSize: 13 }}>
            {error}
          </div>
        )}

        {resultado && (
          <div style={{ marginBottom: 24 }}>
            <Space style={{ marginBottom: 8 }}>
              <Tag color="blue">{resultado.rowCount} filas</Tag>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={descargarXlsx}
                disabled={resultado.rowCount === 0}
              >
                Descargar .xlsx
              </Button>
            </Space>
            <Table
              size="small"
              dataSource={resultado.rows.map((r, i) => ({ ...r, _key: i }))}
              columns={columns}
              rowKey="_key"
              pagination={{ pageSize: 50 }}
              scroll={{ x: 'max-content' }}
            />
          </div>
        )}

        {historial.length > 0 && (
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Text strong>Historial</Text>
              <Button size="small" danger onClick={() => setHistorial([])}>Borrar historial</Button>
            </Space>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {historial.map((q, i) => (
                <li
                  key={i}
                  onClick={() => setQuery(q)}
                  style={{
                    fontFamily: 'monospace', fontSize: 12, padding: '4px 8px',
                    borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    color: '#1677ff',
                  }}
                  title={q}
                >
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Panel lateral derecho: consultas frecuentes */}
      <div style={{
        width: 220, flexShrink: 0,
        border: '1px solid #e8e8e8', borderRadius: 8,
        background: '#fafafa', padding: '12px 0',
      }}>
        <div style={{ padding: '0 12px 8px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #e8e8e8', marginBottom: 4 }}>
          <BookOutlined style={{ color: '#1677ff', fontSize: 14 }} />
          <Text strong style={{ fontSize: 13 }}>Consultas frecuentes</Text>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {CONSULTAS_FRECUENTES.map((c, i) => (
            <Tooltip key={i} title={<pre style={{ margin: 0, fontSize: 11, whiteSpace: 'pre-wrap' }}>{c.sql}</pre>} placement="left">
              <li
                onClick={() => setQuery(c.sql)}
                style={{
                  padding: '7px 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  borderBottom: '1px solid #f0f0f0',
                  color: '#1677ff',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e6f4ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {c.nombre}
              </li>
            </Tooltip>
          ))}
        </ul>
      </div>

    </div>
  );
}
