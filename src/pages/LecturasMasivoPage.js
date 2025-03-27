import React, { useEffect, useState } from 'react';
import { Table, Button, Spin, message, Modal } from 'antd';
import axios from 'axios';

const LecturasMasivoPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recordsToMove, setRecordsToMove] = useState([]);

  // Obtener los datos desde el endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/lecturas_masivo');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Definir las columnas de la tabla
  const columns = [
    {
      title: 'Rut',
      dataIndex: 'rut',
      key: 'rut',
    },
    {
      title: 'ID Matrícula',
      dataIndex: 'id_matricula',
      key: 'id_matricula',
    },
    {
      title: 'Código Interno',
      dataIndex: 'cod_interno',
      key: 'cod_interno',
    },
    {
      title: 'ID Archivo Leído',
      dataIndex: 'id_archivoleido',
      key: 'id_archivoleido',
    },
  ];

  // Función para manejar el clic del botón "Mover todo a lectura temp"
  const handleMoveToTemp = () => {
    const recordsToMove = data.map(record => ({
      rut: record.rut,
      id_archivoleido: record.id_archivoleido,
    }));

    // Mostrar el modal de confirmación con la cantidad de registros
    setRecordsToMove(recordsToMove);
    setIsModalVisible(true);
  };

  // Función para confirmar la acción y mover los registros
  const handleConfirmMove = async () => {
    try {
      const response = await axios.post('http://localhost:3000/lectura-temp-masivo', { records: recordsToMove });
      if (response.data.success) {
        message.success(`Se han movido ${recordsToMove.length} registros a lectura temporal.`);
      } else {
        message.error('Hubo un error al mover los datos');
      }
    } catch (error) {
      message.error('Error al conectar con el servidor');
      console.error('Error:', error);
    } finally {
      setIsModalVisible(false);  // Cerrar el modal después de la acción
    }
  };

  // Función para cancelar la acción
  const handleCancel = () => {
    setIsModalVisible(false);  // Cerrar el modal sin hacer nada
  };

  return (
    <div>
      <h1>Lecturas Masivo</h1>
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Table dataSource={data} columns={columns} rowKey="id_archivoleido" />
          <Button type="primary" onClick={handleMoveToTemp} style={{ marginTop: 20 }}>
            Mover todo a lectura temp
          </Button>
        </>
      )}

      {/* Modal de confirmación */}
      <Modal
        title="Confirmar Movimiento"
        visible={isModalVisible}
        onOk={handleConfirmMove}
        onCancel={handleCancel}
        okText="Mover"
        cancelText="Cancelar"
      >
        <p>Está a punto de mover <strong>{recordsToMove.length}</strong> registros a lectura temporal.</p>
        <p>¿Está seguro de que desea continuar?</p>
      </Modal>
    </div>
  );
};

export default LecturasMasivoPage;
