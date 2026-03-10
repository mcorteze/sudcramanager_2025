import React from 'react';
import { Input, Row, Col } from 'antd';

const EditableDataFields = ({ campoData, setCampoData }) => {
  const fields = [
    { label: 'ID Lectura',        field: 'idLectura' },
    { label: 'RUT',               field: 'rut' },
    { label: 'ID Archivo Leído',  field: 'idArchivoLeido' },
    { label: 'Línea Leída',       field: 'lineaLeida' },
    { label: 'Reproceso',         field: 'reproceso' },
    { label: 'Imagen',            field: 'imagen' },
    { label: 'Instante Forms',    field: 'instanteForms' },
    { label: 'N° Prueba',         field: 'numPrueba' },
    { label: 'Forma',             field: 'forma' },
    { label: 'Grupo',             field: 'grupo' },
    { label: 'Código Interno',    field: 'codInterno' },
  ];

  return (
    <Row gutter={[0, 16]}>
      {fields.map(({ label, field }) => (
        <Col span={24} key={field}>
          <strong>{label}:</strong>
          <Input
            value={campoData[field]}
            onChange={e =>
              setCampoData(prev => ({ ...prev, [field]: e.target.value }))
            }
          />
        </Col>
      ))}
    </Row>
  );
};

export default EditableDataFields;
