import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table, message } from 'antd';

const columnasEsperadas = [
  'id_item',
  'forma',
  'item_num',
  'item_nombre',
  'item_orden',
  'item_tipo',
  'id_eval',
  'item_puntaje',
  'correccion'
];

const ItemRespuestaHoja = forwardRef(({ evalSheetData, itemSheetData }, ref) => {
  const [rows, setRows] = useState([]);
  const [generadas, setGeneradas] = useState([]);

  useEffect(() => {
    if (!itemSheetData || itemSheetData.length < 2) return;

    const headers = itemSheetData[0].map(h => String(h).trim());
    const dataRows = itemSheetData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

    const processed = dataRows.map((row, index) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? '';
      });
      return { key: index, ...obj };
    });

    setRows(processed);
  }, [itemSheetData]);

  useImperativeHandle(ref, () => ({
    async insertarDatos() {
      try {
        // Validar que evalSheetData tiene datos
        if (!evalSheetData || evalSheetData.length < 2) {
          throw new Error('Datos de evaluación insuficientes.');
        }

        // Obtener cod_asig y num_prueba desde evalSheetData
        const evalHeaders = evalSheetData[0].map(h => String(h).trim());
        const evalRow = evalSheetData[1];
        const headerIndex = (header) => evalHeaders.indexOf(header);

        const cod_asig = evalRow[headerIndex('cod_asig')];
        const prueba = evalRow[headerIndex('num_prueba')];

        if (!cod_asig || !prueba) {
          throw new Error('No se encontraron los campos cod_asig o prueba en evalSheetData.');
        }

        // Obtener cod_interno desde el backend
        const codResponse = await fetch(`http://localhost:3001/api/asignaturas/${cod_asig}`);
        const codData = await codResponse.json();
        if (!codResponse.ok) throw new Error('Código interno no encontrado');
        const codInterno = codData.cod_interno;

        // Generación de item_respuesta
        const resultado = [];
        let count = 0;

        for (const row of rows) {
          const tipo = row.item_tipo;
          const anoperiodo = String(row.id_item).substring(0, 7);
          const forma = String(row.forma).padStart(2, '0');
          const orden = String(row.item_orden).padStart(3, '0');
          const baseId = anoperiodo + codInterno + String(prueba).padStart(2, '0') + forma + orden;

          if (tipo === 'SM') {
            for (let i = 0; i < 6; i++) {
              let puntaje = 0;
              const correccion = row.correccion?.trim();
              const letras = ['A', 'B', 'C', 'D', 'E'];
              if (i >= 1 && correccion === letras[i - 1]) puntaje = 1;

              resultado.push({
                key: count++,
                id_itemresp: baseId + i,
                id_item: row.id_item,
                registro: i,
                puntaje_asignado: puntaje
              });
            }

          } else if (tipo === 'RU') {
            const partes = row.correccion?.replace(',', '.').split(';') || [];
            for (let i = 0; i <= partes.length; i++) {
              const puntaje = i === 0 ? 0 : parseFloat(partes[i - 1]) || 0;
              resultado.push({
                key: count++,
                id_itemresp: baseId + i,
                id_item: row.id_item,
                registro: i,
                puntaje_asignado: puntaje
              });
            }

          } else if (tipo === 'DE') {
            resultado.push({
              key: count++,
              id_itemresp: baseId,
              id_item: row.id_item,
              registro: 0,
              puntaje_asignado: row.correccion
            });
          }
        }

        setGeneradas(resultado);

        // Enviar al backend
        const response = await fetch('http://localhost:3001/api/itemrespuesta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resultado)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.details || `Error ${response.status}`);
        message.success('Items cargados correctamente');

      } catch (error) {
        console.error(error);
        message.error(`Error al cargar items: ${error.message}`);
      }
    }
  }));

  const columnasTabla = [
    { title: 'id_itemresp', dataIndex: 'id_itemresp', key: 'id_itemresp' },
    { title: 'id_item', dataIndex: 'id_item', key: 'id_item' },
    { title: 'registro', dataIndex: 'registro', key: 'registro' },
    { title: 'puntaje_asignado', dataIndex: 'puntaje_asignado', key: 'puntaje_asignado' }
  ];

  return (
    <Table
      columns={columnasTabla}
      dataSource={generadas}
      pagination={false}
      size="small"
      bordered
    />
  );
});

export default ItemRespuestaHoja;
