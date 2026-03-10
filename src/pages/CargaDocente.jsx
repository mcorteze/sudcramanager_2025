// CargaDocente.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Tooltip, message, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import DrawerReemplazoDocente from '../components/CargaDocente/DrawerReemplazoDocente';
import DrawerAgregarDocente from '../components/CargaDocente/DrawerAgregarDocente';
import DocenteInfo from '../components/CargaDocente/DocenteInfo'; // ✅ nueva importación

export default function CargaDocente() {
  const { rut } = useParams();
  const [docenteInfo, setDocenteInfo] = useState({});
  const [data, setData] = useState([]);
  const [seccionesData, setSeccionesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerReemplazoVisible, setDrawerReemplazoVisible] = useState(false);
  const [drawerAgregarVisible, setDrawerAgregarVisible] = useState(false);

const fetchDocenteData = async () => {
  setLoading(true);
  try {
    // 1. Cargar secciones normales desde /api/docente/:rut
    const seccionesRes = await fetch(`http://localhost:3001/api/docente/${rut}`);
    const seccionesData = await seccionesRes.json();
    setData(seccionesData);

    // 2. Cargar info del docente desde el nuevo endpoint
    const infoRes = await fetch(`http://localhost:3001/api/infodocente/${rut}`);
    const infoData = await infoRes.json();
    if (infoData.length > 0) {
      setDocenteInfo(infoData[0]);
    }
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};


  const fetchSeccionesData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/seccion_docente/${rut}`);
      const result = await response.json();
      if (result.length > 0) {
        setSeccionesData(result);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocenteData();
    fetchSeccionesData();
  }, [rut]);

  const copiarAlPortapapeles = (texto, label) => {
    navigator.clipboard.writeText(texto)
      .then(() => {
        message.success(`${label} copiado al portapapeles`);
      })
      .catch(() => {
        message.error(`Error al copiar ${label}`);
      });
  };

  const columns = [
    {
      title: 'Nombre de la Sede',
      dataIndex: 'nombre_sede',
      key: 'nombre_sede',
    },
    {
      title: 'Código Asignatura',
      dataIndex: 'cod_asig',
      key: 'cod_asig',
    },
    {
      title: 'Nombre Asignatura',
      dataIndex: 'asig',
      key: 'asig',
    },
    {
      title: 'Sección',
      dataIndex: 'seccion',
      key: 'seccion',
      render: (seccion) => (
        <>
          {seccion}{' '}
          <Tooltip title="Copiar Sección">
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8 }}
              onClick={() => copiarAlPortapapeles(seccion, 'Sección')}
            />
          </Tooltip>
        </>
      ),
    },
    {
      title: 'ID Sección',
      dataIndex: 'id_seccion',
      key: 'id_seccion',
      render: (id_seccion) => (
        <>
          <Link to={`/secciones/${id_seccion}`}>{id_seccion}</Link>{' '}
          <Tooltip title="Copiar ID Sección">
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8 }}
              onClick={() => copiarAlPortapapeles(id_seccion, 'ID Sección')}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  const seccionesColumns = [
    {
      title: 'Nombre de la Sede',
      dataIndex: 'nombre_sede',
      key: 'nombre_sede',
    },
    {
      title: 'Sección',
      dataIndex: 'seccion',
      key: 'seccion',
    },
    {
      title: 'ID Sección',
      dataIndex: 'id_seccion',
      key: 'id_seccion',
      render: (id_seccion) => (
        <>
          <Link to={`/secciones/${id_seccion}`}>{id_seccion}</Link>{' '}
          <Tooltip title="Copiar ID Sección">
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8 }}
              onClick={() => copiarAlPortapapeles(id_seccion, 'ID Sección')}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className='page-full'>
      <h1>Información del Docente</h1>

      {/* ✅ Reemplazo por componente hijo */}
      <DocenteInfo docente={docenteInfo} />

      <Table dataSource={data} columns={columns} pagination={false} style={{ marginBottom: 10 }} />
      <Button type="primary" onClick={() => setDrawerReemplazoVisible(true)}>
        Agregar sección titular
      </Button>

      <h2 style={{ marginTop: 32 }}>Secciones de reemplazo</h2>
      <Table dataSource={seccionesData} columns={seccionesColumns} pagination={false} style={{ marginBottom: 10 }} />
      <Button type="primary" onClick={() => setDrawerAgregarVisible(true)}>
        Agregar sección de reemplazo
      </Button>

      <DrawerReemplazoDocente
        visible={drawerReemplazoVisible}
        onClose={() => {
          setDrawerReemplazoVisible(false);
          fetchDocenteData();
        }}
        rutDocenteReemplazo={docenteInfo.rut_docente}
        nombreDocenteReemplazo={`${docenteInfo.nombre_doc} ${docenteInfo.apellidos_doc}`}
      />

      <DrawerAgregarDocente
        visible={drawerAgregarVisible}
        onClose={() => {
          setDrawerAgregarVisible(false);
          fetchDocenteData();
        }}
        rutDocenteAgregar={docenteInfo.rut_docente}
        nombreDocenteAgregar={`${docenteInfo.nombre_doc} ${docenteInfo.apellidos_doc}`}
        onAgregarDocente={() => {
          fetchSeccionesData();
          setDrawerAgregarVisible(false);
        }}
      />
    </div>
  );
}
