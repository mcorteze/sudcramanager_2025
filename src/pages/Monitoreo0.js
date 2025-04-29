import React, { useEffect, useState } from 'react';
import {
  Spin,
  message,
  Typography,
  Divider,
  DatePicker,
  Space,
  Select,
  Row,
  Col,
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList, ReferenceLine
} from 'recharts';

const { Title } = Typography;
const { Option } = Select;

const HistorialProcesamientoTable = () => {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [tipoArchivo, setTipoArchivo] = useState(null);
  const [filters, setFilters] = useState({
    cod_programa: null,
    cod_asig: null,
    num_prueba: null,
    nombre_prueba: null,
  });

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/historial_procesamiento');
      const allData = response.data || [];
      setRawData(allData);
      filterAll(allData, selectedDate, tipoArchivo, filters);
    } catch (error) {
      console.error('Error al obtener historial de procesamiento:', error);
      message.error('No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterAll(rawData, date, tipoArchivo, filters);
  };

  const handleTipoArchivoChange = (value) => {
    setTipoArchivo(value);
    filterAll(rawData, selectedDate, value, filters);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    filterAll(rawData, selectedDate, tipoArchivo, newFilters);
  };

  const filterAll = (data, date, tipo, filtros) => {
    if (!date) return;

    const day = date.date();
    const month = date.month();

    const filtered = data
      .filter((item) => {
        const itemDate = new Date(item.lectura_fecha);
        return itemDate.getDate() === day && itemDate.getMonth() === month;
      })
      .filter((item) => (tipo ? item.tipoarchivo === tipo : true))
      .filter((item) =>
        Object.entries(filtros).every(([key, value]) =>
          value ? item[key] === value : true
        )
      );

    setFilteredData(filtered);
  };

  const getUniqueOptions = (field) => {
    return [...new Set(filteredData.map((item) => item[field]).filter(Boolean))];
  };

  const renderFilters = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {['cod_programa', 'cod_asig', 'num_prueba', 'nombre_prueba'].map((field) => (
        <Col key={field}>
          <Select
            placeholder={field}
            style={{ width: 180 }}
            allowClear
            value={filters[field]}
            onChange={(value) => handleFilterChange(field, value)}
          >
            {getUniqueOptions(field).map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        </Col>
      ))}
      <Col>
        <Select
          placeholder="Tipo de archivo"
          style={{ width: 180 }}
          allowClear
          value={tipoArchivo}
          onChange={handleTipoArchivoChange}
        >
          <Option value=".txt">.txt</Option>
          <Option value=".xlsm">.xlsm</Option>
        </Select>
      </Col>
    </Row>
  );

  const programColors = {};
  const colorPalette = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7f50',
    '#a6cee3', '#b2df8a', '#fdbf6f', '#cab2d6',
    '#fb9a99', '#e31a1c', '#33a02c', '#1f78b4'
  ];

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

    return base;
  };

  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;

  return (
    <Spin spinning={loading}>
      <div>
        <Space direction="vertical" size="middle">
          <Title level={2} style={{ fontSize: 22, fontWeight: 300 }}>Monitoreo de lecturas con calificación</Title>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            format="DD-MM-YYYY"
            allowClear={false}
          />
        </Space>

        <Divider />

        {renderFilters()}

        <Title level={4}>Distribución de lecturas con calificación, por hora y programa</Title>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={getChartData()}>
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
            <Legend />
            <ReferenceLine
              x={currentDecimalHour}
              stroke="red"
              strokeWidth={2}
              label={{ value: 'Ahora', position: 'insideTopRight', fill: 'red' }}
            />
            {Array.from(new Set(filteredData.map(item => item.programa))).map((programa) => (
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
      </div>
    </Spin>
  );
};

export default HistorialProcesamientoTable;
