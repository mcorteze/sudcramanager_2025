import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { Typography, Button } from 'antd'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import SearchForm from '../components/RutAlumno/SearchForm'; 
import AlumnoInfo from '../components/RutAlumno/AlumnoInfo'; 
import InscripcionesTable from '../components/RutAlumno/InscripcionesTable'; 
import EvaluacionesTable from '../components/RutAlumno/EvaluacionesTable'; 
import DrawerSection from '../components/RutAlumno/DrawerSection'; 
import ModalBuscarIdSeccion from '../components/RutAlumno/ModalBuscarIdSeccion'; 
import InformesTable from '../components/RutAlumno/InformesTable'; 
import RutLecturas from '../components/RutAlumno/RutLecturas'; 
import './RutAlumno.css';

export default function RutAlumno() {
  const [rut, setRut] = useState(''); 
  const [alumnoInfo, setAlumnoInfo] = useState(null); 
  const [alumnos, setAlumnos] = useState([]); 
  const [error, setError] = useState(null); 
  const [inscripciones, setInscripciones] = useState([]); 
  const [drawerVisible, setDrawerVisible] = useState(false); 
  const [selectedSede, setSelectedSede] = useState(null); 
  const [selectedAsignatura, setSelectedAsignatura] = useState(null); 
  const [idMatricula, setIdMatricula] = useState(null);

  const [modalVisible, setModalVisible] = useState(false); 
  const [selectedSeccion, setSelectedSeccion] = useState(null);

  const { rut: rutParam } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => { 
    if (rutParam) { 
      setRut(rutParam); 
      fetchData(rutParam); 
      fetchIdMatricula(rutParam); 
    } 
  }, [rutParam]);

  const fetchData = async (rut) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/alumnos/${rut}`);
      const data = response.data;

      if (data.length > 0) {
        setAlumnoInfo(data[0]);
        setAlumnos(data);
        fetchInscripciones(data[0].id_matricula);
      } else {
        setAlumnoInfo(null);
        setAlumnos([]);
        setInscripciones([]);
      }

      setError(null);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError('Error al obtener datos del servidor');
    }
  };

  const fetchIdMatricula = async (rut) => {
    try {
      const response = await axios.get(`http://localhost:3001/rut_matricula/${rut}`);
      console.log('Respuesta de /rut_matricula/:rut', response.data);

      // Ajuste aquí: ya que la respuesta es un objeto, no un arreglo
      if (response.data && response.data.id_matricula) {
        setIdMatricula(response.data.id_matricula);  // Tomamos directamente el id_matricula
      } else {
        setIdMatricula('NO ENCONTRADO');
      }
    } catch (err) {
      console.error('Error al obtener id_matricula:', err);
      setIdMatricula('ERROR');
    }
  };

  const fetchInscripciones = async (id_matricula) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/inscripciones/${id_matricula}`);
      setInscripciones(response.data);
    } catch (err) {
      console.error('Error al obtener inscripciones:', err);
      setError('Error al obtener inscripciones del servidor');
    }
  };

  const handleSearch = (value) => {
    setRut(value);
    navigate(`/rut/${value}`);
  };

  const handleSeccionSelect = (seccion) => {
    setSelectedSeccion(seccion);
  };

  return (
    <div className='page-full'>
      <h1>Buscar estudiante por RUT</h1>
      <SearchForm onSearch={handleSearch} />

      {/* MOSTRAR RUT E ID MATRICULA DEBAJO DEL FORMULARIO */}
      {(rut && idMatricula) && (
        <Typography.Paragraph style={{ marginTop: '15px', fontSize: '12px' }}>
          <strong>RUT:</strong> {rut} — <strong>ID Matrícula:</strong> {idMatricula}
        </Typography.Paragraph>
      )}

      {error && <Typography.Text type="danger">{error}</Typography.Text>}
      <AlumnoInfo alumnoInfo={alumnoInfo} />

      <InscripcionesTable inscripciones={inscripciones} setInscripciones={setInscripciones} />
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: '20px' }}>
        Inscribir alumno
      </Button>

      {rut && <RutLecturas rut={rut} />}

      <DrawerSection
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        setSelectedSede={setSelectedSede}
        setSelectedAsignatura={setSelectedAsignatura}
        idMatricula={idMatricula}
      />

      {idMatricula && <InformesTable idMatricula={idMatricula} />}

      <ModalBuscarIdSeccion
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSeccionSelect={handleSeccionSelect}
        idMatricula={idMatricula}
      />
    </div>
  );
}
