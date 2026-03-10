import React from 'react';
import { Table, Collapse, Typography } from 'antd';

const { Panel } = Collapse;
const { Text, Link } = Typography;

export default function ResultadosEvaluacionTable({ data, columnasDinamicas }) {
  const columnsBase = [
    { title: 'Código Asignatura', dataIndex: 'cod_asig', key: 'cod_asig' },
    { title: 'Sección', dataIndex: 'seccion', key: 'seccion' },
    {
      title: 'ID Sección',
      dataIndex: 'id_seccion',
      key: 'id_seccion',
      render: (id_seccion) => (
        <Link href={`/secciones/${id_seccion}`} target="_blank" rel="noopener noreferrer">
          {id_seccion}
        </Link>
      ),
    },
    ...columnasDinamicas.map(idEvalKey => ({
      title: idEvalKey.replace('eval_', 'Evaluación '),
      dataIndex: idEvalKey,
      key: idEvalKey,
      render: value => value ?? 0,
    }))
  ];

  const datosPorSede = data.reduce((acc, item) => {
    const sede = item.nombre_sede || 'Sin Sede';
    if (!acc[sede]) acc[sede] = [];
    acc[sede].push(item);
    return acc;
  }, {});

  const contarSeccionesConRegistros = (registros) => {
    return registros.filter(item =>
      columnasDinamicas.some(evalKey => (item[evalKey] ?? 0) > 0)
    ).length;
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h2>Resultados por evaluación</h2>
      <Collapse accordion>
        {Object.entries(datosPorSede).map(([sede, registros]) => {
          const totalConRegistros = contarSeccionesConRegistros(registros);
          return (
            <Panel
              key={sede}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{sede}</span>
                  <Text type="secondary">
                    {totalConRegistros} secciones
                  </Text>
                </div>
              }
            >
              <Table
                columns={columnsBase}
                dataSource={registros}
                rowKey={(row, i) => `${row.cod_asig}-${row.seccion}-${row.id_seccion}-${i}`}
                pagination={false}
                locale={{ emptyText: 'No se encontraron resultados.' }}
                size="small"
              />
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
}
