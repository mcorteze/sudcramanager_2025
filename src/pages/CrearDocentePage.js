import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';



const CrearDocentePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Enviando datos al backend:', values);
      const response = await axios.post('http://localhost:3001/crear_docente', values);
      message.success(response.data.message || 'Docente creado exitosamente');
      form.resetFields();
    } catch (error) {
      console.error('Error al crear docente:', error);
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
      }
      message.error(
        error.response?.data?.error +
        (error.response?.data?.detalle ? `: ${error.response.data.detalle}` : '')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-full">
      <h1>Crear Nuevo Docente</h1>
      <h6>
        Asignar carga académica a un docente nuevo{" "}
        <Link to="/subirdocenteseccionmasivo" target="_blank">aquí</Link>
      </h6>

      <div className="muro">
        <Form
          form={form}
          name="crear_docente"
          onFinish={onFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <Form.Item
            label="RUT"
            name="rut_docente"
            rules={[{ required: true, message: 'Por favor ingrese el RUT del docente' }]}
          >
            <Input placeholder="123456789" />
          </Form.Item>

          <Form.Item
            label="Nombres"
            name="nombre_doc"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del docente' }]}
          >
            <Input placeholder="Juan Andrés" />
          </Form.Item>

          <Form.Item
            label="Apellidos"
            name="apellidos_doc"
            rules={[{ required: true, message: 'Por favor ingrese los apellidos del docente' }]}
          >
            <Input placeholder="Pérez Soto" />
          </Form.Item>

          <Form.Item
            label="Usuario"
            name="username_doc"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
          >
            <Input placeholder="jperez" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="mail_doc"
            rules={[
              { required: true, message: 'Por favor ingrese el correo electrónico' },
              { type: 'email', message: 'El correo no es válido' }
            ]}
          >
            <Input placeholder="juan.perez@ejemplo.com" />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 18, offset: 6 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Docente
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CrearDocentePage;
