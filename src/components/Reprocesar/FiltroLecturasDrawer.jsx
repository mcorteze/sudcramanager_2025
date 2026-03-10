import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Select,
  Button,
  Space,
  message,
  Table,
  Typography,
  Statistic,
  Card,
} from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { Option } = Select;
const { Title } = Typography;

const FiltroLecturasDrawer = ({ open, onClose, onSeleccion }) => {
  const [opciones, setOpciones] = useState([]);
  const [programaList, setProgramaList] = useState([]);
  const [codAsigList, setCodAsigList] = useState([]);
  const [numPruebaList, setNumPruebaList] = useState([]);
  const [filtros, setFiltros] = useState({
    programa: null,
    cod_asig: null,
    num_prueba: null,
  });
  const [resultadosFiltrados, setResultadosFiltrados] = useState([]);
  const [imagenesEncontradas, setImagenesEncontradas] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/seleccion-cod-interno-prueba');
        setOpciones(res.data);
        setProgramaList([...new Set(res.data.map(item => item.programa))]);
      } catch (err) {
        console.error(err);
        message.error('Error al cargar datos');
      }
    };
    if (open) fetchDatos();
  }, [open]);

  useEffect(() => {
    if (filtros.programa) {
      const cods = opciones.filter(o => o.programa === filtros.programa).map(o => o.cod_asig);
      setCodAsigList([...new Set(cods)]);
    } else {
      setCodAsigList([]);
      setFiltros(prev => ({ ...prev, cod_asig: null, num_prueba: null }));
    }
  }, [filtros.programa]);

  useEffect(() => {
    if (filtros.cod_asig) {
      const nums = opciones.filter(o => o.cod_asig === filtros.cod_asig).map(o => o.num_prueba);
      setNumPruebaList([...new Set(nums)]);
    } else {
      setNumPruebaList([]);
      setFiltros(prev => ({ ...prev, num_prueba: null }));
    }
  }, [filtros.cod_asig]);

  const handleAplicar = () => {
    const filtrados = opciones.filter(
      (o) =>
        o.programa === filtros.programa &&
        o.cod_asig === filtros.cod_asig &&
        o.num_prueba === filtros.num_prueba
    );
    setResultadosFiltrados(filtrados);
    onSeleccion(filtros);
  };

  const handleBuscarImagenes = async () => {
    const codInterno = resultadosFiltrados[0]?.cod_interno;
    const numPrueba = filtros.num_prueba;

    if (!codInterno || !numPrueba) {
      message.error('Faltan datos para buscar imágenes');
      return;
    }

    try {
      const res = await axios.get('http://localhost:3001/api/buscar-imagenes-lectura', {
        params: { cod_interno: codInterno, num_prueba: numPrueba },
      });

      setImagenesEncontradas(res.data);
      message.success(`${res.data.length} imágenes encontradas`);
    } catch (err) {
      console.error(err);
      message.error('Error al buscar imágenes');
    }
  };

  const handleDescargarExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [['ID_Imagen'], ...imagenesEncontradas.map(obj => [obj.imagen])];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
    XLSX.writeFile(wb, 'imagenes_encontradas.xlsx');
  };

  const columnsFiltro = [
    { title: 'Programa', dataIndex: 'programa', key: 'programa' },
    { title: 'Código Asignatura', dataIndex: 'cod_asig', key: 'cod_asig' },
    { title: 'Código Interno', dataIndex: 'cod_interno', key: 'cod_interno' },
    { title: 'Número de Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
  ];

  const columnsImagenes = [
    { title: 'ID_Imagen', dataIndex: 'imagen', key: 'imagen' },
  ];

  return (
    <Drawer
      title="Seleccionar filtros"
      placement="right"
      onClose={onClose}
      open={open}
      width="80%"
    >
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Select
          placeholder="Selecciona un programa"
          value={filtros.programa}
          onChange={val => setFiltros({ programa: val, cod_asig: null, num_prueba: null })}
          style={{ width: '100%' }}
        >
          {programaList.map(p => (
            <Option key={p} value={p}>{p}</Option>
          ))}
        </Select>

        <Select
          placeholder="Selecciona un código de asignatura"
          value={filtros.cod_asig}
          onChange={val => setFiltros({ ...filtros, cod_asig: val, num_prueba: null })}
          disabled={!filtros.programa}
          style={{ width: '100%' }}
        >
          {codAsigList.map(c => (
            <Option key={c} value={c}>{c}</Option>
          ))}
        </Select>

        <Select
          placeholder="Selecciona número de prueba"
          value={filtros.num_prueba}
          onChange={val => setFiltros({ ...filtros, num_prueba: val })}
          disabled={!filtros.cod_asig}
          style={{ width: '100%' }}
        >
          {numPruebaList.map(n => (
            <Option key={n} value={n}>{n}</Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleAplicar} disabled={!filtros.num_prueba}>
          Aplicar filtros
        </Button>
      </Space>

      {resultadosFiltrados.length > 0 && (
        <>
          <Table
            dataSource={resultadosFiltrados.map((item, index) => ({ ...item, key: index }))}
            columns={columnsFiltro}
            pagination={false}
            style={{ marginBottom: 24 }}
          />

          <Button type="default" onClick={handleBuscarImagenes}>
            Buscar id_imagen
          </Button>
        </>
      )}

      {imagenesEncontradas.length > 0 && (
        <>
          <Card style={{ marginTop: 24, marginBottom: 16 }}>
            <Statistic
              title="Total de imágenes encontradas"
              value={imagenesEncontradas.length}
            />
            <Button type="primary" style={{ marginTop: 12 }} onClick={handleDescargarExcel}>
              Descargar resultados en Excel
            </Button>
          </Card>

          <Table
            dataSource={imagenesEncontradas.map((item, index) => ({ ...item, key: index }))}
            columns={columnsImagenes}
            pagination={{ pageSize: 10 }}
          />
        </>
      )}
    </Drawer>
  );
};

export default FiltroLecturasDrawer;
