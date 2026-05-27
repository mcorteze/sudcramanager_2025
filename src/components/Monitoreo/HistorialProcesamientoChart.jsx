import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';

const programColors = {
  'Programa de Matemáticas': '#28d0d4',
  'Programa de Lenguaje y Comunicación': '#f67297',
  'Programa de Inglés': '#ffb900',
};

const fallbackColors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7f50',
  '#a6cee3', '#b2df8a', '#fdbf6f', '#cab2d6',
  '#fb9a99', '#33a02c', '#1f78b4',
];

const assignedColors = { ...programColors };
let fallbackIndex = 0;

const getColor = (programa) => {
  if (!assignedColors[programa]) {
    assignedColors[programa] = fallbackColors[fallbackIndex % fallbackColors.length];
    fallbackIndex++;
  }
  return assignedColors[programa];
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const hh = String(Math.floor(label / 60)).padStart(2, '0');
  const mm = String(label % 60).padStart(2, '0');
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '8px 12px', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>{hh}:{mm} hrs</p>
      {payload.filter(p => p.value > 0).map(p => (
        <p key={p.dataKey} style={{ margin: '1px 0', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const HistorialProcesamientoChart = ({ filteredData }) => {
  const getChartData = () => {
    const minutesInDay = Array.from({ length: Math.ceil(1440 / 5) }, (_, i) => i * 5);

    if (!filteredData || filteredData.length === 0) {
      return { data: minutesInDay.map(m => ({ hora: m })), programas: [] };
    }

    const programas = [...new Set(filteredData.map(item => item.programa).filter(Boolean))];

    const base = minutesInDay.map(m => {
      const entry = { hora: m };
      programas.forEach(p => { entry[p] = 0; });
      return entry;
    });

    filteredData.forEach((item) => {
      if (!item.lectura_fecha) return;
      const date = new Date(item.lectura_fecha);
      if (isNaN(date.getTime())) return;
      const minuteOfDay = date.getHours() * 60 + Math.floor(date.getMinutes() / 5) * 5;
      const entry = base.find(e => e.hora === minuteOfDay);
      if (entry && item.programa && Object.prototype.hasOwnProperty.call(entry, item.programa)) {
        entry[item.programa]++;
      }
    });

    base.forEach(entry => {
      programas.forEach(p => { if (entry[p] === 0) entry[p] = null; });
    });

    return { data: base, programas };
  };

  const { data, programas } = getChartData();

  const now = new Date();
  const currentMinuteOfDay = now.getHours() * 60 + Math.floor(now.getMinutes() / 5) * 5;

  const tickFormatter = (tick) => {
    const hh = String(Math.floor(tick / 60)).padStart(2, '0');
    const mm = String(tick % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return (
    <div style={{ background: '#fff', padding: '8px 0 0 0' }}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="hora"
            type="number"
            domain={[0, 1440]}
            tickFormatter={tickFormatter}
            ticks={Array.from({ length: 25 }, (_, i) => i * 60)}
            tick={{ fontSize: 10, fill: '#888' }}
            axisLine={{ stroke: '#d9d9d9' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: '#888' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          <ReferenceLine
            x={currentMinuteOfDay}
            stroke="#ff4d4f"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            label={{ value: 'ahora', position: 'insideTopRight', fill: '#ff4d4f', fontSize: 10 }}
          />
          {programas.map((programa) => (
            <Line
              key={programa}
              type="monotone"
              dataKey={programa}
              stroke={getColor(programa)}
              strokeWidth={2}
              connectNulls
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistorialProcesamientoChart;
