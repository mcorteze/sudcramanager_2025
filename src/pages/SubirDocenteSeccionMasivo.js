import React, { useState } from 'react';
import { Upload, Button, Table, message, Popconfirm, Space, Divider } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

export default function ExcelUploader() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFileUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
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

      // 🔥 Filtra filas vacías antes de mapearlas
      const rows = jsonData
        .slice(1)
        .filter((row) =>
          row.some(
            (cell) =>
              cell !== undefined &&
              cell !== null &&
              String(cell).trim() !== ''
          )
        )
        .map((row, index) => {
          const rowData = {};
          headers.forEach((header, i) => {
            rowData[header] = row[i];
          });
          return { key: index, ...rowData };
        });

      const enrichedRows = await Promise.all(
        rows.map(async (row) => {
          let seccion = {
            seccion: 'No disponible',
            nombre_sede: 'No disponible',
          };
          let docente = {
            docente: 'No disponible',
            mail_doc: 'No disponible',
            username_doc: 'No disponible',
          };

          try {
            if (row.id_seccion) {
              const res = await fetch(
                `http://localhost:3001/api/completar_seccion/${row.id_seccion}`
              );
              const data = await res.json();
              if (data.seccion !== 's.i.') {
                seccion = data;
              }
            }
          } catch (e) {
            console.error(`Error al obtener sección para ${row.id_seccion}`, e);
          }

          try {
            if (row.rut_docente) {
              const res = await fetch(
                `http://localhost:3001/api/completar_docente/${row.rut_docente}`
              );
              const data = await res.json();
              if (data.docente !== 's.i.') {
                docente = data;
              }
            }
          } catch (e) {
            console.error(
              `Error al obtener docente para ${row.rut_docente}`,
              e
            );
          }

          return {
            ...row,
            nombre_sede: seccion.nombre_sede,
            seccion: seccion.seccion,
            docente: docente.docente,
            username_doc: docente.username_doc,
            inactivo: false,
          };
        })
      );

      const extendedHeaders = [
        ...headers,
        'SEDE',
        'SECCIÓN',
        'NUEVO DOCENTE TITUTLAR',
        'USER',
      ];

      const baseColumns = extendedHeaders.map((header) => ({
        title: header,
        dataIndex: header,
        key: header,
        render: (text) =>
          header === 'rut_docente' && text ? (
            <a
              href={`/carga-docente/${text}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {text}
            </a>
          ) : (
            text
          ),
      }));

      baseColumns.push({
        title: 'Acción',
        key: 'accion',
        render: (_, record) =>
          record.inactivo ? (
            <span style={{ color: '#aaa' }}>Acción realizada</span>
          ) : (
            <Space>
              <Popconfirm
                title="¿Asignar como titular?"
                onConfirm={() => handleRegistrar(record, 'titular')}
                okText="Sí"
                cancelText="Cancelar"
              >
                <Button type="primary">Asignar titular</Button>
              </Popconfirm>
              <Popconfirm
                title="¿Agregar como reemplazo?"
                onConfirm={() => handleRegistrar(record, 'reemplazo')}
                okText="Sí"
                cancelText="Cancelar"
              >
                <Button>Agregar reemplazo</Button>
              </Popconfirm>
            </Space>
          ),
      });

      setColumns(baseColumns);
      setData(enrichedRows);
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleRegistrar = async (record, tipo) => {
    const { id_seccion, rut_docente } = record;
    const endpoint =
      tipo === 'titular'
        ? 'asignardocentetitular'
        : 'asignardocentereemplazo';

    try {
      const res = await fetch(
        `http://localhost:3001/api/${endpoint}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idSeccion: id_seccion,
            rutDocente: rut_docente,
          }),
        }
      );

      const result = await res.json();

      if (res.ok) {
        message.success(`Éxito: ${result.message}`);

        setData((prevData) => {
          const newData = prevData.map((item) =>
            item.key === record.key
              ? { ...item, inactivo: true }
              : item
          );
          newData.sort((a, b) =>
            a.inactivo === b.inactivo
              ? 0
              : a.inactivo
              ? 1
              : -1
          );
          return newData;
        });
      } else {
        message.error(
          `Error: ${result.error || 'No se pudo registrar'}`
        );
      }
    } catch (err) {
      console.error('Error al registrar:', err);
      message.error('Error al conectar con el servidor.');
    }
  };

  const handleAsignarMasivo = async (tipo) => {
    const registrosActivos = data.filter(
      (item) => !item.inactivo
    );

    if (registrosActivos.length === 0) {
      message.info('No hay registros activos para asignar.');
      return;
    }

    for (const record of registrosActivos) {
      await handleRegistrar(record, tipo);
    }

    message.success(
      `Asignación masiva de ${tipo} completada.`
    );
  };

  const handleDescargarFormato = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['id_seccion', 'rut_docente'],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Formato'
    );
    XLSX.writeFile(workbook, 'formato_asignacion.xlsx');
  };

  return (
    <div className="page-full">
      <h1>Cargar id seccion por rut docente</h1>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDescargarFormato}
        >
          Descargar formato
        </Button>
        <Upload
          beforeUpload={handleFileUpload}
          accept=".xlsx, .xls"
          showUploadList={false}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>
            Seleccionar archivo Excel
          </Button>
        </Upload>
      </div>

      {data.length > 0 && (
        <>
          <Divider />
          <Space
            style={{
              display: 'flex',
              justifyContent: 'end',
              width: '100%',
              marginBottom: 8,
            }}
          >
            <Popconfirm
              title="¡Advertencia! ¿Estás seguro de asignar a todos como titular?"
              onConfirm={() => handleAsignarMasivo('titular')}
              okText="Sí"
              cancelText="Cancelar"
            >
              <Button type="primary">
                Asignar Titular a todo
              </Button>
            </Popconfirm>

            <Popconfirm
              title="¡Advertencia! ¿Estás seguro de asignar a todos como reemplazo?"
              onConfirm={() =>
                handleAsignarMasivo('reemplazo')
              }
              okText="Sí"
              cancelText="Cancelar"
            >
              <Button>
                Asignar Reemplazo a todo
              </Button>
            </Popconfirm>
          </Space>

          <div style={{ marginTop: 20 }}>
            <Table
              dataSource={data}
              columns={columns}
              pagination={false}
              rowClassName={(record) =>
                record.inactivo ? 'fila-inactiva' : ''
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
