// src/components/SeccionesTabla.jsx
import React, { useMemo } from "react";
import { Table, Tooltip } from "antd";
import { MailOutlined, MailTwoTone } from "@ant-design/icons";

function useTransformSecciones(data) {
  return useMemo(() => {
    const seccionesMap = {};
    const evalsPresent = new Set();
    const pruebaNames = {};
    const enviadosPorEval = {};

    data.forEach((item) => {
      if (!seccionesMap[item.id_seccion]) {
        seccionesMap[item.id_seccion] = {
          id_seccion: item.id_seccion,
          nombre_docente: item.nombre_docente,
          rut_docente: item.rut_docente,
          nombre_sede: item.nombre_sede,
          seccion: item.seccion,
          pruebasRegistradas: 0,
          totalEvaluaciones: 0,
          ...Array.from({ length: 15 }, (_, i) => ({ [`E${i}`]: null })).reduce(
            (acc, curr) => ({ ...acc, ...curr }),
            {}
          ),
        };
      }

      if (item.num_prueba >= 0 && item.num_prueba <= 14) {
        seccionesMap[item.id_seccion][`E${item.num_prueba}`] = item.nombre_prueba;
        seccionesMap[item.id_seccion][`E${item.num_prueba}_id_eval`] =
          item.id_seccion_eval;
        seccionesMap[item.id_seccion][`E${item.num_prueba}_enviado`] = item.enviado;

        if (item.nombre_prueba) {
          seccionesMap[item.id_seccion].totalEvaluaciones += 1;
        }
        if (item.id_seccion_eval) {
          seccionesMap[item.id_seccion].pruebasRegistradas += 1;
        }

        if (item.enviado && item.enviado !== "-1") {
          enviadosPorEval[`E${item.num_prueba}`] =
            (enviadosPorEval[`E${item.num_prueba}`] || 0) + 1;
        }

        evalsPresent.add(item.num_prueba);
        pruebaNames[`E${item.num_prueba}`] = item.nombre_prueba;
      }
    });

    const seccionesArray = Object.values(seccionesMap).map((seccion) => {
      const porcentajeAvance =
        seccion.totalEvaluaciones > 0
          ? Math.round((seccion.pruebasRegistradas / seccion.totalEvaluaciones) * 100)
          : 0;
      return { ...seccion, porcentajeAvance };
    });

    const sortedEvals = Array.from(evalsPresent).sort((a, b) => a - b);

    const dynamicColumns = sortedEvals.map((num) => ({
      title: (
        <Tooltip title={pruebaNames[`E${num}`] || "Sin nombre"}>
          <span>{`E${num}`}</span>
        </Tooltip>
      ),
      dataIndex: `E${num}`,
      key: `E${num}`,
      render: (_, record) =>
        record[`E${num}`] &&
        record[`E${num}_id_eval`] &&
        record[`E${num}_enviado`] !== "-1" ? (
          <MailOutlined
            style={{ fontSize: 15, background: "yellow", color: "#1890ff" }}
          />
        ) : (
          <MailTwoTone twoToneColor="#ccc" style={{ fontSize: 15 }} />
        ),
    }));

    const totalSecciones = seccionesArray.length;
    const totalDocentes = new Set(seccionesArray.map((s) => s.rut_docente)).size;

    return {
      seccionesArray,
      dynamicColumns,
      totalSecciones,
      totalDocentes,
      enviadosPorEval,
    };
  }, [data]);
}

export default function SeccionesTabla({ data, loading }) {
  const {
    seccionesArray,
    dynamicColumns,
    totalSecciones,
    totalDocentes,
    enviadosPorEval,
  } = useTransformSecciones(data);

  const columnsSecciones = [
    {
      title: "ID Sección",
      dataIndex: "id_seccion",
      width: 80,
      key: "id_seccion",
      render: (id) => (
        <a href={`/secciones/${id}`} target="_blank" rel="noopener noreferrer">
          {id}
        </a>
      ),
    },
    {
      title: "Docente",
      dataIndex: "nombre_docente",
      width: 300,
      key: "nombre_docente",
      render: (nombre, record) => (
        <a
          href={`/carga-docente/${record.rut_docente}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {nombre}
        </a>
      ),
    },
    {
      title: "Sección",
      dataIndex: "seccion",
      key: "seccion",
    },
    ...dynamicColumns,
    {
      title: "Avance (%)",
      dataIndex: "porcentajeAvance",
      key: "avance",
      sorter: (a, b) => a.porcentajeAvance - b.porcentajeAvance,
      sortDirections: ["descend", "ascend"],
      render: (porcentaje) => {
        const isBelow100 = porcentaje < 100;
        return (
          <span
            style={{
              color: isBelow100 ? "red" : "black",
              fontWeight: isBelow100 ? "bold" : "normal",
            }}
          >
            {porcentaje}%
          </span>
        );
      },
    },
  ];

  const groupedSecciones = seccionesArray.reduce((acc, seccion) => {
    const sede = seccion.nombre_sede || "Sin sede";
    if (!acc[sede]) acc[sede] = [];
    acc[sede].push(seccion);
    return acc;
  }, {});

  return (
    <>
      <div
        style={{ textAlign: "right", color: "red", marginBottom: 12, fontWeight: 300 }}
      >
        Secciones: {totalSecciones} • Docentes (únicos): {totalDocentes}
        <br />
        {Object.entries(enviadosPorEval)
          .sort(([a], [b]) => parseInt(a.substring(1)) - parseInt(b.substring(1)))
          .map(([evalKey, count]) => (
            <span key={evalKey} style={{ marginLeft: 12 }}>
              {evalKey}: {count} enviados
            </span>
          ))}
      </div>

      {Object.keys(groupedSecciones)
        .sort()
        .map((sede) => (
          <div key={sede} className="seccion-sede" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 8 }}>{sede}</h3>
            <Table
              dataSource={groupedSecciones[sede]}
              columns={columnsSecciones}
              rowKey="id_seccion"
              loading={loading}
              pagination={false}
            />
          </div>
        ))}
    </>
  );
}
