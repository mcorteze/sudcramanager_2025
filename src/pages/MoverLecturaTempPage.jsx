import { useState } from 'react';
import { Button, Form, Input, InputNumber, Table, Tag, Typography, Space, Divider, App } from 'antd';
import { SearchOutlined, SwapRightOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const API = 'http://localhost:3001';

export default function MoverLecturaTempPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [preview, setPreview] = useState(null);   // { total, registros }
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingMover, setLoadingMover] = useState(false);

  const buscarPreview = async () => {
    let valores;
    try { valores = await form.validateFields(); } catch { return; }

    setLoadingPreview(true);
    setPreview(null);
    try {
      const res = await axios.get(`${API}/api/mover-lectura-temp/preview`, {
        params: { num_prueba: valores.num_prueba, cod_interno: valores.cod_interno.trim() },
      });
      setPreview(res.data);
      if (res.data.total === 0) message.info('No se encontraron registros con esos filtros');
    } catch (err) {
      message.error(err?.response?.data?.error || 'Error al consultar registros');
    } finally {
      setLoadingPreview(false);
    }
  };

  const confirmarMover = () => {
    const valores = form.getFieldsValue();
    modal.confirm({
      title: 'Confirmar movimiento',
      content: (
        <div>
          <p>Se moverán <strong>{preview.total - preview.duplicados}</strong> registro(s) nuevos desde <strong>lectura</strong> hacia <strong>lectura_temp</strong>{preview.duplicados > 0 ? ` (${preview.duplicados} duplicados serán omitidos)` : ''} con:</p>
          <ul>
            <li><strong>num_prueba:</strong> {valores.num_prueba}</li>
            <li><strong>cod_interno:</strong> {valores.cod_interno}</li>
          </ul>
          <p>Los registros serán <strong>eliminados de lectura</strong> e insertados en <strong>lectura_temp</strong>.</p>
        </div>
      ),
      okText: 'Mover',
      okType: 'primary',
      cancelText: 'Cancelar',
      onOk: ejecutarMover,
    });
  };

  const ejecutarMover = async () => {
    const valores = form.getFieldsValue();
    setLoadingMover(true);
    try {
      const res = await axios.post(`${API}/api/mover-lectura-temp`, {
        num_prueba: valores.num_prueba,
        cod_interno: valores.cod_interno.trim(),
      });
      message.success(`${res.data.insertados} registro(s) movidos correctamente`);
      setPreview(null);
      form.resetFields();
    } catch (err) {
      message.error(err?.response?.data?.error || 'Error al mover registros');
    } finally {
      setLoadingMover(false);
    }
  };

  const columns = [
    {
      title: 'Estado',
      dataIndex: 'ya_existe',
      width: 100,
      render: (val) => val
        ? <Tag color="red">Duplicado</Tag>
        : <Tag color="green">Nuevo</Tag>,
    },
    { title: 'id_lectura', dataIndex: 'id_lectura', width: 90 },
    { title: 'rut', dataIndex: 'rut', width: 110 },
    { title: 'id_archivoleido', dataIndex: 'id_archivoleido', width: 120 },
    { title: 'linea_leida', dataIndex: 'linea_leida', width: 100 },
    { title: 'forma', dataIndex: 'forma', width: 70 },
    { title: 'grupo', dataIndex: 'grupo', width: 70 },
    { title: 'imagen', dataIndex: 'imagen', ellipsis: true },
    { title: 'instante_forms', dataIndex: 'instante_forms', width: 160 },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Mover registros: lectura → lectura_temp</Title>
      <Text type="secondary">
        Mueve registros de la tabla <strong>lectura</strong> hacia <strong>lectura_temp</strong> filtrando por num_prueba y cod_interno.
      </Text>

      <Divider />

      <Form form={form} layout="inline" style={{ marginBottom: 24 }}>
        <Form.Item
          name="num_prueba"
          label="num_prueba"
          rules={[{ required: true, message: 'Requerido' }]}
        >
          <InputNumber placeholder="ej. 2" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item
          name="cod_interno"
          label="cod_interno"
          rules={[{ required: true, message: 'Requerido' }]}
        >
          <Input placeholder="ej. ABC123" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item>
          <Button
            icon={<SearchOutlined />}
            onClick={buscarPreview}
            loading={loadingPreview}
          >
            Previsualizar
          </Button>
        </Form.Item>
      </Form>

      {preview && (
        <>
          <Space style={{ marginBottom: 12 }}>
            <Text>Registros encontrados:</Text>
            <Tag color="blue">{preview.total}</Tag>
            {preview.duplicados > 0 && (
              <Tag color="red">{preview.duplicados} ya existen en lectura_temp (serán omitidos)</Tag>
            )}
            <Tag color="green">{preview.total - preview.duplicados} nuevos</Tag>
            {preview.total > 0 && (
              <Button
                type="primary"
                icon={<SwapRightOutlined />}
                loading={loadingMover}
                onClick={confirmarMover}
              >
                Mover a lectura_temp
              </Button>
            )}
          </Space>

          {preview.registros.length > 0 && (
            <Table
              size="small"
              dataSource={preview.registros}
              columns={columns}
              rowKey="id_lectura"
              pagination={{ pageSize: 20 }}
              scroll={{ x: 'max-content' }}
            />
          )}
        </>
      )}
    </div>
  );
}
