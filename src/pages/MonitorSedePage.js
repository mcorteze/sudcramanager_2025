import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Breadcrumb, Button, Select, Tooltip, Spin } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { MailOutlined, MailTwoTone } from '@ant-design/icons';
import { ImArrowRight } from "react-icons/im";
import './MonitorPage.css';

export default function MonitorSedePage() {
  const [programas, setProgramas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [selectedSede, setSelectedSede] = useState(null);
  const [loading, setLoading] = useState(false);

  const { programa } = useParams(); // Obtenemos el código del programa de los parámetros de la URL

  // Fetch programas
  useEffect(() => {
    async function fetchProgramas() {
      try {
        const response = await axios.get('http://localhost:3001/api/programas');
        setProgramas(response.data);
      } catch (error) {
        console.error('Error fetching programas:', error);
      }
    }
    fetchProgramas();
  }, []);

  // Fetch sedes cuando se selecciona un programa
  useEffect(() => {
    if (!programa) return;

    async function fetchSedes() {
      try {
        const response = await axios.get('http://localhost:3001/api/sedes');
        setSedes(response.data);
      } catch (error) {
        console.error('Error fetching sedes:', error);
      }
    }
    fetchSedes();
  }, [programa]);

  // Fetch secciones cuando se selecciona una sede
  useEffect(() => {
    if (!selectedSede) return;

    async function fetchSecciones() {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/monitorsede/${programa}/${selectedSede}`);
        setSecciones(response.data);
      } catch (error) {
        console.error('Error fetching secciones:', error);
      }
      setLoading(false);
    }
    fetchSecciones();
  }, [programa, selectedSede]);

  // Transforma los datos de las secciones
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
      key: 'nombre_docente',
      sorter: (a, b) => a.nombre_docente.localeCompare(b.nombre_docente),  // Orden alfabético de docentes
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
      sorter: (a, b) => a.seccion.localeCompare(b.seccion),  // Orden alfabético de secciones
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
    },
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
      <h1>Navegar por programa y sede</h1>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/monitorsede">Programa</Link>
        </Breadcrumb.Item>
        {programa && (
          <Breadcrumb.Item>
            <Link to={`/monitorsede/${programa}`}>Sede</Link>
          </Breadcrumb.Item>
        )}
        {selectedSede && (
          <Breadcrumb.Item>
            <Link to={`/monitorsede/${programa}/${selectedSede}`}>Secciones</Link>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>

      {!programa && (
        <div>
          <div className='monitor-container'>
            <Table
              dataSource={programas}
              columns={[
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
                      <Link to={`/monitorsede/${record.cod_programa}`} className="link-acceder">
                        <ImArrowRight className="icono" />
                        Acceder
                      </Link>
                    </Button>
                  ),
                },
              ]}
              rowKey="cod_programa"
              pagination={false}
            />
          </div>
        </div>
      )}

      {programa && !selectedSede && (
        <div>
          <h2>Seleccione una Sede</h2>
          <Select
            style={{ width: 200 }}
            onChange={value => setSelectedSede(value)}
            options={sedes.map(sede => ({
              label: `${sede.id_sede} – ${sede.nombre_sede}`, // <-- aquí
              value: sede.id_sede
            }))}
            loading={loading}
          />
        </div>
      )}

      {selectedSede && (
        <div>
          <Spin spinning={loading}>
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
          </Spin>
        </div>
      )}
    </div>
  );
}
