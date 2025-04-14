import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Space, Row, Col, Select, Statistic } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UploadListaPage.css';

import InfoBox from '../components/InfoBox/InfoBox';
import UploadListaList from '../components/InfoBox/UploadListaList';

const UploadListaPage = () => {
  const [monitoreoData, setMonitoreoData] = useState([]);
  const [calificacionesTotales, setCalificacionesTotales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [filtro0, setFiltro0] = useState(false);

  const fetchMonitoreo = async () => {
    const desdeNum = parseInt(desde);
    let hastaNum = parseInt(hasta);

    if (desde && !hasta) {
      hastaNum = desdeNum;
      setHasta(desde);
    }

    if (!desde || isNaN(desdeNum)) {
      message.warning('Debes ingresar al menos el valor "Desde" como número.');
      return;
    }

    setLoading(true);
    try {
      const queryParams = [`desde=${desdeNum}`, `hasta=${hastaNum}`];
      const queryString = `?${queryParams.join('&')}`;

      const response = await axios.get(`http://localhost:3001/api/upload_lista${queryString}`);
      const data = response.data.data;

      setMonitoreoData(data);

      const calificacionesPorUpload = data.reduce((acc, item) => {
        const idUpload = parseInt(item.id_upload);
        if (item.tiene_calificacion) {
          if (!acc[idUpload]) {
            acc[idUpload] = { si: 0, no: 0 };
          }
          acc[idUpload].si++;
        } else {
          if (!acc[idUpload]) {
            acc[idUpload] = { si: 0, no: 0 };
          }
          acc[idUpload].no++;
        }
        return acc;
      }, {});

      const calificacionesArray = [];
      for (let i = hastaNum; i >= desdeNum; i--) {
        if (!calificacionesPorUpload[i]) {
          calificacionesPorUpload[i] = { si: 0, no: 0 };
        }
        calificacionesArray.push({
          id_upload: i,
          total_calificaciones_si: calificacionesPorUpload[i].si,
          total_calificaciones_no: calificacionesPorUpload[i].no,
          total_calificaciones_completas: calificacionesPorUpload[i].si + calificacionesPorUpload[i].no,
        });
      }

      setCalificacionesTotales(calificacionesArray);
    } catch (error) {
      console.error('Error al obtener monitoreo:', error);
      message.error('Hubo un problema al obtener los datos de monitoreo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    if (hasta && !desde) {
      const nuevoDesde = parseInt(hasta) - 100;
      setDesde(nuevoDesde.toString());
    } else {
      fetchMonitoreo();
    }
  };

  const filteredData = filtro0
    ? calificacionesTotales.filter((item) => item.total_calificaciones_si === 0)
    : calificacionesTotales;

  const calculateStatsByCategory = () => {
    let sinDescarga = 0;
    let conErrores = 0;
    let conCalificaciones = 0;

    calificacionesTotales.forEach((item) => {
      const total = item.total_calificaciones_completas;
      const si = item.total_calificaciones_si;

      if (total === 0) {
        sinDescarga++;
      } else if (si === 0) {
        conErrores++;
      } else {
        conCalificaciones++;
      }
    });

    return { sinDescarga, conErrores, conCalificaciones };
  };

  const { sinDescarga, conErrores, conCalificaciones } = calculateStatsByCategory();

  const calificacionesColumns = [
    {
      title: 'ID Upload',
      dataIndex: 'id_upload',
      key: 'id_upload',
      render: (id_upload) => <Link to={`/upload/${id_upload}`}>{id_upload}</Link>,
    },
    {
      title: 'Líneas con calificación',
      dataIndex: 'total_calificaciones_si',
      key: 'total_calificaciones_si',
    },
    {
      title: 'Líneas sin calificación',
      dataIndex: 'total_calificaciones_no',
      key: 'total_calificaciones_no',
    },
    {
      title: 'Total de líneas',
      dataIndex: 'total_calificaciones_completas',
      key: 'total_calificaciones_completas',
    },
  ];

  const rowClassName = (record) => {
    const total = record.total_calificaciones_completas;
    const si = record.total_calificaciones_si;

    if (total === 0) {
      return 'sin-descarga';
    } else if (si === 0 && total > 0) {
      return 'con-errores';
    } else if (total > 0 && si > 0) {
      return 'con-calificaciones';
    } else {
      return ''; // fallback por si acaso
    }
  };

  useEffect(() => {
    if (desde && hasta) {
      fetchMonitoreo();
    }
  }, [desde, hasta]);

  const handleDownloadFaltantes = () => {
    const faltantes = filteredData
      .filter(item => item.total_calificaciones_completas === 0)
      .map(item => item.id_upload);

    if (faltantes.length === 0) {
      message.warning('No hay elementos sin descarga.');
      return;
    }

    const csvContent = faltantes.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'faltantes.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-full">
      <h1>Total de Calificaciones por ID Upload</h1>
      <InfoBox items={UploadListaList} />
      <Space style={{ marginBottom: 16, marginLeft: 10 }}>
        <Input
          placeholder="Desde ID Upload"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          style={{ width: 200 }}
        />
        <Input
          placeholder="Hasta ID Upload"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleBuscar}>
          Buscar
        </Button>
      </Space>
      
      <Space style={{ marginBottom: 16, marginLeft: 10 }}>
        <Select
          value={filtro0 ? '0 Calificaciones' : 'Todos'}
          onChange={(value) => setFiltro0(value === '0 Calificaciones')}
        >
          <Select.Option value="0 Calificaciones">0 Calificaciones</Select.Option>
          <Select.Option value="Todos">Todos</Select.Option>
        </Select>
      </Space>

      <Space style={{ marginBottom: 16, marginLeft: 10 }}>
        <Button type="primary" onClick={handleDownloadFaltantes}>
          Descargar faltantes
        </Button>
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="Sin descarga" value={sinDescarga} />
        </Col>
        <Col span={8}>
          <Statistic title="Con errores" value={conErrores} />
        </Col>
        <Col span={8}>
          <Statistic title="Con calificaciones" value={conCalificaciones} />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Table
            columns={calificacionesColumns}
            dataSource={filteredData}
            rowKey="id_upload"
            size="small"
            pagination={false}
            loading={loading}
            rowClassName={rowClassName}
          />
        </Col>
      </Row>
    </div>
  );
};

export default UploadListaPage;
