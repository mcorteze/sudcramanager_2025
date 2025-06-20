import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table, message } from 'antd';

const columnasEsperadas = ['cod_nivel', 'nivel', 'nivel_descripcion', 'id_eval'];

const EscalaHoja = forwardRef(({ sheetData }, ref) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!sheetData || sheetData.length < 2) return;

    const headers = sheetData[0].map(h => String(h).trim());
    const dataRows = sheetData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

    const processed = dataRows.map((row, index) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? '';
      });
      return { key: index, ...obj };
    });

    setRows(processed);
  }, [sheetData]);

useImperativeHandle(ref, () => ({
  async insertarDatos() {
    if (!rows || rows.length === 0) {
      message.warning('No hay datos para insertar.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/escala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.details || `Error ${response.status}`);
      message.success('Escala cargada correctamente');
    } catch (error) {
      message.error(`Error al cargar escala: ${error.message}`);
    }
  }
}));


  const columnasTabla = columnasEsperadas.map(col => ({
    title: col,
    dataIndex: col,
    key: col
  }));

  return (
    <Table
      columns={columnasTabla}
      dataSource={rows}
      pagination={false}
      size="small"
      bordered
    />
  );
});

export default EscalaHoja;
