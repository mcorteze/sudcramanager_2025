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
      // Hacemos la solicitud a la API usando los parámetros
      const response = await axios.get(`http://localhost:3001/api/lectura/${idArchivoParam}/${lineaLeidaParam}`);
      console.log('📥 Datos obtenidos:', response.data);

      // Asegurarnos de que la respuesta sea un array válido
      if (Array.isArray(response.data.data)) {
        setDatosLectura(response.data.data || []);
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

  // Función para extraer los primeros valores de los campos
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

  // Columnas para la tabla
  const columns = [
    { title: 'N', dataIndex: 'n', key: 'n' },
    { title: 'Registro Leído', dataIndex: 'registro_leido', key: 'registro_leido' },
  ];

  // Dividir los datos en 6 tablas de 10 filas cada una
  const tablasDatos = chunkData(datosLectura);

  return (
    <div style={{ padding: 24 }}>
      <h2>Búsqueda por ID Archivo y Línea</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="ID Archivo Leído"
          value={idArchivo}
          onChange={(e) => setIdArchivo(e.target.value)} // Permite que el usuario escriba en el input
          style={{ width: 200 }}
        />
        <Input
          placeholder="Línea Leída"
          value={lineaLeida}
          onChange={(e) => setLineaLeida(e.target.value)} // Permite que el usuario escriba en el input
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleBuscar}>Buscar</Button>
      </Space>

      {/* Mostrar los campos sobre la tabla */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><strong>ID Lectura:</strong> {campoData.idLectura}</Col>
        <Col span={6}><strong>ID Archivo Leído:</strong> {campoData.idArchivoLeido}</Col>
        <Col span={6}><strong>Línea Leída:</strong> {campoData.lineaLeida}</Col>
        <Col span={6}><strong>Reproceso:</strong> {campoData.reproceso}</Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><strong>Imagen:</strong> {campoData.imagen}</Col>
        <Col span={6}><strong>Instante Forms:</strong> {campoData.instanteForms}</Col>
        <Col span={6}><strong>RUT:</strong> {campoData.rut}</Col>
        <Col span={6}><strong>N° Prueba:</strong> {campoData.numPrueba}</Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><strong>Forma:</strong> {campoData.forma}</Col>
        <Col span={6}><strong>Grupo:</strong> {campoData.grupo}</Col>
        <Col span={6}><strong>Código Interno:</strong> {campoData.codInterno}</Col>
      </Row>

      {/* Mostrar las tablas horizontalmente */}
      <Row gutter={16}>
        {tablasDatos.map((tabla, index) => (
          <Col span={4} key={index}>
            <Table
              dataSource={tabla.map((item, idx) => ({ ...item, n: idx + 1 }))}
              columns={columns}
              rowKey="id_lectura"
              pagination={false}
              bordered
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default LecturaPage;
