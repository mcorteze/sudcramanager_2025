import React, { useState, useRef, useCallback } from 'react';
import { Form, Input, Button, Select, App } from 'antd';
import axios from 'axios';

const { Option } = Select;

const CrearAlumnoPage = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rutExiste, setRutExiste] = useState(false);
  const debounceTimer = useRef(null);

  const verificarRut = useCallback(async (rut) => {
    if (!rut || rut.trim() === '') {
      setRutExiste(false);
      message.destroy('rut-alumno-duplicado');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3001/api/verificar-rut-alumno/${rut.trim()}`);
      if (res.data?.existe) {
        const a = res.data.alumno;
        setRutExiste(true);
        message.warning({
          content: `El RUT ${rut.trim()} ya está registrado: ${a.nombres} ${a.apellidos}`,
          duration: 8,
          key: 'rut-alumno-duplicado',
        });
      } else {
        setRutExiste(false);
        message.destroy('rut-alumno-duplicado');
      }
    } catch {
      setRutExiste(false);
    }
  }, []);

  const handleRutChange = (e) => {
    const valor = e.target.value;
    if (rutExiste) setRutExiste(false);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      verificarRut(valor);
    }, 600);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/crear_alumno', values);
      message.success(response.data.message || 'Alumno creado exitosamente');
      form.resetFields();
      setRutExiste(false);
    } catch (error) {
      console.error('Error al crear alumno:', error);
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
            validateStatus={rutExiste ? 'error' : ''}
            help={rutExiste ? 'Este RUT ya está registrado en el sistema.' : ''}
          >
            <Input placeholder="123456789" onChange={handleRutChange} />
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
            <Button type="primary" htmlType="submit" loading={loading} disabled={rutExiste}>
              Crear Alumno
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CrearAlumnoPage;
