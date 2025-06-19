import React, { useState, useEffect } from 'react';
import { Select, Table, message, Spin, Button } from 'antd';
import axios from 'axios';
import moment from 'moment';
import ResultadosEvaluacionTable from '../components/BuscarResultados/ResultadosEvaluacionTable';

const { Option } = Select;

export default function BuscarResultadosPage() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [opcionesNumPrueba, setOpcionesNumPrueba] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedNumPrueba, setSelectedNumPrueba] = useState(null);

  const [resultadosAlumnos, setResultadosAlumnos] = useState([]);
  const [columnasEvaluacion, setColumnasEvaluacion] = useState([]);
  const [loadingResultados, setLoadingResultados] = useState(false);

  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const fetchEvaluaciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/tablas_cargadas');
      const data = response.data;
      setEvaluaciones(data);

      const programasUnicos = [...new Set(data.map(e => e.programa))];
      setProgramas(programasUnicos);
    } catch (err) {
      console.error('Error al obtener evaluaciones:', err);
      message.error('Error al obtener evaluaciones del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleProgramaChange = (programa) => {
    setSelectedPrograma(programa);
    setSelectedAsignatura(null);
    setSelectedNumPrueba(null);
    setOpcionesNumPrueba([]);

    const asignaturasFiltradas = evaluaciones
      .filter(e => e.programa === programa)
      .map(e => e.cod_asig);

    const asignaturasUnicas = [...new Set(asignaturasFiltradas)];
    setAsignaturas(asignaturasUnicas);
  };

  const handleAsignaturaChange = (asignatura) => {
    setSelectedAsignatura(asignatura);
    setSelectedNumPrueba(null);

    const pruebas = evaluaciones
      .filter(e => e.programa === selectedPrograma && e.cod_asig === asignatura)
      .map(e => ({ num: e.num_prueba, nombre: e.nombre_prueba }));

    const unicas = [];
    const numsVistos = new Set();
    for (const p of pruebas) {
      if (!numsVistos.has(p.num)) {
        unicas.push(p);
        numsVistos.add(p.num);
      }
    }

    setOpcionesNumPrueba(unicas);
  };

  const handleNumPruebaChange = (num) => {
    setSelectedNumPrueba(num);
  };

  const evaluacionesFiltradas = evaluaciones.filter(e => {
    return (
      (!selectedPrograma || e.programa === selectedPrograma) &&
      (!selectedAsignatura || e.cod_asig === selectedAsignatura) &&
      (!selectedNumPrueba || e.num_prueba === selectedNumPrueba)
    );
  });

  const buscarResultados = async () => {
    if (evaluacionesFiltradas.length === 0) {
      message.warning('No hay evaluaciones filtradas para buscar resultados.');
      return;
    }

    const id_eval_list = evaluacionesFiltradas.map(e => e.id_eval);

    try {
      setLoadingResultados(true);
      const response = await axios.get('http://localhost:3001/api/explorar_resultados', {
        params: { id_eval_list },
        paramsSerializer: params => {
          return params.id_eval_list.map(id => `id_eval_list=${id}`).join('&');
        }
      });

      const { resultados, columnas_dinamicas } = response.data;
      setResultadosAlumnos(resultados);
      setColumnasEvaluacion(columnas_dinamicas);
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      message.error('Error al obtener resultados de alumnos');
    } finally {
      setLoadingResultados(false);
    }
  };

  const columns = [
    { title: 'ID Evaluación', dataIndex: 'id_eval', key: 'id_eval' },
    { title: 'Programa', dataIndex: 'programa', key: 'programa' },
    { title: 'Código Asignatura', dataIndex: 'cod_asig', key: 'cod_asig' },
    { title: 'Número Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
    { title: 'Nombre Prueba', dataIndex: 'nombre_prueba', key: 'nombre_prueba' },
    {
      title: 'Fecha Cargado',
      dataIndex: 'cargado_fecha',
      key: 'cargado_fecha',
      render: (text) => moment(text).format('HH:mm:ss - DD/MM/YYYY')
    },
  ];

  return (
    <div className='page-full'>
      <h1>Buscar resultados de evaluaciones</h1>

      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="Seleccione un programa"
          style={{ width: 200, marginRight: 10 }}
          onChange={handleProgramaChange}
          value={selectedPrograma}
        >
          {programas.map(programa => (
            <Option key={programa} value={programa}>
              {programa}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Seleccione una asignatura"
          style={{ width: 200, marginRight: 10 }}
          onChange={handleAsignaturaChange}
          value={selectedAsignatura}
          disabled={!selectedPrograma}
        >
          {asignaturas.map(asignatura => (
            <Option key={asignatura} value={asignatura}>
              {asignatura}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Seleccione número de prueba"
          style={{ width: 250 }}
          onChange={handleNumPruebaChange}
          value={selectedNumPrueba}
          disabled={!selectedPrograma || !selectedAsignatura}
        >
          {opcionesNumPrueba.map(op => (
            <Option key={op.num} value={op.num}>
              {`${op.num} - ${op.nombre}`}
            </Option>
          ))}
        </Select>

        <Button onClick={buscarResultados} style={{ marginLeft: 10 }}>
          Buscar Resultados
        </Button>
      </div>

      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={evaluacionesFiltradas}
          rowKey="id_eval"
          pagination={false}
        />
      )}

      {loadingResultados ? (
        <Spin />
      ) : (
        <ResultadosEvaluacionTable
          data={resultadosAlumnos}
          columnasDinamicas={columnasEvaluacion}
        />
      )}
    </div>
  );
}
