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

  const onSearch = (value) => {
    navigate(`/buscar-docente/${value}`);
  };

  const handleCargaAcademica = (record) => {
    window.open(`/carga-docente/${record.rut_docente}`, '_blank');
  };

  const columns = [
    {
      title: 'Sede',
      dataIndex: 'nombre_sede',
      key: 'nombre_sede',
    },
    {
      title: 'RUT',
      dataIndex: 'rut_docente',
      key: 'rut_docente',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_doc',
      key: 'nombre_doc',
    },
    {
      title: 'Apellidos',
      dataIndex: 'apellidos_doc',
      key: 'apellidos_doc',
    },
    {
      title: 'Username',
      dataIndex: 'username_doc',
      key: 'username_doc',
    },
    {
      title: 'Correo',
      dataIndex: 'mail_doc',
      key: 'mail_doc',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, record) => (
        <>
          <Tooltip title="Carga Académica"> 
            <Button
              icon={<FolderOpenOutlined className="icon-tamano1" />}
              onClick={() => handleCargaAcademica(record)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
        </>
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
