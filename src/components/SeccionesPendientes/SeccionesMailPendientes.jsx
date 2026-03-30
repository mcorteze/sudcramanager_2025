import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, message, Tag } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import 'antd/dist/reset.css';
import moment from 'moment';
import './formato_tabla.css';

export default function SeccionesMailPendientes() {
  const [seccionesMailPendientes, setSeccionesMailPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroPrograma, setFiltroPrograma] = useState(null);
  const [filtroAsig, setFiltroAsig] = useState(null);
  const [filtroEval, setFiltroEval] = useState(null);

  const handleProgramaClick = (p) => {
    setFiltroPrograma(prev => prev === p ? null : p);
    setFiltroAsig(null);
    setFiltroEval(null);
  };

  const handleAsigClick = (asig) => {
    setFiltroAsig(prev => prev === asig ? null : asig);
    setFiltroEval(null);
  };

  const handleEvalClick = (eval_) => {
    setFiltroEval(prev => prev === eval_ ? null : eval_);
  };

  useEffect(() => {
    fetchSeccionesMailPendientes();
  }, []);

  const fetchSeccionesMailPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/informes/pendientes-mail');
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setSeccionesMailPendientes(data);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id_seccion) => {
    navigator.clipboard.writeText(id_seccion).then(() => {
      message.success('ID Sección copiado al portapapeles!');
    }).catch(() => {
      message.error('Error al copiar al portapapeles');
    });
  };

  const handleExport = () => {
    const dataToExport = seccionesMailPendientes.map(row => ({
      Programa: row.programa,
      Sede: row.nombre_sede,
      Sección: row.seccion,
      'ID Sección': row.id_seccion,
      'RUT Docente': row.rut_docente,
      'ID Informe Sección': row.id_informeseccion,
      'ID Evaluación': row.id_eval,
      'Marca Temporal': row.marca_temporal ? moment(row.marca_temporal).format('DD/MM/YYYY HH:mm:ss') : '',
      'Marca Temporal Mail': row.marca_temp_mail ? moment(row.marca_temp_mail).format('DD/MM/YYYY HH:mm:ss') : '',
      'Mail Enviado': row.mail_enviado ? 'Sí' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendientes');

    XLSX.writeFile(workbook, 'secciones_pendientes.xlsx');
  };

  const columns = [
    { title: 'Programa', dataIndex: 'programa', key: 'programa', width: 'auto', ellipsis: true },
    { title: 'Sede', dataIndex: 'nombre_sede', key: 'nombre_sede', width: 'auto', ellipsis: true },
    { title: 'Sección', dataIndex: 'seccion', key: 'seccion', width: 'auto', ellipsis: true },
    {
      title: 'ID Sección',
      dataIndex: 'id_seccion',
      key: 'id_seccion',
      width: 'auto',
      ellipsis: true,
      render: (id_seccion) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href={`/secciones/${id_seccion}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px' }}>
            {id_seccion}
          </a>
          <Button 
            type="text"
            icon={<CopyOutlined />} 
            onClick={() => handleCopy(id_seccion)}
            size="small"
          />
        </div>
      ),
    },
    { title: 'RUT Docente', dataIndex: 'rut_docente', key: 'rut_docente', width: 'auto', ellipsis: true },
    { title: 'ID Informe Sección', dataIndex: 'id_informeseccion', key: 'id_informeseccion', width: 'auto', ellipsis: true },
    { title: 'ID Evaluación', dataIndex: 'id_eval', key: 'id_eval', width: 'auto', ellipsis: true },
    {
      title: 'Marca Temporal',
      dataIndex: 'marca_temporal',
      key: 'marca_temporal',
      width: 'auto',
      ellipsis: true,
      render: (fecha) => fecha ? moment(fecha).format('DD/MM/YYYY HH:mm:ss') : '-',
    },
    {
      title: 'Marca Temporal Mail',
      dataIndex: 'marca_temp_mail',
      key: 'marca_temp_mail',
      width: 'auto',
      ellipsis: true,
      render: (fecha) => fecha ? moment(fecha).format('DD/MM/YYYY HH:mm:ss') : '-',
    },
    {
      title: 'Mail Enviado',
      dataIndex: 'mail_enviado',
      key: 'mail_enviado',
      width: 'auto',
      ellipsis: true,
      render: (enviado) => (enviado ? 'Sí' : 'No'),
    },
  ];

  if (loading) return <div><Spin /> Cargando...</div>;
  if (error) return <Alert message="Error" description={error} type="error" />;
  if (seccionesMailPendientes.length === 0)
    return <Alert message="No hay secciones pendientes" description="No hay más secciones pendientes de envío de mail." type="info" />;

  const programasUnicos = [...new Set(seccionesMailPendientes.map(r => r.programa))].sort();

  // Asignaturas dependen del programa seleccionado
  const asignaturasUnicas = [...new Set(
    seccionesMailPendientes
      .filter(r => !filtroPrograma || r.programa === filtroPrograma)
      .map(r => r.cod_asig)
  )].sort();

  // Evaluaciones dependen del programa y asignatura seleccionados
  const evaluacionesUnicas = [...new Set(
    seccionesMailPendientes
      .filter(r =>
        (!filtroPrograma || r.programa === filtroPrograma) &&
        (!filtroAsig || r.cod_asig === filtroAsig)
      )
      .map(r => r.id_eval)
  )].sort();

  const datosFiltrados = seccionesMailPendientes.filter(r =>
    (!filtroPrograma || r.programa === filtroPrograma) &&
    (!filtroAsig || r.cod_asig === filtroAsig) &&
    (!filtroEval || r.id_eval === filtroEval)
  );

  return (
    <div>
      <div style={{ marginTop: '20px' }}></div>
      <h1>Secciones pendientes de envío de mail</h1>
      <h3>Secciones con informe de docente pendiente por algún motivo.</h3>

      {/* FILTRO PROGRAMA */}
      <div style={{ marginBottom: 8 }}>
        <strong>Filtrar por Programa:</strong>{' '}
        {programasUnicos.map(p => (
          <Tag
            key={p}
            color={filtroPrograma === p ? 'geekblue' : 'default'}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => handleProgramaClick(p)}
          >
            {p}
          </Tag>
        ))}
        {filtroPrograma && (
          <Tag color="volcano" closable onClose={() => { setFiltroPrograma(null); setFiltroAsig(null); }} style={{ marginLeft: 8 }}>
            Quitar filtro Programa
          </Tag>
        )}
      </div>

      {/* FILTRO ASIGNATURA — depende del programa */}
      <div style={{ marginBottom: 8 }}>
        <strong>Filtrar por Asignatura:</strong>{' '}
        {asignaturasUnicas.map(asig => (
          <Tag
            key={asig}
            color={filtroAsig === asig ? 'geekblue' : 'default'}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => handleAsigClick(asig)}
          >
            {asig}
          </Tag>
        ))}
        {filtroAsig && (
          <Tag color="volcano" closable onClose={() => setFiltroAsig(null)} style={{ marginLeft: 8 }}>
            Quitar filtro Asignatura
          </Tag>
        )}
      </div>

      {/* FILTRO N° EVALUACIÓN */}
      <div style={{ marginBottom: 16 }}>
        <strong>Filtrar por N° Evaluación:</strong>{' '}
        {evaluacionesUnicas.map(eval_ => (
          <Tag
            key={eval_}
            color={filtroEval === eval_ ? 'purple' : 'default'}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => handleEvalClick(eval_)}
          >
            {eval_}
          </Tag>
        ))}
        {filtroEval && (
          <Tag color="volcano" closable onClose={() => setFiltroEval(null)} style={{ marginLeft: 8 }}>
            Quitar filtro N° Evaluación
          </Tag>
        )}
      </div>

      <Table
        dataSource={datosFiltrados}
        columns={columns}
        rowKey="id_informeseccion"
        pagination={{ pageSize: 10 }}
        className="table-small-font"
      />
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          Exportar a Excel
        </Button>
      </div>
    </div>
  );
}
