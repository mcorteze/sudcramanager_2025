import React, { useState } from 'react';
import { Typography, Button, message, Modal, Input } from 'antd';

const { Title, Text } = Typography;

export default function ResultadosEvaluacionTable({ data }) {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyword, setKeyword] = useState('');

  const total = data?.length || 0;

  // ✅ NUEVO: conteo seguro
  const totalListos = data?.filter(item =>
    String(item.informe_listo).toLowerCase() === 'true'
  ).length || 0;

  const totalNoListos = data?.filter(item =>
    String(item.informe_listo).toLowerCase() === 'false'
  ).length || 0;

  const showModal = () => {
    if (!data || data.length === 0) {
      message.warning('No hay datos para actualizar.');
      return;
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    if (keyword !== 'arcdus') {
      message.error('Palabra clave incorrecta. El proceso no se realizará.');
      return;
    }

    const ids = data.map(item => item.id_matricula_eval);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/marcar-informe-no-listo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los registros.');
      }

      const result = await response.json();
      message.success(result.message || 'Actualización exitosa.');
    } catch (error) {
      console.error(error);
      message.error('Ocurrió un error al actualizar.');
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setKeyword('');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setKeyword('');
  };

  return (
    <div style={{ marginTop: 32 }}>
      <Title level={4}>Resumen de calificaciones</Title>
      <Text strong>Calificaciones encontradas (id_matricula_eval): </Text>
      <Text>{total}</Text>

      <br />
      <Text strong>Total con informe_listo = true: </Text>
      <Text>{totalListos}</Text>

      <br />
      <Text strong>Total con informe_listo = false: </Text>
      <Text>{totalNoListos}</Text>

      <div style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={showModal}
          loading={loading}
          disabled={total === 0}
        >
          Rehacer todos los informes
        </Button>
      </div>

      <Modal
        title="Confirmación"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>
          Para confirmar la acción de rehacer todos los informes, ingrese la palabra clave:
        </p>
        <Input.Password
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Ingrese la palabra clave"
        />
      </Modal>
    </div>
  );
}
