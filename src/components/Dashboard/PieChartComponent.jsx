import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, Text } from 'recharts';
import './PieChartComponent.css';

const COLORS = ['#9C9BBF', '#9CC1D9', '#CCE3E3', '#FFCDDC', '#FFE5C7'];

// Función para mapear el nombre del programa a su abreviatura
const mapProgramToAbbreviation = (program) => {
  switch (program) {
    case 'Programa de Matemáticas':
      return 'MAT';
    case 'Programa de Lenguaje y Comunicación':
      return 'LEN';
    case 'Programa de Inglés':
      return 'ING';
    case 'Programa de Emprendimiento':
      return 'EMP';
    case 'Programa de Etica':
      return 'ETI';
    case 'Programa de Formación Cristiana':
      return 'CRI';
    default:
      return program; // Si no coincide con ningún caso, retornar el nombre original
  }
};

// Función para formatear números con puntuación
const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num);

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2; // Calcular el radio para posicionar el texto en el centro del sector
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const abbreviatedName = mapProgramToAbbreviation(name); // Obtener la abreviatura del programa

  return (
    <Text
      x={x}
      y={y}
      fill="#5d5d5d"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={30} // Tamaño de letra más grande
      fontWeight="400"
    >
      {`${abbreviatedName}: ${formatNumber(value)}`} {/* Formatear valor */}
    </Text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const abbreviatedName = mapProgramToAbbreviation(name); // Obtener la abreviatura para el tooltip

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
        <p style={{ margin: 0 }}>{`Procesamientos: ${formatNumber(value)}`}</p> {/* Formatear valor */}
      </div>
    );
  }
  return null;
};

const PieChartComponent = ({ data }) => {
  // Contar ocurrencias por programa
  const programCounts = data.reduce((acc, item) => {
    acc[item.programa] = (acc[item.programa] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(programCounts).map(program => ({
    name: program,
    value: programCounts[program],
  }));

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabel} // Usar etiqueta personalizada
        outerRadius={150}
        fill="#8884d8"
        dataKey="value"
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} /> {/* Tooltip personalizado */}
      <Legend />
    </PieChart>
  );
};

export default PieChartComponent;
