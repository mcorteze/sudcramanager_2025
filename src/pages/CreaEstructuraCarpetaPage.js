import React, { useEffect, useState } from 'react';
import { Input, Select, Checkbox, Button, message } from 'antd';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const { Option } = Select;

const CreaEstructuraCarpetaPage = () => {
  const [estructuraDatos, setEstructuraDatos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState(null);
  const [nombreCarpeta, setNombreCarpeta] = useState('');
  const [codigosAsignatura, setCodigosAsignatura] = useState([]);
  const [codigosSeleccionados, setCodigosSeleccionados] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/datos_estructura_carpeta')
      .then((res) => res.json())
      .then((data) => {
        setEstructuraDatos(data);
        const programasUnicos = [...new Set(data.map((d) => d.programa))];
        setProgramas(programasUnicos);
      })
      .catch(() => message.error('Error al cargar datos desde el servidor.'));
  }, []);

  useEffect(() => {
    if (programaSeleccionado) {
      const asignaturas = estructuraDatos
        .filter((d) => d.programa === programaSeleccionado)
        .map((d) => d.cod_asig);

      const codigosUnicos = [...new Set(asignaturas)].sort();
      setCodigosAsignatura(codigosUnicos);
      setCodigosSeleccionados([]);
    }
  }, [programaSeleccionado]);

  const toggleSeleccionarTodas = () => {
    if (codigosSeleccionados.length === codigosAsignatura.length) {
      setCodigosSeleccionados([]);
    } else {
      setCodigosSeleccionados(codigosAsignatura);
    }
  };

  const generarEstructura = async () => {
    if (!nombreCarpeta || !programaSeleccionado || codigosSeleccionados.length === 0) {
      message.warning('Por favor completa todos los campos antes de continuar.');
      return;
    }

    const zip = new JSZip();

    estructuraDatos
      .filter(
        (d) =>
          d.programa === programaSeleccionado &&
          codigosSeleccionados.includes(d.cod_asig)
      )
      .forEach((d) => {
        const ruta = `${nombreCarpeta}/${d.programa}/${d.nombre_sede}/${d.cod_asig}/${d.seccion}/`;
        zip.folder(ruta);
      });

    try {
      const contenidoZip = await zip.generateAsync({ type: 'blob' });
      saveAs(contenidoZip, `${nombreCarpeta}_estructura.zip`);
      message.success('Archivo .zip generado correctamente');
    } catch (error) {
      console.error('Error al generar el ZIP:', error);
      message.error('No se pudo generar el archivo ZIP.');
    }
  };

  const descargarExcelEstructura = () => {
    if (!programaSeleccionado) {
      message.warning('Debes seleccionar un programa para descargar el Excel.');
      return;
    }

    const codigos = estructuraDatos
      .filter((d) => d.programa === programaSeleccionado)
      .map((d) => d.cod_asig);

    const codigosUnicos = [...new Set(codigos)].sort();

    // Hoja "Portada" con orientación y celda vacía para escribir
    const hojaPortada = XLSX.utils.aoa_to_sheet([
      ['NOMBRE CARPETA (Ej: P1)'],
      ['Escriba aquí']  // Indicativo visual de edición
    ]);

    // Hoja "Asignaturas" con encabezado y columna vacía para marcar
    const hojaAsignaturas = XLSX.utils.aoa_to_sheet([
      ['SIGLA', 'MARCAR CON X'],
      ...codigosUnicos.map((codigo) => [codigo, ''])
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, hojaPortada, 'Portada');
    XLSX.utils.book_append_sheet(wb, hojaAsignaturas, 'Asignaturas');

    XLSX.writeFile(wb, `${programaSeleccionado}_estructura.xlsx`);
  };

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h2>Crear estructura de carpetas</h2>

      <label>Nombre base de la carpeta (solo para ZIP):</label>
      <Input
        placeholder="Ej. P1"
        value={nombreCarpeta}
        onChange={(e) => setNombreCarpeta(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <label>Selecciona el programa:</label>
      <Select
        placeholder="Selecciona un programa"
        value={programaSeleccionado}
        onChange={setProgramaSeleccionado}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {programas.map((prog) => (
          <Option key={prog} value={prog}>
            {prog}
          </Option>
        ))}
      </Select>

      {codigosAsignatura.length > 0 && (
        <>
          <label>Códigos de asignatura:</label>
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              checked={codigosSeleccionados.length === codigosAsignatura.length}
              onChange={toggleSeleccionarTodas}
            >
              Seleccionar todas
            </Checkbox>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', padding: 8 }}>
            {codigosAsignatura.map((cod) => (
              <Checkbox
                key={cod}
                checked={codigosSeleccionados.includes(cod)}
                onChange={(e) => {
                  const nuevoSet = e.target.checked
                    ? [...codigosSeleccionados, cod]
                    : codigosSeleccionados.filter((c) => c !== cod);
                  setCodigosSeleccionados(nuevoSet);
                }}
              >
                {cod}
              </Checkbox>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Button type="primary" onClick={generarEstructura}>
          Descargar estructura ZIP
        </Button>
        <Button onClick={descargarExcelEstructura}>
          Descargar Excel
        </Button>
      </div>
    </div>
  );
};

export default CreaEstructuraCarpetaPage;
