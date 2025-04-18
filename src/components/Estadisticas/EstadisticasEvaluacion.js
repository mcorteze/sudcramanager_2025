import React, { useEffect, useState, useRef } from 'react';
import { Select, Row, Col, Spin, Button } from 'antd'; // Importa Button desde Ant Design
import { Box } from '@antv/g2plot';
import axios from 'axios';
import * as htmlToImage from 'html-to-image';

const { Option } = Select;

export default function EstadisticasEvaluacion() {
  const [estadisticas, setEstadisticas] = useState([]);
  const [data, setData] = useState([]);
  const [promedios, setPromedios] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchEstadisticas() {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/estadisticas');
        const fetchedData = response.data;
        setEstadisticas(fetchedData);

        const uniqueProgramas = [...new Set(fetchedData.map(item => item.programa))];
        setProgramas(uniqueProgramas);

        const uniqueEvaluaciones = [...new Set(fetchedData.map(item => item.num_prueba))];
        setEvaluaciones(uniqueEvaluaciones);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEstadisticas();
  }, []);

  const handleProgramaChange = (value) => {
    setSelectedPrograma(value);
    setSelectedEvaluacion(null);
  };

  const handleEvaluacionChange = (value) => {
    setSelectedEvaluacion(value);
  };

  useEffect(() => {
    if (estadisticas.length > 0) {
      const filteredData = estadisticas.filter(item => {
        return (
          (!selectedPrograma || item.programa === selectedPrograma) &&
          (!selectedEvaluacion || item.num_prueba === selectedEvaluacion)
        );
      });

      const groupedData = filteredData.reduce((acc, curr) => {
        const { cod_asig, nota } = curr;

        if (!acc[cod_asig]) {
          acc[cod_asig] = { low: Number.MAX_VALUE, high: Number.MIN_VALUE, values: [] };
        }

        acc[cod_asig].values.push(nota);
        acc[cod_asig].low = Math.min(acc[cod_asig].low, nota);
        acc[cod_asig].high = Math.max(acc[cod_asig].high, nota);

        return acc;
      }, {});

      const boxPlotData = Object.entries(groupedData).map(([key, { values, low, high }]) => {
        values.sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)] || 0;
        const median = values[Math.floor(values.length * 0.5)] || 0;
        const q3 = values[Math.floor(values.length * 0.75)] || 0;

        return {
          x: key,
          low: low,
          q1: q1,
          median: median,
          q3: q3,
          high: high,
          outliers: values.filter(value => value < low || value > high),
        };
      });

      boxPlotData.sort((a, b) => a.median - b.median);

      const averages = Object.entries(groupedData).map(([key, { values }]) => {
        const average = values.reduce((sum, value) => sum + value, 0) / values.length || 0;
        return { x: key, average };
      });

      setData(boxPlotData);
      setPromedios(averages);

      const uniqueAsignaturas = [...new Set(filteredData.map(item => item.cod_asig))];
      setAsignaturas(uniqueAsignaturas);
    }
  }, [estadisticas, selectedPrograma, selectedEvaluacion]);

  useEffect(() => {
    if (data.length > 0 && containerRef.current) {
      const boxPlot = new Box(containerRef.current, {
        width: 800,
        height: 500,
        data: data,
        xField: 'x',
        yField: ['low', 'q1', 'median', 'q3', 'high'],
        meta: {
          low: { alias: 'Mínimo' },
          q1: { alias: 'Q1' },
          median: { alias: 'Mediana' },
          q3: { alias: 'Q3' },
          high: { alias: 'Máximo' },
          outliers: { alias: 'Outliers' },
        },
        outliersField: 'outliers',
        tooltip: {
          fields: ['high', 'q3', 'median', 'q1', 'low', 'outliers'],
        },
        boxStyle: {
          stroke: '#545454',
          fill: '#1890FF',
          fillOpacity: 0.3,
        },
        animation: false,
        yAxis: {
          min: 1,
          max: 7,
          tickInterval: 0.5,
          title: {
            text: 'Notas',
          },
        },
        annotations: promedios.map((item) => ({
          type: 'circle',
          position: [item.x, item.average],
          style: {
            fill: 'red',
            stroke: 'red',
            r: 5,
          },
        })),
      });

      boxPlot.render();

      return () => {
        boxPlot.destroy();
      };
    }
  }, [data, promedios]);

  const handleDownload = () => {
    if (containerRef.current) {
      htmlToImage
        .toPng(containerRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'grafico.png';
          link.click();
        })
        .catch((error) => {
          console.error('Error al generar la imagen:', error);
        });
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Select
            placeholder="Seleccione Programa"
            style={{ width: '100%' }}
            onChange={handleProgramaChange}
            allowClear
          >
            {programas.map(programa => (
              <Option key={programa} value={programa}>
                {programa}
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={8}>
          <Select
            placeholder="Seleccione Evaluación"
            style={{ width: '100%' }}
            onChange={handleEvaluacionChange}
            value={selectedEvaluacion}
            allowClear
          >
            {evaluaciones.map(evaluacion => (
              <Option key={evaluacion} value={evaluacion}>
                {`Evaluación ${evaluacion}`}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        {loading ? (
          <Spin />
        ) : (
          <>
            <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
            <Button type="primary" onClick={handleDownload} style={{ marginTop: '20px' }}>
              Descargar Gráfico
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
