import React from 'react';
import { Table, Tooltip, message, Modal } from 'antd'; // Añadimos Modal para la confirmación
import moment from 'moment';
import { LinkOutlined, SendOutlined } from '@ant-design/icons'; // Importamos los íconos

import axios from 'axios'; // Asegúrate de importar axios

// Función para manejar el envío del informe con confirmación
const handleReenviarInforme = async (id_informeseccion, id_eval, nombre_prueba) => {
  Modal.confirm({
    title: '¿Estás seguro de reenviar el informe?',
    content: `Esta acción reenviará al docente el informe ya creado. \n\n${nombre_prueba} - ${id_eval}`,
    okText: 'Sí, reenviar',
    cancelText: 'Cancelar',
    onOk: async () => {
      try {
        const response = await axios.put('http://localhost:3001/api/reenviarinformeseccion', {
          id_informeseccion,
        });
        message.success('Informe reenviado con éxito');
      } catch (error) {
        console.error('Error al reenviar el informe:', error);
        message.error('Error al reenviar el informe');
      }
    },
    onCancel: () => {
      message.info('Operación cancelada');
    },
  });
};

const InformeTable = ({ data, loading }) => (
  <Table
    className="buscar-seccion-table1"
    dataSource={data}
    columns={[
      { title: 'ID Informe', dataIndex: 'id_informeseccion', key: 'id_informeseccion' },
      { title: 'ID Evaluación', dataIndex: 'id_eval', key: 'id_eval' },
      { title: 'Prueba', dataIndex: 'nombre_prueba', key: 'nombre_prueba' },
      {
        title: 'Mail Enviado',
        dataIndex: 'mail_enviado',
        key: 'mail_enviado',
        render: (mailEnviado) => (mailEnviado ? 'Sí' : 'No'),
      },
      {
        title: 'Fecha Envío',
        dataIndex: 'marca_temp_mail',
        key: 'marca_temp_mail',
        render: (marca_temp_mail) =>
          marca_temp_mail ? moment(marca_temp_mail).format('DD-MM-YYY, HH:mm:ss') : 'N/A',
      },
      {
        title: 'Link Informe',
        dataIndex: 'link_informe',
        key: 'link_informe',
        render: (link, record) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Icono: Ver Informe */}
            <Tooltip title="Ver Informe">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <LinkOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '10px' }} />
              </a>
            </Tooltip>

            {/* Icono: Reenviar Informe */}
            <Tooltip title="Reenviar Informe">
              <SendOutlined
                style={{ fontSize: '18px', color: '#52c41a', cursor: 'pointer' }}
                onClick={() =>
                  handleReenviarInforme(
                    record.id_informeseccion,
                    record.id_eval, // Asegúrate de tener el código de asignatura
                    record.nombre_prueba // Asegúrate de tener el nombre de la prueba
                  )
                }
              />
            </Tooltip>
          </div>
        ),
      },
    ]}
    rowKey="id_informeseccion"
    loading={loading}
    pagination={false}
  />
);

export default InformeTable;
