import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Select, Input, Row, Col, Button, Switch } from 'antd';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ErroresPage = () => {
  const [errores, setErrores] = useState([]);
  const [filteredErrores, setFilteredErrores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [programa, setPrograma] = useState('');
  const [sede, setSede] = useState('');
  const [codAsig, setCodAsig] = useState('');
  const [idLista, setIdLista] = useState('');
  const [numSeccion, setNumSeccion] = useState('');
  const [numPrueba, setNumPrueba] = useState('');
  const [rut, setRut] = useState(''); // Nuevo estado para rut
  const [validaRut, setValidaRut] = useState(null);
  const [validaMatricula, setValidaMatricula] = useState(null);
  const [validaInscripcion, setValidaInscripcion] = useState(null);
  const [validaEval, setValidaEval] = useState(null);
  const [validaForma, setValidaForma] = useState(null);

  const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredErrores);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores Filtrados');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });

  saveAs(data, 'errores_filtrados.xlsx');
  };

  useEffect(() => {
    const fetchErrores = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/errores_lista');
        if (!res.ok) throw new Error('No se pudieron obtener los errores');
        const data = await res.json();
        setErrores(data);
        setFilteredErrores(data);  // Inicializamos los errores filtrados
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchErrores();
  }, []);

  const handleFilterChange = () => {
    let filteredData = errores;

    // Filtrar por programa
    if (programa) {
      filteredData = filteredData.filter(item => item.programa === programa);
    }

    // Filtrar por sede
    if (sede) {
      filteredData = filteredData.filter(item => item.nombre_sede === sede);
    }

    // Filtrar por código de asignatura
    if (codAsig) {
      filteredData = filteredData.filter(item => item.cod_asig === codAsig);
    }

    // Filtrar por ID Lista
    if (idLista) {
      filteredData = filteredData.filter(item => item.id_lista === parseInt(idLista));
    }

    // Filtrar por num_seccion
    if (numSeccion) {
      filteredData = filteredData.filter(item => item.num_seccion === parseInt(numSeccion));
    }

    // Filtrar por num_prueba
    if (numPrueba) {
      filteredData = filteredData.filter(item => item.num_prueba === parseInt(numPrueba));
    }


    // Filtrar por rut
    if (rut) {
      filteredData = filteredData.filter(item => item.rut === rut);
    }

    // Filtrar por los campos booleanos
    if (validaRut !== null) {
      filteredData = filteredData.filter(item => item.valida_rut === validaRut);
    }

    if (validaMatricula !== null) {
      filteredData = filteredData.filter(item => item.valida_matricula === validaMatricula);
    }

    if (validaInscripcion !== null) {
      filteredData = filteredData.filter(item => item.valida_inscripcion === validaInscripcion);
    }

    if (validaEval !== null) {
      filteredData = filteredData.filter(item => item.valida_eval === validaEval);
    }

    if (validaForma !== null) {
      filteredData = filteredData.filter(item => item.valida_forma === validaForma);
    }

    setFilteredErrores(filteredData);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setPrograma('');
    setSede('');
    setCodAsig('');
    setIdLista('');
    setNumSeccion('');
    setNumPrueba('');
    setRut('');
    setValidaRut(null);
    setValidaMatricula(null);
    setValidaInscripcion(null);
    setValidaEval(null);
    setValidaForma(null);
    setFilteredErrores(errores); // Restaurar todos los datos
  };

  // Obtener valores únicos para los filtros
  const programas = [...new Set(errores.map(item => item.programa))];
  const sedes = [...new Set(errores.map(item => item.nombre_sede))];
  const codAsigs = [...new Set(errores.map(item => item.cod_asig))];

  const columns = [

    {
      title: 'ID Lista',
      dataIndex: 'id_lista',
      key: 'id_lista',
    },
    {
      title: 'Sede',
      dataIndex: 'nombre_sede',
      key: 'nombre_sede',
    },
    {
      title: 'Código Asignatura',
      dataIndex: 'cod_asig',
      key: 'cod_asig',
    },
    {
      title: 'Sección',
      dataIndex: 'num_seccion',
      key: 'num_seccion',
    },
    {
      title: 'URL Imagen',
      dataIndex: 'url_imagen',
      key: 'url_imagen',
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">Ver Imagen</a>,
    },
    {
      title: 'RUT',
      dataIndex: 'rut',
      key: 'rut',
    },
    {
      title: 'Número de Prueba',
      dataIndex: 'num_prueba',
      key: 'num_prueba',
    },
    {
      title: 'Forma',
      dataIndex: 'forma',
      key: 'forma',
    },
    {
      title: 'Instante Forms',
      dataIndex: 'instante_forms',
      key: 'instante_forms',
      render: (text) => {
        const date = new Date(text);
        const pad = (n) => n.toString().padStart(2, '0');
        const formattedDate = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${pad(date.getFullYear())}`;
        const formattedTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return `${formattedDate}, ${formattedTime}`;
      },
    },
    {
      title: 'Valida RUT',
      dataIndex: 'valida_rut',
      key: 'valida_rut',
      render: (val) => val ? 'Sí' : 'No', // Mostrar "Sí"/"No"
    },
    {
      title: 'Valida Matrícula',
      dataIndex: 'valida_matricula',
      key: 'valida_matricula',
      render: (val) => val ? 'Sí' : 'No', // Mostrar "Sí"/"No"
    },
    {
      title: 'Valida Inscripción',
      dataIndex: 'valida_inscripcion',
      key: 'valida_inscripcion',
      render: (val) => val ? 'Sí' : 'No', // Mostrar "Sí"/"No"
    },
    {
      title: 'Valida Evaluación',
      dataIndex: 'valida_eval',
      key: 'valida_eval',
      render: (val) => val ? 'Sí' : 'No', // Mostrar "Sí"/"No"
    },
    {
      title: 'Valida Forma',
      dataIndex: 'valida_forma',
      key: 'valida_forma',
      render: (val) => val ? 'Sí' : 'No', // Mostrar "Sí"/"No"
    },
    {
      title: 'Programa',
      dataIndex: 'programa',
      key: 'programa',
    },
    {
      title: 'ID Imagen',
      dataIndex: 'id_imagen',
      key: 'id_imagen',
    },
    {
      title: 'ID Archivo Leído',
      dataIndex: 'id_archivoleido',
      key: 'id_archivoleido',
    },
    {
      title: 'Línea Leída',
      dataIndex: 'linea_leida',
      key: 'linea_leida',
    },
    {
      title: 'Archivo Leído',
      dataIndex: 'archivoleido',
      key: 'archivoleido',
    },
  ];

  if (loading) return <Spin size="large" tip="Cargando..." />;

  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div className="page-full">
      <h1>Lista de Errores</h1>

      {/* Filtros */}
      <Row gutter={16} className="mb-4">
        {/* Filtro de Rut y ID Lista */}
        <Col span={6}>
          <div className="mb-2">RUT</div>
          <Input
            placeholder="RUT"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            onPressEnter={handleFilterChange} // Filtro cuando se presiona Enter
          />
        </Col>
        <Col span={6}>
          <div className="mb-2">ID Lista</div>
          <Input
            placeholder="ID Lista"
            value={idLista}
            onChange={(e) => setIdLista(e.target.value)}
            onPressEnter={handleFilterChange} // Filtro cuando se presiona Enter
          />
        </Col>
      </Row>

      <Row gutter={16} className="mb-4">
        {/* Filtros de ComboBoxes */}
        <Col span={6}>
          <div className="mb-2">Programa</div>
          <Select
            placeholder="Seleccionar Programa"
            value={programa}
            onChange={setPrograma}
            style={{ width: '100%' }}
          >
            {programas.map((prog) => (
              <Select.Option key={prog} value={prog}>
                {prog}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <div className="mb-2">Sede</div>
          <Select
            placeholder="Seleccionar Sede"
            value={sede}
            onChange={setSede}
            style={{ width: '100%' }}
          >
            {sedes.map((sede) => (
              <Select.Option key={sede} value={sede}>
                {sede}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <div className="mb-2">Código Asignatura</div>
          <Select
            placeholder="Seleccionar Código Asignatura"
            value={codAsig}
            onChange={setCodAsig}
            style={{ width: '100%' }}
          >
            {codAsigs.map((cod) => (
              <Select.Option key={cod} value={cod}>
                {cod}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <div className="mb-2">Número de Sección</div>
          <Input
            placeholder="Número de Sección"
            value={numSeccion}
            onChange={(e) => setNumSeccion(e.target.value)}
            onPressEnter={handleFilterChange} // Filtro cuando se presiona Enter
          />
        </Col>
        <Col span={6}>
          <div className="mb-2">Evaluación</div>
          <Input
            placeholder="Evaluación"
            value={numPrueba}
            onChange={(e) => setNumPrueba(e.target.value)}
            onPressEnter={handleFilterChange} // Filtro cuando se presiona Enter
          />
        </Col>
      </Row>

      {/* Filtros Booleanos */}
      <Row gutter={16} className="mb-4">
        <Col span={4}>
          <div className="mb-2">Valida RUT</div>
          <Switch checked={validaRut} onChange={(checked) => setValidaRut(checked)} />
        </Col>
        <Col span={4}>
          <div className="mb-2">Valida Matrícula</div>
          <Switch checked={validaMatricula} onChange={(checked) => setValidaMatricula(checked)} />
        </Col>
        <Col span={4}>
          <div className="mb-2">Valida Inscripción</div>
          <Switch checked={validaInscripcion} onChange={(checked) => setValidaInscripcion(checked)} />
        </Col>
        <Col span={4}>
          <div className="mb-2">Valida Evaluación</div>
          <Switch checked={validaEval} onChange={(checked) => setValidaEval(checked)} />
        </Col>
        <Col span={4}>
          <div className="mb-2">Valida Forma</div>
          <Switch checked={validaForma} onChange={(checked) => setValidaForma(checked)} />
        </Col>
      </Row>

      <Row gutter={16} className="mb-4">
        <Col span={24} className="text-center mt-2">
          <Button type="primary" onClick={handleFilterChange} className="mr-2">
            Filtrar
          </Button>
          <Button onClick={clearFilters}>Quitar Filtros</Button>
          <Button type="default" onClick={exportToExcel} style={{ marginLeft: '8px' }}>
            Descargar Excel
          </Button>
        </Col>
      </Row>

      {/* Tabla */}
      <Table
        columns={columns}
        dataSource={filteredErrores}
        rowKey={(record) => `${record.id_imagen}-${record.rut}-${record.num_prueba}`}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          position: ['bottomRight'],
        }}
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ErroresPage;
