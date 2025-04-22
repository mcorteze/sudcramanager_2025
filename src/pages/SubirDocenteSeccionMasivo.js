import React, { useState, useEffect } from 'react';
import { Upload, Button, Table, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom'; // Importamos Link de react-router-dom

export default function ExcelUploader() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [firstIdSeccion, setFirstIdSeccion] = useState(null);
  const [seccionInfo, setSeccionInfo] = useState({ seccion: 'Cargando...', nombre_sede: 'Cargando...' });
  const [rutDocente, setRutDocente] = useState(null);
  const [docenteInfo, setDocenteInfo] = useState({ docente: 'Cargando...', mail_doc: 'Cargando...' });
  const [selectedRow, setSelectedRow] = useState(null); // Para almacenar el id_seccion seleccionado

  // Función para consumir el endpoint de la sección
  const fetchSeccionInfo = async (idSeccion) => {
    try {
      const response = await fetch(`http://localhost:3001/api/completar_seccion/${idSeccion}`);
      const data = await response.json();

      if (data.seccion !== 's.i.') {
        setSeccionInfo(data);
      } else {
        setSeccionInfo({ seccion: 'No disponible', nombre_sede: 'No disponible' });
      }
    } catch (error) {
      console.error('Error al obtener los datos de la sección:', error);
      setSeccionInfo({ seccion: 'Error', nombre_sede: 'Error' });
    }
  };

  // Función para consumir el endpoint del docente
  const fetchDocenteInfo = async (rutDocente) => {
    try {
      const response = await fetch(`http://localhost:3001/api/completar_docente/${rutDocente}`);
      const data = await response.json();

      if (data.docente !== 's.i.') {
        setDocenteInfo(data);
      } else {
        setDocenteInfo({ docente: 'No disponible', mail_doc: 'No disponible' });
      }
    } catch (error) {
      console.error('Error al obtener los datos del docente:', error);
      setDocenteInfo({ docente: 'Error', mail_doc: 'Error' });
    }
  };

  // Función para manejar la carga del archivo Excel
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        message.error('El archivo está vacío o no es válido');
        return;
      }

      const headers = jsonData[0];
      const rows = jsonData.slice(1).map((row, index) => {
        const rowData = {};
        headers.forEach((header, i) => {
          rowData[header] = row[i];
        });
        return { key: index, ...rowData };
      });

      setColumns(headers.map(header => ({
        title: header,
        dataIndex: header,
        key: header,
      })));
      setData(rows);
    };
    reader.readAsArrayBuffer(file);
    return false; // evita el upload real
  };

  // Función para manejar la selección de fila
  const handleRowSelect = (row) => {
    setSelectedRow(row);

    // Llamar al endpoint para completar la información de la sección
    if (row.id_seccion) {
      fetchSeccionInfo(row.id_seccion);
    }

    // Llamar al endpoint para obtener los datos del docente
    if (row.rut_docente) {
      fetchDocenteInfo(row.rut_docente);
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      if (selectedRows.length > 0) {
        handleRowSelect(selectedRows[0]); // Seleccionamos el primer registro de la lista seleccionada
      }
    },
    type: 'radio', // Tipo de selección será por Radio Button
    selectedRowKeys: selectedRow ? [selectedRow.key] : [], // Establecer la fila seleccionada
  };

  // Añadimos una columna para mostrar el enlace de 'Rut Docente'
  const modifiedColumns = columns.map(col => {
    if (col.dataIndex === 'rut_docente') {
      return {
        ...col,
        render: (text) => (
          <a href={`/carga-docente/${text}`} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ),
      };
    }
    return col;
  });

  return (
    <div>
      <h2>Subir archivo Excel</h2>
      <Upload
        beforeUpload={handleFileUpload}
        accept=".xlsx, .xls"
        showUploadList={false}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Seleccionar archivo Excel</Button>
      </Upload>

      {selectedRow && (
        <div style={{ marginTop: 20 }}>
          <h3>Primer id_seccion: {selectedRow.id_seccion}</h3>
          <p><strong>Sección:</strong> {seccionInfo.seccion}</p>
          <p><strong>Sede:</strong> {seccionInfo.nombre_sede}</p>
          <p><strong>Rut Docente:</strong> {selectedRow.rut_docente || 'No disponible'}</p>
          <p><strong>Docente:</strong> {docenteInfo.docente}</p>
          <p><strong>Correo Docente:</strong> {docenteInfo.mail_doc}</p>
        </div>
      )}

      {data.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Datos cargados</h3>
          <Table
            dataSource={data}
            columns={modifiedColumns}  // Usamos las columnas modificadas
            pagination={{ pageSize: 10 }}
            rowSelection={rowSelection} // Agregamos la configuración de selección de filas
          />
        </div>
      )}
    </div>
  );
}
