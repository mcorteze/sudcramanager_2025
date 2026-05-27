import React, { useState, useEffect, useRef } from 'react';
import { Layout, Dropdown, Input, Spin } from 'antd';
import { HiOutlineSquares2X2 } from 'react-icons/hi2';
import { MdOutlineTerminal } from 'react-icons/md'; // <- nuevo ícono
import EnlacesAplicaciones from './EnlacesAplicaciones';
import NotificacionesCamapana from './NotificacionesCampana/NotificacionesCamapana';
import './TopBar.css';

const { Header } = Layout;

const TopBar = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [consolaVisible, setConsolaVisible] = useState(true); // <- nuevo estado
  const searchRef = useRef(null);

  const toggleConsola = () => {
    const body = document.body;

    const isHidden = body.classList.contains('hide-marca-temp');
    const isForced = body.classList.contains('force-show-marca-temp');

    if (isHidden || isForced) {
      body.classList.remove('hide-marca-temp');
      body.classList.remove('force-show-marca-temp');
      setConsolaVisible(true);
    } else {
      const isSmallScreen = window.innerWidth <= 1370;

      if (isSmallScreen) {
        body.classList.add('force-show-marca-temp');
      } else {
        body.classList.add('hide-marca-temp');
      }

      setConsolaVisible(false);
    }
  };


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        setLoading(true);
        fetch(`http://localhost:3001/api/topbar-buscar?q=${encodeURIComponent(search.trim())}`)
          .then(res => res.json())
          .then(data => {
            setResults(data);
            setDropdownVisible(true);
            setLoading(false);
          })
          .catch(err => {
            console.error('Error en búsqueda:', err);
            setLoading(false);
          });
      } else {
        setResults(null);
        setDropdownVisible(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const buildMenuItems = () => {
    if (loading) {
      return [{ key: 'loading', label: <><Spin size="small" /> Buscando...</>, disabled: true }];
    }

    if (!results) {
      return [{ key: 'empty', label: 'No hay resultados', disabled: true }];
    }

    const {
      alumnos = [],
      docentes = [],
      seccionesPorId = [],
      seccionesPorNombre = []
    } = results;

    const noResults =
      alumnos.length === 0 &&
      docentes.length === 0 &&
      seccionesPorId.length === 0 &&
      seccionesPorNombre.length === 0;

    if (noResults) {
      return [{ key: 'no-results', label: 'Sin coincidencias', disabled: true }];
    }

    const buildGroup = (title, items, getLabel, getHref, openInNewTab = false) => {
      if (items.length === 0) return [];
      return [
        { key: `group-${title}`, type: 'group', label: title },
        ...items.map((item, index) => ({
          key: `${title}-${index}`,
          label: (
            <a
              href={getHref(item)}
              target={openInNewTab ? '_blank' : '_self'}
              rel={openInNewTab ? 'noopener noreferrer' : undefined}
            >
              {getLabel(item)}
            </a>
          ),
        })),
      ];
    };

    return [
      ...buildGroup('👨‍🎓 Alumnos', alumnos, a => `${a.rut} — ${a.nombre}`, a => `/rut/${encodeURIComponent(a.rut)}`, true),
      ...buildGroup('👨‍🏫 Docentes', docentes, d => `${d.rut} — ${d.nombre}`, d => `/carga-docente/${encodeURIComponent(d.rut)}`, true),
      ...buildGroup('📘 Secciones por ID', seccionesPorId, s => `${s.id_seccion} — ${s.nombre_sede} ${s.seccion} (DOC: ${s.docente})`, s => `/secciones/${encodeURIComponent(s.id_seccion)}`, true),
      ...buildGroup('📗 Secciones por Nombre', seccionesPorNombre, s => `${s.seccion} — ${s.nombre_sede} (DOC: ${s.docente})`, s => `/secciones/${encodeURIComponent(s.id_seccion)}`, true),
    ];
  };

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px #f0f1f2',
        margin: '24px 16px 10px 210px',
        minHeight: '60px',
        borderRadius: '8px',
      }}
    >
      {/* Izquierda: Input con resultados */}
      <Dropdown
        menu={{ items: buildMenuItems() }}
        open={dropdownVisible}
        onOpenChange={setDropdownVisible}
        trigger={['click']}
      >
        <Input.Search
          ref={searchRef}
          placeholder="Buscar por RUT, ID o Sección..."
          allowClear
          onSearch={() => searchRef.current?.blur()}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
          onClick={() => {
            if (results) setDropdownVisible(true);
          }}
        />
      </Dropdown>

      {/* Derecha: Botones */}
      <div className="topbar-buttons">
        {/* Botón de terminal para mostrar/ocultar la consola */}
        <div
          className="topbar-icon-wrapper"
          onClick={toggleConsola}
          title="Mostrar/Ocultar consola de informes"
          style={{ cursor: 'pointer', marginRight: '8px' }}
        >
          <MdOutlineTerminal
            className="topbar-icon"
            style={{ opacity: consolaVisible ? 1 : 0.4 }}
          />
        </div>

        <NotificacionesCamapana />

        <Dropdown dropdownRender={() => <EnlacesAplicaciones />} placement="bottomRight" trigger={['click']}>
          <div className="topbar-icon-wrapper">
            <HiOutlineSquares2X2 className="topbar-icon" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TopBar;
