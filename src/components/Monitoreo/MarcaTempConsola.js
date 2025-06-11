import React, { useEffect, useState, useRef } from 'react';
import { Card, Spin, Alert, Divider } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import './MarcaTempConsola.css';

dayjs.locale('es');


const MarcaTempConsola = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const bottomRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/listado-informes-enviados');
      const sortedData = [...response.data].sort(
        (a, b) => new Date(a.marca_temp_mail) - new Date(b.marca_temp_mail)
      );
      setData(sortedData);
      setError(null);
    } catch (err) {
      console.error('Error al obtener marcas temporales:', err);
      setError('No se pudo cargar la consola de informes.');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);

  return (
    <Card className="marca-temp-consola" bodyStyle={{ padding: 0 }}>
      <div className="marca-temp-title">
        🖥️ Informes sección enviados
      </div>

      {loadingInitial ? (
        <div style={{ padding: 12 }}><Spin /></div>
      ) : error ? (
        <div style={{ padding: 12 }}><Alert type="error" message={error} /></div>
      ) : (
        <div style={{ padding: 12 }}>
          {data.map((item, index) => {
            const currentDate = dayjs(item.marca_temp_mail);
            const previousDate = index > 0 ? dayjs(data[index - 1].marca_temp_mail) : null;
            const isNewDay = !previousDate || !currentDate.isSame(previousDate, 'day');
            const formattedDate = currentDate.format('dddd D [de] MMMM');

            return (
              <React.Fragment key={index}>
                {isNewDay && (
                  <Divider
                    orientation="left"
                    plain
                    style={{
                      color: '#888',
                      fontSize: '10px',
                      margin: '8px 0',
                      borderColor: '#444',
                    }}
                  >
                    {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                  </Divider>
                )}
                <div className="marca-temp-consola-span">
                  <span style={{ color: '#4ec9b0', marginRight: '4px' }}>
                    {currentDate.format('HH:mm:ss')}
                  </span>
                  <span style={{ color: '#dcdcaa' }}>{item.nombre_sede}</span>{' '}
                  <span style={{ color: '#9cdcfe' }}>{item.eval}</span>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </Card>
  );
};

export default MarcaTempConsola;
