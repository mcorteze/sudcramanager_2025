import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Input, Button, Modal, Radio } from 'antd';

export default function LecturasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rut, setRut] = useState(searchParams.get('rut') || '');
  const [idArchivo, setIdArchivo] = useState(searchParams.get('id_archivoleido') || '');
  const [selectedRow, setSelectedRow] = useState(null); // Estado para almacenar la fila seleccionada
  const [isModalVisible, setIsModalVisible] = useState(false); // Para controlar la visibilidad del modal

  useEffect(() => {
    if (rut || idArchivo) {
      fetchData();
    }
  }, [rut, idArchivo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (rut) query.append('rut', rut);
      if (idArchivo) query.append('id_archivoleido', idArchivo);

      const response = await fetch(`http://localhost:3001/api/lecturas?${query.toString()}`);
      const result = await response.json();

      // Agrupar los registros por id_archivoleido y obtener el primer registro y el instante_forms máximo
      const groupedData = groupDataByIdArchivo(result);

      setData(result);
      setFilteredData(groupedData);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupDataByIdArchivo = (data) => {
    const grouped = data.reduce((acc, curr) => {
      const {
        id_archivoleido,
        rut,
        linea_leida,
        reproceso,
        cod_asig,
        num_prueba,
        forma,
        grupo,
        cod_interno,
        instante_forms,
        apellidos,
        nombres,
      } = curr;

      if (!acc[id_archivoleido]) {
        acc[id_archivoleido] = {
          id_archivoleido,
          cantidad_registros: 1,
          instante_forms_max: instante_forms,
          rut,
          linea_leida,
          reproceso,
          cod_asig,
          num_prueba,
          forma,
          grupo,
          cod_interno,
          nombre_alumno: `${apellidos} ${nombres}`,
        };
      } else {
        if (new Date(instante_forms) > new Date(acc[id_archivoleido].instante_forms_max)) {
          acc[id_archivoleido].instante_forms_max = instante_forms;
        }
        acc[id_archivoleido].cantidad_registros += 1;
      }

      return acc;
    }, {});

    return Object.values(grouped);
  };

  const handleSearch = () => {
    if (!rut && !idArchivo) {
      alert('Debe ingresar un RUT o un ID de Archivo');
      return;
    }
    setSearchParams({ rut, id_archivoleido: idArchivo });
    fetchData();
  };

  const handleRowSelect = (record) => {
    setSelectedRow(record); // Guardamos el registro seleccionado
  };

  const handleSendToLecturaTemp = async () => {
    if (!selectedRow) {
      alert('Debe seleccionar un registro primero.');
      return;
    }

    // Abrir el modal de confirmación
    setIsModalVisible(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedRow) return;

    const { rut, id_archivoleido } = selectedRow;
    
    // Llamada al endpoint que ejecuta el SQL de inserción
    try {
      const response = await fetch('http://localhost:3001/api/lectura-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut,
          id_archivoleido,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Reproceso realizado con éxito');
        fetchData(); // Refrescar los datos
        setIsModalVisible(false); // Cerrar el modal
      } else {
        alert('Error al realizar el reproceso');
      }
    } catch (error) {
      console.error('Error al enviar a lectura temp:', error);
      alert('Hubo un error al procesar la solicitud');
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false); // Cerrar el modal sin hacer nada
  };

  const columns = [
    {
      title: 'Seleccionar',
      dataIndex: 'select',
      render: (_, record) => (
        <Radio
          checked={selectedRow?.id_archivoleido === record.id_archivoleido}
          onChange={() => handleRowSelect(record)}
        />
      ),
    },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'ID Archivo', dataIndex: 'id_archivoleido', key: 'id_archivoleido' },
    { title: 'Linea Leída', dataIndex: 'linea_leida', key: 'linea_leida' },
    { title: 'Reproceso', dataIndex: 'reproceso', key: 'reproceso' },
    { title: 'Cod Asig', dataIndex: 'cod_asig', key: 'cod_asig' },
    { title: 'Número de Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
    { title: 'Forma', dataIndex: 'forma', key: 'forma' },
    { title: 'Grupo', dataIndex: 'grupo', key: 'grupo' },
    { title: 'Código Interno', dataIndex: 'cod_interno', key: 'cod_interno' },
    { title: 'Nombre Alumno', dataIndex: 'nombre_alumno', key: 'nombre_alumno' },
    { title: 'Cantidad de Registros', dataIndex: 'cantidad_registros', key: 'cantidad_registros' },
    {
      title: 'Instante Formulario Máximo',
      dataIndex: 'instante_forms_max',
      key: 'instante_forms_max',
      render: (text) => {
        if (!text) return '-'; 
        const date = new Date(text);
        const pad = (n) => n.toString().padStart(2, '0');
        const formattedDate = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
        const formattedTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return `${formattedDate}, ${formattedTime}`;
      }
    },
  ];

  return (
    <div className='page-full'>
      <h1>Lecturas</h1>
      <div style={{ marginBottom: 16 }}>
        <Input placeholder='RUT (Opcional)' value={rut} onChange={e => setRut(e.target.value)} style={{ width: 200, marginRight: 8 }} />
        <Input placeholder='ID Archivo (Opcional)' value={idArchivo} onChange={e => setIdArchivo(e.target.value)} style={{ width: 200, marginRight: 8 }} />
        <Button type='primary' onClick={handleSearch}>Buscar</Button>
      </div>
      
      <Table dataSource={filteredData} columns={columns} loading={loading} rowKey='id_archivoleido' />
      
      <Button
        type='primary'
        onClick={handleSendToLecturaTemp}
        disabled={!selectedRow} // Solo habilitar si hay una fila seleccionada
      >
        Enviar a Lectura Temp
      </Button>

      <Modal
        title="Confirmar Envío"
        visible={isModalVisible}
        onOk={handleConfirmSend}
        onCancel={handleCancelModal}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>¿Está seguro de enviar el registro con RUT: {selectedRow?.rut} y ID Archivo: {selectedRow?.id_archivoleido} a la tabla Lectura Temp?</p>
      </Modal>
    </div>
  );
}
