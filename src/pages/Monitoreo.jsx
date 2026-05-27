import React, { useEffect, useRef, useState } from 'react';
import {
  Spin, message, Divider,
  Select, Row, Col
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import HistorialProcesamientoChart from '../components/Monitoreo/HistorialProcesamientoChart';
import UltimasLecturasFormsTable from '../components/Monitoreo/UltimasLecturasFormsTable';
import HistorialProcesamiento from '../components/Monitoreo/HistorialProcesamiento';
import MarcaTempConsola from '../components/Monitoreo/MarcaTempConsola';

import 'dayjs/locale/es';
import esES from 'antd/locale/es_ES';
import { ConfigProvider } from 'antd';

dayjs.locale('es');

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

    fetchHistorial();

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
      console.log('[Monitoreo] total registros recibidos:', allData.length, 'ejemplo:', allData[0]);
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

    const targetDateStr = date.format('YYYY-MM-DD');
    const filtered = data
      .filter((item) => {
        if (!item.lectura_fecha) return false;
        // Comparación rápida de strings (YYYY-MM-DD)
        return item.lectura_fecha.startsWith(targetDateStr);
      })
      .filter((item) => (tipo ? item.tipoarchivo === tipo : true))
      .filter((item) =>
        Object.entries(filtros).every(([key, value]) =>
          value ? item[key] === value : true
        )
      );

    console.log('[Monitoreo] filteredData:', filtered.length, 'registros para fecha', date?.format?.('YYYY-MM-DD'));
    setFilteredData(filtered);
  };

  const getUniqueOptions = (field) => {
    return [...new Set(filteredData.map((item) => item[field]).filter(Boolean))];
  };

  const renderFilters = () => (
    <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
      {['cod_programa', 'cod_asig', 'num_prueba', 'nombre_prueba'].map((field) => (
        <Col key={field}>
          <Select
            placeholder={field}
            style={{ width: 160 }}
            allowClear
            size="small"
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
          style={{ width: 140 }}
          allowClear
          size="small"
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
      <Spin spinning={loading}>
        {/* Fila de cards */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 10 }}>
          <UltimasLecturasFormsTable
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
          <HistorialProcesamiento />
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Filtros */}
        {renderFilters()}

        {/* Gráfico de líneas */}
        <div style={{ marginTop: 4 }}>
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 6px 0' }}>
            Lecturas con calificación — {selectedDate?.format('DD/MM/YYYY')}
          </p>
          {filteredData.length > 0 ? (
            <HistorialProcesamientoChart filteredData={filteredData} />
          ) : (
            <div style={{ height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #e0e0e0', borderRadius: 8, color: '#ccc', fontSize: 12 }}>
              Sin datos con calificación para la fecha seleccionada
            </div>
          )}
        </div>
      </Spin>
      <MarcaTempConsola />
    </div>
    </ConfigProvider>
  );
};

export default HistorialProcesamientoTable;
