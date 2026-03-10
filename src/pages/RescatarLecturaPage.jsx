import React, { useState } from 'react';
import { Input, Button, Table, message } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RescatarLecturaPage = () => {
  const [rut, setRut] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    if (!rut) {
      message.warning('Por favor ingresa un RUT');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/lectura_rescatar_rut/${rut}`);
      setData(response.data);
    } catch (error) {
      console.error('Error al consultar la API:', error);
      message.error('Hubo un error al obtener los datos.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'ID Archivo Leído', dataIndex: 'id_archivoleido', key: 'id_archivoleido' },
    { title: 'Línea Leída', dataIndex: 'linea_leida', key: 'linea_leida' },
    {
      title: 'Reproceso',
      dataIndex: 'reproceso',
      key: 'reproceso',
      render: (value) => (value ? 'true' : 'false'),
    },
    { title: 'Imagen', dataIndex: 'imagen', key: 'imagen' },
    { title: 'Instante Forms', dataIndex: 'instante_forms', key: 'instante_forms' },
    {
      title: 'Lectura',
      key: 'ver_lectura',
      render: (text, record) => (
        <Link to={`/lectura/${record.id_archivoleido}/${record.linea_leida}`}>
          Ver Lectura
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Rescatar Lectura por RUT leido</h2>
      <Input
        placeholder="Ingresa el RUT"
        value={rut}
        onChange={(e) => setRut(e.target.value)}
        style={{ width: 300, marginRight: 10 }}
      />
      <Button type="primary" onClick={handleBuscar} loading={loading}>
        Buscar
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record, index) => index}
        style={{ marginTop: 24 }}
        loading={loading}
      />
    </div>
  );
};

export default RescatarLecturaPage;
