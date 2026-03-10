import React, { useState } from 'react';
import { MegaMenu } from 'primereact/megamenu';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { TbDatabaseEdit } from "react-icons/tb";
import { RiFileExcel2Line } from "react-icons/ri";
import { SiSap } from "react-icons/si";
import { MdFollowTheSigns, MdCompareArrows } from "react-icons/md";
import { FaDatabase } from 'react-icons/fa';
import './Apunte.css';

import SapMenu from '../components/megamenu/sap/SapMenu';
import TablaAppMenu from '../components/megamenu/tablaapp/TablaAppMenu';
import TablaEmisionMenu from '../components/megamenu/tablaemision/TablaEmisionMenu';
import TablaAjustes from '../components/megamenu/tablaajustes/TablaAjustes';
import RegistrosMenu from '../components/megamenu/pgadmin/registros/RegistrosMenu';
import SeguimientoMenu from '../components/megamenu/seguimiento/SeguimientoMenu';
import SqlMenu from '../components/megamenu/sql/SqlMenu';

// NUEVO: página de Convalidaciones > Lógica
import ConvalidacionesLogica from '../components/megamenu/convalidaciones/ConvalidacionesLogica';

export default function Apunte() {
  const [renderSapMenu, setRenderSapMenu] = useState(false);
  const [sapMenuIndex, setSapMenuIndex] = useState(0);

  const [renderAppMenu, setRenderAppMenu] = useState(false);
  const [appMenuIndex, setAppMenuIndex] = useState(0);

  const [renderEmisionMenu, setRenderEmisionMenu] = useState(false);
  const [emisionMenuIndex, setEmisionMenuIndex] = useState(0);

  const [renderAjustesMenu, setRenderAjustesMenu] = useState(false);

  const [renderRegistrosMenu, setRenderRegistrosMenu] = useState(false);

  const [renderSeguimientoMenu, setRenderSeguimientoMenu] = useState(false); 
  const [seguimientoMenuIndex, setSeguimientoMenuIndex] = useState(0);

  const [renderSqlMenu, setRenderSqlMenu] = useState(false);

  // NUEVO: estado para Convalidaciones
  const [renderConvalidacionesMenu, setRenderConvalidacionesMenu] = useState(false);

  const resetAll = () => {
    setRenderSapMenu(false);
    setRenderAppMenu(false);
    setRenderEmisionMenu(false);
    setRenderAjustesMenu(false);
    setRenderRegistrosMenu(false);
    setRenderSeguimientoMenu(false);
    setRenderSqlMenu(false);
    setRenderConvalidacionesMenu(false);
  };

  const items = [
    {
      label: 'SAP',
      icon: <SiSap className='menu-iconstyle'/>,
      items: [[
        { label: 'Descargas', items: [
          { label: 'Instrucciones', command: () => { resetAll(); setRenderSapMenu(true); setSapMenuIndex(0); } },
          { label: 'Docentes', command: () => { resetAll(); setRenderSapMenu(true); setSapMenuIndex(1); } },
          { label: 'Indice', command: () => { resetAll(); setRenderSapMenu(true); setSapMenuIndex(2); } },
          { label: 'Inscripción', command: () => { resetAll(); setRenderSapMenu(true); setSapMenuIndex(3); } },
          { label: 'Sabana', command: () => { resetAll(); setRenderSapMenu(true); setSapMenuIndex(4); } },
        ] }
      ]]
    },
    {
      label: 'Tabla de especificaciones',
      icon: <RiFileExcel2Line className='menu-iconstyle'/>,
      items: [
        [
          { label: 'Validación', items: [
            { label: 'App Validacion', command: () => { resetAll(); setRenderAppMenu(true); setAppMenuIndex(0); } }
          ]}
        ],
        [
          { label: 'Emisión de planillas', items: [
            { label: 'Carga de planillas', command: () => { resetAll(); setRenderEmisionMenu(true); setEmisionMenuIndex(0); } },
            { label: 'Planilla base', command: () => { resetAll(); setRenderEmisionMenu(true); setEmisionMenuIndex(1); } },
            { label: 'Emisión de planillas', command: () => { resetAll(); setRenderEmisionMenu(true); setEmisionMenuIndex(2); } },
          ]}
        ],
        [
          { label: 'Ajustes', items: [
            { label: 'Apuntes adicionales', command: () => { resetAll(); setRenderAjustesMenu(true); } }
          ]}
        ],
      ]
    },
    {
      label: 'Cambiar registros',
      icon: <TbDatabaseEdit className='menu-iconstyle'/>,
      items: [[
        { label: 'Modificar', items: [
          { label: 'Docente titular', command: () => { resetAll(); setRenderRegistrosMenu(true); } },
          { label: 'Inscripción alumno', command: () => { resetAll(); setRenderRegistrosMenu(true); } },
          { label: 'Reenviar correo a estudiante', command: () => { resetAll(); setRenderRegistrosMenu(true); } },
        ]}
      ]]
    },
    {
      label: 'Seguimiento',
      icon: <MdFollowTheSigns className='menu-iconstyle'/>,
      items: [[
        { label: 'Planillas', items: [
          { label: 'Seguimiento de planillas', command: () => { resetAll(); setRenderSeguimientoMenu(true); setSeguimientoMenuIndex(0); } },
        ]},
        { label: 'Imagenes', items: [
          { label: 'Seguimiento de imagenes', command: () => { resetAll(); setRenderSeguimientoMenu(true); setSeguimientoMenuIndex(1); } },
        ]},
      ]]
    },

    // NUEVA SECCIÓN
    {
      label: 'Convalidaciones',
      icon: <MdCompareArrows className='menu-iconstyle'/>,
      items: [[
        { label: 'Lógica', items: [
          { label: 'Lógica', command: () => { resetAll(); setRenderConvalidacionesMenu(true); } }
        ] }
      ]]
    },

    {
      label: 'SQL',
      icon: <FaDatabase className='menu-iconstyle'/>,
      items: [[
        { label: 'Consulta extracción', items: [
          { label: 'Notas', command: () => { resetAll(); setRenderSqlMenu(true); } }
        ] }
      ]]
    }
  ];

  return (
    <div className='page-full' style={{ marginTop: '40px' }}>
      <div className="card">
        <MegaMenu model={items} breakpoint="960px" />
      </div>
      <div className='apunte-container'>
        <div className="apunte-content">
          {renderSapMenu && <SapMenu initialActiveIndex={sapMenuIndex} />}
          {renderAppMenu && <TablaAppMenu initialActiveIndex={appMenuIndex} />}
          {renderEmisionMenu && <TablaEmisionMenu initialActiveIndex={emisionMenuIndex} />}
          {renderAjustesMenu && <TablaAjustes />}
          {renderRegistrosMenu && <RegistrosMenu />}
          {renderSeguimientoMenu && <SeguimientoMenu index={seguimientoMenuIndex} />}
          {renderSqlMenu && <SqlMenu />}

          {/* NUEVO: render de Convalidaciones > Lógica */}
          {renderConvalidacionesMenu && <ConvalidacionesLogica />}
        </div>
      </div>
    </div>
  );
}
