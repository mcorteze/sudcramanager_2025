import React from "react";
import { Table, Button } from "antd";
import { Link } from "react-router-dom";
import { ImArrowRight } from "react-icons/im";

export default function AsignaturaList({ data, programa, loading }) {
  const columns = [
    {
      title: "Código Asignatura",
      dataIndex: "cod_asig",
      key: "cod_asig",
    },
    {
      title: "Asignatura",
      dataIndex: "asig",
      key: "asig",
    },
    {
      title: "Acceder",
      key: "acceder",
      render: (_, record) => (
        <Button type="link">
          <Link
            to={`/monitorasig/${programa}/${record.cod_asig}`}
            className="link-acceder"
          >
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
      rowKey="cod_asig"
      loading={loading}
      pagination={false}
    />
  );
}
