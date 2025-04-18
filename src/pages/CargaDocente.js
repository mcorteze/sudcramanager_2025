import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Tooltip, message, Button } from 'antd';
import { Link } from 'react-router-dom';
import { CopyOutlined } from '@ant-design/icons';
import DrawerReemplazoDocente from '../components/CargaDocente/DrawerReemplazoDocente';
import DrawerAgregarDocente from '../components/CargaDocente/DrawerAgregarDocente';

export default function CargaDocente() {
  const { rut } = useParams(); // Extraemos el RUT del docente desde los parámetros de la URL
  const [docenteInfo, setDocenteInfo] = useState({});
  const [data, setData] = useState([]);
  const [seccionesData, setSeccionesData] = useState([]); // Nuevo estado para las secciones
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [drawerReemplazoVisible, setDrawerReemplazoVisible] = useState(false);
  const [drawerAgregarVisible, setDrawerAgregarVisible] = useState(false);

  // Función para cargar los datos del docente
  const fetchDocenteData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/docente/${rut}`);
      const result = await response.json();
      if (result.length > 0) {
        setDocenteInfo(result[0]);
        setData(result);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los datos de las secciones
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
    fetchSeccionesData(); // Llamamos a esta función también
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

  // Columnas para la primera tabla (datos del docente)
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

  // Columnas para la segunda tabla (secciones del docente)
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

      <div>
        <p>
          <strong>RUT:</strong> {docenteInfo.rut_docente}{' '}
          <Tooltip title="Copiar RUT">
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8 }}
              onClick={() => copiarAlPortapapeles(docenteInfo.rut_docente, 'RUT')}
            />
          </Tooltip>
        </p>
        <p><strong>Nombre:</strong> {docenteInfo.nombre_doc}</p>
        <p><strong>Apellidos:</strong> {docenteInfo.apellidos_doc}</p>
        <p><strong>Username:</strong> {docenteInfo.username_doc}</p>
        <p>
          <strong>Email:</strong> {docenteInfo.mail_doc}{' '}
          <Tooltip title="Copiar Correo">
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8 }}
              onClick={() => copiarAlPortapapeles(docenteInfo.mail_doc, 'Correo')}
            />
          </Tooltip>
        </p>
      </div>

      { /* Tabla con secciones de titularidad */ }
      <Table 
        dataSource={data} 
        columns={columns} 
        pagination={false}
        style={{ marginBottom: 10 }}
      />
      <div>
        <Button
          type="primary"
          onClick={() => setDrawerReemplazoVisible(true)}
        >
          Agregar sección titular
        </Button>
      </div>

      { /* Tabla con secciones de agregar */ }
      <h2 style={{ marginTop: 32 }}>Secciones de reemplazo</h2>
      <Table 
        dataSource={seccionesData} 
        columns={seccionesColumns} 
        pagination={false}
        style={{ marginBottom: 10 }}
      />

      <div>
        <Button
          type="primary"
          onClick={() => setDrawerAgregarVisible(true)}
        >
          Agregar sección de reemplazo
        </Button>
      </div>

      <DrawerReemplazoDocente
        visible={drawerReemplazoVisible}
        onClose={() => {
          setDrawerReemplazoVisible(false);
          fetchDocenteData(); // Refrescar datos al cerrar el drawer
        }}
        rutDocenteReemplazo={docenteInfo.rut_docente}
        nombreDocenteReemplazo={`${docenteInfo.nombre_doc} ${docenteInfo.apellidos_doc}`}
      />

      <DrawerAgregarDocente
        visible={drawerAgregarVisible}
        onClose={() => {
          setDrawerAgregarVisible(false);  // Esto cierra el drawer correctamente.
          fetchDocenteData(); // Refresca datos del docente al cerrar el drawer.
        }}
        rutDocenteAgregar={docenteInfo.rut_docente}
        nombreDocenteAgregar={`${docenteInfo.nombre_doc} ${docenteInfo.apellidos_doc}`}
        onAgregarDocente={() => {
          fetchSeccionesData(); // Refresca las secciones después de agregar el docente
          setDrawerAgregarVisible(false); // Asegúrate de cerrar el drawer después de agregar el docente
        }}
      />



    </div>
  );
}
