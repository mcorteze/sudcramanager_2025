import React, { useState, useRef, useCallback } from 'react';
import { Form, Input, Button, message, Modal, Space, Divider } from 'antd';
import { UploadOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const CrearDocentePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [rutExiste, setRutExiste] = useState(false);
  const debounceTimer = useRef(null);

  const verificarRut = useCallback(async (rut) => {
    if (!rut || rut.trim() === '') {
      setRutExiste(false);
      message.destroy('rut-duplicado');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3001/api/verificar-rut-docente/${rut.trim()}`);
      if (res.data?.existe) {
        const d = res.data.docente;
        setRutExiste(true);
        message.warning({
          content: `El RUT ${rut.trim()} ya está registrado: ${d.nombre_doc} ${d.apellidos_doc}`,
          duration: 8,
          key: 'rut-duplicado',
        });
      } else {
        setRutExiste(false);
        message.destroy('rut-duplicado');
      }
    } catch {
      setRutExiste(false);
    }
  }, []);

  const handleRutChange = (e) => {
    const valor = e.target.value;
    if (rutExiste) setRutExiste(false);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      verificarRut(valor);
    }, 600);
  };

  // Abre el modal de confirmación con los valores del formulario
  const handleFormFinish = (values) => {
    setPendingValues(values);
    setModalVisible(true);
  };

  // Confirma la creación desde el modal
  const handleConfirmar = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/crear_docente', pendingValues);
      message.success(response.data.message || 'Docente creado exitosamente');
      form.resetFields();
      setModalVisible(false);
      setPendingValues(null);
    } catch (error) {
      console.error('Error al crear docente:', error);
      setModalVisible(false);
      setPendingValues(null);
      if (error.response?.status === 409) {
        message.warning({
          content: error.response.data.error || 'El docente ya existe en el sistema.',
          duration: 5,
        });
      } else {
        const errorMsg = error.response?.data?.error || 'Error al crear el docente';
        const detalle = error.response?.data?.detalle ? `: ${error.response.data.detalle}` : '';
        message.error({ content: `${errorMsg}${detalle}`, duration: 5 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarModal = () => {
    setModalVisible(false);
    setPendingValues(null);
  };

  const handleDescargarPlantilla = () => {
    const datos = [
      {
        'RUT(sin puntos ni guión)': '',
        NOMBRES: '',
        APELLIDOS: '',
        USUARIO: '',
        EMAIL: ''
      }
    ];

    const hoja = XLSX.utils.json_to_sheet(datos);
    const headers = Object.keys(datos[0]);
    const anchoColumnas = headers.map(header => ({ wch: Math.max(header.length, 15) }));
    hoja['!cols'] = anchoColumnas;

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'NuevoDocente');

    const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'plantilla_nuevo_docente.xlsx');
  };

  // Lee el archivo Excel y carga la primera fila de datos (fila 2) en el formulario
  const handleCargarFormato = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
          message.warning('El archivo no tiene datos en la primera fila.');
          return;
        }

        const row = rows[0]; // fila 2 del Excel (primera fila de datos)

        // Mapeo flexible de encabezados
        const rut = row['RUT(sin puntos ni guión)'] || row['RUT'] || row['rut_docente'] || '';
        const nombres = row['NOMBRES'] || row['Nombres'] || row['nombre_doc'] || '';
        const apellidos = row['APELLIDOS'] || row['Apellidos'] || row['apellidos_doc'] || '';
        const usuario = row['USUARIO'] || row['Usuario'] || row['username_doc'] || '';
        const email = row['EMAIL'] || row['Email'] || row['mail_doc'] || '';

        form.setFieldsValue({
          rut_docente: String(rut),
          nombre_doc: String(nombres),
          apellidos_doc: String(apellidos),
          username_doc: String(usuario),
          mail_doc: String(email),
        });

        message.success('Datos cargados desde el archivo Excel.');
        verificarRut(String(rut));
      } catch (err) {
        console.error('Error al leer el archivo:', err);
        message.error('No se pudo leer el archivo. Verifique que sea un Excel válido.');
      }
    };
    reader.readAsArrayBuffer(file);
    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    e.target.value = '';
  };

  return (
    <div className="page-full">
      <h1>Crear Nuevo Docente</h1>
      <h6>
        Asignar carga académica a un docente nuevo{' '}
        <Link to="/subirdocenteseccionmasivo" target="_blank">aquí</Link>
      </h6>

      <div className="muro">
        {/* Botones de formato arriba del formulario */}
        <div style={{ marginBottom: 20 }}>
          <Space wrap>
            <Button icon={<DownloadOutlined />} onClick={handleDescargarPlantilla}>
              Descargar formato
            </Button>
            <label>
              <Button
                icon={<UploadOutlined />}
                onClick={() => document.getElementById('input-formato-docente').click()}
              >
                Cargar formato completado
              </Button>
              <input
                id="input-formato-docente"
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleCargarFormato}
              />
            </label>
          </Space>
        </div>

        <Divider style={{ margin: '0 0 20px 0' }} />

        <Form
          form={form}
          name="crear_docente"
          onFinish={handleFormFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <Form.Item
            label="RUT"
            name="rut_docente"
            rules={[{ required: true, message: 'Por favor ingrese el RUT del docente' }]}
            validateStatus={rutExiste ? 'error' : ''}
            help={rutExiste ? 'Este RUT ya está registrado en el sistema.' : ''}
          >
            <Input
              placeholder="123456789"
              onChange={handleRutChange}
            />
          </Form.Item>

          <Form.Item
            label="Nombres"
            name="nombre_doc"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del docente' }]}
          >
            <Input placeholder="Juan Andrés" />
          </Form.Item>

          <Form.Item
            label="Apellidos"
            name="apellidos_doc"
            rules={[{ required: true, message: 'Por favor ingrese los apellidos del docente' }]}
          >
            <Input placeholder="Pérez Soto" />
          </Form.Item>

          <Form.Item
            label="Usuario"
            name="username_doc"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
          >
            <Input placeholder="jperez" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="mail_doc"
            rules={[
              { required: true, message: 'Por favor ingrese el correo electrónico' },
              { type: 'email', message: 'El correo no es válido' }
            ]}
          >
            <Input placeholder="juan.perez@ejemplo.com" />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 18, offset: 6 }}>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} disabled={rutExiste}>
              Crear Docente
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Modal de confirmación */}
      <Modal
        title="Confirmar creación de docente"
        open={modalVisible}
        onOk={handleConfirmar}
        onCancel={handleCancelarModal}
        okText="Confirmar"
        cancelText="Cancelar"
        confirmLoading={loading}
        destroyOnClose
      >
        {pendingValues && (
          <div>
            <p>¿Desea crear el siguiente docente?</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ padding: '4px 8px', fontWeight: 'bold' }}>RUT:</td><td style={{ padding: '4px 8px' }}>{pendingValues.rut_docente}</td></tr>
                <tr><td style={{ padding: '4px 8px', fontWeight: 'bold' }}>Nombres:</td><td style={{ padding: '4px 8px' }}>{pendingValues.nombre_doc}</td></tr>
                <tr><td style={{ padding: '4px 8px', fontWeight: 'bold' }}>Apellidos:</td><td style={{ padding: '4px 8px' }}>{pendingValues.apellidos_doc}</td></tr>
                <tr><td style={{ padding: '4px 8px', fontWeight: 'bold' }}>Usuario:</td><td style={{ padding: '4px 8px' }}>{pendingValues.username_doc}</td></tr>
                <tr><td style={{ padding: '4px 8px', fontWeight: 'bold' }}>Email:</td><td style={{ padding: '4px 8px' }}>{pendingValues.mail_doc}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CrearDocentePage;
