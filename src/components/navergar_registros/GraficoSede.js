// src/components/GraficoSede.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

export default function GraficoSede({ data, loading }) {
  const { sedes, chartsData, docentesPorSede } = useMemo(() => {
    const sedeStats = {};
    const docentesPorSede = {}; // { sede: { docente: { total, enviados } } }
    const evalKeysSet = new Set();

    data.forEach((item) => {
      const sede = item.nombre_sede || "Sin sede";
      const docente = item.nombre_docente || "Sin docente";

      if (!sedeStats[sede]) sedeStats[sede] = {};
      if (!docentesPorSede[sede]) docentesPorSede[sede] = {};

      if (!docentesPorSede[sede][docente]) {
        docentesPorSede[sede][docente] = { total: 0, enviados: 0 };
      }

      if (item.num_prueba < 0 || item.num_prueba > 14) return;
      const evalKey = `E${item.num_prueba}`;
      evalKeysSet.add(evalKey);

      // Por sede y evaluación
      if (!sedeStats[sede][evalKey]) {
        sedeStats[sede][evalKey] = { total: 0, enviados: 0 };
      }

      sedeStats[sede][evalKey].total += 1;
      docentesPorSede[sede][docente].total += 1;

      if (item.enviado && item.enviado !== "-1") {
        sedeStats[sede][evalKey].enviados += 1;
        docentesPorSede[sede][docente].enviados += 1;
      }
    });

    const evalKeys = Array.from(evalKeysSet).sort(
      (a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1))
    );

    const chartsData = {};
    Object.entries(sedeStats).forEach(([sede, evals]) => {
      const arr = evalKeys.map((evalKey) => {
        const { total = 0, enviados = 0 } = evals[evalKey] || {};
        const porcentaje = total > 0 ? (enviados / total) * 100 : 0;
        return {
          evalKey,
          enviado: parseFloat(porcentaje.toFixed(1)),
          no_enviado: parseFloat((100 - porcentaje).toFixed(1)),
          total,
          enviados,
          pendientes: total - enviados,
        };
      });
      chartsData[sede] = arr;
    });

    // Calcular porcentajes individuales por docente
    const docentesList = {};
    Object.entries(docentesPorSede).forEach(([sede, docentes]) => {
      const lista = Object.entries(docentes).map(([nombre, { total, enviados }]) => {
        const porcentaje = total > 0 ? (enviados / total) * 100 : 0;
        return { nombre, porcentaje: parseFloat(porcentaje.toFixed(1)), total, enviados };
      });
      // Orden descendente por porcentaje
      lista.sort((a, b) => b.porcentaje - a.porcentaje);
      docentesList[sede] = lista;
    });

    const sedes = Object.keys(sedeStats).sort();
    return { sedes, chartsData, docentesPorSede: docentesList };
  }, [data]);

  if (loading) return <p>Cargando gráficos por sede...</p>;
  if (!sedes.length) return <p>No hay datos disponibles.</p>;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
      <h2 style={{ marginBottom: 10 }}>Cobertura de envíos por evaluación en cada sede</h2>

      {sedes.map((sede, index) => (
        <div
          key={sede}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 40,
            width: "100%",
            minHeight: 400,
          }}
        >
          {/* Gráfico principal de la sede */}
          <div style={{ flex: 2, height: 400 }}>
            <h3 style={{ marginBottom: 8 }}>{sede}</h3>
            <ResponsiveContainer>
              <BarChart
                data={chartsData[sede]}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="evalKey"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Evaluaciones",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  label={{
                    value: "Porcentaje",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #ccc",
                          padding: 8,
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        <strong>{label}</strong>
                        <div>
                          Enviado: {d.enviado}% ({d.enviados} / {d.total})
                        </div>
                        <div>
                          No enviado: {d.no_enviado}% ({d.pendientes} / {d.total})
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar
                  dataKey="enviado"
                  stackId="a"
                  fill={`hsl(${(index * 60) % 360}, 70%, 45%)`}
                  name="Enviado (%)"
                >
                  <LabelList
                    dataKey="enviado"
                    position="insideTop"
                    formatter={(val) => `${val}%`}
                    fill="#fff"
                    fontSize={11}
                  />
                </Bar>
                <Bar dataKey="no_enviado" stackId="a" fill="#ddd" name="No enviado (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de docentes con barras de porcentaje */}
          <div
            style={{
              flex: 1,
              background: "#f9f9f9",
              borderRadius: 8,
              padding: 12,
              border: "1px solid #e0e0e0",
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            <h4 style={{ marginBottom: 10, fontWeight: "600", color: "#333" }}>
              Desempeño por docente
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
              {docentesPorSede[sede].map((doc, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ flex: 1, marginRight: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {doc.nombre}
                    </span>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      {doc.porcentaje}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      width: "100%",
                      background: "#eee",
                      borderRadius: 4,
                      overflow: "hidden",
                      marginTop: 2,
                    }}
                  >
                    <div
                      style={{
                        width: `${doc.porcentaje}%`,
                        height: "100%",
                        background:
                          doc.porcentaje >= 80
                            ? "#4caf50"
                            : doc.porcentaje >= 60
                            ? "#ffb300"
                            : "#e53935",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
