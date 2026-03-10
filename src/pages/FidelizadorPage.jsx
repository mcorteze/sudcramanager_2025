import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse"; // Usamos papaparse para parsear CSV

const TokenViewer = () => {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTokenAndData = async () => {
      try {
        // Paso 1: Obtener el token desde tu backend
        const tokenRes = await axios.post("http://localhost:3002/get-token");
        const accessToken = tokenRes.data.access_token;
        setToken(accessToken);

        // Paso 2: Usar ese token para llamar a tu endpoint local, que obtiene el CSV
        const apiRes = await axios.get("http://localhost:3002/api/fidelizador/reports/delivery", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'text', // Especificamos que esperamos un archivo de texto (CSV)
        });

        // Parsear el CSV a JSON
        Papa.parse(apiRes.data, {
          complete: (result) => {
            setData(result.data); // Guardar los datos obtenidos
          },
          error: (err) => {
            setError("Error al procesar el archivo CSV");
            console.error("Error parsing CSV:", err.message);
          },
        });

      } catch (err) {
        // Manejo de errores mejorado
        const errorMessage = err.response?.data?.error || err.message || "Algo falló";
        setError(errorMessage);
        console.error("Error:", errorMessage);
      }
    };

    fetchTokenAndData();
  }, []); // Dependencia vacía, se ejecuta solo al montar el componente

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fidelizador API Viewer</h1>
      
      {/* Mostrar errores si ocurren */}
      {error && <p className="text-red-500">❌ {error}</p>}
      
      {/* Mostrar si el token fue obtenido */}
      {token && <p className="text-green-600">✅ Token obtenido</p>}
      
      {/* Mostrar los datos en una tabla */}
      {data ? (
        <table className="w-full mt-4 border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Estado</th>
              {/* Puedes añadir más columnas dependiendo de los datos que contiene el reporte */}
            </tr>
          </thead>
          <tbody>
            {/* Asumiendo que el CSV parseado tiene un formato adecuado */}
            {data.map((row, index) => (
              <tr key={index}>
                <td className="p-2 border">{row.Email}</td>
                <td className="p-2 border">{row.Date}</td>
                <td className="p-2 border">{row.Status}</td>
                {/* Ajusta estos campos según el formato del CSV */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p className="mt-4">Cargando datos...</p> // Mensaje de carga mientras se obtiene data
      )}
    </div>
  );
};

export default TokenViewer;
