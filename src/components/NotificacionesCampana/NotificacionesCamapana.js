import React, { useState } from 'react';
import { Badge, Modal, Tooltip, Table } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { FiExternalLink } from 'react-icons/fi'; // ← Importamos el ícono
import useNotificaciones from './useNotificaciones';
import notificacionSources from './notificacionSources';

import './NotificacionesCampana.css';

export default function NotificacionCampana() {
  const [modalVisible, setModalVisible] = useState(false);
  const notificaciones = useNotificaciones(notificacionSources);

  const totalPendientes = notificaciones.reduce((sum, n) => sum + n.count, 0);

  const columns = [
    {
      title: '',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (_, record) =>
        record.count > 0 ? (
          <a
            href={record.redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '16px' }}
            title="Ver detalles"
          >
            <FiExternalLink />
          </a>
        ) : null,
    },
  ];

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }}>
      <Tooltip title="Notificaciones pendientes" onClick={() => setModalVisible(true)}>
        <Badge count={totalPendientes} className="campana-noti-circulo" size="small" offset={[-1, 1]}>
          <BellOutlined className="campana-notificaciones" />
        </Badge>
      </Tooltip>

      <Modal
        title="Notificaciones"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Table
          columns={columns}
          dataSource={notificaciones.map(n => ({ ...n, key: n.id }))} 
          pagination={false}
          size="small"
          bordered
          showHeader={false}
        />
      </Modal>
    </div>
  );
}
