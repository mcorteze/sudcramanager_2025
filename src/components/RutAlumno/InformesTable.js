import React, { useState, useEffect } from 'react';
import { Table, Typography, message, Tooltip, Modal } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { LinkOutlined, SyncOutlined, SendOutlined } from '@ant-design/icons';
import { getPeriodoStr } from '../../utils/periodo'; // ajusta la ruta si es necesario

const { confirm } = Modal;

const SHAREPOINT_BASE = 'https://duoccl0-my.sharepoint.com/personal/mcorteze_duoc_cl/Documents/sudcra-repositorio/informes';

// Reenviar informe (confirmación)
const handleReenviarInforme = (id_matricula_eval, cod_asig, nombre_prueba) => {
  confirm({
    title: '¿Estás seguro de reenviar el informe?',
    content: `Esta acción reenviará al alumno el informe ya creado.\n\n${cod_asig}\n- ${nombre_prueba}`,
    okText: 'Sí, reenviar',
    cancelText: 'Cancelar',
    onOk: async () => {
      try {
        await axios.put('http://localhost:3001/api/reenviarinformealumno', { idMatriculaEval: id_matricula_eval });
        message.success('Informe reenviado con éxito');
      } catch (error) {
        console.error('Error al reenviar el informe:', error);
        message.error('Error al reenviar el informe');
      }
    },
    onCancel: () => message.info('Operación cancelada'),
  });
};

// Rehacer informe (confirmación)
const handleRehacerInforme = (id_matricula_eval, cod_asig, nombre_prueba) => {
  confirm({
    title: '¿Estás seguro de reelaborar el informe?',
    content: `Esta acción volverá a crear y enviar el informe, para alumno y docente.\n\n ${cod_asig}\n- ${nombre_prueba}`,
    okText: 'Sí, confirmar',
    cancelText: 'Cancelar',
    onOk: async () => {
      try {
        await axios.put('http://localhost:3001/api/rehacerinformealumno', { idMatriculaEval: id_matricula_eval });
        message.success('Informe marcado para reelaboración');
      } catch (error) {
        console.error('Error al reelaborar el informe:', error);
        message.error('Error al reelaborar el informe');
      }
    },
    onCancel: () => message.info('Operación cancelada'),
  });
};

// Columns: recibe periodoSafe para construir URLs
const columns = (handleRehacerInforme, handleReenviarInforme, periodoSafe) => [
  { title: 'id_matricula_eval', dataIndex: 'id_matricula_eval', key: 'id_matricula_eval' },
  { title: 'Código Asignatura', dataIndex: 'cod_asig', key: 'cod_asig' },
  { title: 'Nombre Prueba', dataIndex: 'nombre_prueba', key: 'nombre_prueba' },
  { title: 'ID Informe Alumno', dataIndex: 'id_informealum', key: 'id_informealum' },
  {
    title: 'Marca Temporal',
    dataIndex: 'marca_temporal',
    key: 'marca_temporal',
    render: (text) => moment(text).format('DD/MM/YYYY HH:mm:ss'),
  },
  {
    title: 'Mail Enviado',
    dataIndex: 'mail_enviado',
    key: 'mail_enviado',
    render: (mail_enviado) => (mail_enviado ? 'Sí' : 'No'),
  },
  {
    title: 'Marca Temporal de Mail',
    dataIndex: 'marca_temp_mail',
    key: 'marca_temp_mail',
    render: (text) => (text ? moment(text).format('DD/MM/YYYY HH:mm:ss') : 'N/A'),
  },
  {
    title: 'Informe',
    dataIndex: 'id_matricula_eval',
    key: 'informe',
    render: (id_matricula_eval, record) => {
      const url = `${SHAREPOINT_BASE}/${periodoSafe}/alumnos/${id_matricula_eval}.html`;
      return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Tooltip title="Ver Informe">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <LinkOutlined style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }} />
            </a>
          </Tooltip>
          <Tooltip title="Reenviar Informe">
            <SendOutlined
              style={{ fontSize: 18, color: '#52c41a', cursor: 'pointer' }}
              onClick={() => handleReenviarInforme(id_matricula_eval, record.cod_asig, record.nombre_prueba)}
            />
          </Tooltip>
          <Tooltip title="Rehacer Informe">
            <SyncOutlined
              style={{ fontSize: 18, color: '#faad14', cursor: 'pointer' }}
              onClick={() => handleRehacerInforme(id_matricula_eval, record.cod_asig, record.nombre_prueba)}
            />
          </Tooltip>
        </div>
      );
    },
  },
];

const InformesTable = ({ idMatricula }) => {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // leer periodo en tiempo de render (ya inicializado por appConfig.load())
  const periodoSafe = getPeriodoStr() || '0000000';

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/informes-enviados-alumno/${idMatricula}`);
        setInformes(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener los informes:', err);
        setError('Error al obtener los informes del servidor');
        message.error('Error al obtener los informes');
      } finally {
        setLoading(false);
      }
    };

    if (idMatricula) fetchInformes();
  }, [idMatricula]);

  return (
    <div style={{ marginTop: 20 }}>
      <Typography.Title level={4}>
        Informes Enviados al Alumno{' '}
        <Typography.Text type="secondary">({periodoSafe})</Typography.Text>
      </Typography.Title>

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      <Table
        className="formato-table1"
        columns={columns(handleRehacerInforme, handleReenviarInforme, periodoSafe)}
        dataSource={informes}
        rowKey="id_informealum"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default InformesTable;
