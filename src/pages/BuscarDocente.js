import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Tooltip } from 'antd';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderOpenOutlined } from '@ant-design/icons';

const { Search } = Input;

const BuscarDocente = () => {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    if (keyword) {
      fetchDocentes(keyword);
    }
  }, [keyword]);

  const fetchDocentes = async (searchKeyword) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/buscar-docente/${searchKeyword}`);
      setDocentes(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDocentes([]);
    }
  };

  const esCorreoElectronico = (texto) => {
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexCorreo.test(texto.trim());
  };

  const limpiarTexto = (texto) => {
    const textoLimpio = texto.trim();
    if (esCorreoElectronico(textoLimpio)) {
      return textoLimpio;
    } else {
      return textoLimpio.replace(/\./g, '').replace(/-/g, '');
    }
  };

  const onSearch = (value) => {
    const cleanedValue = limpiarTexto(value);
    navigate(`/buscar-docente/${cleanedValue}`);
  };

  const handleCargaAcademica = (record) => {
    window.open(`/carga-docente/${record.rut_docente}`, '_blank');
  };

  // Utilidad para generar filtros únicos
  const generarFiltros = (campo) =>
    docentes
      .map((item) => item[campo])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .map((valor) => ({ text: valor, value: valor }));

  const columns = [
    {
      title: 'Sede',
      dataIndex: 'nombre_sede',
      key: 'nombre_sede',
      filters: generarFiltros('nombre_sede'),
      onFilter: (value, record) => record.nombre_sede === value,
    },
    {
      title: 'RUT',
      dataIndex: 'rut_docente',
      key: 'rut_docente',
      filters: generarFiltros('rut_docente'),
      onFilter: (value, record) => record.rut_docente === value,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_doc',
      key: 'nombre_doc',
      filters: generarFiltros('nombre_doc'),
      onFilter: (value, record) => record.nombre_doc === value,
    },
    {
      title: 'Apellidos',
      dataIndex: 'apellidos_doc',
      key: 'apellidos_doc',
      filters: generarFiltros('apellidos_doc'),
      onFilter: (value, record) => record.apellidos_doc === value,
    },
    {
      title: 'Username',
      dataIndex: 'username_doc',
      key: 'username_doc',
      filters: generarFiltros('username_doc'),
      onFilter: (value, record) => record.username_doc === value,
    },
    {
      title: 'Correo',
      dataIndex: 'mail_doc',
      key: 'mail_doc',
      filters: generarFiltros('mail_doc'),
      onFilter: (value, record) => record.mail_doc === value,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, record) => (
        <Tooltip title="Carga Académica">
          <Button
            icon={<FolderOpenOutlined className="icon-tamano1" />}
            onClick={() => handleCargaAcademica(record)}
            style={{ marginRight: 8 }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className='page-full'>
      <h1>Buscar docente</h1>
      <Search
        placeholder="Ingrese una palabra clave"
        allowClear
        enterButton="Buscar"
        size="large"
        onSearch={onSearch}
        style={{ width: 300, marginBottom: 16 }}
      />
      <Table
        dataSource={docentes}
        columns={columns}
        rowKey={(record) => record.rut_docente}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BuscarDocente;
