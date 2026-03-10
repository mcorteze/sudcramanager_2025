import React, { useState } from 'react';
import { Upload, Button, Table, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const PlanillasAnalizaPage = () => {
  const [data, setData] = useState([]);

  const columns = [
    { title: 'ID', dataIndex: 'ID', key: 'ID' },
    { title: 'Título', dataIndex: 'Título', key: 'Título' },
    { title: 'Creado', dataIndex: 'Creado', key: 'Creado' },
    { title: 'Programa', dataIndex: 'Programa', key: 'Programa' },
    { title: 'Sigla', dataIndex: 'Sigla', key: 'Sigla' },
    { title: 'Sección', dataIndex: 'seccion', key: 'seccion' },
    { title: 'Sede', dataIndex: 'sede', key: 'sede' },
    { title: 'Jornada', dataIndex: 'Jornada', key: 'Jornada' },
    { title: 'Remite', dataIndex: 'remite', key: 'remite' },
    { title: 'Archivo', dataIndex: 'archivo', key: 'archivo' },
    { title: 'urlarchivo', dataIndex: 'urlarchivo', key: 'urlarchivo' },
    {
      title: 'URL',
      dataIndex: 'URL',
      key: 'URL',
      render: (val) =>
        val ? (
          <a href={val} target="_blank" rel="noopener noreferrer">
            {val}
          </a>
        ) : null,
    },
    { title: 'URL_TEXT', dataIndex: 'URL_TEXT', key: 'URL_TEXT' },
    { title: 'num_eval', dataIndex: 'num_eval', key: 'num_eval' },
  ];

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        setData(jsonData);
        message.success('Archivo cargado correctamente');
      } catch (err) {
        console.error(err);
        message.error('Error al procesar el archivo');
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // evita upload automático
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📑 Analizador de Planillas</h2>

      <Upload beforeUpload={handleFileUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Cargar archivo .xlsx</Button>
      </Upload>

      <div style={{ marginTop: '20px' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record, idx) => idx}
          bordered
          pagination={false}          // 🚫 sin paginación
          scroll={{ x: 'max-content' }} // ✅ scroll horizontal
        />
      </div>
    </div>
  );
};

export default PlanillasAnalizaPage;
