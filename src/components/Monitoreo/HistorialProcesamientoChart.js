import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList, ReferenceLine, CartesianGrid
} from 'recharts';

// Colores específicos para programas conocidos
const programColors = {
  'Programa de Matemáticas': '#28d0d4 ', 
  'Programa de Lenguaje y Comunicación': '#f67297', 
  'Programa de Inglés': '#ffb900'
};

// Paleta de respaldo para otros programas
const fallbackColors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7f50',
  '#a6cee3', '#b2df8a', '#fdbf6f', '#cab2d6',
  '#fb9a99', '#33a02c', '#1f78b4'
];

const HistorialProcesamientoChart = ({ filteredData }) => {
  const getChartData = () => {
    // Crear un rango de 1440 minutos (24 horas * 60 minutos)
    const minutesInDay = Array.from({ length: 1440 }, (_, i) => i);
    const programas = [...new Set(filteredData.map(item => item.programa))];

    const base = minutesInDay.map(m => {
      const entry = { hora: m }; // Usar el número de minuto directamente
      programas.forEach(programa => {
        entry[programa] = 0;
      });
      return entry;
    });

    filteredData.forEach((item) => {
      const date = new Date(item.lectura_fecha);
      const hour = date.getHours();
      const minutes = date.getMinutes();
      const minuteOfDay = hour * 60 + minutes; // Calcular minuto del día

      // Buscar el minuto exacto en el arreglo de base
      const entry = base.find(e => e.hora === minuteOfDay);
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

    // Asignar colores a programas
    let fallbackIndex = 0;
    programas.forEach(programa => {
      if (!programColors[programa]) {
        programColors[programa] = fallbackColors[fallbackIndex % fallbackColors.length];
        fallbackIndex++;
      }
    });

    return { data: base, programas };
  };

  const { data, programas } = getChartData();
  const now = new Date();
  const currentMinuteOfDay = now.getHours() * 60 + now.getMinutes(); // Minuto actual del día

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} className="grafico-lineas">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hora"
          type="number"
          domain={[0, 1440]} // Rango de 0 a 1440 minutos
          tickFormatter={(tick) => {
            const hours = Math.floor(tick / 60);
            const minutes = tick % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }}
          ticks={Array.from({ length: 25 }, (_, i) => i * 60)} // Mostrar un tick cada hora
        />
        <YAxis allowDecimals={false} />
        <Tooltip
          labelFormatter={(label) => {
            const hours = Math.floor(label / 60);
            const minutes = label % 60;
            return `Marca temporal: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} hrs.`;
          }}
        />
        <Legend verticalAlign="bottom" align="center" height={36} />
        <ReferenceLine
          x={currentMinuteOfDay}
          stroke="red"
          strokeWidth={2}
          label={{ value: '', position: 'insideTopRight', fill: 'red' }}
        />
        {programas.map((programa) => (
          <Line
            key={programa}
            type="linear"
            dataKey={programa}
            stroke={programColors[programa]}
            connectNulls
          >
            <LabelList dataKey={programa} fill="#bbbbbb" position="top" />
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistorialProcesamientoChart;
