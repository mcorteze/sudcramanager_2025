import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';

const excelColors = {
  txt:  { label: 'TXT',  barFill: 'rgba(158,158,158,0.22)', barStroke: '#9e9e9e', dot: '#9e9e9e' },
  xls:  { label: 'XLS',  barFill: 'rgba(51,196,129,0.28)',  barStroke: '#33c481', dot: '#33c481' },
  xlsm: { label: 'XLSM', barFill: 'rgba(16,124,16,0.32)',   barStroke: '#107c10', dot: '#107c10' },
  xlsx: { label: 'XLSX', barFill: 'rgba(33,115,70,0.42)',   barStroke: '#217346', dot: '#217346' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 10px', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 3px 0', fontWeight: 600, color: '#217346' }}>{dayjs(label).format('ddd DD/MM')}</p>
      {payload.filter(p => p.value > 0).map(p => (
        <p key={p.dataKey} style={{ margin: '1px 0', color: p.stroke || '#555' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const HistorialProcesamiento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResumen = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/historial_procesamiento_resumen');
      const rows = res.data;
      console.log('[HistorialProcesamiento] rows:', rows);

      const days = Array.from({ length: 7 }, (_, i) =>
        dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD')
      );

      const processed = days.map(day => {
        const dayRows = rows.filter(r => dayjs(r.fecha).format('YYYY-MM-DD') === day);
        const get = (tipos) => dayRows
          .filter(r => tipos.includes(r.tipoarchivo))
          .reduce((s, r) => s + Number(r.cantidad), 0);
        const txt  = get(['.txt', '.csv']);
        const xls  = get(['.xls']);
        const xlsm = get(['.xlsm']);
        const xlsx = get(['.xlsx']);
        return { date: day, '.txt': txt, '.xls': xls, '.xlsm': xlsm, '.xlsx': xlsx, total: txt + xls + xlsm + xlsx };
      });

      setData(processed);
    } catch (err) {
      console.error('Error al obtener resumen historial:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
    const id = setInterval(fetchResumen, 60000);
    return () => clearInterval(id);
  }, []);

  const renderTotalLabel = ({ x, y, width, value }) => {
    if (!value || value <= 0) return null;
    return (
      <text x={x + width / 2} y={y - 3} textAnchor="middle" fill="#217346" fontSize={9} fontWeight="600">
        {value}
      </text>
    );
  };

  const hasData = data.some(d => d.total > 0);

  return (
    <div style={{ padding: '10px 12px', background: '#fff' }}>
      <Spin spinning={loading}>
        <p style={{ color: '#217346', fontSize: 11, fontWeight: 600, margin: '0 0 8px 0', textAlign: 'center', letterSpacing: '0.02em' }}>
          Historial de Procesamiento (7 días)
        </p>

        {!loading && !hasData ? (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 11 }}>
            Sin datos recientes
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart width={260} height={130} data={data} margin={{ top: 14, right: 2, left: -30, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="2 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={{ stroke: '#d9d9d9' }}
                tickLine={false}
                tickFormatter={(t) => dayjs(t).format('DD/MM')}
                tick={{ fontSize: 9, fill: '#777' }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#aaa' }} domain={[0, 'dataMax + 2']} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(33,115,70,0.05)' }} />
              <Bar dataKey=".txt"  name="TXT"  stackId="a" fill={excelColors.txt.barFill}  stroke={excelColors.txt.barStroke}  strokeWidth={1} />
              <Bar dataKey=".xls"  name="XLS"  stackId="a" fill={excelColors.xls.barFill}  stroke={excelColors.xls.barStroke}  strokeWidth={1} />
              <Bar dataKey=".xlsm" name="XLSM" stackId="a" fill={excelColors.xlsm.barFill} stroke={excelColors.xlsm.barStroke} strokeWidth={1} />
              <Bar dataKey=".xlsx" name="XLSX" stackId="a" fill={excelColors.xlsx.barFill} stroke={excelColors.xlsx.barStroke} strokeWidth={1} radius={[3,3,0,0]}>
                <LabelList dataKey="total" content={renderTotalLabel} />
              </Bar>
            </BarChart>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.entries(excelColors).map(([, c]) => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c.barFill, border: `1.5px solid ${c.dot}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap' }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default HistorialProcesamiento;
