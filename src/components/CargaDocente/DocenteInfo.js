import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Input, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import axios from 'axios';
import './DocenteInfo.css';

const copyToClipboard = (text, label) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success(`${label} copiado al portapapeles`);
  }).catch(() => {
    message.error(`Error al copiar ${label}`);
  });
};

const DocenteInfo = ({ docente }) => {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docente) {
      setRut(docente.rut_docente);
      setNombre(docente.nombre_doc || '');
      setApellidos(docente.apellidos_doc || '');
      setUsername(docente.username_doc || '');
      setEmail(docente.mail_doc || '');
    }
  }, [docente]);

  const handleUpdate = async () => {
    if (!rut) {
      message.warning('El RUT del docente es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      await axios.put('http://localhost:3001/api/actualizar-docente', {
        rut_docente: rut.trim(),
        nombre_doc: nombre.trim() || null,
        apellidos_doc: apellidos.trim() || null,
        username_doc: username.trim() || null,
        mail_doc: email.trim() || null,
      });

      message.success('Docente actualizado exitosamente.');
    } catch (error) {
      console.error('Error al actualizar el docente:', error);
      message.error('Ocurrió un error al actualizar el docente. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!docente) return null;

  return (
    <div className="docente-info-container">
      <Typography.Title level={4}>Información del Docente</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div className="row">
            <span className="label">RUT:</span>
            <span>{rut}</span>
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8, color: '#1890ff' }}
              onClick={() => copyToClipboard(rut, 'RUT')}
            />
          </div>
          <div className="row">
            <span className="label">Nombre:</span>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="input" />
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8, color: '#1890ff' }}
              onClick={() => copyToClipboard(nombre, 'Nombre')}
            />
          </div>
          <div className="row">
            <span className="label">Apellidos:</span>
            <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="input" />
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8, color: '#1890ff' }}
              onClick={() => copyToClipboard(apellidos, 'Apellidos')}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="row">
            <span className="label">Username:</span>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="input" />
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8, color: '#1890ff' }}
              onClick={() => copyToClipboard(username, 'Username')}
            />
          </div>
          <div className="row">
            <span className="label">Email:</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            <CopyOutlined
              style={{ cursor: 'pointer', marginLeft: 8, color: '#1890ff' }}
              onClick={() => copyToClipboard(email, 'Correo')}
            />
          </div>
        </Col>
      </Row>
      <Button type="primary" loading={loading} onClick={handleUpdate} style={{ marginTop: 16 }}>
        Actualizar Docente
      </Button>
    </div>
  );
};

export default DocenteInfo;
