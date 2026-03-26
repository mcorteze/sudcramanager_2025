import React, { useState } from 'react';
import {
  Button,
  Upload,
  Table,
  Typography,
  Space,
  message,
  Statistic,
  Card,
  Tag,
} from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';
import FiltroLecturasDrawer from '../components/Reprocesar/FiltroLecturasDrawer';

const { Title } = Typography;


const LecturasMasivoPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState(null);
  const [verificando, setVerificando] = useState(false);

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
        messageApi.error(
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
    const imagenes = data.map((record) => record.id_imagen).filter(Boolean);
    if (imagenes.length === 0) {
      messageApi.warning('No hay imágenes para enviar.');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:3001/lectura-temp-masivo',
        { imagenes }
      );
      const { insertadas, enviadas } = response.data;
      console.log('Respuesta backend:', response.data);
      if (insertadas === 0) {
        messageApi.warning(`Se enviaron ${enviadas} IDs pero ninguno coincidió con registros en la tabla lectura. Verifique los IDs del archivo.`);
      } else {
        messageApi.success(`Se insertaron ${insertadas} de ${enviadas} registros en lectura_temp correctamente.`);
      }
    } catch (err) {
      console.error('Error al enviar:', err);
      const msg = err.response?.data?.message || 'Error de red o servidor';
      messageApi.error(msg);
    }
  };

  const handleVerificar = async () => {
    const imagenes = data.map((r) => r.id_imagen).filter(Boolean);
    if (imagenes.length === 0) return;
    setVerificando(true);
    try {
      const res = await axios.post('http://localhost:3001/api/verificar-imagenes-lectura', { imagenes });
      const encontradas = new Set(res.data.encontradas);
      if (encontradas.size === 0) {
        messageApi.warning('Ninguna imagen del listado está en la tabla lectura.');
      } else {
        messageApi.success(`${encontradas.size} de ${imagenes.length} imágenes encontradas en lectura.`);
      }
      setData(prev => prev.map(r => ({
        ...r,
        en_lectura: encontradas.has(r.id_imagen),
      })));
    } catch (err) {
      messageApi.error('Error al verificar imágenes.');
    } finally {
      setVerificando(false);
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
    {
      title: 'En tabla lectura',
      dataIndex: 'en_lectura',
      key: 'en_lectura',
      render: (val) => {
        if (val === undefined) return null;
        return val
          ? <Tag icon={<CheckCircleOutlined />} color="success">Encontrada</Tag>
          : <Tag icon={<CloseCircleOutlined />} color="error">No encontrada</Tag>;
      },
    },
  ];

  return (
    <div className='page-full'>
      {contextHolder}
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

          <Space style={{ marginBottom: 16 }}>
            <Button
              icon={<SearchOutlined />}
              onClick={handleVerificar}
              loading={verificando}
            >
              Verificar en lectura
            </Button>
            <Button
              type="primary"
              onClick={handleEnviar}
              disabled={data.length === 0}
            >
              Enviar a lectura_temp
            </Button>
          </Space>

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
