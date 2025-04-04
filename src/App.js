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
import { BiSolidError } from "react-icons/bi";
import { SlNote } from "react-icons/sl";
import { Layout, Menu, theme } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import CabezalSidebar from './components/CabezalSidebar.js';
import Home from './pages/Home.js';
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
import './App.css';

import EnlacesFlotante from './components/EnlacesFlotante.js';

const { Sider, Content } = Layout;

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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<SyncOutlined />}>
            <Link to="/">Resumen</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<FilterOutlined />}>
            <Link to="/informe">Filtro Informe</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            <Link to="/buscar-alumno">Buscar Alumno</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}>
            <Link to="/buscar-docente">Buscar docente</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<DropboxOutlined />}>
            <Link to="/secciones">ID Sección</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<SendOutlined />}>
            <Link to="/lecturas">Reprocesar</Link>
          </Menu.Item>
          <Menu.Item key="7" icon={<SendOutlined />}>
            <Link to="/lecturas_masivo">Reprocesar Masivo</Link>
          </Menu.Item>
          <Menu.Item key="8" icon={<BiSolidError />}>
            <Link to="/errores_lista">Errores</Link>
          </Menu.Item>
          <Menu.Item key="13" icon={<ExclamationOutlined />}>
            <Link to="/pendientes">Pendientes</Link>
          </Menu.Item>
          <Menu.Item key="16" icon={<SlNote />}>
            <Link to="/tareas">Tareas</Link>
          </Menu.Item>
          <Menu.Item key="17" icon={<DashboardOutlined />}>
            <a href="/dashboard" target="_blank" rel="noopener noreferrer">Dashboard</a>
          </Menu.Item>
          <Menu.Item key="18" icon={<TableOutlined />}>
            <Link to="/accesos">Recursos</Link>
          </Menu.Item>
          <Menu.Item key="19" icon={<TableOutlined />}>
            <Link to="/listasharepoint">SharePoint</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <EnlacesFlotante />
      <Layout>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
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
            <Route path="/buscareval" element={<BuscarEval />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/tareas" element={<TareasPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/accesos" element={<AccesosPage />} />
            <Route path="/listasharepoint" element={<SharepointPage />} />
            <Route path="/lecturas" element={<LecturasPage />} />
            <Route path="/lecturas_masivo" element={<LecturasMasivoPage />} />
            <Route path="/errores_lista" element={<ErroresPage />} />
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
