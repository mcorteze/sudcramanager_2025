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

const { TabPane } = Tabs;

export default function SeccionesPorSedeTabs({ data, loading }) {
  return (
    <Tabs defaultActiveKey="1" type="card">
      {/* TAB 1: Tabla */}
      <TabPane
        tab={
          <span>
            <TableOutlined /> Tabla
          </span>
        }
        key="1"
      >
        <Tabla data={data} loading={loading} />
      </TabPane>

      {/* TAB 2: Gráfico diario */}
      <TabPane
        tab={
          <span>
            <BarChartOutlined /> Gráfico diario
          </span>
        }
        key="2"
      >
        <GraficoDiario data={data} loading={loading} />
      </TabPane>

      {/* TAB 3: Gráfico acumulado */}
      <TabPane
        tab={
          <span>
            <AreaChartOutlined /> Gráfico acumulado
          </span>
        }
        key="3"
      >
        <GraficoAcumulado data={data} loading={loading} />
      </TabPane>

      {/* TAB 4: Gráfico por Evaluación */}
      <TabPane
        tab={
          <span>
            <ClusterOutlined /> Gráfico por Evaluación
          </span>
        }
        key="4"
      >
        <GraficoEvaluacion data={data} loading={loading} />
      </TabPane>

      {/* ✅ TAB 5: Gráfico por Sede */}
      <TabPane
        tab={
          <span>
            <ApartmentOutlined /> Gráfico por Sede
          </span>
        }
        key="5"
      >
        <GraficoSede data={data} loading={loading} />
      </TabPane>
    </Tabs>
  );
}
