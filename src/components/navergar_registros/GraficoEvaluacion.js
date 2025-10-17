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

export default function GraficoEvaluacion({ data, loading }) {
  const { evalKeys, chartsData } = useMemo(() => {
    const evalKeysSet = new Set();
    const sedeStats = {}; // { sede: { E0: { total: n, enviados: n }, ... } }

    data.forEach((item) => {
      const sede = item.nombre_sede || "Sin sede";
      if (!sedeStats[sede]) sedeStats[sede] = {};

      if (item.num_prueba < 0 || item.num_prueba > 14) return;

      const evalKey = `E${item.num_prueba}`;
      evalKeysSet.add(evalKey);

      if (!sedeStats[sede][evalKey]) {
        sedeStats[sede][evalKey] = { total: 0, enviados: 0 };
      }

      // Toda sección que tenga evaluación cuenta como parte del total
      sedeStats[sede][evalKey].total += 1;

      // Si tiene envío válido, cuenta como enviado
      if (item.enviado && item.enviado !== "-1") {
        sedeStats[sede][evalKey].enviados += 1;
      }
    });

    // Convertir a dataset por evaluación
    const chartsData = {};
    Array.from(evalKeysSet)
      .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
      .forEach((evalKey) => {
        const arr = Object.entries(sedeStats).map(([sede, evals]) => {
          const { total = 0, enviados = 0 } = evals[evalKey] || {};
          const porcentaje = total > 0 ? (enviados / total) * 100 : 0;
          return {
            sede,
            enviado: parseFloat(porcentaje.toFixed(1)),
            no_enviado: parseFloat((100 - porcentaje).toFixed(1)),
          };
        });
        chartsData[evalKey] = arr.sort((a, b) => b.enviado - a.enviado);
      });

    return {
      evalKeys: Array.from(evalKeysSet).sort(
        (a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1))
      ),
      chartsData,
    };
  }, [data]);

  if (loading) return <p>Cargando gráficos por sede...</p>;
  if (!evalKeys.length) return <p>No hay datos disponibles.</p>;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
      <h2 style={{ marginBottom: 10 }}>Cobertura de envíos por sede y evaluación</h2>

      {evalKeys.map((evalKey, index) => (
        <div key={evalKey} style={{ width: "100%", height: 400 }}>
          <h3 style={{ marginBottom: 8 }}>{evalKey}</h3>
          <ResponsiveContainer>
            <BarChart
              data={chartsData[evalKey]}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis
                dataKey="sede"
                type="category"
                width={150}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val, name) =>
                  name === "enviado"
                    ? [`${val.toFixed(1)}%`, "Enviado"]
                    : [`${val.toFixed(1)}%`, "Pendiente"]
                }
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
                  position="insideRight"
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
