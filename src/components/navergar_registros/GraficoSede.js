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
  const { sedes, chartsData } = useMemo(() => {
    const sedeStats = {}; // { sede: { E0: { total, enviados }, ... } }
    const evalKeysSet = new Set();

    data.forEach((item) => {
      const sede = item.nombre_sede || "Sin sede";
      if (!sedeStats[sede]) sedeStats[sede] = {};

      if (item.num_prueba < 0 || item.num_prueba > 14) return;

      const evalKey = `E${item.num_prueba}`;
      evalKeysSet.add(evalKey);

      if (!sedeStats[sede][evalKey]) {
        sedeStats[sede][evalKey] = { total: 0, enviados: 0 };
      }

      sedeStats[sede][evalKey].total += 1;
      if (item.enviado && item.enviado !== "-1") {
        sedeStats[sede][evalKey].enviados += 1;
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

    const sedes = Object.keys(sedeStats).sort();

    return { sedes, chartsData, evalKeys };
  }, [data]);

  if (loading) return <p>Cargando gráficos por sede...</p>;
  if (!sedes.length) return <p>No hay datos disponibles.</p>;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
      <h2 style={{ marginBottom: 10 }}>Cobertura de envíos por evaluación en cada sede</h2>

      {sedes.map((sede, index) => (
        <div key={sede} style={{ width: "100%", height: 400 }}>
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
                      <div>Enviado: {d.enviado}% ({d.enviados} / {d.total})</div>
                      <div>No enviado: {d.no_enviado}% ({d.pendientes} / {d.total})</div>
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
              <Bar
                dataKey="no_enviado"
                stackId="a"
                fill="#ddd"
                name="No enviado (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
