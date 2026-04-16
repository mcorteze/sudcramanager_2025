import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Table,
  Space,
  Modal,
  Form,
  InputNumber,
  message,
  Spin,
  Tag,
  Divider,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const API = 'http://localhost:3001';

export default function PlanillasPage() {
  const { id_eval: idEvalParam } = useParams();
  const navigate = useNavigate();

  // --- Búsqueda eval ---
  const [busquedaIdEval, setBusquedaIdEval] = useState('');
  const [evalResultados, setEvalResultados] = useState([]);
  const [loadingEval, setLoadingEval] = useState(false);

  // --- Eval seleccionada ---
  const [evalSeleccionada, setEvalSeleccionada] = useState(null);

  // --- Planillas creadas ---
  const [planillas, setPlanillas] = useState([]);
  const [loadingPlanillas, setLoadingPlanillas] = useState(false);

  // --- Modal agregar/editar ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [registroOriginal, setRegistroOriginal] = useState(null);
  const [form] = Form.useForm();

  // Si viene id_eval por URL, cargar directo
  useEffect(() => {
    if (idEvalParam) {
      cargarEvalPorId(idEvalParam);
    }
  }, [idEvalParam]);

  const cargarEvalPorId = async (id_eval) => {
    setLoadingEval(true);
    try {
      const res = await axios.get(`${API}/api/planillas/eval`, {
        params: { id_eval: id_eval.trim() },
      });
      if (res.data.length > 0) {
        const registro = res.data[0];
        setEvalSeleccionada(registro);
        cargarPlanillas(registro.id_eval);
      } else {
        message.warning(`No se encontró evaluación con id_eval: ${id_eval}`);
      }
    } catch {
      message.error('Error al cargar evaluación');
    } finally {
      setLoadingEval(false);
    }
  };

  // ===========================
  // Buscar evaluaciones
  // ===========================
  const buscarEval = async () => {
    if (!busquedaIdEval.trim()) {
      message.warning('Ingrese un id_eval para buscar');
      return;
    }
    setLoadingEval(true);
    try {
      const res = await axios.get(`${API}/api/planillas/eval`, {
        params: { id_eval: busquedaIdEval.trim() },
      });
      setEvalResultados(res.data);
      if (res.data.length === 0) message.info('No se encontraron evaluaciones con ese id_eval');
    } catch {
      message.error('Error al buscar evaluaciones');
    } finally {
      setLoadingEval(false);
    }
  };

  const seleccionarEval = (registro) => {
    setEvalSeleccionada(registro);
    setEvalResultados([]);
    setBusquedaIdEval('');
    cargarPlanillas(registro.id_eval);
  };

  // ===========================
  // Cargar planillas_creadas
  // ===========================
  const cargarPlanillas = async (id_eval) => {
    setLoadingPlanillas(true);
    try {
      const res = await axios.get(`${API}/api/planillas_creadas/${id_eval}`);
      setPlanillas(res.data);
    } catch {
      message.error('Error al cargar planillas creadas');
    } finally {
      setLoadingPlanillas(false);
    }
  };

  // ===========================
  // Abrir modal agregar
  // ===========================
  const abrirModalAgregar = () => {
    setModoEdicion(false);
    setRegistroOriginal(null);
    form.setFieldsValue({
      id_eval: evalSeleccionada.id_eval,
      ano: evalSeleccionada.ano,
      periodo: evalSeleccionada.periodo,
      num_prueba: evalSeleccionada.num_prueba,
      sufijo: '',
    });
    setModalVisible(true);
  };

  // ===========================
  // Abrir modal editar
  // ===========================
  const abrirModalEditar = (registro) => {
    setModoEdicion(true);
    setRegistroOriginal({ ...registro });
    form.setFieldsValue({
      id_eval: registro.id_eval,
      ano: registro.ano,
      periodo: registro.periodo,
      num_prueba: registro.num_prueba,
      sufijo: registro.sufijo || '',
    });
    setModalVisible(true);
  };

  // ===========================
  // Guardar (crear o editar)
  // ===========================
  const guardar = async () => {
    try {
      const valores = await form.validateFields();
      if (modoEdicion) {
        await axios.put(`${API}/api/planillas_creadas`, {
          ...valores,
          sufijo: valores.sufijo || null,
          original_id_eval: registroOriginal.id_eval,
          original_num_prueba: registroOriginal.num_prueba,
          original_sufijo: registroOriginal.sufijo,
        });
        message.success('Registro actualizado');
      } else {
        await axios.post(`${API}/api/planillas_creadas`, {
          ...valores,
          sufijo: valores.sufijo || null,
        });
        message.success('Registro agregado');
      }
      setModalVisible(false);
      cargarPlanillas(evalSeleccionada.id_eval);
    } catch (err) {
      if (err?.response?.data?.error) {
        message.error(err.response.data.error);
      }
    }
  };

  // ===========================
  // Eliminar
  // ===========================
  const eliminar = (registro) => {
    Modal.confirm({
      title: 'Confirmar eliminación',
      content: `¿Eliminar planilla id_eval=${registro.id_eval}, num_prueba=${registro.num_prueba}, sufijo=${registro.sufijo || '(sin sufijo)'}?`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await axios.delete(`${API}/api/planillas_creadas`, {
            data: {
              id_eval: registro.id_eval,
              num_prueba: registro.num_prueba,
              sufijo: registro.sufijo || null,
            },
          });
          message.success('Registro eliminado');
          cargarPlanillas(evalSeleccionada.id_eval);
        } catch (err) {
          message.error(err?.response?.data?.error || 'Error al eliminar');
        }
      },
    });
  };

  // ===========================
  // Columnas tabla eval (búsqueda)
  // ===========================
  const colsEval = [
    { title: 'id_eval', dataIndex: 'id_eval', ellipsis: true },
    { title: 'Asignatura', dataIndex: 'cod_asig', width: 130 },
    { title: 'Año', dataIndex: 'ano', width: 70 },
    { title: 'Periodo', dataIndex: 'periodo', width: 80 },
    { title: 'N° Prueba', dataIndex: 'num_prueba', width: 90 },
    { title: 'Nombre', dataIndex: 'nombre_prueba', ellipsis: true },
    { title: 'Tipo', dataIndex: 'tipo', width: 80 },
    {
      title: '',
      width: 120,
      render: (_, row) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => seleccionarEval(row)}
        >
          Seleccionar
        </Button>
      ),
    },
  ];

  // ===========================
  // Columnas tabla planillas_creadas
  // ===========================
  const colsPlanillas = [
    { title: 'id_eval', dataIndex: 'id_eval', ellipsis: true },
    { title: 'Año', dataIndex: 'ano', width: 70 },
    { title: 'Periodo', dataIndex: 'periodo', width: 80 },
    { title: 'N° Prueba', dataIndex: 'num_prueba', width: 90 },
    { title: 'Sufijo', dataIndex: 'sufijo', width: 90, render: v => v || <Text type="secondary">—</Text> },
    {
      title: 'Acciones',
      width: 170,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate(`/planillas_solicitud/${encodeURIComponent(row.id_eval)}`)}
          >
            Solicitudes
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => abrirModalEditar(row)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => eliminar(row)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Planillas Creadas</Title>

      {/* ---- Sección búsqueda eval ---- */}
      {!evalSeleccionada && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Buscar evaluación por id_eval</Text>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Input
              placeholder="id_eval (ej. PLC1101-2026001-201)"
              value={busquedaIdEval}
              onChange={e => setBusquedaIdEval(e.target.value)}
              onPressEnter={buscarEval}
              style={{ width: 320 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={buscarEval}
              loading={loadingEval}
            >
              Buscar
            </Button>
          </div>
        </div>
      )}

      {evalResultados.length > 0 && (
        <Table
          size="small"
          dataSource={evalResultados}
          columns={colsEval}
          rowKey="id_eval"
          pagination={{ pageSize: 10 }}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* ---- Eval seleccionada ---- */}
      {evalSeleccionada && (
        <>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Tag color="blue">id_eval: {evalSeleccionada.id_eval}</Tag>
            <Tag color="geekblue">{evalSeleccionada.cod_asig}</Tag>
            <Tag>Prueba {evalSeleccionada.num_prueba}</Tag>
            <Tag>{evalSeleccionada.ano} — {evalSeleccionada.periodo}</Tag>
            <Button
              size="small"
              onClick={() => { setEvalSeleccionada(null); setPlanillas([]); }}
            >
              Cambiar eval
            </Button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={abrirModalAgregar}
            >
              Agregar planilla
            </Button>
          </div>

          <Spin spinning={loadingPlanillas}>
            <Table
              size="small"
              dataSource={planillas}
              columns={colsPlanillas}
              rowKey={(r) => `${r.id_eval}-${r.num_prueba}-${r.sufijo}`}
              pagination={false}
              locale={{ emptyText: 'Sin registros para esta evaluación' }}
            />
          </Spin>
        </>
      )}

      {/* ---- Modal agregar / editar ---- */}
      <Modal
        title={modoEdicion ? 'Editar planilla' : 'Agregar planilla'}
        open={modalVisible}
        onOk={guardar}
        onCancel={() => setModalVisible(false)}
        okText={modoEdicion ? 'Guardar cambios' : 'Agregar'}
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id_eval"
            label="id_eval"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ano"
            label="Año"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="periodo"
            label="Periodo (Ej: 2026001)"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="num_prueba"
            label="N° Prueba"
            rules={[{ required: true, message: 'Requerido' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sufijo" label="Sufijo (opcional)">
            <Input placeholder="ej. A, B, C..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
