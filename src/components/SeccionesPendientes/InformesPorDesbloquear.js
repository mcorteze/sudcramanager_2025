// InformesPorDesbloquear.js
import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, message, Modal, Input, Tag } from 'antd';
import { getColumns } from './InformePorDesbloquear_columns.js';
import 'antd/dist/reset.css';
import './formato_tabla.css';

const { confirm } = Modal;

export default function InformesPorDesbloquear() {
  const [seccionesPendientes, setSeccionesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedSwitches, setUpdatedSwitches] = useState(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);

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
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (keyword === 'arcdus') {
      const updatePromises = Array.from(updatedSwitches).map(async (id_eval) => {
        try {
          const response = await fetch('http://localhost:3001/api/eval/update-maildisponible', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
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
      onCancel: () => console.log('Cancelado'),
    });
  };

  const handleDelete = async (id_seccion, id_eval, id_informeseccion) => {
    try {
      const response = await fetch(`http://localhost:3001/api/informes_secciones/${id_seccion}/${id_eval}/${id_informeseccion}`, {
        method: 'DELETE',
      });

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

  const baseUrl = 'https://duoccl0-my.sharepoint.com/personal/lgutierrez_duoc_cl/Documents/SUDCRA/informes/2025001/secciones/';

  const columns = getColumns(handleSwitchChange, confirmDelete, baseUrl);

  // ============================
  // Filtrado por asignatura
  // ============================
  // Obtener todas las asignaturas únicas:
  const asignaturasUnicas = Array.from(
    new Set(seccionesPendientes.map(item => item.cod_asig))
  ).filter(item => item !== null && item !== undefined);

  // Datos filtrados:
  const dataFiltrada = selectedAsignatura
    ? seccionesPendientes.filter(item => item.cod_asig === selectedAsignatura)
    : seccionesPendientes;

  const handleTagClick = (asig) => {
    if (selectedAsignatura === asig) {
      // Quitar filtro si el mismo tag se selecciona de nuevo
      setSelectedAsignatura(null);
    } else {
      setSelectedAsignatura(asig);
    }
  };

  if (loading) {
    return <div><Spin /> Cargando...</div>;
  }

  if (error) {
    return <Alert message="Información" description={error} type="info" />;
  }

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
      {/* Bloque de tags */}
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
            onClose={() => setSelectedAsignatura(null)}
            style={{ marginLeft: 8 }}
          >
            Quitar filtro
          </Tag>
        )}
      </div>

      <Table
        dataSource={dataFiltrada}
        columns={columns}
        rowKey="id_informeseccion"
        pagination={false}
        className="table-small-font"
      />
      <Button 
        type="primary" 
        onClick={handleSave} 
        disabled={updatedSwitches.size === 0}
        style={{ marginTop: 16 }}
      >
        Guardar Cambios
      </Button>

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
          autoComplete="new-password"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Ingrese la palabra clave"
        />
      </Modal>
    </div>
  );
}
