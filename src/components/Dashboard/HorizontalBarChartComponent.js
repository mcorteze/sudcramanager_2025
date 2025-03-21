import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Text } from 'recharts';

// Función para formatear números con puntuación
const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num);

const CustomYAxisTick = ({ x, y, payload }) => (
  <text
    x={x}
    y={y}
    dy={4} // Ajuste vertical
    fontSize={12} // Tamaño de fuente
    fill="#000" // Color de texto
    textAnchor="end" // Alineación del texto
  >
    {payload.value}
  </text>
);

const CustomBarLabel = ({ x, y, width, value }) => (
  <Text
    x={x + width + 5} // Desplazar un poco a la derecha del borde de la barra
    y={y + 10} // Centrar verticalmente con la barra
    fontSize={12} // Tamaño de fuente
    fill="#000" // Color de texto
    textAnchor="start" // Alinear al inicio
  >
    {formatNumber(value)} {/* Formatear valor */}
  </Text>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo semitransparente
          border: '1px solid #ddd',
          borderRadius: '5px',
          padding: '10px',
          width: '200px', // Ajustar el ancho
          wordWrap: 'break-word', // Permitir que el texto se ajuste
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{name}</p>
        <p style={{ margin: 0 }}>{`Procesos: ${formatNumber(value)}`}</p> {/* Formatear valor */}
      </div>
    );
  }
  return null;
};

const HorizontalBarChartComponent = ({ data }) => {
  const sedeCounts = data.reduce((acc, item) => {
    acc[item.nombre_sede] = (acc[item.nombre_sede] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(sedeCounts)
    .map(sede => ({
      name: sede,
      value: sedeCounts[sede],
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); // Ordenar alfabéticamente por el nombre de la sede

  return (
    <div style={{ width: '100%', height: '100%', padding: '10px' }}>
      <h3>Total de procesos por sede</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={formatNumber} // Formatear números en el eje X
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={<CustomYAxisTick />} // Usando componente personalizado
            interval={0}
          />
          <Tooltip content={<CustomTooltip />} /> {/* Tooltip personalizado */}
          <Bar
            dataKey="value"
            fill="#284872"
            barSize={20}
            label={<CustomBarLabel />} // Agregar etiquetas personalizadas
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalBarChartComponent;
