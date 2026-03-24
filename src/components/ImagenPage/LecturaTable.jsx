import React, { useState } from 'react';
import { Table, Button, Drawer, Tag } from 'antd';
import { PiDotOutlineFill } from "react-icons/pi";
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const LecturaTable = ({ lecturaData, loading }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [rutStatusData, setRutStatusData] = useState([]);
  const [loadingDrawer, setLoadingDrawer] = useState(false);
  const [selectedAsig, setSelectedAsig] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);

  // Generar siglas únicas para las asignaturas
  const uniqueCodAsig = [...new Set(rutStatusData.map(item => item.cod_asig))].filter(Boolean).sort();

  // Generar secciones únicas basadas en la asignatura seleccionada
  const uniqueSecciones = selectedAsig
    ? [...new Set(rutStatusData.filter(item => item.cod_asig === selectedAsig).map(item => item.seccion))].filter(Boolean).sort()
    : [];

  const filteredRutStatusData = rutStatusData.filter(item => {
    const matchAsig = selectedAsig ? item.cod_asig === selectedAsig : true;
    const matchSeccion = selectedSeccion ? item.seccion === selectedSeccion : true;
    return matchAsig && matchSeccion;
  });

  const lecturaColumns = [
    { title: 'Imagen', dataIndex: 'imagen', key: 'imagen' },
    { title: 'Instante Forms', dataIndex: 'instante_forms', key: 'instante_forms' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'ID_MATRICULA_EVAL', dataIndex: 'id_matricula_eval', key: 'id_matricula_eval' },
    { title: 'LOGRO OBTENIDO', dataIndex: 'logro_obtenido', key: 'logro_obtenido' },
    { title: 'Num Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
    { title: 'Reproceso', dataIndex: 'reproceso', key: 'reproceso', render: (text) => text ? 'Sí' : 'No' },
  ];

  const drawerColumns = [
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'Apellidos', dataIndex: 'apellidos', key: 'apellidos' },
    { title: 'Nombres', dataIndex: 'nombres', key: 'nombres' },
    { title: 'Sede', dataIndex: 'nombre_sede', key: 'nombre_sede' },
    { 
      title: 'Asignatura', 
      dataIndex: 'cod_asig', 
      key: 'cod_asig',
      render: (cod) => <Tag color="blue">{cod}</Tag>
    },
    { title: 'ID Sección', dataIndex: 'id_seccion', key: 'id_seccion' },
    { title: 'Sección', dataIndex: 'seccion', key: 'seccion' },
  ];

  const handleOpenDrawer = async () => {
    const uniqueRuts = [...new Set(lecturaData?.map(item => item.rut).filter(Boolean))];
    if (uniqueRuts.length === 0) return;

    setDrawerVisible(true);
    setLoadingDrawer(true);
    setSelectedAsig(null);
    setSelectedSeccion(null);
    try {
      const response = await axios.post('http://localhost:3001/api/estado_ruts', { ruts: uniqueRuts });
      setRutStatusData(response.data);
    } catch (error) {
      console.error('Error fetching RUT status:', error);
    } finally {
      setLoadingDrawer(false);
    }
  };

  const totalRegistros = lecturaData?.length || 0;

  // Set para contar imágenes únicas
  const imagenSet = new Set(lecturaData?.map(item => item.imagen));
  const cantidadUnicas = imagenSet.size;
  const cantidadDuplicados = totalRegistros - cantidadUnicas;

  // Filtrar imágenes con calificación (logro_obtenido no vacío)
  const imagenesConCalificacion = new Set(
    lecturaData?.filter(item => item.logro_obtenido).map(item => item.imagen)
  );
  const cantidadConCalificacion = imagenesConCalificacion.size;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tabla Lectura (líneas txt exportadas por Forms) cruzadas (left join) con calificaciones</h2>
        <Button 
          type="primary" 
          icon={<UserOutlined />} 
          onClick={handleOpenDrawer}
          disabled={!lecturaData || lecturaData.length === 0}
        >
          estado de rut's
        </Button>
      </div>
      
      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span>🧾 Total de registros: {totalRegistros}</span>
        <PiDotOutlineFill />
        <span style={{ fontWeight: '600' }}>🖼️ Imágenes únicas: {cantidadUnicas}</span>
        <PiDotOutlineFill />
        <span>♻️ Duplicados: {cantidadDuplicados}</span>
        <PiDotOutlineFill />
        <span>🏆 Imágenes con calificación: {cantidadConCalificacion}</span>
      </p>
      <Table
        className='buscar-seccion-table1'
        columns={lecturaColumns}
        dataSource={lecturaData}
        loading={loading}
        rowKey="id_lectura"
      />

      <Drawer
        title="Estado de RUTs (Consulta Alumnos/Secciones)"
        placement="right"
        width={1000}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {/* Botones de segmentación tipo Excel */}
        <div style={{ marginBottom: 20, padding: '12px', background: '#f0f2f5', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
          
          {/* Nivel 1: Asignatura */}
          <div style={{ marginBottom: uniqueCodAsig.length > 0 ? 16 : 0 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: '11px', color: '#1890ff', textTransform: 'uppercase' }}>
              1. Filtrar por Asignatura:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tag.CheckableTag
                checked={!selectedAsig}
                onChange={() => {
                  setSelectedAsig(null);
                  setSelectedSeccion(null);
                }}
                style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
              >
                TODAS LAS ASIGNATURAS
              </Tag.CheckableTag>
              {uniqueCodAsig.map(asig => (
                <Tag.CheckableTag
                  key={asig}
                  checked={selectedAsig === asig}
                  onChange={(checked) => {
                    setSelectedAsig(checked ? asig : null);
                    setSelectedSeccion(null);
                  }}
                  style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
                >
                  {asig}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>

          {/* Nivel 2: Sección (Aparece solo si hay asignatura seleccionada) */}
          {selectedAsig && uniqueSecciones.length > 0 && (
            <div style={{ paddingTop: 12, borderTop: '1px dashed #d9d9d9' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: '11px', color: '#52c41a', textTransform: 'uppercase' }}>
                2. Filtrar por Sección en {selectedAsig}:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Tag.CheckableTag
                  checked={!selectedSeccion}
                  onChange={() => setSelectedSeccion(null)}
                  style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
                >
                  TODAS LAS SECCIONES
                </Tag.CheckableTag>
                {uniqueSecciones.map(seccion => (
                  <Tag.CheckableTag
                    key={seccion}
                    checked={selectedSeccion === seccion}
                    onChange={(checked) => setSelectedSeccion(checked ? seccion : null)}
                    style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
                  >
                    {seccion}
                  </Tag.CheckableTag>
                ))}
              </div>
            </div>
          )}
        </div>

        <Table
          columns={drawerColumns}
          dataSource={filteredRutStatusData}
          loading={loadingDrawer}
          rowKey={(record, index) => `${record.rut}-${record.id_seccion}-${index}`}
          pagination={{ pageSize: 20 }}
          size="small"
          bordered
        />
      </Drawer>
    </div>
  );
};


export default LecturaTable;

