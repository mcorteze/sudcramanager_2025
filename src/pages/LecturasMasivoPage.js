import React, { useState } from 'react';
import { Button, Upload, Table, Typography, Space, message, Statistic, Card } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios'; // ✅ Importamos axios

const { Title } = Typography;

const LecturasMasivoPage = () => {
  const [data, setData] = useState([]);

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['ID_Imagen']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Formato');
    XLSX.writeFile(wb, 'formato_lecturas.xlsx');
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (jsonData.length < 2 || jsonData[0][0] !== 'ID_Imagen') {
        message.error('Formato inválido. Asegúrate de que la celda A1 diga "ID_Imagen".');
        return;
      }

      const records = jsonData.slice(1).map((row, index) => ({
        key: index,
        id_imagen: row[0],
      }));

      setData(records);
    };
    reader.readAsArrayBuffer(file);
    return false; // evitar carga automática de archivo
  };

  const handleEnviar = async () => {
    try {
      const imagenes = data.map(record => record.id_imagen).filter(Boolean);
      const response = await axios.post('http://localhost:3001/lectura-temp-masivo', { imagenes });


      if (response.data.success) {
        message.success('Datos enviados correctamente');
      } else {
        message.error(response.data.message || 'Error al enviar los datos');
      }
    } catch (err) {
      console.error(err);
      message.error('Error de red o servidor');
    }
  };

  const columns = [
    {
      title: 'ID_Imagen',
      dataIndex: 'id_imagen',
      key: 'id_imagen',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Enviar registros de lectura a lectura-temp por lista de id_imagen</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
          Descargar formato
        </Button>
        <Upload beforeUpload={handleUpload} showUploadList={false} accept=".xlsx,.xls">
          <Button icon={<UploadOutlined />}>Importar archivo</Button>
        </Upload>
      </Space>

      {data.length > 0 && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Statistic title="Total de registros" value={data.length} />
          </Card>
          <Button type="primary" onClick={handleEnviar} disabled={data.length === 0} style={{ marginBottom: 16 }}>
            Enviar a lectura_temp
          </Button>
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
        </>
      )}
    </div>
  );
};

export default LecturasMasivoPage;
