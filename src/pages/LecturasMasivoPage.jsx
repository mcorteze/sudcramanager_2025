import React, { useState } from 'react';
import {
  Button,
  Upload,
  Table,
  Typography,
  Space,
  message,
  Statistic,
  Card
} from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';
import FiltroLecturasDrawer from '../components/Reprocesar/FiltroLecturasDrawer';

const { Title } = Typography;


const LecturasMasivoPage = () => {
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState(null);

  const { Link } = Typography;

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
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      });

      if (
        jsonData.length < 2 ||
        jsonData[0][0] !== 'ID_Imagen'
      ) {
        message.error(
          'Formato inválido. Asegúrate de que la celda A1 diga "ID_Imagen".'
        );
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
      const imagenes = data
        .map((record) => record.id_imagen)
        .filter(Boolean);
      const response = await axios.post(
        'http://localhost:3001/lectura-temp-masivo',
        { imagenes }
      );

      if (response.data.success) {
        message.success('Datos enviados correctamente');
      } else {
        message.error(
          response.data.message || 'Error al enviar los datos'
        );
      }
    } catch (err) {
      console.error(err);
      message.error('Error de red o servidor');
    }
  };

  const handleSeleccion = (filtros) => {
    setFiltrosSeleccionados(filtros);
    console.log('Filtros aplicados:', filtros);
    // Aquí puedes filtrar los datos, llamar a otro endpoint, etc.
  };

  const columns = [
    {
      title: 'ID_Imagen',
      dataIndex: 'id_imagen',
      key: 'id_imagen',
    },
  ];

  return (
    <div className='page-full'>
      <h1>Buscar listado de imágenes a reprocesar</h1>

      <div style = {{ display: 'flex', flexDirection: 'column'}} >
        <div style = {{ display: 'flex', flexDirection: 'column', marginBottom: '20px', border: '1px solid rgb(190, 190, 190)', padding: '16px', borderRadius: '8px', width: '400px' }}>
          <h2>Extraer listado de imágenes por sigla</h2>
          <Button
            style = {{ width: '200px' }}
            type="default"
            onClick={() => setDrawerOpen(true)}
          >
            Buscar
          </Button>
        </div>
        <div style = {{ display: 'flex', flexDirection: 'column', marginBottom: '20px', border: '1px solid rgb(190, 190, 190)', padding: '16px', borderRadius: '8px', width: '400px' }}>
          <h2>Extraer listado de imágenes de sección por ID Upload</h2>
            <Link href="/imagenes" target="_blank" rel="noopener noreferrer" >
              Descargar desde Seguimiento de imágenes
            </Link>
        </div>
        <div style = {{ display: 'flex', flexDirection: 'column', border: '1px solid rgb(190, 190, 190)', padding: '16px', borderRadius: '8px', width: '400px' }}>
          <h2>Reprocesar con listado de Imágenes</h2>
            <div style = {{ display: 'flex', flexDirection: 'row', gap: '10px'}}>
              <Button
                style = {{ width: '200px' }}
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                Descargar formato
              </Button>

              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept=".xlsx,.xls"
              >
                <Button style = {{ width: '200px' }} icon={<UploadOutlined />}>
                  Importar archivo
                </Button>
              </Upload>
            </div>
        </div>
      </div>

      <Space style={{ marginBottom: 16 }}>
        
      </Space>

      <Space style={{ marginBottom: 16 }}>
        
      </Space>

      <FiltroLecturasDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSeleccion={handleSeleccion}
      />

      {data.length > 0 && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Total de registros"
              value={data.length}
            />
          </Card>

          <Button
            type="primary"
            onClick={handleEnviar}
            disabled={data.length === 0}
            style={{ marginBottom: 16 }}
          >
            Enviar a lectura_temp
          </Button>

          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
          />
        </>
      )}
    </div>
  );
};

export default LecturasMasivoPage;
