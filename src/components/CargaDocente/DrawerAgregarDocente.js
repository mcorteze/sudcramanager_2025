import React, { useEffect, useState } from 'react';
import { Drawer, Select, Button, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const DrawerAgregarDocente = ({ rutDocenteAgregar, nombreDocenteAgregar, visible, onClose, onAgregarDocente }) => {
  const [programas, setProgramas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedSeccionValue, setSelectedSeccionValue] = useState(null);
  const [docentesSeccionData, setDocentesSeccionData] = useState([]);

  useEffect(() => {
    fetchProgramas();
    fetchSedes();
  }, []);

  const fetchProgramas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/programas');
      setProgramas(response.data);
    } catch (error) {
      console.error('Error fetching programas:', error);
    }
  };

  const fetchSedes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sedes');
      setSedes(response.data);
    } catch (error) {
      console.error('Error fetching sedes:', error);
    }
  };

  const fetchAsignaturas = async (codPrograma) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/asignaturas/${codPrograma}`);
      setAsignaturas(response.data);
    } catch (error) {
      console.error('Error fetching asignaturas:', error);
    }
  };

  const fetchSecciones = async (codAsignatura, idSede) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/secciones/${codAsignatura}/${idSede}`);
      setSecciones(response.data);
    } catch (error) {
      console.error('Error fetching secciones:', error);
    }
  };

  const fetchDocentesSeccionData = async (idSeccion) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/docentes_secciones/${idSeccion}`);
      if (response.data) {
        setDocentesSeccionData(response.data);
      }
    } catch (error) {
      console.error('Error fetching docentes seccion data:', error);
    }
  };

  const handleProgramaChange = (value) => {
    setSelectedPrograma(value);
    fetchAsignaturas(value);
  };

  const handleSedeChange = (value) => {
    setSelectedSede(value);
    if (selectedAsignatura) {
      fetchSecciones(selectedAsignatura, value);
    }
  };

  const handleAsignaturaChange = (value) => {
    setSelectedAsignatura(value);
    if (selectedSede) {
      fetchSecciones(value, selectedSede);
    }
  };

  const handleSeccionChange = (value, option) => {
    setSelectedSeccion(value);
    setSelectedSeccionValue(option.children);
    fetchDocentesSeccionData(value);
  };

  const handleAgregarDocente = async () => {
    if (!rutDocenteAgregar || !selectedSeccion) {
      message.warning('Por favor, seleccione un docente y una sección.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/agregar-docente-seccion', {
        idSeccion: selectedSeccion,
        rutDocente: rutDocenteAgregar,
      });

      message.success(response.data.message);
      onAgregarDocente();
    } catch (error) {
      console.error('Error al agregar el docente a la sección:', error);
      message.error('Error al agregar el docente a la sección');
    }
  };

  return (
    <Drawer
      title="Añadir Docente"
      placement="right"
      onClose={onClose}
      visible={visible}
    >
      <Select
        placeholder="Seleccione un programa"
        onChange={handleProgramaChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {programas.map(programa => (
          <Option key={programa.cod_programa} value={programa.cod_programa}>
            {programa.programa}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Seleccione una sede"
        onChange={handleSedeChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {sedes.map(sede => (
          <Option key={sede.id_sede} value={sede.id_sede}>
            {sede.nombre_sede}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Seleccione una asignatura"
        onChange={handleAsignaturaChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {asignaturas.map(asignatura => (
          <Option key={asignatura.cod_asig} value={asignatura.cod_asig}>
            {asignatura.cod_asig}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Seleccione una sección"
        onChange={handleSeccionChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {secciones.map(seccion => (
          <Option key={seccion.id_seccion} value={seccion.id_seccion}>
            {seccion.seccion}
          </Option>
        ))}
      </Select>

      {/* Mostrar el rut y nombre del docente */}
      <div>
        <b>Rut docente seleccionado:</b>
        <p>{rutDocenteAgregar}</p>
        <b>Nombre docente:</b>
        <p>{nombreDocenteAgregar}</p>
        <hr />
      </div>

      {selectedSeccion && (
        <div>
          <b>Sección Seleccionada:</b>
          <p>{selectedSeccionValue}</p>
          <p><b>Id sección:</b> {selectedSeccion}</p>
          <hr />
          <b>Lista de Docentes Asignados:</b>
          {docentesSeccionData.map((docente, index) => (
            <div key={index}>
              <p>{docente.nombre_doc} {docente.apellidos_doc}</p>
            </div>
          ))}
          <hr />
          <Button type="primary" onClick={handleAgregarDocente} style={{ marginTop: 16 }}>
            Agregar Docente
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default DrawerAgregarDocente;
