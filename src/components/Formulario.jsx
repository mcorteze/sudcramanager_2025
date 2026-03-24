import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Combobox from './Combobox';
import MatriculaTable from './MatriculaTable';
import { Button, App } from 'antd';
import { InfoOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons';
import './Formulario.css';

export default function Formulario() {
  const navigate = useNavigate();
  const { modal } = App.useApp();

  const [programas, setProgramas] = useState([]);
  const [programaSeleccionada, setProgramaSeleccionada] = useState('');
  const [sedes, setSedes] = useState([]);
  const [idSedeSeleccionada, setIdSedeSeleccionada] = useState('');
  const [nombreSedeSeleccionada, setNombreSedeSeleccionada] = useState('');
  const [asignaturas, setAsignaturas] = useState([]);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  const [matriculas, setMatriculas] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [idSeccion, setIdSeccion] = useState('');
  const [numeroSeccion, setNumeroSeccion] = useState('');
  const [jornada, setJornada] = useState('');
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/programas');
        setProgramas(response.data);
      } catch (error) {
        console.error('Error al obtener los programas:', error);
      }
    };

    const fetchSedes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/sedes');
        setSedes(response.data);
      } catch (error) {
        console.error('Error al obtener las sedes:', error);
      }
    };

    fetchProgramas();
    fetchSedes();
  }, []);

  const handleProgramaChange = async (event) => {
    const codPrograma = event.target.value;
    setProgramaSeleccionada(codPrograma);

    if (codPrograma) {
      try {
        const response = await axios.get(`http://localhost:3001/api/asignaturas/${codPrograma}`);
        setAsignaturas(response.data);
      } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
      }
    } else {
      setAsignaturas([]);
    }

    setAsignaturaSeleccionada('');
  };

  const handleSedeChange = async (event) => {
    const sedeId = event.target.value;
    const nombreSede = sedes.find((sede) => sede.id_sede === sedeId)?.nombre_sede || '';
    setIdSedeSeleccionada(sedeId);
    setNombreSedeSeleccionada(nombreSede);
  };

  const handleAsignaturaChange = async (event) => {
    const asignatura = event.target.value;
    setAsignaturaSeleccionada(asignatura);

    setSeccionSeleccionada('');
    setPruebas([]);
    setMatriculas([]);

    if (asignatura && idSedeSeleccionada) {
      try {
        const responseSecciones = await axios.get(`http://localhost:3001/api/secciones/${asignatura}/${idSedeSeleccionada}`);
        setSecciones(responseSecciones.data);

        const responsePruebas = await axios.get(`http://localhost:3001/api/eval/${asignatura}`);
        setPruebas(responsePruebas.data);
      } catch (error) {
        console.error('Error al obtener las secciones o pruebas:', error);
      }
    } else {
      setSecciones([]);
      setPruebas([]);
    }
  };

  // Función centralizada para cargar matrículas
  const fetchMatriculas = async (idSec, asig) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/matriculas/${idSec}/${asig}`);
      setMatriculas(response.data);
    } catch (error) {
      console.error('Error al obtener las matrículas:', error);
    }
  };

  const handleSeccionChange = async (event) => {
    const idSec = event.target.value;
    const seccionTexto = event.target.options[event.target.selectedIndex].text;
    setSeccionSeleccionada(idSec);
    setIdSeccion(idSec);

    if (idSec && asignaturaSeleccionada) {
      await fetchMatriculas(idSec, asignaturaSeleccionada);

      const numSec = seccionTexto.slice(-4, -1);
      const jor = seccionTexto.slice(-1);
      setNumeroSeccion(numSec);
      setJornada(jor);
    } else {
      setMatriculas([]);
    }
  };

  // Actualiza los registros sin cambiar la sección seleccionada
  const handleRefresh = async () => {
    if (!idSeccion || !asignaturaSeleccionada) return;
    setLoadingRefresh(true);
    await fetchMatriculas(idSeccion, asignaturaSeleccionada);
    setLoadingRefresh(false);
  };

  const handleInfoClick = () => {
    if (idSeccion) {
      window.open(`/secciones/${idSeccion}`, '_blank');
    } else {
      alert('Por favor, seleccione una sección primero.');
    }
  };

  // Limpiar con confirmación modal
  const handleClearComboboxes = () => {
    modal.confirm({
      title: '¿Limpiar selección?',
      content: 'Se borrarán todos los filtros seleccionados y los registros de la tabla.',
      okText: 'Sí, limpiar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: () => {
        setProgramaSeleccionada('');
        setSeccionSeleccionada('');
        setAsignaturaSeleccionada('');
        setIdSedeSeleccionada('');
        setMatriculas([]);
        setPruebas([]);
        setSecciones([]);
        setAsignaturas([]);
        setIdSeccion('');
        setNumeroSeccion('');
        setJornada('');
      },
    });
  };

  return (
    <div>
      <div className="formulario-container">
        <Combobox
          label="Programa:"
          id="programas"
          value={programaSeleccionada}
          onChange={handleProgramaChange}
          options={programas.map((programa) => ({ value: programa.cod_programa, label: programa.programa }))}
        />
        <Combobox
          label="Sede:"
          id="sedes"
          value={idSedeSeleccionada}
          onChange={handleSedeChange}
          options={sedes.map((sede) => ({ value: sede.id_sede, label: sede.nombre_sede }))}
        />
        <Combobox
          label="Asignatura:"
          id="asignaturas"
          value={asignaturaSeleccionada}
          onChange={handleAsignaturaChange}
          options={asignaturas.map((asignatura) => ({ value: asignatura.cod_asig, label: asignatura.cod_asig }))}
        />
        <Combobox
          label="Sección:"
          id="secciones"
          value={seccionSeleccionada}
          onChange={handleSeccionChange}
          options={secciones.map((seccion) => ({ value: seccion.id_seccion, label: seccion.seccion }))}
        />
        <Button
          type="primary"
          icon={<InfoOutlined />}
          onClick={handleInfoClick}
          disabled={!idSeccion}
          className="info-button"
          title="Ver detalle de sección"
        />
        {/* Botón para actualizar registros de la tabla */}
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          disabled={!idSeccion}
          loading={loadingRefresh}
          className="info-button"
          title="Actualizar registros"
        />
        {/* Botón para limpiar (con confirmación) */}
        <Button
          type="primary"
          danger
          icon={<ClearOutlined />}
          onClick={handleClearComboboxes}
          className="info-button"
          title="Limpiar selección"
        />
      </div>
      <div className="table-container">
        <MatriculaTable
          matriculas={matriculas}
          pruebas={pruebas}
          asignatura={asignaturaSeleccionada}
          idSeccion={idSeccion}
          sedeId={idSedeSeleccionada}
          nombreSede={nombreSedeSeleccionada}
          numSeccion={numeroSeccion}
          jornada={jornada}
        />
      </div>
    </div>
  );
}
