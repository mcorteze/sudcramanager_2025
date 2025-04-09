import React, { useState, useEffect } from 'react'; 
import { Table, Input, Button, message, Space, Row, Col, Modal } from 'antd'; 
import axios from 'axios'; 
import { useLocation, useParams } from 'react-router-dom';

const ErroresIDPage = () => {
  const { id_archivoleido, linea_leida } = useParams();  // Obtener id_archivoleido y linea_leida desde los parámetros de la URL
  const location = useLocation();  // Usar useLocation para acceder al estado pasado por navigate
  const { id_upload } = location.state || {};  // Obtener id_upload desde el estado

  const [idArchivo, setIdArchivo] = useState(id_archivoleido || ''); 
  const [lineaLeida, setLineaLeida] = useState(linea_leida || ''); 
  const [erroresData, setErroresData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campoData, setCampoData] = useState({
    idError: '',
    rut: '',
    numPrueba: '',
    codInterno: '',
    forma: '',
    grupo: '',
    idArchivoleido: '',
    lineaLeida: '',
    imagen: '',
    instanteForms: '',
    mailEnviado: '',
    marcaTempMail: ''
  });

  // Modal para ver la imagen
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  useEffect(() => {
    if (idArchivo && lineaLeida) {
      fetchErrores(idArchivo, lineaLeida);
    }
  }, [idArchivo, lineaLeida]);

  const fetchErrores = async (idArchivoParam, lineaLeidaParam) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/errores/${idArchivoParam}/${lineaLeidaParam}`);
      if (Array.isArray(response.data.data)) {
        setErroresData(response.data.data || []);
        extractFields(response.data.data);
      } else {
        console.error('La respuesta no es un array válido');
        setErroresData([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      message.error('Error al obtener los datos.');
      setErroresData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para extraer los primeros valores de los campos
  const extractFields = (data) => {
    if (data.length > 0) {
      const firstRecord = data[0];
      setCampoData({
        idError: firstRecord.id_error || '',
        rut: firstRecord.rut || '',
        numPrueba: firstRecord.num_prueba || '0',
        codInterno: firstRecord.cod_interno || '',
        forma: firstRecord.forma || '',
        grupo: firstRecord.grupo || '',
        idArchivoleido: firstRecord.id_archivoleido || '',
        lineaLeida: firstRecord.linea_leida || '',
        imagen: firstRecord.imagen || '',
        instanteForms: firstRecord.instante_forms || '',
        mailEnviado: firstRecord.mail_enviado ? 'Sí' : 'No',
        marcaTempMail: firstRecord.marca_temp_mail ? 'Sí' : 'No'
      });
    }
  };

  // Función para extraer el código de la imagen
  const getImagenCode = (imagen) => {
    // Split para obtener la parte después del primer "_"
    const parts = imagen.split('_');
    return parts.slice(1).join('_'); // Concatenamos de nuevo las partes que están después del primer "_"
  };

  // Función para copiar URL al portapapeles
  const copyToClipboard = (imagen) => {
    const imagenCode = getImagenCode(imagen);
    const url = `https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/imgenes20251/Attachments/${id_upload}/${imagenCode}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        message.success('URL copiada al portapapeles');
      })
      .catch(() => {
        message.error('Hubo un error al copiar la URL');
      });
  };

  // Función para descargar imagen
  const downloadImage = (imagen) => {
    const imagenCode = getImagenCode(imagen);
    const url = `https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/imgenes20251/Attachments/${id_upload}/${imagenCode}`;
    window.open(url, '_blank');
  };

  // Abrir modal para ver imagen
  const openModal = (imagen) => {
    const imagenCode = getImagenCode(imagen);
    const url = `https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/imgenes20251/Attachments/${id_upload}/${imagenCode}`;
    setCurrentImageUrl(url);
    setIsModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleBuscar = () => {
    if (!idArchivo || !lineaLeida) {
      message.warning('Debes ingresar ambos valores.');
      return;
    }
    fetchErrores(idArchivo, lineaLeida);
  };

  // Columnas para la tabla
  const columns = [
    { title: 'Valida RUT', dataIndex: 'valida_rut', key: 'valida_rut', render: (val) => val ? 'Sí' : 'No' },
    { title: 'Valida Matrícula', dataIndex: 'valida_matricula', key: 'valida_matricula', render: (val) => val ? 'Sí' : 'No' },
    { title: 'Valida Inscripción', dataIndex: 'valida_inscripcion', key: 'valida_inscripcion', render: (val) => val ? 'Sí' : 'No' },
    { title: 'Valida Evaluación', dataIndex: 'valida_eval', key: 'valida_eval', render: (val) => val ? 'Sí' : 'No' },
    { title: 'Valida Forma', dataIndex: 'valida_forma', key: 'valida_forma', render: (val) => val ? 'Sí' : 'No' },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <div>
          <Button
            type="link"
            onClick={() => copyToClipboard(record.imagen)}
          >
            Copiar URL
          </Button>
          <Button
            type="link"
            onClick={() => downloadImage(record.imagen)}
          >
            Descargar
          </Button>
          <Button
            type="link"
            onClick={() => openModal(record.imagen)}
          >
            Ver Imagen
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Búsqueda por ID Archivo y Línea</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="ID Archivo Leído"
          value={idArchivo}
          onChange={(e) => setIdArchivo(e.target.value)}
          style={{ width: 200 }}
        />
        <Input
          placeholder="Línea Leída"
          value={lineaLeida}
          onChange={(e) => setLineaLeida(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleBuscar}>Buscar</Button>
      </Space>

      {/* Mostrar los campos sobre la tabla */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><strong>ID Error:</strong> {campoData.idError}</Col>
        <Col span={6}><strong>RUT:</strong> {campoData.rut}</Col>
        <Col span={6}><strong>N° Prueba:</strong> {campoData.numPrueba}</Col>
        <Col span={6}><strong>Código Interno:</strong> {campoData.codInterno}</Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><strong>Forma:</strong> {campoData.forma}</Col>
        <Col span={6}><strong>Grupo:</strong> {campoData.grupo}</Col>
        <Col span={6}><strong>ID Archivo Leído:</strong> {campoData.idArchivoleido}</Col>
        <Col span={6}><strong>Línea Leída:</strong> {campoData.lineaLeida}</Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><strong>Imagen:</strong> {campoData.imagen}</Col>
        <Col span={6}><strong>Instante Forms:</strong> {campoData.instanteForms}</Col>
        <Col span={6}><strong>Mail Enviado:</strong> {campoData.mailEnviado}</Col>
        <Col span={6}><strong>Marca Temp Mail:</strong> {campoData.marcaTempMail}</Col>
      </Row>

      {/* Mostrar la tabla con los errores */}
      <Table
        dataSource={erroresData}
        columns={columns}
        rowKey="id_error"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      {/* Modal para mostrar imagen */}
      <Modal
        visible={isModalVisible}
        title="Ver Imagen"
        footer={null}
        onCancel={closeModal}
      >
        <img src={currentImageUrl} alt="Imagen" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default ErroresIDPage;
