import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const CrearMatriculaPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        marca_temporal: new Date().toISOString(), // Se genera internamente
      };

      console.log('Enviando datos al backend:', payload);

      const response = await axios.post('http://localhost:3001/crear_matricula', payload);

      message.success(response.data.message || 'Matrícula creada exitosamente');
      form.resetFields();
    } catch (error) {
      console.error('Error al crear matrícula:', error);
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
      <h1>Crear Nueva Matrícula</h1>
      <div className="muro">
        <Form
          form={form}
          name="crear_matricula"
          onFinish={onFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <Form.Item
            label="ID Matrícula"
            name="id_matricula"
            rules={[{ required: true, message: 'Ingrese el ID de matrícula' }]}
          >
            <Input placeholder="Ej: 123456" />
          </Form.Item>

          <Form.Item
            label="RUT Alumno"
            name="rut"
            rules={[{ required: true, message: 'Ingrese el RUT del alumno' }]}
          >
            <Input placeholder="Ej: 12345678-9" />
          </Form.Item>

          <Form.Item
            label="ID Sede"
            name="id_sede"
            rules={[{ required: true, message: 'Ingrese el ID de sede' }]}
          >
            <Input placeholder="Ej: 1" />
          </Form.Item>

          <Form.Item
            label="Código Plan"
            name="cod_plan"
            rules={[{ required: true, message: 'Ingrese el código del plan' }]}
          >
            <Input placeholder="Ej: PLAN2024" />
          </Form.Item>

          <Form.Item
            label="Año"
            name="ano"
            rules={[{ required: true, message: 'Ingrese el año' }]}
          >
            <Input placeholder="Ej: 2025" />
          </Form.Item>

          <Form.Item
            label="Periodo"
            name="periodo"
            rules={[{ required: true, message: 'Ingrese el periodo' }]}
          >
            <Input placeholder="Ej: 1" />
          </Form.Item>

          <Form.Item
            label="Vigente"
            name="vigente"
            rules={[{ required: true, message: 'Seleccione si está vigente' }]}
          >
            <Select placeholder="Seleccionar...">
              <Option value={true}>true</Option>
              <Option value={false}>false</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Estado"
            name="estado"
            rules={[{ required: true, message: 'Seleccione el estado' }]}
          >
            <Select placeholder="Seleccionar...">
              <Option value={true}>true</Option>
              <Option value={false}>false</Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 18, offset: 6 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Matrícula
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CrearMatriculaPage;
