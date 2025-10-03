import { useEffect, useState } from "react";
import { Table, Spin } from "antd";

export default function ItemRespList({ id_matricula_eval }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3001/api/archivos_leidos/itemresp/${id_matricula_eval}`
        );
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error al cargar itemresp:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id_matricula_eval) fetchData();
  }, [id_matricula_eval]);

  const columns = [
    { title: "ID MEI", dataIndex: "id_mei", key: "id_mei" },
    { title: "ID Matrícula Eval", dataIndex: "id_matricula_eval", key: "id_matricula_eval" },
    { title: "ID ItemResp", dataIndex: "id_itemresp", key: "id_itemresp" },
    { title: "Registro Leído", dataIndex: "registro_leido", key: "registro_leido" },
    { title: "Puntaje Alumno", dataIndex: "puntaje_alum", key: "puntaje_alum" },
  ];

  return loading ? (
    <Spin />
  ) : (
    <Table
      rowKey="id_mei"
      columns={columns}
      dataSource={data}
      pagination={false}
    />
  );
}
