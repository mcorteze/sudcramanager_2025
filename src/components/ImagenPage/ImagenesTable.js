import React, { useState } from 'react';
import { Table, Modal, Button, notification, Typography, Tag } from 'antd';
import { CopyOutlined, DownloadOutlined, EyeOutlined, ArrowsAltOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import { PiDotOutlineFill } from "react-icons/pi";
import * as XLSX from 'xlsx';

const ImagenesTable = ({ imagenesData, loading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMaxHeightFull, setIsMaxHeightFull] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // NUEVOS estados
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);

  const { Link } = Typography;

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalVisible(true);
    setRotation(0); // Reinicia rotación al abrir
    setFlipH(false);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setRotation(0);
      setFlipH(false);
    }
  };

  const nextImage = () => {
    if (currentImageIndex < imagenesData.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setRotation(0);
      setFlipH(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => notification.success({
        message: 'URL Copiada',
        description: 'La URL de la imagen ha sido copiada al portapapeles.',
      }))
      .catch(() => notification.error({
        message: 'Error al copiar',
        description: 'Hubo un error al intentar copiar la URL.',
      }));
  };

  const downloadImage = (url) => {
    window.open(url, '_blank');
  };

  const toggleImageSize = () => {
    setIsMaxHeightFull(prev => !prev);
  };

  const rotateImage = () => {
    setRotation((prev) => prev + 90);
  };

  const flipImageHorizontal = () => {
    setFlipH((prev) => !prev);
  };

  const getAbsoluteIndex = (index) => {
    return (currentPage - 1) * 10 + index;
  };

  const totalRegistros = imagenesData?.length || 0;
  const imagenSet = new Set(imagenesData?.map(item => item.imagen));
  const cantidadUnicas = imagenSet.size;
  const cantidadDuplicados = totalRegistros - cantidadUnicas;

  const imagenesColumns = [
    { title: 'ID Sección', dataIndex: 'id_seccion', key: 'id_seccion' },
    { title: 'ID Lista', dataIndex: 'id_lista', key: 'id_lista' },
    { title: 'ID Imagen', dataIndex: 'id_imagen', key: 'id_imagen' },
    {
      title: 'Imagen',
      dataIndex: 'imagen',
      key: 'imagen',
      render: (text) => {
        const extension = text?.split('.').pop()?.toLowerCase();
        const esJpg = extension === 'jpg' || extension === 'jpeg';

        if (esJpg) {
          return text;
        } else {
          return (
            <Tag color="red">
              {text} ({extension})
            </Tag>
          );
        }
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, __, index) => (
        <div>
          <Button type="link" icon={<CopyOutlined />} onClick={() => copyToClipboard(imagenesData[getAbsoluteIndex(index)].url_imagen)}>Copiar URL</Button>
          <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadImage(imagenesData[getAbsoluteIndex(index)].url_imagen)}>Descargar</Button>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openModal(getAbsoluteIndex(index))}>Ver Imagen</Button>
        </div>
      ),
    },
  ];

  const exportToExcel = () => {
    const idImagenSet = new Set(imagenesData.map(item => item.id_imagen));
    const idImagenesUnicas = Array.from(idImagenSet);
    const ws = XLSX.utils.aoa_to_sheet([['ID_Imagen'], ...idImagenesUnicas.map(id => [id])]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Listado de ID_Imagenes');
    XLSX.writeFile(wb, 'Listado_ID_Imagenes.xlsx');
  };

  return (
    <div>
      <h2>Tabla Imágenes (registro preliminar de archivos, al descargarlas en el flujo de PowerAutomate, al contrastar con la subida se puede detectar imágenes no descargadas)</h2>

      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span>🧾 Total de registros: {totalRegistros}</span>
        <PiDotOutlineFill />
        <span style={{ fontWeight: '600' }}>🖼️ Imágenes únicas: {cantidadUnicas}</span>
        <PiDotOutlineFill />
        <span>♻️ Duplicados: {cantidadDuplicados}</span>
        <Link onClick={exportToExcel}>
          <DownloadOutlined /> Listado de imágenes
        </Link>
      </p>

      <Table
        className='buscar-seccion-table1'
        columns={imagenesColumns}
        dataSource={imagenesData}
        loading={loading}
        rowKey="id_imagen"
        pagination={{
          pageSize: 10,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      <Modal
        open={isModalVisible}
        title={`Visor de Imagen: ${imagenesData[currentImageIndex]?.imagen || 'Sin nombre'}`}
        footer={null}
        onCancel={closeModal}
        centered
        width="90%"
        style={{ top: 0 }}
      >
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <img
            src={imagenesData[currentImageIndex]?.url_imagen}
            alt={imagenesData[currentImageIndex]?.imagen}
            style={{
              maxWidth: '100%',
              maxHeight: isMaxHeightFull ? '100%' : '80vh',
              transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
              transition: 'transform 0.3s ease',
            }}
          />
        </div>

        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000,
        }}>
          {imagenesData[currentImageIndex]?.imagen || 'Sin nombre'}
        </div>

        <div style={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          zIndex: 1000,
        }}>
          <Button onClick={previousImage} disabled={currentImageIndex === 0} type="primary">
            Anterior
          </Button>
          <Button onClick={nextImage} disabled={currentImageIndex === imagenesData.length - 1} type="primary">
            Siguiente
          </Button>
          <Button onClick={toggleImageSize} type="primary" icon={<ArrowsAltOutlined />}>
            Cambiar Tamaño
          </Button>
          <Button onClick={rotateImage} type="primary" icon={<ReloadOutlined />}>
            Rotar 90°
          </Button>
          <Button onClick={flipImageHorizontal} type="primary" icon={<SwapOutlined />}>
            Invertir Horizontal
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ImagenesTable;
