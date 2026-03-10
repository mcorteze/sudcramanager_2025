import React, { useMemo } from "react";
import "./0_tablero.css";

// Tablero: tarjetas con vaivén sutil, evocando ideas/anotaciones mentales
// Uso en el padre:
//   import Tablero from "./tablero";
//   <Tablero onSelect={(item) => console.log(item)} />

const DEFAULT_ITEMS = [
  { id: "programacion", title: "Programación de evaluaciones", subtitle: "Calendario y hitos por sede" },
  { id: "instrumentos", title: "Instrumentos de evaluación", subtitle: "Pruebas, rúbricas y guías aplicadas" },
  { id: "aplicacion", title: "Aplicación en sedes", subtitle: "Logística y supervisión de evaluaciones" },
  { id: "resultados", title: "Resultados preliminares", subtitle: "Datos y reportes iniciales" },
  { id: "retroalimentacion", title: "Retroalimentación docente", subtitle: "Comentarios y ajustes desde las sedes" },
  { id: "seguimiento", title: "Seguimiento de estudiantes", subtitle: "Trayectorias y desempeño académico" },
  { id: "informes", title: "Informes institucionales", subtitle: "Síntesis para dirección y facultades" },
];


function Card({ item, onClick }) {
  return (
    <button
      className="tablero__card"
      onClick={() => onClick && onClick(item)}
      type="button"
    >
      <div className="tablero__cardBody">
        <h3 className="tablero__title">{item.title}</h3>
        {item.subtitle ? (
          <p className="tablero__subtitle">{item.subtitle}</p>
        ) : null}
      </div>
      <div className="tablero__noise" aria-hidden />
    </button>
  );
}

export default function Tablero({ title = "", items = DEFAULT_ITEMS, onSelect }) {
  const content = useMemo(
    () => items.map((item) => (
      <Card
        key={item.id}
        item={item}
        onClick={(i) => {
          if (onSelect) onSelect(i);
          if (i.href) window.location.assign(i.href);
        }}
      />
    )),
    [items, onSelect]
  );

  return (
    <section className="tablero">
      {title ? (
        <header className="tablero__header">
          <h2 className="tablero__heading">{title}</h2>
        </header>
      ) : null}

      <div className="tablero__grid" role="list">
        {content}
      </div>
    </section>
  );
}
