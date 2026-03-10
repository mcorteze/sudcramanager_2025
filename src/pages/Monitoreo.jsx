import React, { useEffect, useRef, useState } from 'react';
import {
  Spin, message, Typography, Divider, DatePicker,
  Space, Select, Row, Col
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import HistorialProcesamientoChart from '../components/Monitoreo/HistorialProcesamientoChart';
import EquiposEstado from '../components/Monitoreo/EquiposEstado';
import NotificacionCampana from '../components/NotificacionesCampana/NotificacionesCamapana';
import UltimasLecturasFormsTable from '../components/Monitoreo/UltimasLecturasFormsTable';
import HistorialProcesamiento from '../components/Monitoreo/HistorialProcesamiento';
import MarcaTempConsola from '../components/Monitoreo/MarcaTempConsola';

import 'dayjs/locale/es';
import esES from 'antd/locale/es_ES';
import { ConfigProvider } from 'antd';

dayjs.locale('es');

const { Title } = Typography;
const { Option } = Select;

const HistorialProcesamientoTable = () => {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [tipoArchivo, setTipoArchivo] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filters, setFilters] = useState({
    cod_programa: null,
    cod_asig: null,
    num_prueba: null,
    nombre_prueba: null,
  });
  const intervalRef = useRef(null);

  const hayFiltrosActivos = () => {
    return tipoArchivo !== null || Object.values(filters).some(val => val !== null);
  };
  
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  
    const updateCondition = () => {
      const esHoy = dayjs(selectedDate).isSame(dayjs(), 'day');
      const filtrosActivos = tipoArchivo !== null || Object.values(filters).some(val => val !== null);
      return esHoy && !filtrosActivos;
    };
  
    if (updateCondition()) {
      intervalRef.current = setInterval(() => {
        if (updateCondition()) {
          fetchHistorial();
        }
      }, 20000);
    }
  
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedDate, tipoArchivo, filters]);
  
  

  const fetchHistorial = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/historial_procesamiento');
      const allData = response.data || [];
      setRawData(allData);
      filterAll(allData, selectedDate, tipoArchivo, filters);
      setLastUpdated(new Date());
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

  return (
    <ConfigProvider locale={esES}>
    <div className='page-full'>
      <h1>Monitoreo</h1> 
      <Spin spinning={loading}>
        <div>
          <Space direction="vertical" size="middle" style = {{ width: '100%' }}>
            <Space direction="horizontal" size="middle">
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="DD-MM-YYYY"
                allowClear={false}
              />
            </Space>
            <Space direction="horizontal" size="middle" style = {{ width: '100%', height: 'fit-content',display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <EquiposEstado />
              <UltimasLecturasFormsTable />
              <HistorialProcesamiento rawData={rawData} loading={loading} />
            </Space>
          </Space>
          <Divider />

          {renderFilters()}

          <Title level={5} style = {{ marginBottom: '0px' }}>Procesos de lecturas con calificación</Title>
          {lastUpdated && (
            <Typography.Paragraph style={{ fontSize: '12px', color: 'red', marginBottom: '12px' }}>
              Última actualización: {dayjs(lastUpdated).format('HH:mm:ss')}, Polling (20s)
            </Typography.Paragraph>
          )}
          
          <HistorialProcesamientoChart filteredData={filteredData} />
        </div>
      </Spin>
      <MarcaTempConsola />
    </div>
    </ConfigProvider>
  );
};

export default HistorialProcesamientoTable;
