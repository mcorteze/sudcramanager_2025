
import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Space, Row, Col } from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const LecturaPage = () => {
  const { id_archivoleido, linea_leida } = useParams();
  const [idArchivo, setIdArchivo] = useState(id_archivoleido || ''); // Si hay params, lo carga, si no, es vacío
  const [lineaLeida, setLineaLeida] = useState(linea_leida || ''); // Lo mismo con linea_leida
  const [datosLectura, setDatosLectura] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editableData, setEditableData] = useState([]); // Estado para los datos editables

  // Campos a mostrar arriba de la tabla
  const [campoData, setCampoData] = useState({
    idLectura: '',
    idArchivoLeido: '',
    lineaLeida: '',
    reproceso: '',
    imagen: '',
    instanteForms: '',
    rut: '',
    numPrueba: '',
    forma: '',
    grupo: '',
    codInterno: ''
  });

  useEffect(() => {
    if (idArchivo && lineaLeida) {
      fetchLectura(idArchivo, lineaLeida);
    }
  }, [idArchivo, lineaLeida]);

  const fetchLectura = async (idArchivoParam, lineaLeidaParam) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/lectura/${idArchivoParam}/${lineaLeidaParam}`);
      console.log('📥 Datos obtenidos:', response.data);

      if (Array.isArray(response.data.data)) {
        setDatosLectura(response.data.data || []);
        setEditableData(response.data.data || []); // Actualizamos los datos editables
        extractFields(response.data.data);
      } else {
        console.error('La respuesta no es un array válido');
        setDatosLectura([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      message.error('Error al obtener los datos.');
      setDatosLectura([]);
    } finally {
      setLoading(false);
    }
  };

  const extractFields = (data) => {
    if (data.length > 0) {
      const firstRecord = data[0];
      setCampoData({
        idLectura: firstRecord.id_lectura || '',
        idArchivoLeido: firstRecord.id_archivoleido || '',
        lineaLeida: firstRecord.linea_leida || '',
        reproceso: firstRecord.reproceso ? 'Sí' : 'No', // Convertir booleano a 'Sí' o 'No'
        imagen: firstRecord.imagen || '',
        instanteForms: firstRecord.instante_forms || '',
        rut: firstRecord.rut || '',
        numPrueba: firstRecord.num_prueba || '0', // Mostrar 0 si no hay valor
        forma: firstRecord.forma || '',
        grupo: firstRecord.grupo || '',
        codInterno: firstRecord.cod_interno || ''
      });
    }
  };

  const handleBuscar = () => {
    if (!idArchivo || !lineaLeida) {
      message.warning('Debes ingresar ambos valores.');
      return;
    }
    fetchLectura(idArchivo, lineaLeida);
  };

  // Dividir los datos en bloques de 10
  const chunkData = (data) => {
    const result = [];
    for (let i = 0; i < data.length; i += 10) {
      result.push(data.slice(i, i + 10));
    }
    return result;
  };

  // Función para manejar el cambio en "Registro Leído"
  const handleRegistroChange = (idLectura, newValue) => {
    const newData = editableData.map(item =>
      item.id_lectura === idLectura ? { ...item, registro_leido: newValue } : item
    );
    setEditableData(newData);
  };

  // Columnas para la tabla
  const columns = [
    { title: 'N', dataIndex: 'n', key: 'n' },
    {
      title: 'Registro Leído',
      dataIndex: 'registro_leido',
      key: 'registro_leido',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleRegistroChange(record.id_lectura, e.target.value)}
        />
      ),
    },
  ];

  // Dividir los datos en 6 tablas de 10 filas cada una
  const tablasDatos = chunkData(editableData);

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

      {/* Estructura en 2 columnas: izquierda (datos) y derecha (tablas) */}
      <Row gutter={24}>
        {/* Columna izquierda - Datos */}
        <Col span={8}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <strong>ID Lectura:</strong>
              <Input
                value={campoData.idLectura}
                onChange={(e) => setCampoData({ ...campoData, idLectura: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>RUT:</strong>
              <Input
                value={campoData.rut}
                onChange={(e) => setCampoData({ ...campoData, rut: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>ID Archivo Leído:</strong>
              <Input
                value={campoData.idArchivoLeido}
                onChange={(e) => setCampoData({ ...campoData, idArchivoLeido: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>Línea Leída:</strong>
              <Input
                value={campoData.lineaLeida}
                onChange={(e) => setCampoData({ ...campoData, lineaLeida: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>Reproceso:</strong>
              <Input
                value={campoData.reproceso}
                onChange={(e) => setCampoData({ ...campoData, reproceso: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>Imagen:</strong>
              <Input
                value={campoData.imagen}
                onChange={(e) => setCampoData({ ...campoData, imagen: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>Instante Forms:</strong>
              <Input
                value={campoData.instanteForms}
                onChange={(e) => setCampoData({ ...campoData, instanteForms: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>N° Prueba:</strong>
              <Input
                value={campoData.numPrueba}
                onChange={(e) => setCampoData({ ...campoData, numPrueba: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>Forma:</strong>
              <Input
                value={campoData.forma}
                onChange={(e) => setCampoData({ ...campoData, forma: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>Grupo:</strong>
              <Input
                value={campoData.grupo}
                onChange={(e) => setCampoData({ ...campoData, grupo: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <strong>Código Interno:</strong>
              <Input
                value={campoData.codInterno}
                onChange={(e) => setCampoData({ ...campoData, codInterno: e.target.value })}
              />
            </Col>
          </Row>
        </Col>

        {/* Columna derecha - Tablas */}
        <Col span={16}>
          <Row gutter={16}>
            {tablasDatos.map((tabla, index) => (
              <Col span={8} key={index}>
                <Table
                  dataSource={tabla.map((item, idx) => ({ ...item, n: idx + 1 }))}
                  columns={columns}
                  rowKey="id_lectura"
                  pagination={false}
                  bordered
                  size="small"
                />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default LecturaPage;
