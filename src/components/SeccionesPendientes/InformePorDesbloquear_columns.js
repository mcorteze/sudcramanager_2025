// columns.js
import React from 'react';
import { Switch, Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

/**
 * Genera las columnas para la tabla de secciones pendientes.
 *
 * @param {Function} handleSwitchChange - Función que maneja el cambio del switch.
 * @param {Function} confirmDelete - Función que lanza el modal de confirmación para borrar.
 * @param {string} baseUrl - Ruta base para los enlaces de informes.
 * @returns {Array} Array de columnas.
 */
export const getColumns = (handleSwitchChange, confirmDelete, baseUrl) => [
  { title: 'ID Informe Sección', dataIndex: 'id_informeseccion', key: 'id_informeseccion' },
  { title: 'ID Evaluación', dataIndex: 'id_eval', key: 'id_eval' },
  { title: 'Programa', dataIndex: 'programa', key: 'programa' },
  { title: 'Sede', dataIndex: 'nombre_sede', key: 'nombre_sede' },
  { title: 'Asignatura', dataIndex: 'cod_asig', key: 'cod_asig' },
  { title: 'Sección', dataIndex: 'seccion', key: 'seccion' },
  { 
    title: 'Marcatemporal', 
    dataIndex: 'marca_temporal', 
    key: 'marca_temporal',
    render: (fecha) => fecha ? moment(fecha).format('DD/MM/YYYY HH:mm:ss') : '-',
  },
  {
    title: 'ID Sección',
    dataIndex: 'id_seccion',
    key: 'id_seccion',
    render: (id_seccion) => (
      <a 
        href={`/secciones/${id_seccion}`} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#1890ff' }}
      >
        {id_seccion}
      </a>
    ),
  },
  { title: 'Evaluación', dataIndex: 'nombre_prueba', key: 'nombre_prueba' },
  {
    title: 'Docente',
    dataIndex: 'docente',
    key: 'docente',
    render: (docente, record) => (
      <a 
        href={`/carga-docente/${record.rut_docente}`} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#1890ff' }}
      >
        {docente}
      </a>
    ),
  },
  { 
    title: 'Informe',
    key: 'informe',
    render: (_, record) => (
      <a href={`${baseUrl}${record.informe}`} target="_blank" rel="noopener noreferrer">
        {record.informe}
      </a>
    ),
  },
  {
    title: 'Aprobar',
    key: 'aprobar',
    render: (_, record) => (
      <Switch 
        defaultChecked={false} 
        onChange={(checked) => handleSwitchChange(checked, record)} 
      />
    ),
  },
  {
    title: 'Eliminar',
    key: 'eliminar',
    render: (_, record) => (
      <Tooltip title="Eliminar">
        <Button 
          danger
          icon={<DeleteOutlined className="icon-tamano1" />}
          onClick={() => confirmDelete(record.id_seccion, record.id_eval, record.id_informeseccion)}
          style={{ color: 'red' }}
        />
      </Tooltip>
    ),
  },
];
