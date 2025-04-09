import React, { useState } from 'react';
import { Table, Input, Button, message, Space, Row, Col, Select, Statistic } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UploadListaPage.css';

const UploadListaPage = () => {
  const [monitoreoData, setMonitoreoData] = useState([]);
  const [calificacionesTotales, setCalificacionesTotales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [filtro0, setFiltro0] = useState(false); // Estado para el filtro 0 calificaciones

  const fetchMonitoreo = async () => {
    const desdeNum = parseInt(desde);
    let hastaNum = parseInt(hasta);

    if (desde && !hasta) {
      hastaNum = desdeNum;
      setHasta(desde); // sincroniza input hasta también
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

      // Calcular las calificaciones por ID Upload
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

      // Asegurarse de que todos los IDs entre "desde" y "hasta" estén presentes en la lista
      const calificacionesArray = [];
      for (let i = desdeNum; i <= hastaNum; i++) {
        if (!calificacionesPorUpload[i]) {
          calificacionesPorUpload[i] = { si: 0, no: 0 }; // Si no tiene calificaciones, poner 0
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
    fetchMonitoreo();
  };

  // Filtrar las filas con calificaciones "0"
  const filteredData = filtro0
    ? calificacionesTotales.filter((item) => item.total_calificaciones_si === 0)
    : calificacionesTotales;

  // Agregar una columna "Forms"
  const dataWithForms = filteredData.map((item) => ({
    ...item,
    forms: item.id_upload % 2 === 0 ? 'Forms Ingles' : 'Forms Lenguaje',
  }));

  // Calcular estadísticas por Forms
  const calculateStatistics = () => {
    const total = dataWithForms.length;
    const formsStats = {
      'Forms Lenguaje': {
        totalCalificaciones: 0,
        count0: 0,
      },
      'Forms Ingles': {
        totalCalificaciones: 0,
        count0: 0,
      },
    };

    let totalCalificaciones = 0; // Variable para almacenar el total de calificaciones

    dataWithForms.forEach((item) => {
      const formsType = item.forms;
      if (item.total_calificaciones_si > 0) {
        formsStats[formsType].totalCalificaciones += item.total_calificaciones_si;
        totalCalificaciones += item.total_calificaciones_si;
      } else {
        formsStats[formsType].count0 += 1;
      }
    });

    const formsLenguajePercentage = totalCalificaciones
      ? (formsStats['Forms Lenguaje'].totalCalificaciones / totalCalificaciones) * 100
      : 0;
    const formsInglesPercentage = totalCalificaciones
      ? (formsStats['Forms Ingles'].totalCalificaciones / totalCalificaciones) * 100
      : 0;

    return { formsStats, formsLenguajePercentage, formsInglesPercentage, totalCalificaciones };
  };

  const { formsStats, formsLenguajePercentage, formsInglesPercentage, totalCalificaciones } =
    calculateStatistics();

  const calificacionesColumns = [
    {
      title: 'Forms',
      dataIndex: 'forms',
      key: 'forms',
    },
    {
      title: 'ID Upload',
      dataIndex: 'id_upload',
      key: 'id_upload',
      render: (id_upload) => (
        <Link to={`/upload/${id_upload}`}>{id_upload}</Link>
      ),
    },
    {
      title: 'Lineas con calificación',
      dataIndex: 'total_calificaciones_si',
      key: 'total_calificaciones_si',
    },
    {
      title: 'Lineas sin calificación',
      dataIndex: 'total_calificaciones_no',
      key: 'total_calificaciones_no',
    },
    {
      title: 'Total de líneas',
      dataIndex: 'total_calificaciones_completas',
      key: 'total_calificaciones_completas',
    },
  ];

  // Función para asignar clase a la fila, marca en rojo si las calificaciones son 0
  const rowClassName = (record) => {
    return record.total_calificaciones_si === 0 ? 'sin_calificacion' : '';
  };

  // Formatear números con punto como separador de miles
  const formatNumber = (number) => {
    return new Intl.NumberFormat('de-CL').format(number);
  };

  return (
    <div className="page-full">
      <h1>Total de Calificaciones por ID Upload</h1>

      <Space style={{ marginBottom: 16 }}>
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

      <Space style={{ marginBottom: 16 }}>
        <Select
          value={filtro0 ? '0 Calificaciones' : 'Todos'}
          onChange={(value) => setFiltro0(value === '0 Calificaciones')}
        >
          <Select.Option value="0 Calificaciones">0 Calificaciones</Select.Option>
          <Select.Option value="Todos">Todos</Select.Option>
        </Select>
      </Space>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic
            title="Calificaciones Forms Lenguaje"
            value={formatNumber(formsStats['Forms Lenguaje'].totalCalificaciones)}
            suffix={`(${formsLenguajePercentage.toFixed(2)}%)`}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Calificaciones Forms Ingles"
            value={formatNumber(formsStats['Forms Ingles'].totalCalificaciones)}
            suffix={`(${formsInglesPercentage.toFixed(2)}%)`}
          />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic
            title="0 Calificaciones Forms Lenguaje"
            value={formsStats['Forms Lenguaje'].count0}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="0 Calificaciones Forms Ingles"
            value={formsStats['Forms Ingles'].count0}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
        <Table
          columns={calificacionesColumns}
          dataSource={dataWithForms}
          rowKey="id_upload"
          size="small"
          pagination={false}
          loading={loading}
          rowClassName={rowClassName}  // Aplica la función rowClassName
        />
        </Col>
      </Row>
    </div>
  );
};

export default UploadListaPage;
