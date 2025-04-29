import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Input, Button, Modal, Radio } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';

export default function LecturasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rut, setRut] = useState(searchParams.get('rut') || '');
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (rut) {
      fetchData();
    }
  }, [rut]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/lecturas?rut=${rut}`);
      const result = await response.json();
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
        nombre_alumno,
        imagen,
        registro_leido, // <-- AGREGADO AQUÍ
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
          nombre_alumno,
          imagen,
          registro_leido, // <-- AGREGADO AQUÍ
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
    if (!rut) {
      alert('Debe ingresar un RUT');
      return;
    }
    setSearchParams({ rut });
    fetchData();
  };

  const handleRowSelect = (record) => {
    setSelectedRow(record);
  };

  const handleSendToLecturaTemp = async () => {
    if (!selectedRow) {
      alert('Debe seleccionar un registro primero.');
      return;
    }
    setIsModalVisible(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedRow) return;

    const { rut, id_archivoleido } = selectedRow;

    try {
      const response = await fetch('http://localhost:3001/api/lectura-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, id_archivoleido }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Reproceso realizado con éxito');
        fetchData();
        setIsModalVisible(false);
      } else {
        alert('Error al realizar el reproceso');
      }
    } catch (error) {
      console.error('Error al enviar a lectura temp:', error);
      alert('Hubo un error al procesar la solicitud');
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
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
    { title: 'Cod Asig', dataIndex: 'cod_asig', key: 'cod_asig' },
    { title: 'Nombre Alumno', dataIndex: 'nombre_alumno', key: 'nombre_alumno' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'ID Item Resp', dataIndex: 'id_itemresp', key: 'id_itemresp' }, // <-- Asegúrate de que este campo esté en los datos
    { title: 'ID Archivo', dataIndex: 'id_archivoleido', key: 'id_archivoleido' },
    { title: 'Línea Leída', dataIndex: 'linea_leida', key: 'linea_leida' },
    {
      title: 'Reproceso',
      dataIndex: 'reproceso',
      key: 'reproceso',
      render: (value) => (value ? 'true' : 'false'),
    },    
    {
      title: 'Imagen',
      dataIndex: 'imagen',
      key: 'imagen',
      render: (nombre) => nombre || '-',
    },    
    {
      title: 'Instante Formulario',
      dataIndex: 'instante_forms_max', // o 'instante_forms' si no usas agrupación
      key: 'instante_forms_max',
      render: (text) => {
        if (!text) return '-';
        const date = new Date(text);
        const pad = (n) => n.toString().padStart(2, '0');
        const formattedDate = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
        const formattedTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return `${formattedDate}, ${formattedTime}`;
      },
    },
    { title: 'Número de Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
    { title: 'Forma', dataIndex: 'forma', key: 'forma' },
    { title: 'Grupo', dataIndex: 'grupo', key: 'grupo' },
    { title: 'Código Interno', dataIndex: 'cod_interno', key: 'cod_interno' },
    { title: 'Registro Leído', dataIndex: 'registro_leido', key: 'registro_leido' },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => window.open(`/lectura/${record.id_archivoleido}/${record.linea_leida}`, '_blank')}
        />
      ),
    },
    
  ];
  

  return (
    <div className='page-full'>
      <h1>Lecturas</h1>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder='RUT'
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          style={{ width: 200, marginRight: 8 }}
        />
        <Button type='primary' onClick={handleSearch}>Buscar</Button>
      </div>

      <Table dataSource={filteredData} columns={columns} loading={loading} rowKey='id_archivoleido' />

      <Button
        type='primary'
        onClick={handleSendToLecturaTemp}
        disabled={!selectedRow}
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
