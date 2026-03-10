import React, { useState } from 'react';
import { Table, Tag, Input, Button, message, Space, Row, Col } from 'antd';
import axios from 'axios';

const MonitoreoPage = () => {
  const [monitoreoData, setMonitoreoData] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [calificacionesTotales, setCalificacionesTotales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

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

      const response = await axios.get(`http://localhost:3001/api/monitoreo_lista${queryString}`);
      const data = response.data.data;

      setMonitoreoData(data);

      // IDs encontrados
      const encontrados = [...new Set(data.map(item => parseInt(item.id_upload)))];

      // Calcular faltantes en el rango con tipo
      const faltantesCalculados = [];
      for (let i = desdeNum; i <= hastaNum; i++) {
        if (!encontrados.includes(i)) {
          faltantesCalculados.push({
            id_upload: i,
            tipo: i % 2 === 0 ? 'Forms Inglés' : 'Forms Lenguaje',
          });
        }
      }

      setFaltantes(faltantesCalculados);

      // Calcular las calificaciones "Sí" por ID Upload
      const calificacionesPorUpload = data.reduce((acc, item) => {
        const idUpload = parseInt(item.id_upload);
        if (item.tiene_calificacion) {
          if (!acc[idUpload]) {
            acc[idUpload] = 0;
          }
          acc[idUpload]++;
        }
        return acc;
      }, {});

      // Asegurarse de que todos los IDs entre "desde" y "hasta" estén presentes en la lista
      const calificacionesArray = [];
      for (let i = desdeNum; i <= hastaNum; i++) {
        if (!calificacionesPorUpload[i]) {
          calificacionesPorUpload[i] = 0; // Si no tiene calificaciones, poner 0
        }
        calificacionesArray.push({
          id_upload: i,
          total_calificaciones: calificacionesPorUpload[i],
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

  const columns = [
    {
      title: 'Título',
      key: 'titulo',
      render: (record) => {
        const idUploadNum = parseInt(record.id_upload);
        return idUploadNum % 2 === 0 ? 'Forms Inglés' : 'Forms Lenguaje';
      },
    },
    {
      title: 'ID Upload',
      dataIndex: 'id_upload',
      key: 'id_upload',
    },
    {
      title: 'ID Archivo Leído',
      dataIndex: 'id_archivoleido',
      key: 'id_archivoleido',
    },
    {
      title: 'Línea Leída',
      dataIndex: 'linea_leida',
      key: 'linea_leida',
    },
    {
      title: '¿Tiene Calificación?',
      dataIndex: 'tiene_calificacion',
      key: 'tiene_calificacion',
      filters: [
        { text: 'Sí', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.tiene_calificacion === value,
      render: (tiene) => (
        tiene ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>
      ),
    },
  ];

  const faltantesColumns = [
    {
      title: 'ID Upload Faltante',
      dataIndex: 'id_upload',
      key: 'id_upload',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
    },
  ];

  const calificacionesColumns = [
    {
      title: 'ID Upload',
      dataIndex: 'id_upload',
      key: 'id_upload',
    },
    {
      title: 'Total Calificaciones "Sí"',
      dataIndex: 'total_calificaciones',
      key: 'total_calificaciones',
    },
  ];

  return (
    <div className="page-full">
      <h1>Monitoreo de Informes</h1>

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

      <Row gutter={16}>
        <Col span={16}>
          <Table
            className="formato-table1"
            columns={columns}
            dataSource={monitoreoData}
            rowKey={(record, index) => `${record.id_archivoleido}-${record.linea_leida}-${index}`}
            loading={loading}
            pagination={{ pageSize: 15 }}
          />
        </Col>

        <Col span={8}>
          {faltantes.length > 0 && (
            <div>
              <h3>ID Upload Faltantes en el Rango</h3>
              <Table
                columns={faltantesColumns}
                dataSource={faltantes}
                rowKey="id_upload"
                size="small"
                pagination={false}
              />
            </div>
          )}
        </Col>

        <Col span={24} style={{ marginTop: 20 }}>
          {calificacionesTotales.length > 0 && (
            <div>
              <h3>Total de Calificaciones "Sí" por ID Upload</h3>
              <Table
                columns={calificacionesColumns}
                dataSource={calificacionesTotales}
                rowKey="id_upload"
                size="small"
                pagination={false}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default MonitoreoPage;
