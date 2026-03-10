// EvalHoja.jsx
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table, message } from 'antd';

const columnMapping = {
  'id_eval': 'id_eval',
  'cod_asig': 'cod_asig',
  'ano': 'ano',
  'periodo': 'periodo',
  'num_prueba': 'num_prueba',
  'nombre_prueba': 'nombre_prueba',
  'tiene forma': 'tiene_formas',
  'retro_alum': 'retro_alum',
  'retro_doc': 'retro_doc',
  'ver_correcta': 'ver_correctas',
  'tiene_grupo': 'tiene_grupo',
  'archivo': 'archivo_tabla',
  'cargado_fecha': 'cargado_fecha',
  'exigencia': 'exigencia',
  'num_ppt': 'num_ppt',
  'tipo_eval': 'tipo',
  'ponderacion': 'ponderacion'
};

const booleanFields = [
  'tiene_formas',
  'retro_alum',
  'retro_doc',
  'ver_correctas',
  'tiene_grupo'
];

const EvalHoja = forwardRef(({ sheetData }, ref) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!sheetData || sheetData.length < 2) return;

    const rawHeaders = sheetData[0]?.slice(0, 17) || [];
    const valuesRow = sheetData[1]?.slice(0, 17) || [];

    const processed = rawHeaders.map((header, index) => {
      const rawKey = String(header).trim();
      const officialKey = columnMapping[rawKey] || rawKey;

      let valor = valuesRow[index] ?? '';
      if (booleanFields.includes(officialKey)) {
        const val = String(valor).toLowerCase().trim();
        valor = val === 'true' || val === '1' || val === 'sí' ? 'true' : 'false';
      }

      return {
        key: index,
        campo: officialKey,
        valor
      };
    });

    setRows(processed);
  }, [sheetData]);

  useImperativeHandle(ref, () => ({
    async insertarDatos() {
      const payload = {};
      rows.forEach(({ campo, valor }) => {
        payload[campo] = valor;
      });

      try {
        const response = await fetch('http://localhost:3001/api/tablas_especificaciones_eval/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.details || `Error ${response.status}`);
        message.success('Tabla cargada correctamente');
      } catch (error) {
        message.error(`Error al cargar los datos: ${error.message}`);
      }
    }
  }));

  const columnasModal = [
    { title: 'Campo', dataIndex: 'campo', key: 'campo' },
    { title: 'Valor', dataIndex: 'valor', key: 'valor' }
  ];

  return (
    <Table
      columns={columnasModal}
      dataSource={rows}
      pagination={false}
      bordered
      size="small"
    />
  );
});

export default EvalHoja;
