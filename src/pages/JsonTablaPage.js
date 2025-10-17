import React, { useState } from "react";
import { Input, Button, Table, message, Space, Typography } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { TextArea } = Input;
const { Title } = Typography;

const JsonTablePage = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [data, setData] = useState([]);

  const handleAddJson = () => {
    try {
      const parsed = JSON.parse(jsonInput.trim());
      const newRows = Array.isArray(parsed) ? parsed : [parsed];

      if (newRows.some((r) => typeof r !== "object" || r === null)) {
        message.error("El JSON debe contener objetos válidos.");
        return;
      }

      const withKeys = newRows.map((r, i) => ({
        key: `${data.length + i}-${Date.now()}`,
        ...r,
      }));

      setData((prev) => [...prev, ...withKeys]);
      setJsonInput("");
      message.success(`Se agregaron ${withKeys.length} fila(s)`);
    } catch (err) {
      message.error("JSON inválido. Verifica la sintaxis.");
    }
  };

  const handleDownloadExcel = () => {
    if (data.length === 0) {
      message.warning("No hay datos para exportar.");
      return;
    }

    try {
      // Quita la columna "key"
      const exportData = data.map(({ key, ...rest }) => rest);

      // Crea la hoja de cálculo
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

      // Convierte a blob y descarga
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, `tabla_json_${new Date().toISOString().slice(0, 10)}.xlsx`);
      message.success("Archivo Excel generado correctamente");
    } catch (error) {
      message.error("Error al generar el archivo Excel.");
    }
  };

  const columns =
    data.length > 0
      ? Object.keys(data[0])
          .filter((k) => k !== "key")
          .map((key) => ({
            title: key,
            dataIndex: key,
            key,
            ellipsis: true,
          }))
      : [];

  return (
    <div style={{ maxWidth: "100%", padding: 0 }}>
      <Title level={3}>Ingresar JSON y registrar en tabla</Title>

      <Space direction="vertical" style={{ width: "100%" }}>
        <TextArea
          rows={6}
          placeholder='Ejemplo: [{"nombre":"Juan","edad":30},{"nombre":"Ana","edad":25}]'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />

        <Space>
          <Button type="primary" onClick={handleAddJson}>
            Ingresar
          </Button>
          <Button onClick={handleDownloadExcel} type="default">
            Descargar Excel
          </Button>
        </Space>

        <div style={{ marginTop: 10 }}>
          <Table
            dataSource={data}
            columns={columns}
            pagination={{ pageSize: 5 }}
            bordered
            scroll={{
              x: "max-content",
              y: 400,
            }}
          />
        </div>
      </Space>
    </div>
  );
};

export default JsonTablePage;
