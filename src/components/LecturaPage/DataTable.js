import React, { useMemo } from 'react';
import { Table, Input, Row, Col } from 'antd';

/** Divide un arreglo en bloques de tamaño `size`. */
const chunkData = (arr, size = 10) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/**
 * DataTable
 * @param {{
 *   data: any[],
 *   columns: import('antd').ColumnType[],
 *   handleRegistroChange: (id: string|number, value: string) => void
 * }} props
 */
const DataTable = ({ data = [], columns = [], handleRegistroChange }) => {
  const numbered = useMemo(
    () => data.map((r, i) => ({ ...r, n: i + 1 })),
    [data]
  );

  // ⚠️ Usar `value` en lugar de `defaultValue`
  const cols = useMemo(() =>
    columns.map(col =>
      col.dataIndex === 'registro_leido'
        ? {
            ...col,
            render: (_, record) => (
              <Input
                value={record.registro_leido}          // ← ligado al estado
                onChange={e =>
                  handleRegistroChange(record.id_lectura, e.target.value)
                }
              />
            ),
          }
        : col
    ), [columns, handleRegistroChange]
  );


  // 3️⃣ dividimos en bloques de 10
  const bloques = useMemo(() => chunkData(numbered, 10), [numbered]);

  return (
    <Row gutter={[16, 16]} align="top">
      {bloques.map((bloque, idx) => (
        <Col xs={24} md={12} lg={8} key={idx}>
          <Table
            dataSource={bloque}
            columns={cols}
            rowKey="id_lectura"
            pagination={false}
            bordered
            size="small"
          />
        </Col>
      ))}
    </Row>
  );
};

export default DataTable;
