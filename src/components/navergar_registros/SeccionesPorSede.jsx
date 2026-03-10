import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export default function SeccionesSedeGrafico({ data, loading }) {
  // Transformar los datos en estructura por sede y evaluación
  const { evalsPorSede, evalKeys, pruebaNames } = useMemo(() => {
    const conteo = {}; // { E0: { "Sede A": 10, "Sede B": 5, ... } }
    const pruebaNames = {};
    const evalKeysSet = new Set();

    data.forEach((item) => {
      if (!item.enviado || item.enviado === "-1") return;
      if (item.num_prueba < 0 || item.num_prueba > 14) return;

      const evalKey = `E${item.num_prueba}`;
      const sede = item.nombre_sede || "Sin sede";

      if (!conteo[evalKey]) conteo[evalKey] = {};
      conteo[evalKey][sede] = (conteo[evalKey][sede] || 0) + 1;

      evalKeysSet.add(evalKey);
      pruebaNames[evalKey] = item.nombre_prueba || evalKey;
    });

    // Convertir cada evaluación en un array compatible con recharts
    const evalsPorSede = {};
    Array.from(evalKeysSet)
      .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
      .forEach((key) => {
        const sedeData = conteo[key] || {};
        evalsPorSede[key] = Object.entries(sedeData)
          .map(([sede, count]) => ({ sede, count }))
          .sort((a, b) => b.count - a.count); // ordenar por cantidad descendente
      });

    return {
      evalsPorSede,
      evalKeys: Array.from(evalKeysSet).sort(
        (a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))
      ),
      pruebaNames,
    };
  }, [data]);

  if (loading) {
    return <p>Cargando gráficos por sede...</p>;
  }

  if (!Object.keys(evalsPorSede).length) {
    return <p>No hay datos de envíos por sede para graficar.</p>;
  }

  return (
    <div style={{ width: "100%", padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Distribución de envíos por sede</h2>

      {evalKeys.map((evalKey, index) => {
        const sedeData = evalsPorSede[evalKey];
        if (!sedeData || !sedeData.length) return null;

        return (
          <div key={evalKey} style={{ marginBottom: 60 }}>
            <h3 style={{ marginBottom: 12 }}>
              {evalKey} — {pruebaNames[evalKey] || "Sin nombre"}
            </h3>
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={sedeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="sede"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill={`hsl(${(index * 60) % 360}, 65%, 55%)`}
                    barSize={35}
                  >
                    <LabelList dataKey="count" position="top" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
