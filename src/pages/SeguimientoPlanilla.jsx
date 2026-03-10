import React, { useState } from 'react';
import { Input, Button, Table, message, Drawer, Spin, Form } from 'antd';
import axios from 'axios';

const { Search } = Input;

const SeguimientoPlanilla = () => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  // Columnas tabla
  const columns = [
    {
      title: 'ID Lectura',
      dataIndex: 'id_lectura',
      key: 'id_lectura',
    },
    {
      title: 'RUT',
      dataIndex: 'rut',
      key: 'rut',
    },
    {
      title: 'ID Archivo Leído',
      dataIndex: 'id_archivoleido',
      key: 'id_archivoleido',
    },
    {
      title: 'Línea Leída',
      dataIndex: 'linea_leida',
      key: 'linea_leida',
    },
    {
      title: 'Instante Forms',
      dataIndex: 'instante_forms',
      key: 'instante_forms',
    },
    {
      title: 'Tiene Logro',
      dataIndex: 'tiene_logro',
      key: 'tiene_logro',
      render: (val) => (val === 'Sí' ? '✅ Sí' : '❌ No'),
    },
    {
      title: 'Ver Lectura',
      key: 'ver_lectura',
      render: (_, record) => (
        <a
          href={`/lectura/${record.id_archivoleido}/${record.linea_leida}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir
        </a>
      ),
    },
    {
      title: 'Calificación',
      key: 'calificacion',
      render: (_, record) => (
        <a
          onClick={() => handleOpenDrawer(record)}
          style={{ cursor: 'pointer', color: '#1677ff' }}
        >
          Ver Calificaciones
        </a>
      ),
    },
  ];

  // Buscar registros
  const handleSearch = async () => {
    if (!search) {
      message.warning('Ingrese un término de búsqueda');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:3001/api/archivosleidosconcalificacion',
        { params: { search } }
      );
      setData(response.data);
    } catch (error) {
      console.error(error);
      message.error('Error al buscar los datos.');
    } finally {
      setLoading(false);
    }
  };

  // Abrir Drawer calificaciones
  const handleOpenDrawer = async (record) => {
    setSelectedRow(record);
    setDrawerVisible(true);
    setDrawerLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:3001/api/planilla-calificaciones-matricula',
        {
          params: {
            id_archivoleido: record.id_archivoleido,
            matricula: record.rut,
          },
        }
      );
      setDrawerData(response.data);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar calificaciones.');
    } finally {
      setDrawerLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Búsqueda de planillas leídas</h2>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <Search
          placeholder="Ingrese parte del nombre del archivo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          enterButton="Buscar"
          loading={loading}
        />

        {/* Botón Archivo Leído */}
        {data.length > 0 && (
          <Button
            type="primary"
            onClick={() =>
              (window.location.href = `/buscar_archivo_leido/${data[0].id_archivoleido}`)
            }
          >
            Archivo leído
          </Button>
        )}
      </div>

      {/* Cantidad de registros */}
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Total de registros: {data.length}
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id_lectura"
        loading={loading}
        bordered
      />

      {/* Drawer calificaciones */}
      <Drawer
        title={`Calificaciones - Archivo ${selectedRow?.id_archivoleido}`}
        placement="right"
        width={480}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {drawerLoading ? (
          <Spin />
        ) : (
          drawerData.map((item) => (
            <div key={item.id_matricula_eval} style={{ marginBottom: '20px' }}>
              <h3>📌 Datos Matrícula</h3>
              <Form layout="vertical">
                <Form.Item label="ID Matrícula Eval">
                  <Input value={item.id_matricula_eval} readOnly />
                </Form.Item>
                <Form.Item label="ID Matrícula">
                  <Input value={item.id_matricula} readOnly />
                </Form.Item>
                <Form.Item label="ID Eval">
                  <Input value={item.id_eval} readOnly />
                </Form.Item>
                <Form.Item label="Forma">
                  <Input value={item.forma} readOnly />
                </Form.Item>
                <Form.Item label="Grupo">
                  <Input value={item.grupo} readOnly />
                </Form.Item>
              </Form>

              <h3>📊 Datos Calificación</h3>
              <Form layout="vertical">
                <Form.Item label="Puntaje Total Obtenido">
                  <Input value={item.puntaje_total_obtenido} readOnly />
                </Form.Item>
                <Form.Item label="Logro Obtenido">
                  <Input value={item.logro_obtenido} readOnly />
                </Form.Item>
                <Form.Item label="Número de Prueba">
                  <Input value={item.num_prueba} readOnly />
                </Form.Item>
                <Form.Item label="Informe Listo">
                  <Input value={item.informe_listo ? 'Sí' : 'No'} readOnly />
                </Form.Item>
              </Form>
            </div>
          ))
        )}
      </Drawer>
    </div>
  );
};

export default SeguimientoPlanilla;
