import React from 'react';
import { Table } from 'antd';
import { PiDotOutlineFill } from "react-icons/pi";

const ErroresTable = ({ erroresData, loading }) => {
  const erroresColumns = [
    { title: 'ID Error', dataIndex: 'id_error', key: 'id_error' },
    { title: 'ID Archivo Leído', dataIndex: 'id_archivoleido', key: 'id_archivoleido' },
    { title: 'RUT', dataIndex: 'rut', key: 'rut' },
    { title: 'Imagen', dataIndex: 'imagen', key: 'imagen' },
    { title: 'Valida RUT', dataIndex: 'valida_rut', key: 'valida_rut', render: (text) => text ? 'Sí' : 'No' },
    { title: 'Valida Matrícula', dataIndex: 'valida_matricula', key: 'valida_matricula', render: (text) => text ? 'Sí' : 'No' },
    { title: 'Valida Inscripción', dataIndex: 'valida_inscripcion', key: 'valida_inscripcion', render: (text) => text ? 'Sí' : 'No' },
    { title: 'Valida Eval', dataIndex: 'valida_eval', key: 'valida_eval', render: (text) => text ? 'Sí' : 'No' },
    { title: 'Valida Forma', dataIndex: 'valida_forma', key: 'valida_forma', render: (text) => text ? 'Sí' : 'No' },
  ];

  // Conteo de imágenes únicas y duplicadas
  const totalRegistros = erroresData?.length || 0;
  const imagenSet = new Set(erroresData?.map(item => item.imagen));
  const cantidadUnicas = imagenSet.size;
  const cantidadDuplicados = totalRegistros - cantidadUnicas;

  return (
    <div>
      <h2>Registros en tabla Errores</h2>
      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span>🧾 Total de registros: {totalRegistros}</span>
        <PiDotOutlineFill />
        <span style = {{ fontWeight:'600' }}>🖼️ Imágenes únicas: {cantidadUnicas}</span>
        <PiDotOutlineFill />
        <span>♻️ Duplicados: {cantidadDuplicados}</span>
      </p>
      <Table
        className='buscar-seccion-table1'
        columns={erroresColumns}
        dataSource={erroresData}
        loading={loading}
        rowKey="id_error"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ErroresTable;
