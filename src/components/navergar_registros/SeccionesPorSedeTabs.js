// src/components/SeccionesPorSedeTabs.jsx
import React from "react";
import { Tabs } from "antd";
import { BarChartOutlined, TableOutlined } from "@ant-design/icons";
import SeccionesTabla from "./SeccionesTabla";
import SeccionesGrafico from "./SeccionesGrafico";

const { TabPane } = Tabs;

export default function SeccionesPorSedeTabs({ data, loading }) {
  return (
    <Tabs defaultActiveKey="1" type="card">
      <TabPane
        tab={
          <span>
            <TableOutlined /> Tabla
          </span>
        }
        key="1"
      >
        <SeccionesTabla data={data} loading={loading} />
      </TabPane>

      <TabPane
        tab={
          <span>
            <BarChartOutlined /> Gráfico
          </span>
        }
        key="2"
      >
        <SeccionesGrafico data={data} loading={loading} />
      </TabPane>
    </Tabs>
  );
}
