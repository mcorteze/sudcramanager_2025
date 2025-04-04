import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import moment from 'moment';
import './formato_tabla.css';

export default function SeccionesMailPendientes() {
  const [seccionesMailPendientes, setSeccionesMailPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSeccionesMailPendientes();
  }, []);

  const fetchSeccionesMailPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/informes/pendientes-mail');
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setSeccionesMailPendientes(data);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id_seccion) => {
    navigator.clipboard.writeText(id_seccion).then(() => {
      message.success('ID Sección copiado al portapapeles!');
    }).catch(() => {
      message.error('Error al copiar al portapapeles');
    });
  };

  const columns = [
    { title: 'Programa', dataIndex: 'programa', key: 'programa', width: 'auto', ellipsis: true },
    { title: 'Sede', dataIndex: 'nombre_sede', key: 'nombre_sede', width: 'auto', ellipsis: true },
    { title: 'Sección', dataIndex: 'seccion', key: 'seccion', width: 'auto', ellipsis: true },
    {
      title: 'ID Sección',
      dataIndex: 'id_seccion',
      key: 'id_seccion',
      width: 'auto',
      ellipsis: true,
      render: (id_seccion) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href={`/secciones/${id_seccion}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px' }}>
            {id_seccion}
          </a>
          <Button 
            type="text"
            icon={<CopyOutlined />} 
            onClick={() => handleCopy(id_seccion)}
            size="small"
          />
        </div>
      ),
    },
    { title: 'RUT Docente', dataIndex: 'rut_docente', key: 'rut_docente', width: 'auto', ellipsis: true },
    { title: 'ID Informe Sección', dataIndex: 'id_informeseccion', key: 'id_informeseccion', width: 'auto', ellipsis: true },
    { title: 'ID Evaluación', dataIndex: 'id_eval', key: 'id_eval', width: 'auto', ellipsis: true },
    {
      title: 'Marca Temporal',
      dataIndex: 'marca_temporal',
      key: 'marca_temporal',
      width: 'auto',
      ellipsis: true,
      render: (fecha) => fecha ? moment(fecha).format('DD/MM/YYYY HH:mm:ss') : '-',
    },
    {
      title: 'Marca Temporal Mail',
      dataIndex: 'marca_temp_mail',
      key: 'marca_temp_mail',
      width: 'auto',
      ellipsis: true,
      render: (fecha) => fecha ? moment(fecha).format('DD/MM/YYYY HH:mm:ss') : '-',
    },
    {
      title: 'Mail Enviado',
      dataIndex: 'mail_enviado',
      key: 'mail_enviado',
      width: 'auto',
      ellipsis: true,
      render: (enviado) => (enviado ? 'Sí' : 'No'),
    },
  ];

  if (loading) {
    return <div><Spin /> Cargando...</div>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

  if (seccionesMailPendientes.length === 0) {
    return <Alert message="No hay secciones pendientes" description="No hay más secciones pendientes de envío de mail." type="info" />;
  }

  return (
    <div>
      <div style={{ marginTop: '20px' }}></div>
      <h1>Secciones pendientes de envío de mail</h1>
      <h3>Secciones con informe de docente pendiente por algún motivo.</h3>
      <Table
        dataSource={seccionesMailPendientes}
        columns={columns}
        rowKey="id_informeseccion"
        pagination={false}
        className="table-small-font"
      />
    </div>
  );
}
