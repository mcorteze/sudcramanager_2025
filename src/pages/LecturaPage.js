// LecturaPage.js
import React, { useState, useEffect } from 'react';
import { Row, Col, message, Divider } from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SearchForm from '../components/LecturaPage/SearchForm';
import EditableDataFields from '../components/LecturaPage/EditableDataFields';
import DataTable from '../components/LecturaPage/DataTable';
import DownloadTxtButton from '../components/LecturaPage/DownloadTxtButton'; // Importa el nuevo componente

const LecturaPage = () => {
  const { id_archivoleido, linea_leida } = useParams();
  const [idArchivo, setIdArchivo] = useState(id_archivoleido || '');
  const [lineaLeida, setLineaLeida] = useState(linea_leida || '');
  const [datosLectura, setDatosLectura] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editableData, setEditableData] = useState([]);
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
      const { data } = await axios.get(
        `http://localhost:3001/api/lectura/${idArchivoParam}/${lineaLeidaParam}`
      );
      if (Array.isArray(data.data)) {
        setDatosLectura(data.data);
        setEditableData(data.data);
        extractFields(data.data);
      } else {
        setDatosLectura([]);
      }
    } catch (err) {
      message.error('Error al obtener los datos.');
      setDatosLectura([]);
    } finally {
      setLoading(false);
    }
  };

  const extractFields = (rows) => {
    if (!rows.length) return;
    const r = rows[0];
    setCampoData({
      idLectura: r.id_lectura ?? '',
      idArchivoLeido: r.id_archivoleido ?? '',
      lineaLeida: r.linea_leida ?? '',
      reproceso: r.reproceso ? 'Sí' : 'No',
      imagen: r.imagen ?? '',
      instanteForms: r.instante_forms ?? '',
      rut: r.rut ?? '',
      numPrueba: r.num_prueba ?? '0',
      forma: r.forma ?? '',
      grupo: r.grupo ?? '',
      codInterno: r.cod_interno ?? ''
    });
  };

  const columns = [
    { title: 'N', dataIndex: 'n', key: 'n' },
    { title: 'Registro Leído', dataIndex: 'registro_leido', key: 'registro_leido' }
  ];

  const handleRegistroChange = (idLectura, value) => {
    setEditableData(prev =>
      prev.map(r =>
        r.id_lectura === idLectura ? { ...r, registro_leido: value } : r
      )
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Búsqueda por ID Archivo y Línea</h2>

      <SearchForm
        idArchivo={idArchivo}
        setIdArchivo={setIdArchivo}
        lineaLeida={lineaLeida}
        setLineaLeida={setLineaLeida}
        handleBuscar={() => fetchLectura(idArchivo, lineaLeida)}
      />
      
      <Divider style={{ borderColor: '#7cb305' }}>Hoja Digitalizada</Divider>
      
      <Row gutter={24}>
        <Col span={8}>
          <EditableDataFields
            campoData={campoData}
            setCampoData={setCampoData}
          />
        </Col>
        <Col span={16}>
          <DataTable
            data={editableData}
            columns={columns}
            handleRegistroChange={handleRegistroChange}
          />
        </Col>
      </Row>
      <Divider />
      {/* Usamos el componente DownloadTxtButton */}
      <DownloadTxtButton campoData={campoData} editableData={editableData} />
    </div>
  );
};

export default LecturaPage;
