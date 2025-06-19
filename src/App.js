import React, { useState } from 'react';
import {
  FileExcelOutlined,
  SyncOutlined,
  AppstoreOutlined,
  DesktopOutlined,
  DownloadOutlined,
  ExclamationOutlined,
  FileImageOutlined,
  UserOutlined,
  FilterOutlined,
  DropboxOutlined,
  SlidersOutlined,
  DashboardOutlined,
  TableOutlined,
  SendOutlined
} from '@ant-design/icons';
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { BiSolidError } from "react-icons/bi";
import { RiRadarLine } from "react-icons/ri";
import { SlNote } from "react-icons/sl";
import { Layout, Menu, theme } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import CabezalSidebar from './components/CabezalSidebar.js';
import Home from './pages/ResumenProcesosPage.js';
import Informe from './pages/Informe';
import RutAlumno from './pages/RutAlumno';
import BuscarAlumno from './pages/BuscarAlumno';
import BuscarDocente from './pages/BuscarDocente';
import CargaDocente from './pages/CargaDocente';
import SeguimientoPlanilla from './pages/SeguimientoPlanilla';
import Apunte from './pages/Apunte';
import MonitorAsigPage from './pages/MonitorAsigPage';
import MonitorSedePage from './pages/MonitorSedePage';
import EnlacePage from './pages/EnlacePage';
import SapMenu from './components/megamenu/sap/SapMenu';
import SapDocente from './components/megamenu/sap/SapDocente';
import SapIndice from './components/megamenu/sap/SapInscripcion';
import SapInscripcion from './components/megamenu/sap/SapIndice';
import SapSabana from './components/megamenu/sap/SapSabana';
import ExtraerNotasPage from './pages/ExtraerNotasPage.js';
import Pruebas from './pages/Pruebas.js';
import SeccionesPendientesPage from './pages/SeccionesPendientesPage.js'
import ImagenPage from './pages/ImagenPage.js';
import BuscarSeccion from './pages/BuscarSeccion.js';
import BuscarEval from './pages/BuscarEval.js';
import EstadisticasPage from './pages/EstadisticasPage.js';
import TareasPage from './pages/TareasPage.js';
import DashboardPage from './pages/DashboardPage.js';
import AccesosPage from './pages/AccesosPage.js';
import ArchivoLeidoPage from './pages/ArchivoLeidoPage.js';
import SharepointPage from './pages/SharepointPage.js';
import LecturasPage from './pages/LecturasPage.js';
import LecturasMasivoPage from './pages/LecturasMasivoPage.js';
import ErroresPage from './pages/ErroresPage.js';
import UploadListaPage from './pages/UploadListaPage.js';
import UploadIdPage from './pages/UploadIdPage.js';
import LecturaPage from './pages/LecturaPage.js';
import ErroresIDPage from './pages/ErroresIDPage.js';
import RutLecturas from './components/RutAlumno/RutLecturas.js';
import MonitorPage from './pages/MonitorPage.js';
import ResumenProcesosPage from './pages/ResumenProcesosPage.js';
import Monitoreo from './pages/Monitoreo.js';
import CrearAlumnoPage from './pages/CrearAlumnoPage.js';
import CrearDocentePage from './pages/CrearDocentePage.js';
import CrearMatriculaPage from './pages/CrearMatriculaPage.js';
import MonitoreoInicioPage from './pages/MonitoreoInicioPage.js'
import SubirDocenteSeccionMasivo from './pages/SubirDocenteSeccionMasivo.js'
import EquiposEstado from './components/Monitoreo/EquiposEstado.js'
import FidelizadorPage from './pages/FidelizadorPage.js'
import RescatarLecturaPage from './pages/RescatarLecturaPage.js'
import Forms100Page from './pages/Forms100Page.js'
import TicketsPage from './pages/TicketsPage.js'
import AlumnosPage from './pages/AlumnosPage.js'
import CargaTabla from './pages/CargaTabla.js'
import ListadoCantNotasPage from './pages/ListadoCantNotasPage.js'
import TopBar from './components/TopBar.js'
import CargarTablaPage from './pages/CargarTablaPage.js'
import CreaEstructuraCarpetaPage from './pages/CreaEstructuraCarpetaPage.js'



import { IoIosSearch } from "react-icons/io";
import { PlusOutlined } from '@ant-design/icons';

import './App.css';



const { Sider, Content, Header  } = Layout;
const { SubMenu } = Menu;

const AppContent = () => {
  const [collapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation(); // Obtener la ruta actual

  // Verificar si la ruta actual es /dashboard
  const isDashboardRoute = location.pathname === '/dashboard';

  return isDashboardRoute ? (
    // Renderizar el dashboard sin el layout
    <DashboardPage />
  ) : (
    // Renderizar el resto de la app con el layout
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <CabezalSidebar />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} className='menu-general-contenedor'>
          <Menu.Item key="1" icon={<RiRadarLine />}>
            <Link to="/">Monitoreo</Link>
          </Menu.Item>
          {/* ✅ Buscar */}
          <SubMenu key="buscar-sub1" icon={<IoIosSearch />} title="Buscar">
            <Menu.Item key="sub1-0">
              <Link to="/informe">• Filtro Informe</Link>
            </Menu.Item>
            <Menu.Item key="sub1-1">
              <Link to="/buscar-alumno">• Buscar Alumno</Link>
            </Menu.Item>
            <Menu.Item key="sub1-2">
              <Link to="/buscar-docente">• Buscar Docente</Link>
            </Menu.Item>
            <Menu.Item key="sub1-3">
              <Link to="/secciones">• Buscar ID Sección</Link>
            </Menu.Item>
          </SubMenu>

          {/* ✅ Reprocesar */}
          <SubMenu key="repro-sub1" icon={<SyncOutlined />} title="Reprocesar">
            <Menu.Item key="sub1-1">
              <Link to="/lectura_rescatar_rut">• RUT Error</Link>
            </Menu.Item>
            <Menu.Item key="sub1-2">
              <Link to="/lecturas">• RUT Correcto</Link>
            </Menu.Item>
            <Menu.Item key="sub1-3">
              <Link to="/lecturas_masivo">• Reprocesar Sigla</Link>
            </Menu.Item>
          </SubMenu>

          {/* ✅ Seguimiento */}
          <SubMenu key="monitor-accesos" icon={<HiMiniViewfinderCircle />} title="Seguimiento">
            <Menu.Item key="monitor-1">
              <Link to="/imagenes">• Buscar hoja por ID</Link>
            </Menu.Item>
            <Menu.Item key="monitor-2">
              <Link to="/monitoreo_lista">• Lecturas con filtros</Link>
            </Menu.Item>
            <Menu.Item key="monitor-3">
              <Link to="/forms100">• Últimas 30 lecturas</Link>
            </Menu.Item>
            <Menu.Item key="monitor-4">
              <Link to="/seguimientoplanilla">• Buscar planilla por nombre</Link>
            </Menu.Item>
            <Menu.Item key="monitor-5">
              <Link to="/monitorasig">• Por asignatura</Link>
            </Menu.Item>
            <Menu.Item key="monitor-6">
              <Link to="/monitorsede">• Por sede</Link>
            </Menu.Item>
            <Menu.Item key="monitor-7">
              <Link to="/errores_lista">• Errores detectados</Link>
            </Menu.Item>
            <Menu.Item key="monitor-8">
              <Link to="/listado_cantidad_notas">• Listado asig/nota</Link>
            </Menu.Item>
          </SubMenu>

          {/* ✅ Crear elementos */}
          <SubMenu key="crear-sub1" icon={<PlusOutlined />} title="Crear elemento">
            <Menu.Item key="sub1-1">
              <Link to="/crear_alumno">• Crear Alumno</Link>
            </Menu.Item>
            <Menu.Item key="sub1-2">
              <Link to="/crear_docente">• Crear Docente</Link>
            </Menu.Item>
            <Menu.Item key="sub1-3">
              <Link to="/crear_matricula">• Crear Matrícula</Link>
            </Menu.Item>
            <Menu.Item key="sub1-4">
              <Link to="/subirdocenteseccionmasivo">• Carga id seccion</Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="13" icon={<ExclamationOutlined />}>
            <Link to="/pendientes">Pendientes</Link>
          </Menu.Item>
          <Menu.Item key="18" icon={<TableOutlined />}>
            <Link to="/accesos">Otros recursos</Link>
          </Menu.Item>   
        </Menu>
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
            <Route path="/monitorasig" element={<MonitorAsigPage />} />
            <Route path="/monitorasig/:programa" element={<MonitorAsigPage />} />
            <Route path="/monitorasig/:programa/:asignatura" element={<MonitorAsigPage />} />
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
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/tareas" element={<TareasPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/accesos" element={<AccesosPage />} />
            <Route path="/listasharepoint" element={<SharepointPage />} />
            <Route path="/lecturas" element={<LecturasPage />} />
            <Route path="/lecturas_masivo" element={<LecturasMasivoPage />} />
            <Route path="/errores_lista" element={<ErroresPage />} />
            <Route path="/monitoreo_lista" element={<UploadListaPage />} />
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

            {/* rutas con python */}
            <Route path="/obtener_alumnos" element={<AlumnosPage />} />
            <Route path="/carga_tablas_especificaciones" element={<CargaTabla />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};


const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
