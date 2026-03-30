import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Tag } from 'antd';
import axios from 'axios';
import moment from 'moment';
import './formato_tabla.css';

const MailPendientesAlumnos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroAsig, setFiltroAsig] = useState(null);
  const [filtroNombrePrueba, setFiltroNombrePrueba] = useState(null);
  const [filtroEval, setFiltroEval] = useState(null);

  const handleAsigClick = (asig) => {
    setFiltroAsig(prev => prev === asig ? null : asig);
    setFiltroNombrePrueba(null);
  };

  const handleNombrePruebaClick = (nombre) => {
    setFiltroNombrePrueba(prev => prev === nombre ? null : nombre);
  };

  const handleEvalClick = (eval_) => {
    setFiltroEval(prev => prev === eval_ ? null : eval_);
  };

  // Definir las columnas de la tabla
  const columns = [
    {
      title: 'N°',
      dataIndex: 'n', // Columna para ID visual
      key: 'n',
    },
    {
      title: 'Código Asignatura',
      dataIndex: 'cod_asig',
      key: 'cod_asig',
    },
    {
      title: 'Nombre Prueba',
      dataIndex: 'nombre_prueba',
      key: 'nombre_prueba',
    },
    {
      title: 'Rut Alumno',
      dataIndex: 'rut',
      key: 'rut',
    },
    {
      title: 'Usuario',
      dataIndex: 'user_alum',
      key: 'user_alum',
    },
    {
      title: 'ID Matrícula',
      dataIndex: 'id_matricula',
      key: 'id_matricula',
    },
    {
      title: 'ID Evaluación',
      dataIndex: 'id_matricula_eval',
      key: 'id_matricula_eval',
    },
    {
      title: 'ID Informe',
      dataIndex: 'id_informealum',
      key: 'id_informealum',
    },
    {
      title: 'Marca Temporal',
      dataIndex: 'marca_temporal',
      key: 'marca_temporal',
      render: (fecha) => fecha ? moment(fecha).format('DD/MM/YYYY HH:mm:ss') : '-', // Formatea la fecha o muestra 'Sin fecha'
    },
    {
      title: 'Mail Enviado',
      dataIndex: 'mail_enviado',
      key: 'mail_enviado',
      render: (text) => (text ? 'Sí' : 'No'),
    },
    {
      title: 'Marca Temp Mail',
      dataIndex: 'marca_temp_mail',
      key: 'marca_temp_mail',
    },
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/informes/pendientes-mail-alumnos');
        
        // Filtrar duplicados por RUT
        const uniqueData = response.data.filter((item, index, self) =>
          index === self.findIndex((t) => t.rut === item.rut)
        );

        // Agregar ID secuencial a cada registro
        const dataWithNs = uniqueData.map((item, index) => ({
          ...item,
          n: index + 1, // ID secuencial, empieza en 1
        }));

        setData(dataWithNs); // Almacenamos los datos únicos en el estado
        setLoading(false); // Terminamos de cargar
      } catch (err) {
        setError('Error al cargar los datos.');
        setLoading(false);
      }
    };

    fetchData();
  }, []); // El array vacío [] significa que este efecto solo se ejecutará una vez al cargar el componente

  if (loading) {
    return <Spin size="large" tip="Cargando..." />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  const asignaturasUnicas = [...new Set(data.map(r => r.cod_asig))].sort();

  const nombresPruebaUnicos = [...new Set(
    data
      .filter(r => !filtroAsig || r.cod_asig === filtroAsig)
      .map(r => r.nombre_prueba)
  )].sort();

  const evaluacionesUnicas = [...new Set(data.map(r => r.num_prueba))].sort((a, b) => a - b);

  const datosFiltrados = data.filter(r =>
    (!filtroAsig || r.cod_asig === filtroAsig) &&
    (!filtroNombrePrueba || r.nombre_prueba === filtroNombrePrueba) &&
    (!filtroEval || r.num_prueba === filtroEval)
  );

  return (
    <div>
      <h1>Informes Pendientes de Envío (con filtro de duplicados por rut)</h1>

      {/* FILTRO CÓDIGO ASIGNATURA */}
      <div style={{ marginBottom: 8 }}>
        <strong>Código Asignatura:</strong>{' '}
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
          <Tag color="volcano" closable onClose={() => { setFiltroAsig(null); setFiltroNombrePrueba(null); }} style={{ marginLeft: 8 }}>
            Quitar filtro Asignatura
          </Tag>
        )}
      </div>

      {/* FILTRO NOMBRE PRUEBA — depende de asignatura */}
      <div style={{ marginBottom: 8 }}>
        <strong>Nombre Prueba:</strong>{' '}
        {nombresPruebaUnicos.map(nombre => (
          <Tag
            key={nombre}
            color={filtroNombrePrueba === nombre ? 'geekblue' : 'default'}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => handleNombrePruebaClick(nombre)}
          >
            {nombre}
          </Tag>
        ))}
        {filtroNombrePrueba && (
          <Tag color="volcano" closable onClose={() => setFiltroNombrePrueba(null)} style={{ marginLeft: 8 }}>
            Quitar filtro Nombre Prueba
          </Tag>
        )}
      </div>

      {/* FILTRO N° EVALUACIÓN */}
      <div style={{ marginBottom: 16 }}>
        <strong>N° Evaluación:</strong>{' '}
        {evaluacionesUnicas.map(eval_ => (
          <Tag
            key={eval_}
            color={filtroEval === eval_ ? 'purple' : 'default'}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => handleEvalClick(eval_)}
          >
            N° {eval_}
          </Tag>
        ))}
        {filtroEval && (
          <Tag color="volcano" closable onClose={() => setFiltroEval(null)} style={{ marginLeft: 8 }}>
            Quitar filtro N° Evaluación
          </Tag>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={datosFiltrados}
        rowKey="id_informealum"
        pagination={{ pageSize: 10 }}
        className="table-small-font"
      />
    </div>
  );
};

export default MailPendientesAlumnos;
