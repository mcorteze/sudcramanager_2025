import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Button, Divider, Card } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import SearchForm from '../components/RutAlumno/SearchForm';
import AlumnoInfo from '../components/RutAlumno/AlumnoInfo';
import InscripcionesTable from '../components/RutAlumno/InscripcionesTable';
import DrawerSection from '../components/RutAlumno/DrawerSection';
import ModalBuscarIdSeccion from '../components/RutAlumno/ModalBuscarIdSeccion';
import InformesTable from '../components/RutAlumno/InformesTable';
import RutLecturas from '../components/RutAlumno/RutLecturas';
import './RutAlumno.css';

export default function RutAlumno() {
  /* ---------- ESTADOS ---------- */
  const [rut, setRut] = useState('');
  const [alumnoInfo, setAlumnoInfo] = useState(null);            // ← info global para AlumnoInfo
  const [idMatriculas, setIdMatriculas] = useState([]);          // todas las matrículas
  const [inscripciones, setInscripciones] = useState({});        // {id: []}
  const [error, setError] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSede, setSelectedSede] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSeccion, setSelectedSeccion] = useState(null);

  const { rut: rutParam } = useParams();
  const navigate = useNavigate();

  /* ------------ EFECTO INICIAL (por URL) ------------ */
  useEffect(() => {
    if (rutParam) {
      setRut(rutParam);
      fetchDatosGenerales(rutParam);   // Info de alumno + matrícula principal (primera)
      fetchIdMatriculas(rutParam);     // Todas las matrículas
    }
  }, [rutParam]);

  /* -------------------------------------------------- */
  /*  DATOS GENERALES (lo que pedías que faltaba)       */
  /* -------------------------------------------------- */
  const fetchDatosGenerales = async (rutBuscado) => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/alumnos/${rutBuscado}`);

      if (data.length > 0) {
        setAlumnoInfo(data[0]);               // info para <AlumnoInfo />
        // Si quisieras mostrar inscripciones de la 1ª matrícula:
        fetchInscripciones(data[0].id_matricula);
      } else {
        setAlumnoInfo(null);
        setInscripciones({});
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al obtener datos del servidor');
    }
  };

  /* -------------------------------------------------- */
  /*  LISTA COMPLETA DE id_matricula PARA EL RUT        */
  /* -------------------------------------------------- */
  const fetchIdMatriculas = async (rutBuscado) => {
    try {
      const { data } = await axios.get(`http://localhost:3001/rut_matricula/${rutBuscado}`);
      const ids = data.map(obj => obj.id_matricula);
      setIdMatriculas(ids);

      // Traer inscripciones de todas
      ids.forEach(id => fetchInscripciones(id));

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al obtener matrículas');
      setIdMatriculas([]);
    }
  };

  /* -------------------------------------------------- */
  /*  INSCRIPCIONES (por id_matricula)                  */
  /* -------------------------------------------------- */
  const fetchInscripciones = async (id_matricula) => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/inscripciones/${id_matricula}`);
      setInscripciones(prev => ({ ...prev, [id_matricula]: data }));
    } catch (err) {
      console.error(err);
      setError('Error al obtener inscripciones');
    }
  };

  /* ----------------- buscador ----------------------- */
  const handleSearch = (value) => {
    setRut(value);
    navigate(`/rut/${value}`);
  };

  const handleSeccionSelect = (seccion) => {
    setSelectedSeccion(seccion);
  };

  /* ================================================== */
  /*  RENDER                                            */
  /* ================================================== */
  return (
    <div className='page-full'>
      <h1>Buscar estudiante por RUT</h1>
      <SearchForm onSearch={handleSearch} />

      {rut && (
        <Typography.Paragraph style={{ marginTop: 15, fontSize: 12 }}>
          <strong>RUT:</strong> {rut} — <strong>Matrículas encontradas:</strong> {idMatriculas.join(', ') || '—'}
        </Typography.Paragraph>
      )}

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      {/* ---------- DATOS GENERALES DEL ALUMNO ---------- */}
      <AlumnoInfo alumnoInfo={alumnoInfo} />

      {/* ---------- BLOQUE POR CADA id_matricula ---------- */}
      {idMatriculas.map(id => (
        <div key={id} className='matricula-block'>
          
          <Divider style={{ borderColor: '#7cb305' }}>
            <Typography.Title level={4} style={{ marginTop: 25 }}>
              Matrícula #{id}
            </Typography.Title>
          </Divider>
          <Card style={{ border: '1px solid #91caff' }}>
            <InscripcionesTable
              inscripciones={inscripciones[id] || []}
              setInscripciones={data => setInscripciones(prev => ({ ...prev, [id]: data }))}
            />

            <Button
              type="primary"
              onClick={() => setModalVisible(true)}
              style={{ marginBottom: 20 }}>
              Inscribir alumno
            </Button>

            <RutLecturas rut={rut} />

            <DrawerSection
              visible={drawerVisible}
              onClose={() => setDrawerVisible(false)}
              setSelectedSede={setSelectedSede}
              setSelectedAsignatura={setSelectedAsignatura}
              idMatricula={id}
            />

            <InformesTable idMatricula={id} />
          </Card>

          <ModalBuscarIdSeccion
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSeccionSelect={handleSeccionSelect}
            idMatricula={id}
          />
        </div>
      ))}
    </div>
  );
}
