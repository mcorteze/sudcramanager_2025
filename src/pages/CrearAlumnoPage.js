// CrearAlumnoPage.js

import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const CrearAlumnoPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Enviando datos al backend:', values);
      const response = await axios.post('http://localhost:3001/crear_alumno', values);
      message.success(response.data.message || 'Alumno creado exitosamente');

      form.resetFields();
    } catch (error) {
      console.error('Error al crear alumno:', error);
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
      <h1>Crear Nuevo Alumno</h1>
      <div className="muro">
        <Form
          form={form}
          name="crear_alumno"
          onFinish={onFinish}
          initialValues={{ sexo: 'M' }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <Form.Item
            label="RUT"
            name="rut"
            rules={[{ required: true, message: 'Por favor ingrese el RUT' }]}
          >
            <Input placeholder="123456789" />
          </Form.Item>

          <Form.Item
            label="Nombres"
            name="nombres"
            rules={[{ required: true, message: 'Por favor ingrese los nombres' }]}
          >
            <Input placeholder="MARCO ANDRES" />
          </Form.Item>

          <Form.Item
            label="Apellidos"
            name="apellidos"
            rules={[{ required: true, message: 'Por favor ingrese los apellidos' }]}
          >
            <Input placeholder="RODRIGUEZ GOMEZ" />
          </Form.Item>

          <Form.Item
            label="Usuario"
            name="user_alum"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
          >
            <Input placeholder="JRODRIGUEZ" />
          </Form.Item>

          <Form.Item
            label="Sexo"
            name="sexo"
            rules={[{ required: true, message: 'Por favor seleccione el sexo' }]}
          >
            <Select>
              <Option value="M">M</Option>
              <Option value="F">F</Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 18, offset: 6 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Alumno
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CrearAlumnoPage;
