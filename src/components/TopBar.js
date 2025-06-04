import React, { useState, useEffect, useRef } from 'react';
import { Layout, Dropdown, Input, Menu, Spin } from 'antd';
import { HiOutlineSquares2X2 } from 'react-icons/hi2';
import EnlacesAplicaciones from './EnlacesAplicaciones';
import NotificacionesCamapana from './NotificacionesCampana/NotificacionesCamapana';
import './TopBar.css';

const { Header } = Layout;

const TopBar = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchRef = useRef(null);

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

  const buildMenu = () => {
    if (loading) {
      return (
        <Menu>
          <Menu.Item disabled><Spin size="small" /> Buscando...</Menu.Item>
        </Menu>
      );
    }

    if (!results) return <Menu><Menu.Item disabled>No hay resultados</Menu.Item></Menu>;

    const {
      alumnos = [],
      docentes = [],
      seccionesPorId = [],
      seccionesPorNombre = []
    } = results || {};

    const noResults =
      alumnos.length === 0 &&
      docentes.length === 0 &&
      seccionesPorId.length === 0 &&
      seccionesPorNombre.length === 0;

    if (noResults) return <Menu><Menu.Item disabled>Sin coincidencias</Menu.Item></Menu>;

    const renderGroup = (title, items, getLabel, getHref, openInNewTab = false) =>
      items.length > 0 && [
        <Menu.ItemGroup key={title} title={title} />,
        ...items.map((item, index) => (
          <Menu.Item key={`${title}-${index}`}>
            <a
              href={getHref(item)}
              target={openInNewTab ? '_blank' : '_self'}
              rel={openInNewTab ? 'noopener noreferrer' : undefined}
            >
              {getLabel(item)}
            </a>
          </Menu.Item>
        )),
      ];

    return (
      <Menu>
        {renderGroup(
          '👨‍🎓 Alumnos',
          alumnos,
          a => `${a.rut} — ${a.nombre}`,
          a => `/rut/${encodeURIComponent(a.rut)}`,
          true
        )}
        {renderGroup(
          '👨‍🏫 Docentes',
          docentes,
          d => `${d.rut} — ${d.nombre}`,
          d => `/carga-docente/${encodeURIComponent(d.rut)}`,
          true
        )}
        {renderGroup(
          '📘 Secciones por ID',
          seccionesPorId,
          s => `${s.id_seccion} — ${s.nombre_sede} ${s.seccion} (DOC: ${s.docente})`,
          s => `/secciones/${encodeURIComponent(s.id_seccion)}`,
          true
        )}
        {renderGroup(
          '📗 Secciones por Nombre',
          seccionesPorNombre,
          s => `${s.seccion} — ${s.nombre_sede} (DOC: ${s.docente})`,
          s => `/secciones/${encodeURIComponent(s.id_seccion)}`,
          true
        )}
      </Menu>
    );
  };

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px #f0f1f2',
        margin: '24px 16px 10px 210px',
        marginLeft: '210px',
        padding: '24px',
        minHeight: '60px',
        borderRadius: '8px',
      }}
    >
      {/* Izquierda: Input con resultados */}
      <Dropdown
        overlay={buildMenu()}
        visible={dropdownVisible}
        onVisibleChange={setDropdownVisible}
        trigger={['click']}
      >
        <Input.Search
          ref={searchRef}
          placeholder="Buscar..."
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
        <NotificacionesCamapana/>
        <Dropdown overlay={<EnlacesAplicaciones />} placement="bottomRight" trigger={['click']}>
          <div className="topbar-icon-wrapper">
            <HiOutlineSquares2X2 className="topbar-icon" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TopBar;
