// components/DownloadTxtButton.js
import React from 'react';
import { Button } from 'antd';
import { saveAs } from 'file-saver';

const DownloadTxtButton = ({ campoData, editableData }) => {
  // Función para manejar la descarga del archivo de texto
  const handleDescargarTxt = () => {
    // 1️⃣ Reproceso (0 si es false, 1 si es true)
    const reproceso = campoData.reproceso === 'Sí' ? 1 : 0;

    // 2️⃣ Usar directamente el nombre de la imagen sin modificar
    const nombreImagen = campoData.imagen;

    // 3️⃣ Fecha actual en formato YYMMDD
    const fecha = new Date();
    const YYMMDD = `${fecha.getFullYear().toString().slice(2)}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}`;

    // 4️⃣ Hora actual en formato hhmmss
    const hhmmss = `${fecha.getHours().toString().padStart(2, '0')}${fecha.getMinutes().toString().padStart(2, '0')}${fecha.getSeconds().toString().padStart(2, '0')}`;

    // 5️⃣ Rut (se separa en caracteres y el último dígito se ajusta según la regla)
    const rut = campoData.rut ?? '';
    const rutSinDv = rut.slice(0, -1); // Se obtiene el rut sin el dígito verificador
    let dv = rut.slice(-1); // El último dígito (DV)

    // Reemplazamos el dígito verificador según las reglas:
    if (dv === 'k' || dv === 'K') {
      dv = '10';
    } else {
      dv = dv.padStart(2, '0'); // Aseguramos que los números sean de 2 dígitos
    }

    // Separamos los caracteres del rut y el dígito verificador
    const rutSeparado = rutSinDv.split('').concat(dv).join(',');

    // 6️⃣ Código interno
    const codInterno = campoData.codInterno ?? '';

    // 7️⃣ Número de prueba
    const numPrueba = campoData.numPrueba ?? '';

    // 8️⃣ Forma
    const forma = campoData.forma ?? '';

    // 9️⃣ Registros de la tabla (se agregarán separados por coma)
    const registrosTabla = editableData
      .map(item => item.registro_leido ?? 'sinRegistro')
      .join(',');

    // 🔟 Construimos el texto completo en una sola línea, separados por comas
    const textoCompleto = [
      reproceso,
      nombreImagen,
      YYMMDD,
      hhmmss,
      rutSeparado,
      codInterno,
      numPrueba,
      forma,
      registrosTabla
    ].join(',');

    // 1️⃣1️⃣ Construir el nombre del archivo
    const archivoNombre = `sudcra-manager_${rutSeparado.replace(/,/g, '')}_${YYMMDD}_${hhmmss}.txt`;

    // 1️⃣2️⃣ Creamos el Blob y lo descargamos
    const blob = new Blob([textoCompleto], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, archivoNombre);
  };

  return (
    <Button
      type="primary"
      onClick={handleDescargarTxt}
      style={{ margin: '16px 0' }}
    >
      Descargar txt
    </Button>
  );
};

export default DownloadTxtButton;
