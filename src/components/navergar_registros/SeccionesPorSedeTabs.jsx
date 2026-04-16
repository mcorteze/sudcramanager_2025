// src/components/SeccionesPorSedeTabs.jsx
import React from "react";
import { Tabs } from "antd";
import {
  BarChartOutlined,
  TableOutlined,
  AreaChartOutlined,
  ClusterOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";

import Tabla from "./Tabla";
import GraficoDiario from "./GraficoDiario";
import GraficoAcumulado from "./GraficoAcumulado";
import GraficoEvaluacion from "./GraficoEvaluacion";
import GraficoSede from "./GraficoSede";

export default function SeccionesPorSedeTabs({ data, loading }) {
  const items = [
    {
      key: "1",
      label: <span><TableOutlined /> Tabla</span>,
      children: <Tabla data={data} loading={loading} />,
    },
    {
      key: "2",
      label: <span><BarChartOutlined /> Gráfico diario</span>,
      children: <GraficoDiario data={data} loading={loading} />,
    },
    {
      key: "3",
      label: <span><AreaChartOutlined /> Gráfico acumulado</span>,
      children: <GraficoAcumulado data={data} loading={loading} />,
    },
    {
      key: "4",
      label: <span><ClusterOutlined /> Gráfico por Evaluación</span>,
      children: <GraficoEvaluacion data={data} loading={loading} />,
    },
    {
      key: "5",
      label: <span><ApartmentOutlined /> Gráfico por Sede</span>,
      children: <GraficoSede data={data} loading={loading} />,
    },
  ];

  return <Tabs defaultActiveKey="1" type="card" items={items} />;
}
