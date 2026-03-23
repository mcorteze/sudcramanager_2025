import React, { useState } from 'react';
import { Typography, Button, message, Modal, Input, Row, Col, Card, Tag } from 'antd';

const { Title, Text } = Typography;

export default function ResultadosEvaluacionTable({ data, resumenDetallado, refetch }) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [modalType, setModalType] = useState(null); // 'rehacer', 'alumnos_true', 'alumnos_false', 'secciones_true', 'secciones_false'

  const total = data?.length || 0;
  const stats = resumenDetallado && resumenDetallado.length > 0 ? resumenDetallado[0] : null;

  const openConfirmation = (type) => {
    if (type === 'rehacer' && (!data || data.length === 0)) {
      message.warning('No hay datos para actualizar.');
      return;
    }
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleConfirm = async () => {
    if (keyword !== 'arcdus') {
      message.error('Palabra clave incorrecta. El proceso no se realizará.');
      return;
    }

    setLoadingAction(true);
    try {
      if (modalType === 'rehacer') {
        await executeRehacer();
      } else if (modalType === 'alumnos_true') {
        await executeUpdateMail('alumnos', true);
      } else if (modalType === 'alumnos_false') {
        await executeUpdateMail('alumnos', false);
      } else if (modalType === 'secciones_true') {
        await executeUpdateMail('secciones', true);
      } else if (modalType === 'secciones_false') {
        await executeUpdateMail('secciones', false);
      }
      
      if (refetch) await refetch();
    } catch (error) {
      console.error(error);
      message.error('Ocurrió un error al procesar la solicitud.');
    } finally {
      setLoadingAction(false);
      setIsModalVisible(false);
      setKeyword('');
      setModalType(null);
    }
  };

  const executeRehacer = async () => {
    const ids = data.map(item => item.id_matricula_eval);
    const response = await fetch('http://localhost:3001/api/marcar-informe-no-listo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!response.ok) throw new Error('Error al actualizar los registros.');
    const result = await response.json();
    message.success(result.message || 'Informes marcados para rehacer.');
  };

  const executeUpdateMail = async (target, disponible) => {
    const endpoint = target === 'alumnos' 
      ? 'http://localhost:3001/api/actualizar-mail-disponible-alumnos'
      : 'http://localhost:3001/api/actualizar-mail-disponible-secciones';
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_eval: stats.id_eval, disponible })
    });
    if (!response.ok) throw new Error(`Error al actualizar registros de ${target}.`);
    const result = await response.json();
    message.success(result.message || 'Actualización exitosa.');
  };

  const getModalContent = () => {
    switch (modalType) {
      case 'rehacer':
        return {
          title: 'Regeneración Masiva de Informes',
          warning: 'Atención: Al confirmar esta operación se marcarán los informes como "no listos" para ser regenerados y enviados en la próxima campaña. Esto puede implicar reenvíos a alumnos y docentes.',
          detail: 'Esta acción modificará el estado de los registros seleccionados en la tabla calificaciones_obtenidas.'
        };
      case 'alumnos_true':
      case 'alumnos_false':
        const stateA = modalType === 'alumnos_true' ? 'DISPONIBLE' : 'NO DISPONIBLE';
        return {
          title: `Cambiar Disponibilidad Mails Alumnos a ${stateA}`,
          warning: 'Atención: Esta operación afectará a TODOS los alumnos de esta evaluación.',
          detail: `Se marcará la disponibilidad de mail como ${stateA} para todos los registros del ID: ${stats?.id_eval}`
        };
      case 'secciones_true':
      case 'secciones_false':
        const stateS = modalType === 'secciones_true' ? 'DISPONIBLE' : 'NO DISPONIBLE';
        return {
          title: `Cambiar Disponibilidad Mails Secciones a ${stateS}`,
          warning: 'Atención: Esta operación afectará a TODAS las secciones asociadas a esta evaluación.',
          detail: `Se marcará la disponibilidad de mail como ${stateS} para todos los registros del ID: ${stats?.id_eval}`
        };
      default:
        return {};
    }
  };

  const modalContent = getModalContent();

  return (
    <div style={{ marginTop: 32 }}>
      <Row gutter={[16, 16]}>
        {/* Columna 1: Resumen de calificaciones */}
        <Col xs={24} md={8}>
          <Card
            title="Resumen de calificaciones"
            extra={<Tag color="blue">{stats?.id_eval || 'N/A'}</Tag>}
            bordered={true}
            className="summary-card"
            style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #ff4d4f' }}
          >
            <div style={{ flexGrow: 1 }}>
              <Text strong>Total Registros: </Text>
              <Text>{stats?.calificaciones?.total || 0}</Text>
              <br />
              <Text strong style={{ color: '#52c41a' }}>Informe Listo (True): </Text>
              <Text>{stats?.calificaciones?.listos || 0}</Text>
              <br />
              <Text strong style={{ color: '#ff4d4f' }}>Informe Listo (False): </Text>
              <Text>{stats?.calificaciones?.no_listos || 0}</Text>
            </div>

            <Button
              type="primary"
              danger
              block
              onClick={() => openConfirmation('rehacer')}
              loading={loadingAction && modalType === 'rehacer'}
              disabled={total === 0}
            >
              Rehacer todos los informes
            </Button>
          </Card>
        </Col>

        {/* Columna 2: Informes alumnos disponibles */}
        <Col xs={24} md={8}>
          <Card 
            title="Informes alumnos disponibles" 
            extra={<Tag color="blue">{stats?.id_eval || 'N/A'}</Tag>}
            bordered={true} 
            className="summary-card" 
            style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #ff4d4f' }}
          >
            <div style={{ flexGrow: 1 }}>
              <Text strong>Total en informe_alumnos: </Text>
              <Text>{stats?.alumnos?.total || 0}</Text>
              <br />
              <Text strong style={{ color: '#52c41a' }}>Mail Disponible (True): </Text>
              <Text>{stats?.alumnos?.disponible || 0}</Text>
              <br />
              <Text strong style={{ color: '#ff4d4f' }}>Mail Disponible (False): </Text>
              <Text>{stats?.alumnos?.no_disponible || 0}</Text>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: '8px' }}>
              <Button 
                type="primary"
                danger
                size="small" 
                block
                onClick={() => openConfirmation('alumnos_true')}
              >
                Habilitar Todos
              </Button>
              <Button 
                type="primary"
                danger
                size="small" 
                block
                onClick={() => openConfirmation('alumnos_false')}
              >
                Deshabilitar Todos
              </Button>
            </div>
          </Card>
        </Col>

        {/* Columna 3: Informes seccion disponible */}
        <Col xs={24} md={8}>
          <Card 
            title="Informes seccion disponible" 
            extra={<Tag color="blue">{stats?.id_eval || 'N/A'}</Tag>}
            bordered={true} 
            className="summary-card" 
            style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #ff4d4f' }}
          >
            <div style={{ flexGrow: 1 }}>
              <Text strong>Total en informes_secciones: </Text>
              <Text>{stats?.secciones?.total || 0}</Text>
              <br />
              <Text strong style={{ color: '#52c41a' }}>Mail Disponible (True): </Text>
              <Text>{stats?.secciones?.disponible || 0}</Text>
              <br />
              <Text strong style={{ color: '#ff4d4f' }}>Mail Disponible (False): </Text>
              <Text>{stats?.secciones?.no_disponible || 0}</Text>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: '8px' }}>
              <Button 
                type="primary"
                danger
                size="small" 
                block
                onClick={() => openConfirmation('secciones_true')}
              >
                Habilitar Todos
              </Button>
              <Button 
                type="primary"
                danger
                size="small" 
                block
                onClick={() => openConfirmation('secciones_false')}
              >
                Deshabilitar Todos
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <span>
            <Title level={4} style={{ display: 'inline', margin: 0 }}>
              ⚠️ {modalContent.title}
            </Title>
          </span>
        }
        open={isModalVisible}
        onOk={handleConfirm}
        onCancel={() => {
          setIsModalVisible(false);
          setKeyword('');
          setModalType(null);
        }}
        confirmLoading={loadingAction}
        okText="Confirmar y Procesar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        width={600}
      >
        <div style={{ marginBottom: 20 }}>
          <p>{modalContent.detail}</p>
          <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <Text type="danger" strong>
              {modalContent.warning}
            </Text>
          </div>

          <p style={{ marginTop: 24 }}>
            Para proceder, por favor ingrese la palabra clave requerida:
          </p>
        </div>

        <Input.Password
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Ingrese la palabra clave para autorizar"
          size="large"
        />
      </Modal>
    </div>
  );
}
