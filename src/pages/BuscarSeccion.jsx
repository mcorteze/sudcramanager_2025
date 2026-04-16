import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, App, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import SearchSection from '../components/BuscarSeccion/SearchSection';
import SectionDetails from '../components/BuscarSeccion/SectionDetails';
import DocenteTable from '../components/BuscarSeccion/DocenteTable';
import InformeTable from '../components/BuscarSeccion/InformeTable';
import ImagenesTable from '../components/BuscarSeccion/ImagenesTable';
import './BuscarSeccion.css';

const BuscarSeccion = () => {
  const { id_seccion } = useParams();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [data, setData] = useState([]);
  const [docenteData, setDocenteData] = useState([]);
  const [informesData, setInformesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocentes, setLoadingDocentes] = useState(false);
  const [loadingInformes, setLoadingInformes] = useState(false);
  const [idSeccion, setIdSeccion] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/secciones?id_seccion=${id}`);
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Error al cargar los datos: ' + error.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocenteData = async (id) => {
    setLoadingDocentes(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/docentes_secciones/${id}`);
      setDocenteData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Error al cargar los datos de docentes: ' + error.message);
      setDocenteData([]);
    } finally {
      setLoadingDocentes(false);
    }
  };

  const fetchInformesData = async (id) => {
    setLoadingInformes(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/seccion_informes?id_seccion=${id}`);
      setInformesData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Error al cargar los datos de informes: ' + error.message);
      setInformesData([]);
    } finally {
      setLoadingInformes(false);
    }
  };

  const handleSearch = (value) => {
    setIdSeccion(value);
    fetchData(value);
    fetchDocenteData(value);
    fetchInformesData(value);
  };

  const handleDeleteDocente = (id_seccion, rut_docente) => {
    modal.confirm({
      title: '¿Estás seguro de eliminar este docente?',
      onOk: async () => {
        setConfirmLoading(true);
        try {
          await axios.delete('http://localhost:3001/api/eliminar_docente_seccion', { data: { id_seccion, rut_docente } });
          message.success('Docente eliminado exitosamente');
          fetchDocenteData(id_seccion);
        } catch (error) {
          message.error('Error al eliminar el docente: ' + error.message);
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  const handleDeleteSeccion = () => {
    modal.confirm({
      title: `¿Eliminar sección ${idSeccion}?`,
      content: 'Esta acción eliminará el registro de la tabla secciones y no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3001/api/secciones/${idSeccion}`);
          message.success('Sección eliminada correctamente');
          navigate(-1);
        } catch (error) {
          message.error('Error al eliminar la sección: ' + error.message);
        }
      },
    });
  };

  useEffect(() => {
    if (id_seccion) {
      setIdSeccion(id_seccion);
      fetchData(id_seccion);
      fetchDocenteData(id_seccion);
      fetchInformesData(id_seccion);
    }
  }, [id_seccion]);

  return (
    <div className="page-full">
      <h1>Información de sección</h1>
      <SearchSection idSeccion={idSeccion} onSearch={handleSearch} onChange={(e) => setIdSeccion(e.target.value)} />

      {loading ? <Spin tip="Cargando..." /> : <SectionDetails data={data} />}

      {idSeccion && (
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={handleDeleteSeccion}
          style={{ marginBottom: 16 }}
        >
          Eliminar sección {idSeccion}
        </Button>
      )}
      
      <h2>Docentes remitentes</h2>
      <DocenteTable data={docenteData} loading={loadingDocentes} onDelete={handleDeleteDocente} />

      <ImagenesTable idSeccion={idSeccion} /> {/* Añadir el componente de imágenes aquí */}
      
      <h2>Informes asociados a la sección</h2>
      {loadingInformes ? (
        <Spin tip="Cargando informes..." />
      ) : (
        <InformeTable data={informesData} loading={loadingInformes} />
      )}
    </div>
  );
};

export default BuscarSeccion;
