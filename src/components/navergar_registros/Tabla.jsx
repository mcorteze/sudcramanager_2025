import React, { useMemo } from "react";
import { Table, Tooltip, Button } from "antd";
import { MailOutlined, MailTwoTone, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
          totalEvaluaciones: 0,
          enviadas: 0,
          ...Array.from({ length: 15 }, (_, i) => ({ [`E${i}`]: null })).reduce(
            (acc, curr) => ({ ...acc, ...curr }),
            {}
          ),
        };
      }

      if (item.num_prueba >= 0 && item.num_prueba <= 14) {
        const evalKey = `E${item.num_prueba}`;
        seccionesMap[item.id_seccion][evalKey] = item.nombre_prueba;
        seccionesMap[item.id_seccion][`${evalKey}_id_eval`] = item.id_seccion_eval;
        seccionesMap[item.id_seccion][`${evalKey}_enviado`] = item.enviado;

        if (item.nombre_prueba) {
          seccionesMap[item.id_seccion].totalEvaluaciones += 1;
        }
        if (item.enviado && item.enviado !== "-1") {
          seccionesMap[item.id_seccion].enviadas += 1;
          enviadosPorEval[evalKey] = (enviadosPorEval[evalKey] || 0) + 1;
        }

        evalsPresent.add(item.num_prueba);
        pruebaNames[evalKey] = item.nombre_prueba;
      }
    });

    const seccionesArray = Object.values(seccionesMap).map((seccion) => {
      const { enviadas, totalEvaluaciones } = seccion;
      const porcentajeAvance =
        totalEvaluaciones > 0
          ? Math.round((enviadas / totalEvaluaciones) * 100)
          : 0;
      return { ...seccion, porcentajeAvance };
    });

    const sortedEvals = Array.from(evalsPresent).sort((a, b) => a - b);

    const dynamicColumns = sortedEvals.map((num) => {
      const evalKey = `E${num}`;
      return {
        title: (
          <Tooltip title={pruebaNames[evalKey] || "Sin nombre"}>
            <span>{evalKey}</span>
          </Tooltip>
        ),
        dataIndex: evalKey,
        key: evalKey,
        render: (_, record) => {
          const enviadoVal = record[`${evalKey}_enviado`];
          const enviado = enviadoVal && enviadoVal !== "-1";
          return enviado ? (
            <MailOutlined
              style={{ fontSize: 15, background: "yellow", color: "#1890ff" }}
            />
          ) : (
            <MailTwoTone twoToneColor="#ccc" style={{ fontSize: 15 }} />
          );
        },
      };
    });

    const totalSecciones = seccionesArray.length;
    const totalDocentes = new Set(seccionesArray.map((s) => s.rut_docente)).size;

    return {
      seccionesArray,
      dynamicColumns,
      totalSecciones,
      totalDocentes,
      enviadosPorEval,
      evalsPresent: sortedEvals,
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
    evalsPresent,
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

  // 🔽 Descargar Excel (.xlsx) ordenado por sede y sección
  const handleDownloadXlsx = () => {
    // Ordenar primero por sede, luego por sección
    const ordered = [...seccionesArray].sort((a, b) => {
      const sedeA = (a.nombre_sede || "").toLowerCase();
      const sedeB = (b.nombre_sede || "").toLowerCase();
      if (sedeA < sedeB) return -1;
      if (sedeA > sedeB) return 1;
      const seccionA = (a.seccion || "").toLowerCase();
      const seccionB = (b.seccion || "").toLowerCase();
      return seccionA.localeCompare(seccionB, "es", { numeric: true });
    });

    const rows = ordered.map((s) => {
      const row = {
        Sede: s.nombre_sede,
        Sección: s.seccion,
        ID_Seccion: s.id_seccion,
        Docente: s.nombre_docente,
        RUT_Docente: s.rut_docente,
      };
      evalsPresent.forEach((num) => {
        const evalKey = `E${num}`;
        const enviado = s[`${evalKey}_enviado`] && s[`${evalKey}_enviado`] !== "-1";
        row[evalKey] = enviado ? "SI" : "NO";
      });
      row.Avance = `${s.porcentajeAvance}`;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Secciones");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "secciones.xlsx");
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ color: "red", fontWeight: 300 }}>
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

        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadXlsx}>
          Descargar .xlsx
        </Button>
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
