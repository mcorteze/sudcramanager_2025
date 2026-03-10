import React, { useState } from 'react';
import { Input, Button, Table, Space, message } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListadoCantNotasPage = () => {
  const [codPrograma, setCodPrograma] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotas = async () => {
    if (!codPrograma) {
      message.warning('Por favor ingresa un código de programa');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/listado_cantidad_notas?cod_programa=${codPrograma}`);
      setData(response.data);
    } catch (error) {
      message.error('Error al obtener los datos');
      console.error(error);
    }
    setLoading(false);
  };

  const downloadExcel = () => {
    if (data.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Notas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const fileName = `listado_notas_${codPrograma}.xlsx`;
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  const columns = [
    { title: 'Código Programa', dataIndex: 'cod_programa', key: 'cod_programa' },
    { title: 'Sede', dataIndex: 'nombre_sede', key: 'nombre_sede' },
    { title: 'Código Interno', dataIndex: 'cod_interno', key: 'cod_interno' },
    { title: 'Número de Prueba', dataIndex: 'num_prueba', key: 'num_prueba' },
    { title: 'Forma', dataIndex: 'forma', key: 'forma' },
    { title: 'Cantidad de Notas', dataIndex: 'cantidad_notas', key: 'cantidad_notas' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>Listado de Cantidad de Notas</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Código del programa (ej. ING)"
          value={codPrograma}
          onChange={(e) => setCodPrograma(e.target.value)}
          onPressEnter={fetchNotas}
        />
        <Button type="primary" onClick={fetchNotas}>Buscar</Button>
        <Button onClick={downloadExcel} disabled={data.length === 0}>Descargar Excel</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record, index) => index}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ListadoCantNotasPage;
