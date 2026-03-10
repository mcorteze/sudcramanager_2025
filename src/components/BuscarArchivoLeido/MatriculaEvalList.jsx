import { useEffect, useState } from "react";
import { Table, Spin } from "antd";

export default function MatriculaEvalList({ id_archivo_leido, onSelect }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id_archivo_leido) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3001/api/archivos_leidos/${id_archivo_leido}/matriculas`
        );
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error al cargar matrículas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_archivo_leido]);

  const columns = [
    {
      title: "ID Matrícula Eval",
      dataIndex: "id_matricula_eval",
      key: "id_matricula_eval",
    },
    {
      title: "Forma",
      dataIndex: "forma",
      key: "forma",
    },
    {
      title: "Grupo",
      dataIndex: "grupo",
      key: "grupo",
    },
    {
      title: "Imagen",
      dataIndex: "imagen",
      key: "imagen",
    },
    {
      title: "ID Archivo Leído",
      dataIndex: "id_archivoleido",
      key: "id_archivoleido",
    },
    {
      title: "Línea Leída",
      dataIndex: "linea_leida",
      key: "linea_leida",
    },
    {
      title: "Alumno",
      dataIndex: "nombre_alum",
      key: "nombre_alum",
    },
    {
      title: "Asignatura",
      dataIndex: "nom_asig",
      key: "nom_asig",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <a
          href={`/lectura/${record.id_archivoleido}/${record.linea_leida}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver lectura
        </a>
      ),
    },
  ];

  return loading ? (
    <Spin />
  ) : (
    <Table
      rowKey="id_matricula_eval"
      columns={columns}
      dataSource={data}
      onRow={(record) => ({
        onClick: () => onSelect(record.id_matricula_eval),
      })}
      pagination={false}
    />
  );
}
