// InformesPorDesbloquear.js
import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, message, Modal, Input, Tag } from 'antd';
import { getColumns } from './InformePorDesbloquear_columns.jsx';
import * as XLSX from 'xlsx';
import 'antd/dist/reset.css';
import './formato_tabla.css';

// helper centralizado
import { getPeriodoStr } from '../../utils/periodo';

const { confirm } = Modal;

const SHAREPOINT_BASE =
  'https://duoccl0-my.sharepoint.com/personal/mcorteze_duoc_cl/Documents/sudcra-repositorio/informes';

export default function InformesPorDesbloquear() {
  const [seccionesPendientes, setSeccionesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedSwitches, setUpdatedSwitches] = useState(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [evaluacionesConAlerta, setEvaluacionesConAlerta] = useState([]);

  const periodoSafe = getPeriodoStr() || '0000000';
  const baseUrl = `${SHAREPOINT_BASE}/${periodoSafe}/secciones/`;

  useEffect(() => {
    fetchSeccionesPendientes();
  }, []);

  const fetchSeccionesPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/informes/pendientes');
      const contentType = response.headers.get('content-type');

      if (response.status === 404) {
        setError('No hay secciones pendientes para revisar.');
        setSeccionesPendientes([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Error al obtener los datos. Estado: ' + response.status);
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setSeccionesPendientes(data);
      } else {
        throw new Error('Respuesta no es JSON');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (checked, record) => {
    const updated = new Set(updatedSwitches);
    if (checked) {
      updated.add(record.id_eval);
    } else {
      updated.delete(record.id_eval);
    }
    setUpdatedSwitches(updated);
  };

  const handleSave = () => {
    const alertas = [];
    const idsRevisados = new Set();
    
    updatedSwitches.forEach(id_eval => {
      if (idsRevisados.has(id_eval)) return;
      idsRevisados.add(id_eval);
      
      const record = seccionesPendientes.find(item => item.id_eval === id_eval);
      if (record && record.esquema === 'Logro General') {
        const calculado = Math.round(Number(record.exigencia) * Number(record.puntaje_total) * 10) / 10;
        const esCorrecto = Math.abs(Number(record.puntaje_aprobacion) - calculado) < 0.05;
        if (!esCorrecto) {
          alertas.push(record);
        }
      }
    });

    if (alertas.length > 0) {
      setEvaluacionesConAlerta(alertas);
      setIsAlertModalVisible(true);
    } else {
      setIsModalVisible(true);
    }
  };

  const handleAlertModalOk = () => {
    setIsAlertModalVisible(false);
    setIsModalVisible(true);
  };

  const handleAlertModalCancel = () => {
    setIsAlertModalVisible(false);
  };

  const handleModalOk = () => {
    if (keyword === 'arcdus') {
      const updatePromises = Array.from(updatedSwitches).map(async (id_eval) => {
        try {
          const response = await fetch('http://localhost:3001/api/eval/update-maildisponible', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_eval }),
          });

          if (!response.ok) {
            throw new Error('Error al actualizar el registro con id_eval: ' + id_eval);
          }
        } catch (err) {
          console.error(err);
        }
      });

      Promise.all(updatePromises)
        .then(() => {
          message.success('Cambios guardados exitosamente');
          setUpdatedSwitches(new Set());
          fetchSeccionesPendientes();
          setIsModalVisible(false);
          setKeyword('');
        })
        .catch(() => {
          message.error('Error al guardar los cambios');
        });
    } else {
      message.error('Palabra clave incorrecta. El envío no se realizará.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const confirmDelete = (id_seccion, id_eval, id_informeseccion) => {
    confirm({
      title: '¿Estás seguro de eliminar este registro?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => handleDelete(id_seccion, id_eval, id_informeseccion),
    });
  };

  const handleDelete = async (id_seccion, id_eval, id_informeseccion) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/informes_secciones/${id_seccion}/${id_eval}/${id_informeseccion}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('No se pudo eliminar el registro');
      }

      message.success('Registro eliminado exitosamente');
      fetchSeccionesPendientes();
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
      message.error('Error al eliminar el registro');
    }
  };

  // ==============================
  // Filtrado por Asignatura
  // ==============================
  const asignaturasUnicas = Array.from(
    new Set(seccionesPendientes.map(item => item.cod_asig))
  ).filter(item => item !== null && item !== undefined);

  const handleTagClick = (asig) => {
    setSelectedAsignatura(prev => {
      const next = prev === asig ? null : asig;
      setSelectedEvaluacion(null); // Reset evaluación al cambiar asignatura
      return next;
    });
  };

  const evaluacionesUnicas = selectedAsignatura
    ? Array.from(new Set(seccionesPendientes
      .filter(item => item.cod_asig === selectedAsignatura)
      .map(item => item.nombre_prueba)))
    : [];

  const handleEvalClick = (evaluacion) => {
    setSelectedEvaluacion(prev => (prev === evaluacion ? null : evaluacion));
  };

  const dataFiltrada = seccionesPendientes.filter(item => {
    const matchAsig = !selectedAsignatura || item.cod_asig === selectedAsignatura;
    const matchEval = !selectedEvaluacion || item.nombre_prueba === selectedEvaluacion;
    return matchAsig && matchEval;
  });

  // ==========================================
  //   🟦 FUNCIÓN PARA DESCARGAR EXCEL
  // ==========================================
  const descargarExcel = () => {
    if (dataFiltrada.length === 0) {
      message.warning("No hay datos para exportar.");
      return;
    }

    // Construir los objetos para Excel con columnas explícitas
    const datosExcel = dataFiltrada.map(item => ({
      "ID Informe Sección": item.id_informeseccion,
      "ID Evaluación": item.id_eval,
      "Programa": item.programa,
      "Sede": item.nombre_sede,
      "Asignatura": item.cod_asig,
      "Sección": item.seccion,
      "Marcatemporal": item.marca_temporal,
      "ID Sección": item.id_seccion,
      "Evaluación": item.nombre_prueba,
      "Docente": item.docente,
      "Rut Docente": item.rut_docente,
      "Nombre Informe": item.informe,
      "URL Informe": `${baseUrl}${item.informe}`  // 🔥 se incluye la URL completa
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Informes");

    XLSX.writeFile(wb, "informes_por_desbloquear.xlsx");
  };

  const columns = getColumns(handleSwitchChange, confirmDelete, baseUrl);

  if (loading) return <div><Spin /> Cargando...</div>;
  if (error) return <Alert message="Información" description={error} type="info" />;
  if (seccionesPendientes.length === 0) {
    return (
      <Alert
        message="No hay secciones pendientes"
        description="No hay más secciones por revisar."
        type="info"
      />
    );
  }

  return (
    <div>

      {/* FILTRO */}
      <div style={{ marginBottom: 16 }}>
        <strong>Filtrar por Asignatura:</strong>{' '}
        {asignaturasUnicas.map((asig) => (
          <Tag
            key={asig}
            color={selectedAsignatura === asig ? 'geekblue' : 'default'}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => handleTagClick(asig)}
          >
            {asig}
          </Tag>
        ))}

        {selectedAsignatura && (
          <Tag
            color="volcano"
            closable
            onClose={() => {
              setSelectedAsignatura(null);
              setSelectedEvaluacion(null);
            }}
            style={{ marginLeft: 8 }}
          >
            Quitar filtro Asignatura
          </Tag>
        )}
      </div>

      {/* FILTRO EVALUACIÓN (Sólo si hay asignatura seleccionada) */}
      {selectedAsignatura && evaluacionesUnicas.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong>Filtrar por Evaluación:</strong>{' '}
          {evaluacionesUnicas.map((evaluacion) => (
            <Tag
              key={evaluacion}
              color={selectedEvaluacion === evaluacion ? 'blue' : 'default'}
              style={{ cursor: 'pointer', marginBottom: 4 }}
              onClick={() => handleEvalClick(evaluacion)}
            >
              {evaluacion}
            </Tag>
          ))}
          {selectedEvaluacion && (
            <Tag
              color="volcano"
              closable
              onClose={() => setSelectedEvaluacion(null)}
              style={{ marginLeft: 8 }}
            >
              Quitar filtro Evaluación
            </Tag>
          )}
        </div>
      )}

      {/* TABLA */}
      <Table
        dataSource={dataFiltrada}
        columns={columns}
        rowKey="id_informeseccion"
        pagination={false}
        className="table-small-font"
      />

      {/* BOTÓN DESCARGA EXCEL */}
      <Button
        onClick={descargarExcel}
        style={{ marginTop: 16, marginRight: 12 }}
      >
        Descargar Excel
      </Button>


      {/* BOTÓN GUARDAR CAMBIOS */}
      <Button
        type="primary"
        onClick={handleSave}
        disabled={updatedSwitches.size === 0}
        style={{ marginTop: 16 }}
      >
        Guardar Cambios
      </Button>

      {/* MODAL */}
      <Modal
        title="Confirmación"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>Para confirmar el envío de los informes, ingresa la palabra clave:</p>
        <Input
          type="password"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Ingrese la palabra clave"
        />
      </Modal>

      {/* MODAL DE ALERTA DE PUNTAJE */}
      <Modal
        title="⚠️ Advertencia: Evaluaciones con Anomalías"
        visible={isAlertModalVisible}
        onOk={handleAlertModalOk}
        onCancel={handleAlertModalCancel}
        okText="Entendido, continuar"
        cancelText="Cancelar"
        width={600}
      >
        <p>
          Las siguientes evaluaciones tienen un <b>puntaje de aprobación inusual o mal calculado</b>.
          ¿Está absolutamente seguro de que desea aprobarlas manualmente?
        </p>
        <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {evaluacionesConAlerta.map(ev => {
            const calculado = Math.round(Number(ev.exigencia) * Number(ev.puntaje_total) * 10) / 10;
            return (
              <li key={ev.id_eval} style={{ marginBottom: 8 }}>
                <strong>{ev.id_eval}</strong> — {ev.nombre_prueba}<br/>
                <span style={{ color: 'red' }}>
                  Puntaje actual: {ev.puntaje_aprobacion} (Debería ser ~{calculado} según {Math.round(ev.exigencia * 100)}% de exigencia)
                </span>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
