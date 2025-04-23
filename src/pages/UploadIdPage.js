import React, { useState, useEffect } from 'react';  
import { Table, Tag, Input, Button, message, Space, Row, Col } from 'antd';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useParams y useNavigate

const UploadIdPage = () => {
  const [monitoreoData, setMonitoreoData] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idUpload, setIdUpload] = useState('');

  const { id_upload } = useParams();
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    if (id_upload) {
      setIdUpload(id_upload);
      fetchMonitoreo(id_upload);
    }
  }, [id_upload]);

  const fetchMonitoreo = async (idUploadParam) => {
    const idUploadNum = parseInt(idUploadParam);

    if (!idUploadParam || isNaN(idUploadNum)) {
      message.warning('Debes ingresar un valor válido para el ID Upload.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/upload/${idUploadNum}`);
      const data = response.data.data;

      setMonitoreoData(data);
      setFaltantes([]);
    } catch (error) {
      console.error('Error al obtener monitoreo:', error);
      message.error('Hubo un problema al obtener los datos de monitoreo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    fetchMonitoreo(idUpload);
  };

  const handleVerLectura = (idArchivoleido, lineaLeida) => {
    // Redirige a la URL con los parámetros id_archivoleido y linea_leida
    navigate(`/lectura/${idArchivoleido}/${lineaLeida}`);
  };

  const handleVerErrores = (idArchivoleido, lineaLeida) => {
    // Redirige a la URL con los parámetros id_archivoleido y linea_leida, y pasa id_upload en el estado
    navigate(`/errores/${idArchivoleido}/${lineaLeida}`, { state: { id_upload } });
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
      title: 'Rut',
      dataIndex: 'rut',
      key: 'rut',
    },
    {
      title: 'Imagen',
      dataIndex: 'imagen',
      key: 'imagen',
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
    {
      title: 'Acción',
      key: 'accion',
      render: (record) => (
        <span>
          <span
            style={{ color: 'blue', cursor: 'pointer', marginRight: '10px' }}
            onClick={() => handleVerLectura(record.id_archivoleido, record.linea_leida)}
          >
            Ver lectura
          </span>
          <span
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => handleVerErrores(record.id_archivoleido, record.linea_leida)}
          >
            Ver errores
          </span>
        </span>
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

  return (
    <div className="page-full">
      <h1>Monitoreo de Informes</h1>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="ID Upload"
          value={idUpload}
          onChange={(e) => setIdUpload(e.target.value)}
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
      </Row>
    </div>
  );
};

export default UploadIdPage;
