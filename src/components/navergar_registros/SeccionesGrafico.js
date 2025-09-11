// src/components/SeccionesGrafico.jsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

function CustomLabel({ x, y, value, index, dataKey, data }) {
  if (!value || value === 0) return null;

  const prev = index > 0 ? data[index - 1][dataKey] : null;
  const next = index < data.length - 1 ? data[index + 1][dataKey] : null;

  if (value !== prev || value !== next) {
    return (
      <text x={x} y={y - 6} fontSize={10} textAnchor="middle" fill="#333">
        {value}
      </text>
    );
  }

  return null;
}

export default function SeccionesGrafico({ data, loading }) {
  const { chartData, evalKeys } = useMemo(() => {
    const registros = [];
    const evalKeysSet = new Set();

    data.forEach((item) => {
      if (!item.enviado || item.enviado === "-1") return;

      // ✅ Solo tomamos la fecha (día) ignorando hora/minutos
      const fechaObj = new Date(item.enviado.replace(" ", "T"));
      if (isNaN(fechaObj.getTime())) return;

      const fechaStr = fechaObj.toISOString().split("T")[0]; // YYYY-MM-DD

      if (item.num_prueba >= 0 && item.num_prueba <= 14) {
        const evalKey = `E${item.num_prueba}`;
        evalKeysSet.add(evalKey);
        registros.push({ fecha: fechaStr, evalKey });
      }
    });

    // Agrupar por día + evaluación
    const grouped = {};
    registros.forEach((r) => {
      if (!grouped[r.fecha]) grouped[r.fecha] = { fecha: r.fecha };
      grouped[r.fecha][r.evalKey] = (grouped[r.fecha][r.evalKey] || 0) + 1;
    });

    // Ordenar cronológicamente por día
    const chartData = Object.values(grouped).sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

    return {
      chartData,
      evalKeys: Array.from(evalKeysSet).sort(
        (a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1))
      ),
    };
  }, [data]);

  if (loading) {
    return <p>Cargando gráfico...</p>;
  }

  if (!chartData.length) {
    return <p>No hay datos de envíos para graficar.</p>;
  }

  return (
    <div style={{ width: "100%", height: 500 }}>
      <h3 style={{ marginBottom: 20 }}>Frecuencia diaria de envíos por evaluación</h3>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="fecha"
              type="category"
              allowDuplicatedCategory={false}
              tickFormatter={(tick) =>
                new Intl.DateTimeFormat("es-CL", {
                  day: "2-digit",
                  month: "short",
                }).format(new Date(tick))
              }
            />

          <YAxis allowDecimals={false} />
          <Tooltip
            labelFormatter={(label) =>
              label
                ? new Intl.DateTimeFormat("es-CL", {
                    day: "2-digit",
                    month: "short",
                  }).format(new Date(label))
                : ""
            }
          />
          <Legend />
          {evalKeys.map((evalKey, index) => (
            <Line
              key={evalKey}
              type="linear"
              connectNulls={true}
              dataKey={evalKey}
              stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
              strokeWidth={2}
              dot={false}
            >
              <LabelList
                dataKey={evalKey}
                content={(props) => (
                  <CustomLabel {...props} data={chartData} dataKey={evalKey} />
                )}
              />
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
