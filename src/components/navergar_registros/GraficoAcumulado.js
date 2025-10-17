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
      const fechaStr = fechaObj.toISOString().split("T")[0]; // YYYY-MM-DD

      if (item.num_prueba >= 0 && item.num_prueba <= 14) {
        const evalKey = `E${item.num_prueba}`;
        evalKeysSet.add(evalKey);
        registros.push({ fecha: fechaStr, evalKey });
      }
    });

    // Conteo diario por fecha/evaluación
    const grouped = {};
    registros.forEach((r) => {
      if (!grouped[r.fecha]) grouped[r.fecha] = { fecha: r.fecha };
      grouped[r.fecha][r.evalKey] = (grouped[r.fecha][r.evalKey] || 0) + 1;
    });

    // Fechas (solo días con actividad)
    const sortedDays = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const chartData = [];
    const acumulado = {};
    const firstSeen = {}; // marca el primer día en que aparece cada evaluación

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
            entry[k] = acumulado[k]; // comienza aquí
          } else {
            entry[k] = undefined; // no dibujar antes del primer registro
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

  return (
    <div style={{ width: "100%", height: 500 }}>
      <h3 style={{ marginBottom: 20 }}>Evolución acumulada de envíos por evaluación</h3>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="fecha"
            type="category"
            allowDuplicatedCategory={false}
            tickFormatter={(tick) =>
              new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" })
                .format(new Date(tick))
            }
          />
          <YAxis allowDecimals={false} />
          <Tooltip
            labelFormatter={(label) =>
              label
                ? new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" })
                    .format(new Date(label))
                : ""
            }
          />
          <Legend />
          {evalKeys.map((evalKey, index) => (
            <Area
              key={evalKey}
              type="monotone"
              dataKey={evalKey}
              stackId="1"
              stroke={`hsl(${(index * 60) % 360}, 70%, 45%)`}
              fill={`hsl(${(index * 60) % 360}, 70%, 70%)`}
              isAnimationActive={false}
            >
              <LabelList
                dataKey={evalKey}
                content={(props) => (
                  <CustomLabel {...props} data={chartData} dataKey={evalKey} />
                )}
              />
            </Area>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
