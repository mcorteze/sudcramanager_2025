import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaLink } from 'react-icons/fa';
import SearchBar from '../components/ImagenPage/SearchBar';
import ImagenesTable from '../components/ImagenPage/ImagenesTable';
import ErroresTable from '../components/ImagenPage/ErroresTable';
import LecturaTable from '../components/ImagenPage/LecturaTable';
import LecturaTempTable from '../components/ImagenPage/LecturaTempTable';
import './ImagenPage.css';

export default function ImagenPage() {
  const { id_lista } = useParams();
  const [searchTerm, setSearchTerm] = useState(id_lista || '');
  const [erroresData, setErroresData] = useState([]);
  const [imagenesData, setImagenesData] = useState([]);
  const [lecturaData, setLecturaData] = useState([]);
  const [lecturaTempData, setLecturaTempData] = useState([]);
  const [idEval, setIdEval] = useState(null);
  const [loadingErrores, setLoadingErrores] = useState(false);
  const [loadingImagenes, setLoadingImagenes] = useState(false);
  const [loadingLectura, setLoadingLectura] = useState(false);
  const [loadingLecturaTemp, setLoadingLecturaTemp] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    if (id_lista) {
      handleSearch();
    }
  }, [id_lista]);

  const handleSearch = async () => {
    if (!searchTerm) return;

    setLoadingErrores(true);
    setLoadingImagenes(true);
    setLoadingLectura(true);
    setLoadingLecturaTemp(true);

    try {
      const erroresResponse = await axios.get(`http://localhost:3001/api/errores/${searchTerm}`);
      setErroresData(erroresResponse.data);

      const imagenesResponse = await axios.get(`http://localhost:3001/api/imagenes/${searchTerm}`);
      setImagenesData(imagenesResponse.data);

      const lecturaResponse = await axios.get(`http://localhost:3001/api/lecturas_calificadas/${searchTerm}`);
      setLecturaData(lecturaResponse.data);

      const lecturaTempResponse = await axios.get(`http://localhost:3001/api/lectura_temp/${searchTerm}`);
      setLecturaTempData(lecturaTempResponse.data);

      const idEvalResponse = await axios.get(`http://localhost:3001/api/seguimientoimageneval/${searchTerm}`);
      if (idEvalResponse.data && idEvalResponse.data.id_eval) {
        setIdEval(idEvalResponse.data.id_eval);
      } else {
        setIdEval(null);
      }

      // Verificar si hay resultados en cualquiera de las tablas
      setHasResults(
        erroresResponse.data.length > 0 ||
        imagenesResponse.data.length > 0 ||
        lecturaResponse.data.length > 0 ||
        lecturaTempResponse.data.length > 0
      );

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingErrores(false);
      setLoadingImagenes(false);
      setLoadingLectura(false);
      setLoadingLecturaTemp(false);
    }
  };

  const getIdSeccionTitle = (data) => {
    const uniqueSecciones = [...new Set(data.map(item => item.id_seccion))];
    if (uniqueSecciones.length > 0) {
      return (
        <div className='search-info'>
          <p style={{ marginRight: '10px' }}>
            Busqueda para: <strong>{searchTerm}</strong>
          </p>
          <p style={{ marginRight: '10px' }}>
            ID Sección:
            {uniqueSecciones.map((idSeccion) => (
              <Link
                key={idSeccion}
                to={`/secciones/${idSeccion}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: '5px',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                {idSeccion}
              </Link>
            ))}
          </p>
          {idEval && (
            <p style={{ marginRight: '10px' }}>
              ID Eval: {idEval}
            </p>
          )}
          {idEval && uniqueSecciones.length > 0 && (
            <a
              href={`https://duoccl0-my.sharepoint.com/personal/lgutierrez_duoc_cl/Documents/SUDCRA/informes/2025001/secciones/${idEval}_${uniqueSecciones[0]}.html`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              <FaLink style={{ marginRight: '5px' }} />
              Ver Informe
            </a>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-full">
      <h1>Seguimiento de imágenes</h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}
      >
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
        />

        {hasResults && (
          <a
            href={`/upload/${searchTerm}`}  
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            Ir a Upload
          </a>
        )}
      </div>

      {imagenesData.length > 0 && getIdSeccionTitle(imagenesData)}

      <ImagenesTable imagenesData={imagenesData} loading={loadingImagenes} />
      <LecturaTable lecturaData={lecturaData} loading={loadingLectura} />
      <ErroresTable erroresData={erroresData} loading={loadingErrores} />
      <LecturaTempTable lecturaTempData={lecturaTempData} loading={loadingLecturaTemp} />
    </div>
  );
}
