import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Table, Upload, message, Button, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import EvalHoja from '../components/CargarTablaPage/EvalHoja';
import MedidasHoja from '../components/CargarTablaPage/MedidasHoja';
import EscalaHoja from '../components/CargarTablaPage/EscalaHoja';
import CalificacionesHoja from '../components/CargarTablaPage/CalificacionesHoja';
import ItemHoja from '../components/CargarTablaPage/ItemHoja';
import ItemMedidaHoja from '../components/CargarTablaPage/ItemMedidaHoja';

const CargarTablaPage = () => {
  const [archivos, setArchivos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoHojaModal, setTipoHojaModal] = useState('');
  const [nombreArchivoModal, setNombreArchivoModal] = useState('');
  const [mostrarBotonCargar, setMostrarBotonCargar] = useState(false);

  // Estados para cada hoja
  const [evalSheetData, setEvalSheetData] = useState([]);
  const [medidasSheetData, setMedidasSheetData] = useState([]);
  const [escalaSheetData, setEscalaSheetData] = useState([]);
  const [calificacionesSheetData, setCalificacionesSheetData] = useState([]);
  const [itemSheetData, setItemSheetData] = useState([]);
  const [itemMedidaSheetData, setItemMedidaSheetData] = useState([]);

  // Refs
  const evalRef = useRef();
  const medidasRef = useRef();
  const escalaRef = useRef();
  const calificacionesRef = useRef();
  const itemRef = useRef();
  const itemMedidaRef = useRef();

  const handleFile = (file) => {
    setArchivos([]);
    setNombreArchivoModal('');
    setMostrarBotonCargar(false);
    setModalVisible(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = new Uint8Array(e.target.result);
      const workbook = XLSX.read(fileData, { type: 'array' });

      const hojas = {
        eval: XLSX.utils.sheet_to_json(workbook.Sheets['eval'] || {}, { header: 1 }),
        medidas: XLSX.utils.sheet_to_json(workbook.Sheets['medidas'] || {}, { header: 1 }),
        escala: XLSX.utils.sheet_to_json(workbook.Sheets['escala'] || {}, { header: 1 }),
        calificaciones: XLSX.utils.sheet_to_json(workbook.Sheets['calificaciones'] || {}, { header: 1 }),
        item: XLSX.utils.sheet_to_json(workbook.Sheets['item'] || {}, { header: 1 }),
        item_medida: XLSX.utils.sheet_to_json(workbook.Sheets['item_medida'] || {}, { header: 1 }),
      };

      const nuevoArchivo = {
        key: file.uid,
        nombre: file.name,
        ...hojas
      };

      setArchivos([nuevoArchivo]);
      setEvalSheetData(hojas.eval);
      setMedidasSheetData(hojas.medidas);
      setEscalaSheetData(hojas.escala);
      setCalificacionesSheetData(hojas.calificaciones);
      setItemSheetData(hojas.item);
      setItemMedidaSheetData(hojas.item_medida);
      setNombreArchivoModal(file.name);
      setMostrarBotonCargar(true);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const mostrarContenido = (archivo, tipoHoja) => {
    setNombreArchivoModal(archivo.nombre);
    setTipoHojaModal(tipoHoja);
    setModalVisible(true);

    const setters = {
      eval: setEvalSheetData,
      medidas: setMedidasSheetData,
      escala: setEscalaSheetData,
      calificaciones: setCalificacionesSheetData,
      item: setItemSheetData,
      item_medida: setItemMedidaSheetData
    };

    if (archivo[tipoHoja]) {
      setters[tipoHoja](archivo[tipoHoja]);
    } else {
      message.warning(`La hoja "${tipoHoja}" no fue encontrada en el archivo.`);
    }
  };

  const handleCargarTabla = async () => {
    if (evalRef.current) await evalRef.current.insertarDatos();
    if (medidasRef.current) await medidasRef.current.insertarDatos();
    if (escalaRef.current) await escalaRef.current.insertarDatos();
    if (calificacionesRef.current) await calificacionesRef.current.insertarDatos();
    if (itemRef.current) await itemRef.current.insertarDatos();
    if (itemMedidaRef.current) await itemMedidaRef.current.insertarDatos();
    setModalVisible(false);
    setMostrarBotonCargar(false);
  };

  const columnasTablaPrincipal = [
    {
      title: 'Archivo',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    ...['eval', 'medidas', 'escala', 'calificaciones', 'item', 'item_medida'].map(tipo => ({
      title: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      key: tipo,
      render: (_, record) => (
        <Button onClick={() => mostrarContenido(record, tipo)}>Ver</Button>
      )
    }))
  ];

  return (
    <div style={{ padding: 20 }}>
      <Upload beforeUpload={handleFile} showUploadList={false} accept=".xls,.xlsx,.xlsm">
        <Button icon={<UploadOutlined />}>Subir archivo</Button>
      </Upload>

      <Table
        columns={columnasTablaPrincipal}
        dataSource={archivos}
        pagination={false}
        style={{ marginTop: 20 }}
        bordered
      />

      {mostrarBotonCargar && (
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={handleCargarTabla}>
            Cargar tabla
          </Button>
        </div>
      )}

      <Modal
        open={modalVisible}
        title={`Contenido de la hoja "${tipoHojaModal}" - ${nombreArchivoModal}`}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {/* Ocultos pero montados */}
        <div style={{ display: 'none' }}>
          <EvalHoja ref={evalRef} sheetData={evalSheetData} />
          <MedidasHoja ref={medidasRef} sheetData={medidasSheetData} />
          <EscalaHoja ref={escalaRef} sheetData={escalaSheetData} />
          <CalificacionesHoja ref={calificacionesRef} sheetData={calificacionesSheetData} />
          <ItemHoja ref={itemRef} sheetData={itemSheetData} />
          <ItemMedidaHoja ref={itemMedidaRef} sheetData={itemMedidaSheetData} />
        </div>

        {/* Visual */}
        {{
          eval: <EvalHoja sheetData={evalSheetData} />,
          medidas: <MedidasHoja sheetData={medidasSheetData} />,
          escala: <EscalaHoja sheetData={escalaSheetData} />,
          calificaciones: <CalificacionesHoja sheetData={calificacionesSheetData} />,
          item: <ItemHoja sheetData={itemSheetData} />,
          item_medida: <ItemMedidaHoja sheetData={itemMedidaSheetData} />
        }[tipoHojaModal]}
      </Modal>
    </div>
  );
};

export default CargarTablaPage;
