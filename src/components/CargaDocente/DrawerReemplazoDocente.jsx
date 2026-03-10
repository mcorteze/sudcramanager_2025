import React, { useEffect, useState } from 'react';
import { Drawer, Select, Button, Modal, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const DrawerReemplazoDocente = ({
  visible,
  onClose,
  rutDocenteReemplazo,
  nombreDocenteReemplazo,
}) => {
  const [programas, setProgramas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [secciones, setSecciones] = useState([]);

  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [currentDocente, setCurrentDocente] = useState(null);

  useEffect(() => {
    fetchProgramas();
    fetchSedes();
  }, []);

  const fetchProgramas = async () => {
    const res = await axios.get('http://localhost:3001/api/programas');
    setProgramas(res.data);
  };

  const fetchSedes = async () => {
    const res = await axios.get('http://localhost:3001/api/sedes');
    setSedes(res.data);
  };

  const fetchAsignaturas = async (programa) => {
    const res = await axios.get(`http://localhost:3001/api/asignaturas/${programa}`);
    setAsignaturas(res.data);
  };

  const fetchSecciones = async (asig, sede) => {
    const res = await axios.get(`http://localhost:3001/api/secciones/${asig}/${sede}`);
    setSecciones(res.data);
  };

  const fetchDocenteTitular = async (rut) => {
    const res = await axios.get(`http://localhost:3001/api/buscar-docente/${rut}`);
    if (res.data.length > 0) setCurrentDocente(res.data[0]);
  };

  const handleProgramaChange = (value) => {
    setSelectedPrograma(value);
    fetchAsignaturas(value);
  };

  const handleSedeChange = (value) => {
    setSelectedSede(value);
    if (selectedAsignatura) fetchSecciones(selectedAsignatura, value);
  };

  const handleAsignaturaChange = (value) => {
    setSelectedAsignatura(value);
    if (selectedSede) fetchSecciones(value, selectedSede);
  };

  const handleSeccionChange = (value) => {
    setSelectedSeccion(value);
    const seccion = secciones.find(sec => sec.id_seccion === value);
    if (seccion?.rut_docente) fetchDocenteTitular(seccion.rut_docente);
  };

  const handleReemplazarDocente = async () => {
    try {
      await axios.put('http://localhost:3001/api/reemplazar-docente', {
        rutNuevoDocente: rutDocenteReemplazo,
        seccion: selectedSeccion,
      });
      message.success('Docente reemplazado con éxito');
      onClose();
    } catch (error) {
      console.error(error);
      message.error('Error al reemplazar docente');
    }
  };

  const confirmReemplazo = () => {
    if (!selectedSeccion) {
      return message.warning('Seleccione una sección primero');
    }

    Modal.confirm({
      title: 'Confirmar Reemplazo',
      content: `¿Desea reemplazar al docente ${currentDocente?.nombre_doc} por ${nombreDocenteReemplazo}?`,
      onOk: handleReemplazarDocente,
    });
  };

  return (
    <Drawer
      title="Reemplazar Docente"
      placement="right"
      visible={visible}
      onClose={onClose}
    >
      <Select
        placeholder="Seleccione un programa"
        onChange={handleProgramaChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {programas.map(p => (
          <Option key={p.cod_programa} value={p.cod_programa}>
            {p.programa}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Seleccione una sede"
        onChange={handleSedeChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {sedes.map(s => (
          <Option key={s.id_sede} value={s.id_sede}>
            {s.nombre_sede}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Seleccione una asignatura"
        onChange={handleAsignaturaChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {asignaturas.map(a => (
          <Option key={a.cod_asig} value={a.cod_asig}>
            {a.cod_asig}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Seleccione una sección"
        onChange={handleSeccionChange}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {secciones.map(sec => (
          <Option key={sec.id_seccion} value={sec.id_seccion}>
            {sec.seccion}
          </Option>
        ))}
      </Select>

      {currentDocente && (
        <div>
          <hr />
          <b>Titular Actual:</b>
          <p>{currentDocente.nombre_doc} {currentDocente.apellidos_doc}</p>
          <p>RUT: {currentDocente.rut_docente}</p>
          <hr />
        </div>
      )}

      {rutDocenteReemplazo && (
        <div>
          <b>Nuevo Docente:</b>
          <p>{nombreDocenteReemplazo}</p>
          <p>RUT: {rutDocenteReemplazo}</p>
          <Button
            type="primary"
            danger
            style={{ marginTop: 16 }}
            onClick={confirmReemplazo}
          >
            Reemplazar Docente
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default DrawerReemplazoDocente;
