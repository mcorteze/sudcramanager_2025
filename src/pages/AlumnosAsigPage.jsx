import React, { useMemo, useState } from 'react';
import { Table, Input, Button, Card, Space, Typography, Divider, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Search } = Input;

const AlumnosAsigPage = () => {
  const [codAsig, setCodAsig] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ultimoCodBuscado, setUltimoCodBuscado] = useState('');

  const limpiarSigla = (v) => (v || '').trim().toUpperCase();

  const fetchAlumnos = async (sigla) => {
    const cod = limpiarSigla(sigla || codAsig);
    if (!cod) {
      message.warning('Ingresa una sigla de asignatura (ej: MAT2121)');
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:3001/api/alumnosporasig', {
        params: { cod_asig: cod },
      });
      setAlumnos(Array.isArray(data) ? data : []);
      setUltimoCodBuscado(cod);
    } catch (err) {
      console.error(err);
      message.error('No fue posible obtener los alumnos.');
      setAlumnos([]);
    } finally {
      setLoading(false);
    }
  };

  const recuentoPorSede = useMemo(() => {
    const map = new Map();
    for (const row of alumnos) {
      const sede = row?.nombre_sede || '—';
      map.set(sede, (map.get(sede) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([nombre_sede, cantidad]) => ({ nombre_sede, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad || a.nombre_sede.localeCompare(b.nombre_sede));
  }, [alumnos]);

  const handleDownload = () => {
    if (!alumnos.length) {
      message.info('No hay datos para descargar.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(alumnos, {
      header: ['nombre_sede', 'seccion', 'rut', 'apellidos', 'nombres', 'user_alum'],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'alumnos');
    const filename = `alumnos_${ultimoCodBuscado || 'asig'}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

    const columns = [
    { title: 'Sede', dataIndex: 'nombre_sede', key: 'nombre_sede' },
    { title: 'Sección', dataIndex: 'seccion', key: 'seccion' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'Apellidos', dataIndex: 'apellidos', key: 'apellidos' },
    { title: 'Nombres', dataIndex: 'nombres', key: 'nombres' },
    { title: 'Usuario', dataIndex: 'user_alum', key: 'user_alum' },
    { title: 'Código Plan', dataIndex: 'cod_plan', key: 'cod_plan' },
    { title: 'Nombre Plan', dataIndex: 'nombre_plan', key: 'nombre_plan' },
    { title: 'Código Carrera', dataIndex: 'cod_carrera', key: 'cod_carrera' },
    { title: 'Carrera', dataIndex: 'nombre_carrera', key: 'nombre_carrera' },
    { title: 'Escuela', dataIndex: 'escuela', key: 'escuela' },
    ];

  const columnsRecuento = [
    { title: 'Sede', dataIndex: 'nombre_sede', key: 'nombre_sede' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
  ];

  return (
    <div className="page-full">
      <Title level={2} style={{ marginBottom: 16 }}>Alumnos por asignatura</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space wrap>
            <Search
              value={codAsig}
              onChange={(e) => setCodAsig(e.target.value)}
              onSearch={fetchAlumnos}
              placeholder="Sigla (ej: MAT2121)"
              allowClear
              enterButton={<><SearchOutlined /> Buscar</>}
              style={{ width: 320 }}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!alumnos.length}
            >
              Descargar .xlsx
            </Button>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          <Text>
            {ultimoCodBuscado
              ? <>Resultados para <b>{ultimoCodBuscado}</b>: <b>{alumnos.length}</b> registro(s)</>
              : <>Sin búsqueda realizada.</>}
          </Text>
        </Space>
      </Card>

      <Space align="start" size="large" style={{ width: '100%' }} wrap>
        <Card title="Recuento por sede" style={{ flex: '0 0 320px' }}>
          <Table
            size="small"
            pagination={false}
            rowKey={(r) => r.nombre_sede}
            dataSource={recuentoPorSede}
            columns={columnsRecuento}
          />
        </Card>

        <Card title="Listado de alumnos" style={{ flex: 1, minWidth: 360 }}>
          <Table
            dataSource={alumnos}
            columns={columns}
            loading={loading}
            rowKey={(record) => `${record.rut}-${record.seccion}-${record.nombre_sede}`}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default AlumnosAsigPage;
