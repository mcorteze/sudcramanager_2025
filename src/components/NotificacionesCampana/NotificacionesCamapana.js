import React, { useState } from 'react';
import { Badge, Modal, Tooltip, Table } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { FiExternalLink } from 'react-icons/fi';
import useNotificaciones from './useNotificaciones';
import notificacionSources from './notificacionSources';
import CalidadLectura from './CalidadLectura';

import './NotificacionesCampana.css';

export default function NotificacionCampana() {
  const [modalVisible, setModalVisible] = useState(false);
  const [hayAlertaLectura, setHayAlertaLectura] = useState(false);

  const notificaciones = useNotificaciones(notificacionSources);
  const totalPendientes = notificaciones.reduce((sum, n) => sum + n.count, 0);
  const totalBadge = totalPendientes + (hayAlertaLectura ? 1 : 0);

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
        <Badge
          count={totalBadge}
          className="campana-noti-circulo"
          size="small"
          offset={[-1, 1]}
          style={{ backgroundColor: hayAlertaLectura ? '#ff4d4f' : undefined }}
        >
          <BellOutlined
            className="campana-notificaciones"
            style={{ color: hayAlertaLectura ? '#ff4d4f' : undefined }}
          />
        </Badge>
      </Tooltip>

      <Modal
        title="Notificaciones, Polling (10s)"
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
        <h4 style={{ marginTop: '20px', fontWeight: '400' }}>CALIDAD DE LA LECTURA DE IMÁGENES</h4>
        <CalidadLectura onAlertaChange={setHayAlertaLectura} />
      </Modal>
    </div>
  );
}
