import React from "react";
import { Table, Button } from "antd";
import { Link } from "react-router-dom";
import { ImArrowRight } from "react-icons/im";

export default function ProgramList({ data, loading }) {
  const columns = [
    {
      title: "Programa",
      dataIndex: "programa",
      key: "programa",
    },
    {
      title: "Acceder",
      key: "acceder",
      render: (_, record) => (
        <Button type="link">
          <Link to={`/monitorasig/${record.cod_programa}`} className="link-acceder">
            <ImArrowRight className="icono" />
            Acceder
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="cod_programa"
      pagination={false}
      loading={loading}
    />
  );
}
