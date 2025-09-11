import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { Link } from "react-router-dom";
import { ImArrowRight } from "react-icons/im";

export default function AsignaturaList({ data, programa, loading }) {
  const [dataWithTotals, setDataWithTotals] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const fetchTotals = async () => {
      const updatedData = await Promise.all(
        data.map(async (item) => {
          try {
            const res = await fetch(`http://localhost:3001/api/total-matricula_eval/${item.cod_asig}`);
            const result = await res.json();
            return {
              ...item,
              total_secciones: result.total_secciones || 0,
            };
          } catch (error) {
            console.error("Error al obtener total:", error);
            return { ...item, total_secciones: 0 };
          }
        })
      );
      setDataWithTotals(updatedData);
    };

    fetchTotals();
  }, [data]);

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
      title: "Secciones procesadas",
      dataIndex: "total_secciones",
      key: "total_secciones",
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
      dataSource={dataWithTotals}
      columns={columns}
      rowKey="cod_asig"
      loading={loading}
      pagination={false}
    />
  );
}
