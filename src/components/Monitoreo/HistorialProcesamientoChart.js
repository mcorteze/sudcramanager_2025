import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList, ReferenceLine
} from 'recharts';

const programColors = {};
const colorPalette = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7f50',
  '#a6cee3', '#b2df8a', '#fdbf6f', '#cab2d6',
  '#fb9a99', '#e31a1c', '#33a02c', '#1f78b4'
];

const HistorialProcesamientoChart = ({ filteredData }) => {
  const getChartData = () => {
    const quarterHours = Array.from({ length: 96 }, (_, i) => i * 0.25);
    const programas = [...new Set(filteredData.map(item => item.programa))];

    const base = quarterHours.map(h => {
      const hourLabel = h.toFixed(2);
      const entry = { hora: parseFloat(hourLabel) };
      programas.forEach(programa => {
        entry[programa] = 0;
      });
      return entry;
    });

    filteredData.forEach((item) => {
      const date = new Date(item.lectura_fecha);
      const hour = date.getHours();
      const minutes = date.getMinutes();
      const decimalHour = hour + minutes / 60;
      const rounded = Math.round(decimalHour * 4) / 4;
      const entry = base.find(e => e.hora === rounded);
      if (entry) {
        const programa = item.programa;
        if (programa) {
          entry[programa]++;
        }
      }
    });

    base.forEach(entry => {
      programas.forEach(programa => {
        if (entry[programa] === 0) {
          entry[programa] = null;
        }
      });
    });

    programas.forEach((programa, i) => {
      if (!programColors[programa]) {
        programColors[programa] = colorPalette[i % colorPalette.length];
      }
    });

    return { data: base, programas };
  };

  const { data, programas } = getChartData();
  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="hora"
          type="number"
          domain={[0, 24]}
          tickFormatter={(tick) => {
            const hours = Math.floor(tick);
            const minutes = Math.round((tick - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }}
          ticks={Array.from({ length: 25 }, (_, i) => i)}
        />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend
          payload={programas.map((programa) => ({
            value: programa,
            type: 'line',
            color: programColors[programa]
          }))}
        />
        <ReferenceLine
          x={currentDecimalHour}
          stroke="red"
          strokeWidth={2}
          label={{ value: 'Ahora', position: 'insideTopRight', fill: 'red' }}
        />
        {programas.map((programa) => (
          <Line
            key={programa}
            type="linear"
            dataKey={programa}
            stroke={programColors[programa]}
            connectNulls
          >
            <LabelList dataKey={programa} position="top" />
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistorialProcesamientoChart;
