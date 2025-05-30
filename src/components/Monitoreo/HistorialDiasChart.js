import React, { useEffect, useState } from 'react';
import { Spin, message, Typography } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, LabelList
} from 'recharts';

const { Title } = Typography;

const HistorialProcesamiento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Función para obtener los últimos 5 días
  const getLast5Days = () => {
    const days = [];
    for (let i = 4; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }
    return days;
  };

  // Función para procesar y filtrar los datos
  const processData = (rawData) => {
    const last5Days = getLast5Days();
    const result = last5Days.map(day => {
      const dayData = rawData.filter(item => dayjs(item.lectura_fecha).format('YYYY-MM-DD') === day);
      return {
        date: day,
        '.txt': dayData.filter(item => item.tipoarchivo === '.txt').length,
        '.xlsm': dayData.filter(item => item.tipoarchivo === '.xlsm').length,
        '.xlsx': dayData.filter(item => item.tipoarchivo === '.xlsx').length,
      };
    });
    setData(result);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/historial_procesamiento');
        const allData = response.data || [];
        processData(allData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error al obtener historial de procesamiento:', error);
        message.error('No se pudo cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para renderizar el texto solo si el valor es mayor que 0
  const renderLabel = (props) => {
    const { x, y, width, value } = props;
    if (value > 0) {
      return (
        <text x={x + width / 2} y={y + 15} textAnchor="middle" fill="#43640b" fontSize={12}>
          {value}
        </text>
      );
    }
    return null; // No mostrar el texto si el valor es 0
  };

  return (
    <div style={{ height: '210px', width: '350px' }}>
      <Spin spinning={loading}>
        <div>
          <Title level={5} style={{ marginBottom: '20px' }}>Total de Procesamientos por Día</Title>

          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data}>
              <XAxis dataKey="date" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo negro con 50% de transparencia
                  border: 'none', // Eliminar el borde
                  color: 'white', // Color del texto del tooltip
                }}
              />
              <Legend />
              <Bar dataKey=".txt" stackId="a" fill="#eef1f0" barSize={50}>
                <LabelList content={renderLabel} />
              </Bar>
              <Bar dataKey=".xlsm" stackId="a" fill="#8ce1c2" barSize={50}>
                <LabelList content={renderLabel} />
              </Bar>
              <Bar dataKey=".xlsx" stackId="a" fill="#ffff67" barSize={50}>
                <LabelList content={renderLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Spin>
    </div>
  );
};

export default HistorialProcesamiento;
