import React, { useState } from 'react';
import { Form, Input, Button, Select, message, Space } from 'antd';
import axios from 'axios';

const { Option } = Select;

const CrearMatriculaPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const generarIdMatricula = () => {
    const codPlan = form.getFieldValue('cod_plan');
    const rut = form.getFieldValue('rut');
    const ano = form.getFieldValue('ano');
    const periodo = form.getFieldValue('periodo');

    if (codPlan && rut && ano && periodo) {
      const periodoFormateado = periodo === '1' ? '001' : periodo === '2' ? '002' : periodo.padStart(3, '0');
      const idMatricula = `${codPlan}${rut}${ano}${periodoFormateado}`;
      form.setFieldsValue({ id_matricula: idMatricula });
    } else {
      message.warning('Debe completar Código Plan, RUT, Año y Periodo antes de generar el ID.');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        marca_temporal: new Date().toISOString(),
      };

      const response = await axios.post('http://localhost:3001/crear_matricula', payload);

      message.success(response.data.message || 'Matrícula creada exitosamente');
      form.resetFields();
    } catch (error) {
      console.error('Error al crear matrícula:', error);
      message.error(
        error.response?.data?.error +
        (error.response?.data?.detalle ? `: ${error.response.data.detalle}` : 'Error desconocido')
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
            required
          >
            <Space style={{ width: '100%' }}>
              <Form.Item
                name="id_matricula"
                noStyle
                rules={[{ required: true, message: 'Genere el ID de matrícula' }]}
              >
                <Input readOnly style={{ width: '100%' }} />
              </Form.Item>
              <Button onClick={generarIdMatricula}>
                Generar ID Matrícula
              </Button>
            </Space>
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
            rules={[{ required: true, message: 'Seleccione el periodo' }]}
          >
            <Select placeholder="Seleccione el periodo">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
            </Select>
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
