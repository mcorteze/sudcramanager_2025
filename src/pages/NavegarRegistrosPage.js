import React, { useEffect, useState } from "react";
import axios from "axios";
import { Breadcrumb } from "antd";
import { Link, useParams } from "react-router-dom";
import ProgramList from "../components/navergar_registros/ProgramList";
import AsignaturaList from "../components/navergar_registros/AsignaturaList";
import SeccionesPorSede from "../components/navergar_registros/SeccionesPorSede";
import "./MonitorPage.css";

export default function NavegarRegistrosPage() {
  const [programas, setProgramas] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const { programa, asignatura } = useParams();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);

        // Programas siempre se consultan (como en tu versión original)
        const t1 = axios
          .get("http://localhost:3001/api/programas")
          .then((r) => !cancelled && setProgramas(r.data))
          .catch((e) => {
            console.error("Error fetching programas:", e);
            !cancelled && setProgramas([]);
          });

        // Asignaturas solo cuando existe programa
        const t2 = programa
          ? axios
              .get(`http://localhost:3001/api/monitorasig/${programa}`)
              .then((r) => !cancelled && setAsignaturas(r.data))
              .catch((e) => {
                console.error("Error fetching asignaturas:", e);
                !cancelled && setAsignaturas([]);
              })
          : Promise.resolve();

        // Secciones solo cuando existe programa y asignatura
        const t3 =
          programa && asignatura
            ? axios
                .get(
                  `http://localhost:3001/api/monitorasig/${programa}/${asignatura}`
                )
                .then((r) => !cancelled && setSecciones(r.data))
                .catch((e) => {
                  console.error("Error fetching secciones:", e);
                  !cancelled && setSecciones([]);
                })
            : Promise.resolve();

        await Promise.all([t1, t2, t3]);
      } finally {
        !cancelled && setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [programa, asignatura]);

  return (
    <div className="page-full">
      <h1>Navegar por programa y asignatura</h1>

      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/monitorasig">Programa</Link>
        </Breadcrumb.Item>
        {programa && (
          <Breadcrumb.Item>
            <Link to={`/monitorasig/${programa}`}>Asignatura</Link>
          </Breadcrumb.Item>
        )}
        {asignatura && (
          <Breadcrumb.Item>
            <Link to={`/monitorasig/${programa}/${asignatura}`}>Secciones</Link>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>

      {!programa && (
        <div className="monitor-container">
          <ProgramList data={programas} loading={loading} />
        </div>
      )}

      {programa && !asignatura && (
        <div className="monitor-container">
          <AsignaturaList
            data={asignaturas}
            loading={loading}
            programa={programa}
          />
        </div>
      )}

      {programa && asignatura && (
        <div className="monitor-container">
          <SeccionesPorSede data={secciones} loading={loading} />
        </div>
      )}
    </div>
  );
}
