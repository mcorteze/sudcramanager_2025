import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Breadcrumb, Button, Tooltip } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { MailOutlined, MailTwoTone } from '@ant-design/icons';
import { ImArrowRight } from "react-icons/im";
import './MonitorPage.css';

export default function MonitorPage() {
  const [programas, setProgramas] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const { programa, asignatura } = useParams();

  useEffect(() => {
    setLoading(true);

    async function fetchProgramas() {
      try {
        const response = await axios.get('http://localhost:3001/api/programas');
        setProgramas(response.data);
      } catch (error) {
        console.error('Error fetching programas:', error);
        setProgramas([]);
      }
    }

    async function fetchAsignaturas(programa) {
      try {
        const response = await axios.get(`http://localhost:3001/api/monitorasig/${programa}`);
        setAsignaturas(response.data);
      } catch (error) {
        console.error('Error fetching asignaturas:', error);
        setAsignaturas([]);
      }
    }

    async function fetchSecciones(programa, asignatura) {
      try {
        const response = await axios.get(`http://localhost:3001/api/monitorasig/${programa}/${asignatura}`);
        setSecciones(response.data);
      } catch (error) {
        console.error('Error fetching secciones:', error);
        setSecciones([]);
      }
    }

    fetchProgramas();
    if (programa) {
      fetchAsignaturas(programa);
    }
    if (programa && asignatura) {
      fetchSecciones(programa, asignatura);
    }

    setLoading(false);
  }, [programa, asignatura]);

  const columnsProgramas = [
    {
      title: 'Programa',
      dataIndex: 'programa',
      key: 'programa',
    },
    {
      title: 'Acceder',
      key: 'acceder',
      render: (text, record) => (
        <Button type="link">
          <Link to={`/monitorasig/${record.cod_programa}`} className="link-acceder">
            <ImArrowRight className="icono" />
            Acceder
          </Link>
        </Button>
      ),
    },
  ];

  const columnsAsignaturas = [
    {
      title: 'Código Asignatura',
      dataIndex: 'cod_asig',
      key: 'cod_asig',
    },
    {
      title: 'Asignatura',
      dataIndex: 'asig',
      key: 'asig',
    },
    {
      title: 'Acceder',
      key: 'acceder',
      render: (text, record) => (
        <Button type="link">
          <Link to={`/monitorasig/${programa}/${record.cod_asig}`} className="link-acceder">
            <ImArrowRight className="icono" />
            Acceder
          </Link>
        </Button>
      ),
    },
  ];

  const transformSeccionesData = (data) => {
    const seccionesMap = {};
    const evalsPresent = new Set();
    const pruebaNames = {}; // Para almacenar los nombres de las pruebas

    data.forEach((item) => {
      if (!seccionesMap[item.id_seccion]) {
        seccionesMap[item.id_seccion] = {
          id_seccion: item.id_seccion,
          nombre_docente: item.nombre_docente,
          rut_docente: item.rut_docente,
          nombre_sede: item.nombre_sede,
          seccion: item.seccion,
          pruebasRegistradas: 0, // Inicializamos el contador de pruebas registradas
          ...Array.from({ length: 15 }, (_, i) => ({ [`E${i}`]: null })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        };
      }

      if (item.num_prueba >= 0 && item.num_prueba <= 14) {
        // Registramos el valor para esa prueba
        seccionesMap[item.id_seccion][`E${item.num_prueba}`] = item.nombre_prueba;

        // Contamos cuántas pruebas tienen datos (no son null)
        if (item.nombre_prueba) {
          seccionesMap[item.id_seccion].pruebasRegistradas += 1;
        }
        evalsPresent.add(item.num_prueba);
        pruebaNames[`E${item.num_prueba}`] = item.nombre_prueba; // Guardamos el nombre de la prueba
      }
    });

    // Calculamos el porcentaje de avance
    const seccionesArray = Object.values(seccionesMap).map((seccion) => {
      const totalEvaluaciones = evalsPresent.size; // El total de evaluaciones es el número único de pruebas
      const porcentajeAvance = totalEvaluaciones > 0
        ? Math.round((seccion.pruebasRegistradas / totalEvaluaciones) * 100)
        : 0;

      return {
        ...seccion,
        porcentajeAvance, // Añadimos el porcentaje de avance
      };
    });

    // Ordenamos evalsPresent numéricamente y generamos las columnas dinámicas
    const sortedEvals = Array.from(evalsPresent).sort((a, b) => a - b);  // Ordenación numérica

    const dynamicColumns = sortedEvals.map((num) => ({
      title: (
        <Tooltip title={pruebaNames[`E${num}`] || 'Sin nombre'}>
          <span>{`E${num}`}</span>
        </Tooltip>
      ),
      dataIndex: `E${num}`,
      key: `E${num}`,
      render: (text, record) => (
        record[`E${num}`] ? <MailOutlined style={{ fontSize: '15px', background: 'yellow', color: '#1890ff' }} /> : <MailTwoTone twoToneColor="#ccc" style={{ fontSize: '15px' }} />
      ),
    }));

    return { seccionesArray, dynamicColumns };
  };

  const { seccionesArray, dynamicColumns } = transformSeccionesData(secciones);

  const columnsSecciones = [
    {
      title: 'ID Sección',
      dataIndex: 'id_seccion',
      width: 80,
      key: 'id_seccion',
      render: (id_seccion) => (
        <a href={`/secciones/${id_seccion}`} target="_blank" rel="noopener noreferrer">
          {id_seccion}
        </a>
      ),
    },
    {
      title: 'Docente',
      dataIndex: 'nombre_docente',
      width: 300,
      key: 'nombre_docente',
      render: (nombre_docente, record) => (
        <a
          href={`/carga-docente/${record.rut_docente}`}  // Usamos el rut_docente para construir la URL
          target="_blank"
          rel="noopener noreferrer"
        >
          {nombre_docente}
        </a>
      ),
    },
    {
      title: 'Sección',
      dataIndex: 'seccion',
      key: 'seccion',
    },
    ...dynamicColumns,
    {
      title: 'Avance (%)',
      key: 'avance',
      render: (text, record) => {
        const isBelow100 = record.porcentajeAvance < 100;
        return (
          <span
            style={{
              color: isBelow100 ? 'red' : 'black',   // Rojo si es menor a 100%
              fontWeight: isBelow100 ? 'bold' : 'normal' // Negrita si es menor a 100%
            }}
          >
            {record.porcentajeAvance}%
          </span>
        );
      },
    }
    
  ];

  const groupedSecciones = seccionesArray.reduce((acc, seccion) => {
    const sede = seccion.nombre_sede;
    if (!acc[sede]) {
      acc[sede] = [];
    }
    acc[sede].push(seccion);
    return acc;
  }, {});

  return (
    <div className='page-full'>
      <h1>Navegar por programa</h1>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/monitorasig">Programa</Link>
        </Breadcrumb.Item>
        {programa && (
          <Breadcrumb.Item>
            <Link to={`/monitorasig/${programa}`}>Asignatura</Link>
          </Breadcrumb.Item>
        )}
        {asignatura && (
          <Breadcrumb.Item>
            <Link to={`/monitorasig/${programa}/${asignatura}`}>Secciones</Link>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>

      {!programa && (
        <div>
          <div className='monitor-container'>
            <Table
              dataSource={programas}
              columns={columnsProgramas}
              rowKey="cod_programa"
              pagination={false}
            />
          </div>
        </div>
      )}
      {programa && !asignatura && (
        <div>
          <div className='monitor-container'>
            <Table
              dataSource={asignaturas}
              columns={columnsAsignaturas}
              rowKey="cod_asig"
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {programa && asignatura && (
        <div>
          <div className='monitor-container'>
            {Object.keys(groupedSecciones)
            .sort()  // Ordena alfabéticamente
            .map((sede) => (
              <div key={sede} className="seccion-sede">
                <h3>{sede}</h3>
                <Table
                  dataSource={groupedSecciones[sede]}
                  columns={columnsSecciones}
                  rowKey="id_seccion"
                  loading={loading}
                  pagination={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
