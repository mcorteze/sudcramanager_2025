// src/components/SeccionesGraficoAcum.jsx
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

function CustomLabel({ x, y, value, index, dataKey, data }) {
  if (value == null || value === 0) return null;
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

export default function GraficoAcumulado({ data, loading }) {
  const { chartData, evalKeys } = useMemo(() => {
    const registros = [];
    const evalKeysSet = new Set();

    data.forEach((item) => {
      if (!item.enviado || item.enviado === "-1") return;
      const fechaObj = new Date(item.enviado.replace(" ", "T"));
      if (isNaN(fechaObj.getTime())) return;
      const fechaStr = fechaObj.toISOString().split("T")[0];

      if (item.num_prueba >= 0 && item.num_prueba <= 14) {
        const evalKey = `E${item.num_prueba}`;
        evalKeysSet.add(evalKey);
        registros.push({ fecha: fechaStr, evalKey });
      }
    });

    const grouped = {};
    registros.forEach((r) => {
      if (!grouped[r.fecha]) grouped[r.fecha] = { fecha: r.fecha };
      grouped[r.fecha][r.evalKey] = (grouped[r.fecha][r.evalKey] || 0) + 1;
    });

    const sortedDays = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const chartData = [];
    const acumulado = {};
    const firstSeen = {};

    const keys = Array.from(evalKeysSet).sort(
      (a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)
    );
    keys.forEach((k) => {
      acumulado[k] = 0;
      firstSeen[k] = false;
    });

    sortedDays.forEach((fecha) => {
      const daily = grouped[fecha];
      const entry = { fecha };

      keys.forEach((k) => {
        const inc = daily[k] || 0;
        if (!firstSeen[k]) {
          if (inc > 0) {
            firstSeen[k] = true;
            acumulado[k] = inc;
            entry[k] = acumulado[k];
          } else {
            entry[k] = undefined;
          }
        } else {
          acumulado[k] += inc;
          entry[k] = acumulado[k];
        }
      });

      chartData.push(entry);
    });

    return { chartData, evalKeys: keys };
  }, [data]);

  if (loading) return <p>Cargando gráfico acumulado...</p>;
  if (!chartData.length) return <p>No hay datos de envíos para graficar.</p>;

  // 🎨 Paleta minimalista (pastel con transparencia)
  const palette = [
    "rgba(66, 133, 244, 0.25)", // azul suave
    "rgba(219, 68, 55, 0.25)",  // rojo coral
    "rgba(244, 180, 0, 0.25)",  // dorado pastel
    "rgba(15, 157, 88, 0.25)",  // verde menta
    "rgba(171, 71, 188, 0.25)", // violeta suave
    "rgba(0, 172, 193, 0.25)",  // celeste
    "rgba(255, 112, 67, 0.25)", // naranja coral
  ];

  return (
    <div style={{ width: "100%", height: 500 }}>
      <h3 style={{ marginBottom: 20 }}>
        Evolución acumulada de envíos por evaluación
      </h3>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
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
          {evalKeys.map((evalKey, index) => {
            const color = palette[index % palette.length];
            return (
              <Area
                key={evalKey}
                type="monotone"
                dataKey={evalKey}
                stroke={color.replace("0.25", "1")} // misma paleta, sin transparencia
                fill={color}
                strokeWidth={2}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={evalKey}
                  content={(props) => (
                    <CustomLabel {...props} data={chartData} dataKey={evalKey} />
                  )}
                />
              </Area>
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
