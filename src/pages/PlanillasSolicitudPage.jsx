import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BuscarSeccionSelector from '../components/BuscarSeccionSelector';

const { Title, Text } = Typography;
const API = 'http://localhost:3001';

export default function PlanillasSolicitudPage() {
  const { id_eval } = useParams();
  const navigate = useNavigate();
  const idEvalDecoded = decodeURIComponent(id_eval);

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [registroOriginal, setRegistroOriginal] = useState(null);
  const [idSeccionSeleccionado, setIdSeccionSeleccionado] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarSolicitudes();
  }, [idEvalDecoded]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/planillas_solicitudes/${encodeURIComponent(idEvalDecoded)}`);
      setSolicitudes(res.data);
    } catch {
      message.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Abrir modal agregar
  // ===========================
  const abrirModalAgregar = () => {
    setModoEdicion(false);
    setRegistroOriginal(null);
    setIdSeccionSeleccionado(null);
    form.setFieldsValue({ id_eval: idEvalDecoded, id_seccion: '' });
    setModalVisible(true);
  };

  // ===========================
  // Abrir modal editar
  // ===========================
  const abrirModalEditar = (registro) => {
    setModoEdicion(true);
    setRegistroOriginal({ ...registro });
    setIdSeccionSeleccionado(registro.id_seccion);
    form.setFieldsValue({
      id_eval: registro.id_eval,
      id_seccion: registro.id_seccion,
    });
    setModalVisible(true);
  };

  // ===========================
  // Guardar
  // ===========================
  const guardar = async () => {
    if (modoEdicion) {
      // En edición validar el form normalmente
      let valores;
      try {
        valores = await form.validateFields();
      } catch {
        return;
      }
      try {
        await axios.put(`${API}/api/planillas_solicitudes`, {
          id_eval: idEvalDecoded,
          id_seccion: valores.id_seccion,
          original_id_eval: registroOriginal.id_eval,
          original_id_seccion: registroOriginal.id_seccion,
        });
        message.success('Registro actualizado');
        setModalVisible(false);
        cargarSolicitudes();
      } catch (err) {
        message.error(err?.response?.data?.error || 'Error al actualizar');
      }
    } else {
      // En agregar el id_seccion viene del selector externo al form
      if (!idSeccionSeleccionado) {
        message.warning('Seleccione una sección usando los desplegables');
        return;
      }
      try {
        await axios.post(`${API}/api/planillas_solicitudes`, {
          id_eval: idEvalDecoded,
          id_seccion: idSeccionSeleccionado,
        });
        message.success('Registro agregado');
        setModalVisible(false);
        cargarSolicitudes();
      } catch (err) {
        message.error(err?.response?.data?.error || 'Error al agregar');
      }
    }
  };

  // ===========================
  // Eliminar
  // ===========================
  const eliminar = (registro) => {
    Modal.confirm({
      title: 'Confirmar eliminación',
      content: `¿Eliminar solicitud id_eval=${registro.id_eval}, id_seccion=${registro.id_seccion}?`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await axios.delete(`${API}/api/planillas_solicitudes`, {
            data: { id_eval: registro.id_eval, id_seccion: registro.id_seccion },
          });
          message.success('Registro eliminado');
          cargarSolicitudes();
        } catch (err) {
          message.error(err?.response?.data?.error || 'Error al eliminar');
        }
      },
    });
  };

  const columns = [
    { title: 'id_eval', dataIndex: 'id_eval', ellipsis: true },
    { title: 'id_seccion', dataIndex: 'id_seccion', width: 120 },
    {
      title: 'Acciones',
      width: 110,
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => abrirModalEditar(row)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => eliminar(row)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/planillas_creadas/${encodeURIComponent(idEvalDecoded)}`)}
        >
          Volver
        </Button>
      </Space>

      <Title level={4}>Planillas Solicitud</Title>

      <div style={{ marginBottom: 12 }}>
        <Tag color="blue">id_eval: {idEvalDecoded}</Tag>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirModalAgregar}>
          Agregar solicitud
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          size="small"
          dataSource={solicitudes}
          columns={columns}
          rowKey={(r) => `${r.id_eval}-${r.id_seccion}`}
          pagination={false}
          locale={{ emptyText: 'Sin solicitudes para esta evaluación' }}
        />
      </Spin>

      {/* ---- Modal agregar / editar ---- */}
      <Modal
        title={modoEdicion ? 'Editar solicitud' : 'Agregar solicitud'}
        open={modalVisible}
        onOk={guardar}
        onCancel={() => setModalVisible(false)}
        okText={modoEdicion ? 'Guardar cambios' : 'Agregar'}
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="id_eval">
            <Input value={idEvalDecoded} disabled />
          </Form.Item>

          {modoEdicion ? (
            // En edición: campo de texto simple con el valor actual
            <Form.Item
              name="id_seccion"
              label="id_seccion"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Input />
            </Form.Item>
          ) : (
            // En agregar: selector en cascada
            <Form.Item label="Buscar sección" required>
              <BuscarSeccionSelector
                value={idSeccionSeleccionado}
                onChange={setIdSeccionSeleccionado}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
