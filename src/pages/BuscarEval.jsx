import React, { useState, useEffect } from 'react';
import { Select, Table, message, Spin, Button, Modal, Input, Space } from 'antd';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';

const { Option } = Select;
const PASSWORD_REQUERIDA = 'arcdus';

export default function EvaluacionesFiltradas() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);

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

    const asignaturasFiltradas = evaluaciones
      .filter(e => e.programa === programa)
      .map(e => e.cod_asig);

    const asignaturasUnicas = [...new Set(asignaturasFiltradas)];
    setAsignaturas(asignaturasUnicas);
  };

  const handleAsignaturaChange = (asignatura) => {
    setSelectedAsignatura(asignatura);
  };

  const evaluacionesFiltradas = evaluaciones.filter(e => {
    return (
      (!selectedPrograma || e.programa === selectedPrograma) &&
      (!selectedAsignatura || e.cod_asig === selectedAsignatura)
    );
  });

  const confirmarEliminacionMasiva = (accion) => {
    let inputValue = '';
    const id_eval_list = evaluacionesFiltradas.map(e => e.id_eval);

    if (id_eval_list.length === 0) {
      message.warning('No hay registros filtrados para eliminar');
      return;
    }

    Modal.confirm({
      title: `¿Desea eliminar según la acción seleccionada?`,
      width: 600,
      content: (
        <div>
          {accion === 'calificaciones' && (
            <p>⚠️ Esto eliminará todas las <strong>calificaciones</strong> de los registros filtrados.</p>
          )}
          {accion === 'todo' && (
            <p>⚠️ Esto eliminará primero todas las <strong>calificaciones</strong> y luego las <strong>evaluaciones</strong>.</p>
          )}
          {accion === 'soloTabla' && (
            <p>⚠️ Esto eliminará únicamente las <strong>evaluaciones</strong> (sin calificaciones).</p>
          )}
          <p><strong>Registros a eliminar:</strong></p>
          <ul style={{ maxHeight: 150, overflowY: 'auto', paddingLeft: 20 }}>
            {id_eval_list.map(id => (
              <li key={id}>ID Evaluación: {id}</li>
            ))}
          </ul>
          <p>Ingrese la contraseña para continuar:</p>
          <Input.Password
            placeholder="Contraseña"
            onChange={(e) => { inputValue = e.target.value }}
          />
        </div>
      ),
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          if (inputValue !== PASSWORD_REQUERIDA) {
            message.error('Contraseña incorrecta');
            throw new Error('Contraseña inválida');
          }

          if (accion === 'calificaciones') {
            await axios.delete('http://localhost:3001/api/calificaciones_eval', {
              data: { id_eval_list }
            });
            message.success('Calificaciones eliminadas correctamente');
          } else if (accion === 'todo') {
            await axios.delete('http://localhost:3001/api/calificaciones_eval', {
              data: { id_eval_list }
            });
            message.success('Calificaciones eliminadas correctamente');

            await axios.delete('http://localhost:3001/api/eval', {
              data: { id_eval_list }
            });
            message.success('Evaluaciones eliminadas correctamente');
          } else if (accion === 'soloTabla') {
            await axios.delete('http://localhost:3001/api/eval', {
              data: { id_eval_list }
            });
            message.success('Evaluaciones eliminadas correctamente (sólo tabla)');
          }

          fetchEvaluaciones();
        } catch (err) {
          console.error('Error en eliminación masiva:', err);
          message.error('Error al eliminar registros');
          throw err;
        }
      }
    });
  };

  const mostrarConfirmacion = (accion, registro) => {
    let inputValue = '';
    const id_eval_list = [registro.id_eval];

    Modal.confirm({
      title: `¿Está seguro que desea eliminar este registro?`,
      content: (
        <div>
          {accion === 'calificaciones' && (
            <p>⚠️ Esta acción eliminará las <strong>calificaciones</strong> asociadas.</p>
          )}
          {accion === 'todo' && (
            <p>⚠️ Esta acción eliminará las <strong>calificaciones</strong> asociadas y luego la <strong>evaluación</strong>.</p>
          )}
          {accion === 'soloTabla' && (
            <p>⚠️ Esta acción eliminará únicamente la <strong>evaluación</strong> (sin calificaciones).</p>
          )}
          <p>❌ Esta operación no se puede deshacer.</p>
          <p>Ingrese la contraseña para continuar:</p>
          <Input.Password
            placeholder="Contraseña"
            onChange={(e) => { inputValue = e.target.value }}
          />
        </div>
      ),
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          if (inputValue !== PASSWORD_REQUERIDA) {
            message.error('Contraseña incorrecta');
            throw new Error('Contraseña inválida');
          }

          if (accion === 'calificaciones') {
            await axios.delete('http://localhost:3001/api/calificaciones_eval', {
              data: { id_eval_list }
            });
            message.success('Calificaciones eliminadas correctamente');
          } else if (accion === 'todo') {
            await axios.delete('http://localhost:3001/api/calificaciones_eval', {
              data: { id_eval_list }
            });
            message.success('Calificaciones eliminadas correctamente');

            await axios.delete('http://localhost:3001/api/eval', {
              data: { id_eval_list }
            });
            message.success('Evaluación eliminada correctamente');
          } else if (accion === 'soloTabla') {
            await axios.delete('http://localhost:3001/api/eval', {
              data: { id_eval_list }
            });
            message.success('Evaluación eliminada correctamente (sólo tabla)');
          }

          fetchEvaluaciones();
        } catch (err) {
          console.error(`Error al eliminar ${accion}:`, err);
          message.error(`Error al eliminar ${accion}`);
          throw err;
        }
      }
    });
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
    {
      title: 'Eliminar registros',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            style={{ backgroundColor: '#1677ff', color: '#fff' }}
            onClick={() => mostrarConfirmacion('soloTabla', record)}
          >
            Sólo tabla
          </Button>
          <Button
            danger
            onClick={() => mostrarConfirmacion('calificaciones', record)}
          >
            Sólo calificaciones
          </Button>
          <Button
            danger
            type="primary"
            onClick={() => mostrarConfirmacion('todo', record)}
          >
            Eliminar todo
          </Button>
        </Space>
      ),
    },
  ];

  const descargarExcel = () => {
    const dataParaExportar = evaluacionesFiltradas.map(e => ({
      'ID Evaluación': e.id_eval,
      Programa: e.programa,
      'Código Asignatura': e.cod_asig,
      'Número Prueba': e.num_prueba,
      'Nombre Prueba': e.nombre_prueba,
      'Fecha Cargado': moment(e.cargado_fecha).format('HH:mm:ss - DD/MM/YYYY'),
    }));

    const hoja = XLSX.utils.json_to_sheet(dataParaExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Evaluaciones');
    XLSX.writeFile(libro, 'evaluaciones.xlsx');
  };

  return (
    <div className='page-full'>
      <h1>Tablas de especificaciones cargadas</h1>

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

        <Button
          style={{ backgroundColor: '#1677ff', color: '#fff', marginRight: 10 }}
          onClick={() => confirmarEliminacionMasiva('soloTabla')}
        >
          Eliminar sólo tabla filtradas
        </Button>

        <Button
          danger
          onClick={() => confirmarEliminacionMasiva('calificaciones')}
          style={{ marginRight: 10 }}
        >
          Eliminar calificaciones filtradas
        </Button>

        <Button
          danger
          type="primary"
          onClick={() => confirmarEliminacionMasiva('todo')}
        >
          Eliminar todo filtradas
        </Button>
      </div>

      <Button type="primary" onClick={descargarExcel} style={{ marginBottom: 16 }}>
        Descargar Excel
      </Button>

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
    </div>
  );
}
