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
  ResponsiveContainer, LabelList
} from 'recharts';

const { Title } = Typography;
const { Option } = Select;

const HistorialImagenesTable = () => {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cod_programa: null,
    cod_asig: null,
    id_sede: null,
  });

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/historial_imagenes');
      const allData = response.data.data || [];
      setRawData(allData);
      filterAll(allData, filters);
    } catch (error) {
      console.error('Error al obtener historial de imágenes:', error);
      message.error('No se pudo cargar el historial de imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    filterAll(rawData, newFilters);
  };

  const filterAll = (data, filtros) => {
    const filtered = data.filter((item) =>
      Object.entries(filtros).every(([key, value]) =>
        value ? item[key] === value : true
      )
    );

    // Asegurar que cant_adjuntos sea número
    const parsed = filtered.map(item => ({
      ...item,
      cant_adjuntos: parseInt(item.cant_adjuntos, 10)
    }));

    setFilteredData(parsed);
  };

  const getUniqueOptions = (field) => {
    return [...new Set(rawData.map((item) => item[field]).filter(Boolean))];
  };

  const renderFilters = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {['cod_programa', 'cod_asig', 'id_sede'].map((field) => (
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
    </Row>
  );

  const getChartData = () => {
    const grouped = {};

    filteredData.forEach(item => {
      const idLista = item.id_lista;
      if (!grouped[idLista]) {
        grouped[idLista] = { id_lista: idLista, cant_adjuntos: 0 };
      }
      grouped[idLista].cant_adjuntos += item.cant_adjuntos || 0;
    });

    return Object.values(grouped).sort((a, b) => a.id_lista - b.id_lista);
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={4}>Filtrar por campos</Title>
        {renderFilters()}

        <Divider />

        <Title level={4}>Cantidad de adjuntos por lista</Title>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={getChartData()}>
            <XAxis
              dataKey="id_lista"
              type="category"
              label={{ value: 'ID Lista', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              allowDecimals={false}
              label={{ value: 'Cantidad de adjuntos', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="cant_adjuntos"
              stroke="#8884d8"
              activeDot={{ r: 6 }}
            >
              <LabelList dataKey="cant_adjuntos" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Spin>
  );
};

export default HistorialImagenesTable;
