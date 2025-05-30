import React, { useState, useEffect } from 'react';

const AlumnosPage = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [error, setError] = useState(null);

    // Llamada a la API para obtener los alumnos
    useEffect(() => {
        const fetchAlumnos = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/gestion/obtener_alumnos/");
                if (!response.ok) {
                    throw new Error('Error al obtener los alumnos');
                }
                const data = await response.json();
                setAlumnos(data.alumnos);  // Almacenamos los datos en el estado
            } catch (err) {
                setError(err.message);  // Manejamos cualquier error
            }
        };

        fetchAlumnos();  // Llamar a la API cuando el componente se monta
    }, []);  // Solo se ejecuta una vez al montar el componente

    return (
        <div>
            <h1>Lista de Alumnos(leido con django)</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Mostrar error si existe */}
            <ul>
                {alumnos.length > 0 ? (
                    alumnos.map((alumno) => (
                        <li key={alumno.id}>
                            {alumno.nombre} {alumno.apellido}
                        </li>
                    ))
                ) : (
                    <p>No se encontraron alumnos.</p>
                )}
            </ul>
        </div>
    );
};

export default AlumnosPage;
