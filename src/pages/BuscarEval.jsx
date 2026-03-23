import React, { useState, useEffect } from 'react';
import { Select, Table, message, Spin, Button, Modal, Input, Space } from 'antd';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';
import {
  DeleteOutlined,
  TableOutlined,
  DatabaseOutlined,
  FileExcelOutlined,
  SearchOutlined
} from '@ant-design/icons';
import CalificacionesModal from '../components/CalificacionesModal';


const { Option } = Select;
const PASSWORD_REQUERIDA = 'arcdus';

export default function EvaluacionesFiltradas() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedNumPrueba, setSelectedNumPrueba] = useState(null);
  const [numPruebas, setNumPruebas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIdEval, setCurrentIdEval] = useState(null);


  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const handleMailDisponibleChange = (id_eval, newVal) => {
    Modal.confirm({
      title: 'Confirmar cambio de Mail Disponible',
      content: newVal 
        ? 'Si activa esta opción, se enviarán correos automáticos al procesar tanto para docentes como para alumnos. ¿Desea continuar?' 
        : 'Si desactiva esta opción, NO se enviarán correos automáticos, solo se procesarán. ¿Desea continuar?',
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await axios.put('http://localhost:3001/api/eval/maildisponible', {
            id_eval: id_eval,
            maildisponible: newVal
          });
          message.success('Configuración de correo actualizada');
          fetchEvaluaciones();
        } catch (err) {
          console.error('Error al actualizar maildisponible:', err);
          message.error('Error al actualizar la configuración de correo');
        }
      }
    });
  };

  const fetchEvaluaciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/tablas_cargadas');
      const data = response.data;
      setEvaluaciones(data);

      const programasUnicos = [...new Set(data.map(e => e.programa))];
      setProgramas(programasUnicos);

      const numPruebasUnicosStatic = [...new Set(data.map(e => e.num_prueba))].sort((a, b) => a - b);
      setNumPruebas(numPruebasUnicosStatic);
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

    // Si hay programa, filtramos las asignaturas y los números de evaluación de ese programa
    if (programa) {
      const filteredData = evaluaciones.filter(e => e.programa === programa);

      const asignaturasUnicas = [...new Set(filteredData.map(e => e.cod_asig))];
      setAsignaturas(asignaturasUnicas);

      const numPruebasUnicos = [...new Set(filteredData.map(e => e.num_prueba))].sort((a, b) => a - b);
      setNumPruebas(numPruebasUnicos);
    } else {
      // Si se limpia el programa, volvemos a mostrar todo
      setAsignaturas([]);
      const numPruebasTodo = [...new Set(evaluaciones.map(e => e.num_prueba))].sort((a, b) => a - b);
      setNumPruebas(numPruebasTodo);
    }
  };

  const handleAsignaturaChange = (asignatura) => {
    setSelectedAsignatura(asignatura);
    // No reseteamos numPruebas aquí para permitir filtrar por N° independientemente o después
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
    { title: 'ID', dataIndex: 'id_eval', key: 'id_eval', width: 100 },
    { title: 'Prog.', dataIndex: 'programa', key: 'programa', width: 120 },
    { title: 'Asig.', dataIndex: 'cod_asig', key: 'cod_asig', width: 60 },
    { title: 'N°', dataIndex: 'num_prueba', key: 'num_prueba', width: 50 },
    { title: 'Nombre Prueba', dataIndex: 'nombre_prueba', key: 'nombre_prueba', width: 150 },
    { title: 'Esquema', dataIndex: 'esquema', key: 'esquema', width: 100 },
    { title: 'Exig.', dataIndex: 'exigencia', key: 'exigencia', width: 70, render: (val) => val ? `${Math.round(val * 100)}%` : '-' },

    {
      title: 'Puntaje Aprobación',
      dataIndex: 'puntaje_aprobacion',
      key: 'puntaje_aprobacion',
      width: 70,
      render: (val, record) => {
        if (!val || record.esquema === 'UC') return '-';
        if (record.esquema === 'Logro General') {
          const calculado = Math.round(Number(record.exigencia) * Number(record.puntaje_total) * 10) / 10;
          const esCorrecto = Math.abs(Number(val) - calculado) < 0.05;

          return (
            <span
              title={esCorrecto ? 'Puntaje correcto según exigencia' : `Error: Debería ser ${calculado} (Exigencia ${Math.round(record.exigencia * 100)}%)`}
              style={{
                color: esCorrecto ? '#389e0d' : '#cf1322',
                fontWeight: 'bold',
                backgroundColor: esCorrecto ? '#f6ffed' : '#fff1f0',
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${esCorrecto ? '#b7eb8f' : '#ffa39e'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: esCorrecto ? 'none' : '0 0 8px rgba(245, 34, 45, 0.3)'
              }}
            >
              {val} {esCorrecto ? '✅' : '❌'}
            </span>
          );
        }
        return val;
      }
    },

    { title: 'Puntos Tot.', dataIndex: 'puntaje_total', key: 'puntaje_total', width: 60, render: (val) => val != null ? Number(val) : '-' },
    {
      title: 'Mail Disp.',
      dataIndex: 'maildisponible',
      key: 'maildisponible',
      width: 100,
      render: (val, record) => (
        <Select
          value={val === true}
          size="small"
          style={{ width: 70 }}
          onChange={(newVal) => handleMailDisponibleChange(record.id_eval, newVal)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value={true}>SI</Option>
          <Option value={false}>NO</Option>
        </Select>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'cargado_fecha',
      key: 'cargado_fecha',
      width: 100,
      render: (text) => moment(text).format('HH:mm - DD/MM/YYYY')
    },
    {
      title: 'Borrar',
      key: 'acciones',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            danger
            title="Eliminar sólo tabla"
            style={{ fontSize: '11px', padding: '0 4px' }}
            onClick={(e) => { e.stopPropagation(); mostrarConfirmacion('soloTabla', record); }}
          >
            tabla
          </Button>
          <Button
            size="small"
            danger
            title="Eliminar sólo calificaciones"
            style={{ fontSize: '11px', padding: '0 4px' }}
            onClick={(e) => { e.stopPropagation(); mostrarConfirmacion('calificaciones', record); }}
          >
            calificaciones
          </Button>
          <Button
            size="small"
            danger
            type="primary"
            title="Eliminar todo"
            style={{ fontSize: '11px', padding: '0 4px' }}
            onClick={(e) => { e.stopPropagation(); mostrarConfirmacion('todo', record); }}
          >
            todo
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
      'Esquema': e.esquema,
      'Exigencia': e.exigencia ? `${Math.round(e.exigencia * 100)}%` : '-',

      'Puntaje Aprobación': e.esquema === 'UC' ? '-' : e.puntaje_aprobacion,

      'Puntaje Total': e.puntaje_total != null ? Number(e.puntaje_total) : '-',
      'Mail Disponible': e.maildisponible ? 'SI' : 'NO',
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
          allowClear
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
          allowClear
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
          allowClear
          placeholder="N°"
          style={{ width: 80, marginRight: 10 }}
          onChange={handleNumPruebaChange}
          value={selectedNumPrueba}
        >
          {numPruebas.map(num => (
            <Option key={num} value={num}>
              {num}
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

      {
        loading ? (
          <Spin />
        ) : (
          <Table
            size="small"
            columns={columns}
            dataSource={evaluacionesFiltradas}
            rowKey="id_eval"
            pagination={{ pageSize: 20 }}
            scroll={{ x: 'max-content' }}
            onRow={(record) => ({
              onClick: () => {
                setCurrentIdEval(record.id_eval);
                setModalVisible(true);
              },
              style: { cursor: 'pointer' }
            })}
          />
        )
      }

      <CalificacionesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        idEval={currentIdEval}
      />
    </div >

  );
}
