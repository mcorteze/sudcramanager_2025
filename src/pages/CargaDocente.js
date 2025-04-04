import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Tooltip, message } from 'antd';
import { Link } from 'react-router-dom';
import { CopyOutlined } from '@ant-design/icons';

export default function CargaDocente() {
  const { rut } = useParams();
  const [docenteInfo, setDocenteInfo] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
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
      <Table dataSource={data} columns={columns} />
    </div>
  );
}
