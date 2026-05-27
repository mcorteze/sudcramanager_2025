import React, { useState } from 'react';
import {
  SyncOutlined,
  ExclamationOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { RiRadarLine } from "react-icons/ri";
import { Layout, Menu, theme, App as AntdApp } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CabezalSidebar from './components/CabezalSidebar.jsx';
import Informe from './pages/Informe';
import RutAlumno from './pages/RutAlumno';
import BuscarAlumno from './pages/BuscarAlumno';
import BuscarDocente from './pages/BuscarDocente';
import CargaDocente from './pages/CargaDocente';
import SeguimientoPlanilla from './pages/SeguimientoPlanilla';
import Apunte from './pages/Apunte';
import NavegarRegistrosPage from './pages/NavegarRegistrosPage';
import MonitorSedePage from './pages/MonitorSedePage';
import EnlacePage from './pages/EnlacePage';
import SapMenu from './components/megamenu/sap/SapMenu';
import SapDocente from './components/megamenu/sap/SapDocente';
import SapIndice from './components/megamenu/sap/SapInscripcion';
import SapInscripcion from './components/megamenu/sap/SapIndice';
import SapSabana from './components/megamenu/sap/SapSabana';
import ExtraerNotasPage from './pages/ExtraerNotasPage.jsx';
import Pruebas from './pages/Pruebas.jsx';
import SeccionesPendientesPage from './pages/SeccionesPendientesPage.jsx'
import ImagenPage from './pages/ImagenPage.jsx';
import BuscarSeccion from './pages/BuscarSeccion.jsx';
import BuscarEval from './pages/BuscarEval.jsx';
import SqlEditorPage from './pages/SqlEditorPage.jsx';
import EstadisticasPage from './pages/EstadisticasPage.jsx';
import TareasPage from './pages/TareasPage.jsx';
// import DashboardPage from './pages/DashboardPage.jsx'; ← eliminado
import AccesosPage from './pages/AccesosPage.jsx';
import ArchivoLeidoPage from './pages/ArchivoLeidoPage.jsx';
import SharepointPage from './pages/SharepointPage.jsx';
import LecturasPage from './pages/LecturasPage.jsx';
import LecturasMasivoPage from './pages/LecturasMasivoPage.jsx';
import ErroresPage from './pages/ErroresPage.jsx';
import UploadListaPage from './pages/UploadListaPage.jsx';
import UploadIdPage from './pages/UploadIdPage.jsx';
import LecturaPage from './pages/LecturaPage.jsx';
import ErroresIDPage from './pages/ErroresIDPage.jsx';
import RutLecturas from './components/RutAlumno/RutLecturas.jsx';
import MonitorPage from './pages/MonitorPage.jsx';
import ResumenProcesosPage from './pages/ResumenProcesosPage.jsx';
import CrearAlumnoPage from './pages/CrearAlumnoPage.jsx';
import CrearDocentePage from './pages/CrearDocentePage.jsx';
import CrearMatriculaPage from './pages/CrearMatriculaPage.jsx';
import MonitoreoInicioPage from './pages/MonitoreoInicioPage.jsx'
import SubirDocenteSeccionMasivo from './pages/SubirDocenteSeccionMasivo.jsx'
import EquiposEstado from './components/Monitoreo/EquiposEstado.jsx'
import FidelizadorPage from './pages/FidelizadorPage.jsx'
import RescatarLecturaPage from './pages/RescatarLecturaPage.jsx'
import Forms100Page from './pages/Forms100Page.jsx'
import TicketsPage from './pages/TicketsPage.jsx'
import AlumnosPage from './pages/AlumnosPage.jsx'
import CargaTabla from './pages/CargaTabla.jsx'
import ListadoCantNotasPage from './pages/ListadoCantNotasPage.jsx'
import TopBar from './components/TopBar.jsx'
import CargarTablaPage from './pages/CargarTablaPage.jsx'
import CreaEstructuraCarpetaPage from './pages/CreaEstructuraCarpetaPage.jsx'
import BuscarResultadosPage from './pages/BuscarResultadosPage.jsx'
import ReprocesarSiglaPage from './pages/ReprocesarSiglaPage.jsx'
import LogActualizacionPage from './pages/LogActualizacionPage.jsx'
import AlumnosAsigPage from './pages/AlumnosAsigPage.jsx'
import BuscarArchivoLeidoPage from './pages/BuscarArchivoLeidoPage.jsx'
import PlanillasAnalizaPage from './pages/PlanillasAnalizaPage.jsx'
import JsonTablaPage from './pages/JsonTablaPage.jsx'
import LogsPage from './pages/LogsPage.jsx'
import ConfiguraPlanilla from './pages/ConfiguraPlanilla.jsx'
import PlanillasPage from './pages/PlanillasPage.jsx'
import PlanillasSolicitudPage from './pages/PlanillasSolicitudPage.jsx'
import MoverLecturaTempPage from './pages/MoverLecturaTempPage.jsx'

import { IoIosSearch } from "react-icons/io";
import { PlusOutlined, HistoryOutlined, CodeOutlined } from '@ant-design/icons';

import './App.css';
import './pages/DashboardPage.css';
import './pages/ResumenProcesosPage.css';
import './components/Dashboard/PieChartComponent.css';
import './components/Dashboard/styles.css';


const { Sider, Content } = Layout;

const AppContent = () => {
  const [collapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <AntdApp>
      <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <CabezalSidebar />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          className='menu-general-contenedor'
          items={[
            { key: '1', icon: <RiRadarLine />, label: <Link to="/">Monitoreo</Link> },
            {
              key: 'buscar-sub1', icon: <IoIosSearch />, label: 'Buscar',
              children: [
                { key: 'buscar-0', label: <Link to="/informe">• Filtro Informe</Link> },
                { key: 'buscar-1', label: <Link to="/buscar-alumno">• Buscar Alumno</Link> },
                { key: 'buscar-2', label: <Link to="/buscar-docente">• Buscar Docente</Link> },
                { key: 'buscar-3', label: <Link to="/secciones">• Buscar ID Sección</Link> },
                { key: 'buscar-4', label: <Link to="/buscar_resultados">• Buscar Resultados</Link> },
              ],
            },
            {
              key: 'repro-sub1', icon: <SyncOutlined />, label: 'Reprocesar',
              children: [
                { key: 'repro-1', label: <Link to="/lectura_rescatar_rut">• RUT Error</Link> },
                { key: 'repro-2', label: <Link to="/lecturas">• RUT Correcto</Link> },
                { key: 'repro-3', label: <Link to="/lecturas_masivo">• Lista id_upload</Link> },
                { key: 'repro-4', label: <Link to="/reprocesar_sigla">• Rehacer inf sigla</Link> },
              ],
            },
            {
              key: 'monitor-accesos', icon: <HiMiniViewfinderCircle />, label: 'Seguimiento',
              children: [
                { key: 'monitor-1',   label: <Link to="/buscar_archivo_leido">Archivo leído</Link> },
                { key: 'monitor-1-1', label: <Link to="/imagenes">Hoja por ID</Link> },
                { key: 'monitor-1-2', label: <Link to="/upload">Lectura por ID</Link> },
                { key: 'monitor-2',   label: <Link to="/monitoreo_lista">Lecturas con filtros</Link> },
                { key: 'monitor-3',   label: <Link to="/forms100">Últimas 30 lecturas</Link> },
                { key: 'monitor-4',   label: <Link to="/seguimientoplanilla">Buscar planilla por nombre</Link> },
                { key: 'monitor-5',   label: <Link to="/monitorasig">Navegar prog-asig</Link> },
                { key: 'monitor-6',   label: <Link to="/monitorsede">Navegar prog-sede</Link> },
                { key: 'monitor-7',   label: <Link to="/errores_lista">Errores detectados</Link> },
                { key: 'monitor-8',   label: <Link to="/listado_cantidad_notas">Listado asig/nota</Link> },
                { key: 'monitor-9',   label: <Link to="/planillasanaliza">Planillas Analiza</Link> },
              ],
            },
            {
              key: 'crear-sub1', icon: <PlusOutlined />, label: 'Crear elemento',
              children: [
                { key: 'crear-1', label: <Link to="/crear_alumno">• Crear Alumno</Link> },
                { key: 'crear-2', label: <Link to="/crear_docente">• Crear Docente</Link> },
                { key: 'crear-3', label: <Link to="/crear_matricula">• Crear Matrícula</Link> },
                { key: 'crear-4', label: <Link to="/subirdocenteseccionmasivo">• Carga id seccion</Link> },
              ],
            },
            { key: '13',        icon: <ExclamationOutlined />, label: <Link to="/pendientes">Pendientes</Link> },
            { key: '18',        icon: <TableOutlined />,       label: <Link to="/accesos">Otros recursos</Link> },
            { key: '19',        icon: <TableOutlined />,       label: <Link to="/configura_planilla">Configura Planilla</Link> },
            { key: '22',        icon: <TableOutlined />,       label: <Link to="/planillas_creadas">Planillas Creadas</Link> },
            { key: '23',        icon: <TableOutlined />,       label: <Link to="/mover-lectura-temp">Mover lectura → temp</Link> },
            { key: '20',        icon: <HistoryOutlined />,     label: <Link to="/log_actualizacion">Log actualización</Link> },
            { key: '21',        icon: <HistoryOutlined />,     label: <Link to="/logs">Logs Pulsos</Link> },
            { key: 'sql-editor',icon: <CodeOutlined />,        label: <Link to="/sql-editor">SQL Editor</Link> },
          ]}
        />
      </Sider>

      <Layout>
        {/* 🚀 Top Bar (Header) */}
        <TopBar />
        <Content
          style={{
            margin: '0px 16px 24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/" element={<MonitoreoInicioPage />} />
            <Route path="/informe" element={<Informe />} />
            <Route path="/informe/:programa/:sede/:asignatura/:seccion" element={<Informe />} />
            <Route path="/rut" element={<RutAlumno />} />
            <Route path="/rut/:rut" element={<RutAlumno />} />
            <Route path="/buscar-docente" element={<BuscarDocente />} />
            <Route path="/buscar-docente/:keyword" element={<BuscarDocente />} />
            <Route path="/buscar-alumno" element={<BuscarAlumno />} />
            <Route path="/buscar-alumno/:keyword" element={<BuscarAlumno />} />
            <Route path="/carga-docente/:rut" element={<CargaDocente />} />
            <Route path="/seguimientoplanilla" element={<SeguimientoPlanilla />} />
            <Route path="/archivoleido" element={<ArchivoLeidoPage />} />
            <Route path="/archivoleido/:id_archivoleido" element={<ArchivoLeidoPage />} />
            <Route path="/apuntes" element={<Apunte />} />
            <Route path="/enlaces" element={<EnlacePage />} />
            <Route path="/apuntes/sap" element={<SapMenu />} />
            <Route path="/apuntes/sap/docente" element={<SapDocente />} />
            <Route path="/apuntes/sap/indice" element={<SapIndice />} />
            <Route path="/apuntes/sap/inscripcion" element={<SapInscripcion />} />
            <Route path="/apuntes/sap/sabana" element={<SapSabana />} />
            <Route path="/monitorasig" element={<NavegarRegistrosPage />} />
            <Route path="/monitorasig/:programa" element={<NavegarRegistrosPage />} />
            <Route path="/monitorasig/:programa/:asignatura" element={<NavegarRegistrosPage />} />
            <Route path="/monitorsede" element={<MonitorSedePage />} />
            <Route path="/monitorsede/:programa" element={<MonitorSedePage />} />
            <Route path="/monitorsede/:programa/:sede" element={<MonitorSedePage />} />
            <Route path="/extraernotas" element={<ExtraerNotasPage />} />
            <Route path="/pendientes" element={<SeccionesPendientesPage />} />
            <Route path="/imagenes" element={<ImagenPage />} />
            <Route path="/imagenes/:id_lista" element={<ImagenPage />} />
            <Route path="/secciones" element={<BuscarSeccion />} />
            <Route path="/secciones/:id_seccion" element={<BuscarSeccion />} />
            <Route path="/pruebas" element={<Pruebas />} />
            <Route path="/tablas_cargadas" element={<BuscarEval />} />
            <Route path="/sql-editor" element={<SqlEditorPage />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/tareas" element={<TareasPage />} />
            {/* <Route path="/dashboard" element={<DashboardPage />} /> */} {/* Eliminada */}
            <Route path="/accesos" element={<AccesosPage />} />
            <Route path="/listasharepoint" element={<SharepointPage />} />
            <Route path="/lecturas" element={<LecturasPage />} />
            <Route path="/lecturas_masivo" element={<LecturasMasivoPage />} />
            <Route path="/errores_lista" element={<ErroresPage />} />
            <Route path="/monitoreo_lista" element={<UploadListaPage />} />
            <Route path="/upload" element={<UploadIdPage />} />
            <Route path="/upload/:id_upload" element={<UploadIdPage />} />
            <Route path="/lectura" element={<LecturaPage />} />
            <Route path="/lecturas_calificadas/:num_imagen" element={<ImagenPage />} />
            <Route path="/lectura/:id_archivoleido/:linea_leida" element={<LecturaPage />} />
            <Route path="/errores/:id_archivoleido/:linea_leida" element={<ErroresIDPage />} />
            <Route path="/rut_lecturas/:rut" element={<RutLecturas />} />
            <Route path="/monitor_accesos" element={<MonitorPage />} />
            <Route path="/resumen_procesos" element={<ResumenProcesosPage />} />
            <Route path="/crear_alumno" element={<CrearAlumnoPage />} />
            <Route path="/crear_docente" element={<CrearDocentePage />} />
            <Route path="/crear_matricula" element={<CrearMatriculaPage />} />
            <Route path="/monitoreo_inicio" element={<MonitoreoInicioPage />} />
            <Route path="/subirdocenteseccionmasivo" element={<SubirDocenteSeccionMasivo />} />
            <Route path="/equipos_estado" element={<EquiposEstado />} />
            <Route path="/fidelizador" element={<FidelizadorPage />} />
            <Route path="/lectura_rescatar_rut" element={<RescatarLecturaPage />} />
            <Route path="/lectura_rescatar_rut/:rut" element={<RescatarLecturaPage />} />
            <Route path="/forms100" element={<Forms100Page />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/listado_cantidad_notas" element={<ListadoCantNotasPage />} />
            <Route path="/cargar_tablas" element={<CargarTablaPage />} />
            <Route path="/crea_estructura_carpetas" element={<CreaEstructuraCarpetaPage />} />
            <Route path="/buscar_resultados" element={<BuscarResultadosPage />} />
            <Route path="/reprocesar_sigla" element={<ReprocesarSiglaPage />} />
            <Route path="/log_actualizacion" element={<LogActualizacionPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/alumnosporasig" element={<AlumnosAsigPage />} />
            <Route path="/planillasanaliza" element={<PlanillasAnalizaPage />} />
            <Route path="/jsontable" element={<JsonTablaPage />} />
            <Route path="/configura_planilla" element={<ConfiguraPlanilla />} />
            <Route path="/planillas_creadas" element={<PlanillasPage />} />
            <Route path="/planillas_creadas/:id_eval" element={<PlanillasPage />} />
            <Route path="/planillas_solicitud/:id_eval" element={<PlanillasSolicitudPage />} />
            <Route path="/mover-lectura-temp" element={<MoverLecturaTempPage />} />

            {/* rutas con python */}
            <Route path="/obtener_alumnos" element={<AlumnosPage />} />
            <Route path="/carga_tablas_especificaciones" element={<CargaTabla />} />
            <Route path="/buscar_archivo_leido/" element={<BuscarArchivoLeidoPage />} />
            <Route path="/buscar_archivo_leido/:id_archivo_leido" element={<BuscarArchivoLeidoPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  </AntdApp>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
