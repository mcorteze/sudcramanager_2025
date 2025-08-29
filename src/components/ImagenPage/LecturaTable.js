import React from 'react';
import { Table } from 'antd';
import { PiDotOutlineFill } from "react-icons/pi";

const LecturaTable = ({ lecturaData, loading }) => {
  const lecturaColumns = [
    { title: 'Imagen', dataIndex: 'imagen', key: 'imagen' },
    { title: 'Instante Forms', dataIndex: 'instante_forms', key: 'instante_forms' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'ID_MATRICULA_EVAL', dataIndex: 'id_matricula_eval', key: 'id_matricula_eval' },
    { title: 'LOGRO OBTENIDO', dataIndex: 'logro_obtenido', key: 'logro_obtenido' },
    { title: 'Num Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
    { title: 'Reproceso', dataIndex: 'reproceso', key: 'reproceso', render: (text) => text ? 'Sí' : 'No' },
  ];

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
      <h2>Tabla Lectura (líneas txt exportadas por Forms) cruzadas (left join) con calificaciones</h2>
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
    </div>
  );
};

export default LecturaTable;
