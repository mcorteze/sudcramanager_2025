import { useEffect, useState } from "react";
import { Table, Pagination, Card, Spin, Alert, Button, Modal } from "antd";

const PAGE_SIZE = 5;

export default function SeccionesSinInscritosPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Resetea el error antes de hacer la nueva petición
      try {
        const res = await fetch("http://localhost:3001/api/secciones_sin_inscritos");

        // Si la respuesta no es OK, lanza un error
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }

        // Verifica si la respuesta es de tipo JSON
        const contentType = res.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Respuesta no es de tipo JSON");
        }

        // Parseamos el JSON de la respuesta
        const json = await res.json();

        // Si la respuesta contiene los datos esperados, actualizamos el estado
        if (Array.isArray(json)) {
          setData(json);
        } else {
          throw new Error("El formato de los datos es incorrecto.");
        }
      } catch (err) {
        setError(err.message); // Guarda el mensaje de error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  const columns = [
    {
      title: "ID Sección",
      dataIndex: "id_seccion",
      key: "id_seccion",
      sorter: (a, b) => a.id_seccion - b.id_seccion,
    },
    {
      title: "Sección",
      dataIndex: "seccion",
      key: "seccion",
    },
    {
      title: "Sede",
      dataIndex: "nombre_sede",
      key: "nombre_sede",
    },
  ];

  const paginatedData = data.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleDelete = async () => {
    setIsModalVisible(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/api/borrar_secciones_sin_inscritos", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const json = await res.json();
      
      // Almacenamos el mensaje de éxito y la cantidad de eliminados
      setSuccessMessage(json.message);
      
      // Después de eliminar las secciones, vuelve a cargar los datos
      setData([]);
    } catch (err) {
      setError(err.message); // Muestra el error en caso de fallar
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "¿Estás seguro de eliminar todas las secciones sin inscritos?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      onOk: handleDelete,
    });
  };

  return (
    <div className="page-full">
      <h1>Secciones sin inscritos</h1>
      <Card className="w-full max-w-4xl shadow-2xl rounded-2xl">
        {error && <Alert type="error" message={error} showIcon className="mb-4" />}
        {successMessage && <Alert type="success" message={successMessage} showIcon className="mb-4" />}

        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Table
              dataSource={paginatedData}
              columns={columns}
              rowKey="id_seccion"
              pagination={false}
            />
            <div className="flex justify-end mt-4">
              <Pagination
                current={current}
                pageSize={PAGE_SIZE}
                total={data.length}
                onChange={(page) => setCurrent(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}

        {/* Botón para borrar secciones sin inscritos */}
        <div className="flex justify-end mt-4">
          <Button type="danger" onClick={showDeleteConfirm}>
            Borrar secciones vacías
          </Button>
        </div>
      </Card>
    </div>
  );
}
