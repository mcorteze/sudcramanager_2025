import React from 'react';
import { Input, Button, Space } from 'antd';

const SearchForm = ({ idArchivo, setIdArchivo, lineaLeida, setLineaLeida, handleBuscar }) => {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder="ID Archivo Leído"
        value={idArchivo}
        onChange={(e) => setIdArchivo(e.target.value)}
        style={{ width: 200 }}
      />
      <Input
        placeholder="Línea Leída"
        value={lineaLeida}
        onChange={(e) => setLineaLeida(e.target.value)}
        style={{ width: 200 }}
      />
      <Button type="primary" onClick={handleBuscar}>Buscar</Button>
    </Space>
  );
};

export default SearchForm;
