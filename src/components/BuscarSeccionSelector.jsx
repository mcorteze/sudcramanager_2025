import React, { useEffect, useState } from 'react';
import { Select, Typography } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Text } = Typography;
const API = 'http://localhost:3001';

/**
 * Selector en cascada: Programa → Sede → Asignatura → Sección
 * Props:
 *   value       : id_seccion actualmente seleccionado
 *   onChange    : callback(id_seccion) cuando se elige una sección
 */
export default function BuscarSeccionSelector({ value, onChange }) {
  const [programas, setProgramas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [secciones, setSecciones] = useState([]);

  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(value ?? null);

  useEffect(() => {
    axios.get(`${API}/api/programas`).then(r => setProgramas(r.data)).catch(() => {});
    axios.get(`${API}/api/sedes`).then(r => setSedes(r.data)).catch(() => {});
  }, []);

  // Si el valor externo cambia (ej: reset al abrir modal), sincronizar
  useEffect(() => {
    setSelectedSeccion(value ?? null);
  }, [value]);

  const handleProgramaChange = (val) => {
    setSelectedPrograma(val);
    setSelectedAsignatura(null);
    setSelectedSeccion(null);
    setAsignaturas([]);
    setSecciones([]);
    onChange(null);
    axios.get(`${API}/api/asignaturas/${val}`).then(r => setAsignaturas(r.data)).catch(() => {});
  };

  const handleSedeChange = (val) => {
    setSelectedSede(val);
    setSelectedSeccion(null);
    setSecciones([]);
    onChange(null);
    if (selectedAsignatura) {
      axios.get(`${API}/api/secciones/${selectedAsignatura}/${val}`).then(r => setSecciones(r.data)).catch(() => {});
    }
  };

  const handleAsignaturaChange = (val) => {
    setSelectedAsignatura(val);
    setSelectedSeccion(null);
    setSecciones([]);
    onChange(null);
    if (selectedSede) {
      axios.get(`${API}/api/secciones/${val}/${selectedSede}`).then(r => setSecciones(r.data)).catch(() => {});
    }
  };

  const handleSeccionChange = (val) => {
    setSelectedSeccion(val);
    onChange(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Select
        placeholder="Programa"
        value={selectedPrograma}
        onChange={handleProgramaChange}
        style={{ width: '100%' }}
        showSearch
        optionFilterProp="children"
        allowClear
      >
        {programas.map(p => (
          <Option key={p.cod_programa} value={p.cod_programa}>{p.programa}</Option>
        ))}
      </Select>

      <Select
        placeholder="Sede"
        value={selectedSede}
        onChange={handleSedeChange}
        style={{ width: '100%' }}
        showSearch
        optionFilterProp="children"
        allowClear
        disabled={!selectedPrograma}
      >
        {sedes.map(s => (
          <Option key={s.id_sede} value={s.id_sede}>{s.nombre_sede}</Option>
        ))}
      </Select>

      <Select
        placeholder="Asignatura"
        value={selectedAsignatura}
        onChange={handleAsignaturaChange}
        style={{ width: '100%' }}
        showSearch
        optionFilterProp="children"
        allowClear
        disabled={!selectedPrograma}
      >
        {asignaturas.map(a => (
          <Option key={a.cod_asig} value={a.cod_asig}>{a.cod_asig}</Option>
        ))}
      </Select>

      <Select
        placeholder="Sección"
        value={selectedSeccion}
        onChange={handleSeccionChange}
        style={{ width: '100%' }}
        showSearch
        optionFilterProp="children"
        allowClear
        disabled={!secciones.length}
      >
        {secciones.map(sec => (
          <Option key={sec.id_seccion} value={sec.id_seccion}>
            {sec.seccion} — ID: {sec.id_seccion}
          </Option>
        ))}
      </Select>

      {selectedSeccion && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          id_seccion seleccionado: <strong>{selectedSeccion}</strong>
        </Text>
      )}
    </div>
  );
}
