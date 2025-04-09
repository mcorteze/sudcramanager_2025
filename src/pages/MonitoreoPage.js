import React, { useState } from 'react';
import { Button } from 'antd';
import UploadIdPage from './UploadIdPage';  // Importa el nuevo componente con el nombre actualizado
import MonitoreoPageUploadEx from './UploadListaPage';

export default function MenuAcceso() {
  const [currentPage, setCurrentPage] = useState(null);

  // Funciones para cambiar entre páginas
  const handleUploadIdPage = () => {
    setCurrentPage('UploadIdPage');  // Cambié a 'UploadIdPage' en lugar de 'MonitoreoPageUpload'
  };

  const handleMonitoreoPageUploadEx = () => {
    setCurrentPage('MonitoreoPageUploadEx');
  };

  return (
    <div className="page-full">
      <h1>Acceso a Páginas</h1>
      
      {/* Botones para acceder a las páginas */}
      <div style={{ marginBottom: 20 }}>
        <Button 
          type="primary" 
          onClick={handleUploadIdPage}  // Cambié a handleUploadIdPage
          style={{ marginRight: 10 }}
        >
          ID Upload, Archivo leído, Línea leída
        </Button>
        <Button 
          type="primary" 
          onClick={handleMonitoreoPageUploadEx}
        >
          ID Upload
        </Button>
      </div>

      {/* Renderiza el componente correspondiente según la página seleccionada */}
      {currentPage === 'UploadIdPage' && <UploadIdPage />}  // Cambié a 'UploadIdPage'
      {currentPage === 'MonitoreoPageUploadEx' && <MonitoreoPageUploadEx />}
    </div>
  );
}
