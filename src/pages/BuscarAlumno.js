import React, { useEffect, useState } from 'react';
import { Table, Input, Button, message } from 'antd';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Search } = Input;

const BuscarAlumno = () => {
  const [alumnos, setAlumnos] = useState([]); // Estado para almacenar los resultados
  const [loading, setLoading] = useState(false); // Estado para manejar el indicador de carga
  const { keyword } = useParams(); // Obtiene el parámetro de la URL
  const navigate = useNavigate(); // Para redirigir

  // Función para limpiar el RUT (eliminar espacios, puntos y guiones)
  const formatRut = (rut) => {
    return rut.replace(/\s+/g, '').replace(/[.-]/g, '');
  };

  // Función para manejar la búsqueda
  const fetchAlumnos = async (searchKeyword) => {
    if (!searchKeyword) {
      message.warning('Por favor, ingrese una palabra clave para buscar.');
      return;
    }

    setLoading(true); // Activa el indicador de carga
    try {
      const response = await axios.get(`http://localhost:3001/api/buscar-alumno/${searchKeyword}`);
      setAlumnos(response.data); // Actualiza el estado con los resultados
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Hubo un problema al obtener los datos.');
    } finally {
      setLoading(false); // Desactiva el indicador de carga
    }
  };

  // Ejecutar la búsqueda al cargar si hay un parámetro en la URL
  useEffect(() => {
    if (keyword) {
      fetchAlumnos(formatRut(keyword)); // Aplica el formateo antes de buscar
    }
  }, [keyword]);

  // Manejo del evento de búsqueda manual
  const onSearch = (searchKeyword) => {
    const formattedKeyword = formatRut(searchKeyword); // Aplica el formateo al RUT
    if (formattedKeyword) {
      navigate(`/buscar-alumno/${formattedKeyword}`); // Redirige con el parámetro en la URL
      fetchAlumnos(formattedKeyword); // Realiza la búsqueda inmediatamente
    }
  };

  // Función para manejar la navegación al hacer clic en el botón
  const goToRutDetail = (rut) => {
    navigate(`/rut/${rut}`);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'SEDE',
      dataIndex: 'nombre_sede',
      key: 'nombre_sede',
      filters: alumnos.map(item => item.nombre_sede).filter((value, index, self) => self.indexOf(value) === index).map(sede => ({ text: sede, value: sede })),
      onFilter: (value, record) => record.nombre_sede === value,
    },
    {
      title: 'RUT',
      dataIndex: 'rut',
      key: 'rut',
    },
    {
      title: 'APELLIDOS',
      dataIndex: 'apellidos',
      key: 'apellidos',
    },
    {
      title: 'NOMBRES',
      dataIndex: 'nombres',
      key: 'nombres',
    },
    {
      title: 'USUARIO',
      dataIndex: 'user_alum',
      key: 'user_alum',
      filters: alumnos.map(item => item.user_alum).filter((value, index, self) => self.indexOf(value) === index).map(usuario => ({ text: usuario, value: usuario })),
      onFilter: (value, record) => record.user_alum === value,
    },
    {
      title: 'ACCIÓN',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => goToRutDetail(record.rut)}>
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <div className='page-full'>
      <h1>Buscar alumno</h1>
      <Search
        placeholder="Ingrese una palabra clave"
        allowClear
        enterButton="Buscar"
        size="large"
        onSearch={onSearch}
        style={{ width: 400, marginBottom: 20 }}
      />

      <Table
        className="formato-table1"
        columns={columns}
        dataSource={alumnos}
        rowKey="rut"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BuscarAlumno;
