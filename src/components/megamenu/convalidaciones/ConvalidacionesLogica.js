// components/megamenu/convalidaciones/ConvalidacionesLogica.jsx
import React from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

export default function ConvalidacionesLogica() {
  return (
    <div className="p-3">
      <Card title="Guía mínima — Reporte de Convalidación DARA">
        <section className="mb-3">
          <h4 className="mt-0">Script Python <code>txt_convalidacion</code></h4>
          <ul>
            <li>Genera archivos TXT por sede con el listado de convalidados.</li>
            <li>Formato: columnas de ancho fijo (cantidad de caracteres definida por columna).</li>
            <li>Incluye un parche que reemplaza el corte de exigencia de <strong>70% → 65%</strong> para que el código lo lea correctamente.</li>
          </ul>
        </section>

        <Divider />

        <section className="mb-3">
          <h4 className="mt-0">Tabla <code>calificaciones_obtenidas</code> (pgAdmin)</h4>
          <ul>
            <li>Campos relevantes: <code>logro_obtenido</code>, <code>dara_convalidacion</code>.</li>
            <li>
              <code>dara_convalidacion</code> se cambia manualmente a <code>true</code> al finalizar el proceso para mantener al día los registros ya analizados y extraídos,
              independiente de si el resultado permitió convalidación o no.
            </li>
          </ul>
        </section>

        <Divider />

        <section className="mb-3">
          <h4 className="mt-0">Vista <code>convalidacion_dara</code></h4>
          <p className="m-0">
            Vista almacenada que devuelve las convalidaciones aplicando criterios como el <strong>65%</strong> usando datos de <code>calificaciones_obtenidas</code>.
          </p>
        </section>

        <Divider />

        <section className="mb-3">
          <h4 className="mt-0">Tabla <code>convalidacion</code></h4>
          <p className="m-0">
            Mantiene el registro por asignatura y <code>cod_norma</code> necesarios para la convalidación.
          </p>
        </section>

        <Divider />

        <section>
          <h4 className="mt-0">Pasos (resumen operativo)</h4>
          <ol className="pl-3">
            <li>Verficiar si existe registro de norma para la asignatura</li>
            <li>Ejecutar/consultar la vista <code>convalidacion_dara</code></li>
            <li>Correr <code>txt_convalidacion</code> para generar los TXT por sede</li>
            <li>
              Tras finalizar, marcar <code>dara_convalidacion = true</code> en <code>calificaciones_obtenidas</code> para todos los registros de la tabla.
            </li>
          </ol>
        </section>
      </Card>
    </div>
  );
}
