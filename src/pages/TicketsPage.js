import React, { useEffect, useState } from 'react';
import { Typography, List, Spin, Space, Card, Tag, Row, Col } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const TicketsPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/solicitudes');
        setSolicitudes(response.data);
        setFilteredSolicitudes(response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const estadosConConteo = solicitudes.reduce((acc, item) => {
    acc[item.estado] = (acc[item.estado] || 0) + 1;
    return acc;
  }, {});

  const handleEstadoFilter = (estado) => {
    setEstadoSeleccionado(estado);
    if (estado === null) {
      setFilteredSolicitudes(solicitudes);
    } else {
      setFilteredSolicitudes(solicitudes.filter((item) => item.estado === estado));
    }
    setSelectedTicket(null);
  };

  const estadoItems = [
    { estado: null, label: `Todos (${solicitudes.length})` },
    ...Object.entries(estadosConConteo).map(([estado, count]) => ({
      estado,
      label: `${estado} (${count})`,
    })),
  ];

  return (
    <div className='page-full'>
      <h1>Tickets SUDCRA</h1>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={16} style={{ width: '100%' }}>
          {/* Panel de Estados */}
          <Col xs={24} sm={6} md={4} style={{ maxHeight: 500, overflowY: 'auto' }}>
            <List
              bordered
              dataSource={estadoItems}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleEstadoFilter(item.estado)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: estadoSeleccionado === item.estado ? '#f0f5ff' : 'white',
                  }}
                >
                  <Text>{item.label}</Text>
                </List.Item>
              )}
            />
          </Col>

          {/* Panel Asunto de Ticket */}
          <Col xs={24} sm={9} md={8} style={{ maxHeight: 500, overflowY: 'auto' }}>
            <List
              bordered
              dataSource={filteredSolicitudes}
              itemLayout="vertical"
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => setSelectedTicket(item)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedTicket?.id === item.id ? '#f0f5ff' : 'white',
                    padding: 12,
                  }}
                >
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>#{item.id}</Text>
                        <Tag color={item.estado === 'Abierto' ? 'green' : 'orange'}>{item.estado}</Tag>
                    </div>
                    
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.creado_por} · {new Date(item.creado).toLocaleDateString()}
                    </Text>

                    <Text style={{ fontSize: 14 }}>{item.titulo}</Text>
                </Space>

                </List.Item>
              )}
            />
          </Col>

          {/* Panel de Detalles */}
          <Col xs={24} sm={9} md={12}>
            {selectedTicket ? (
              <Card title={`Detalle de la Solicitud #${selectedTicket.id}`} bordered>
                <p><strong>Título:</strong> {selectedTicket.titulo}</p>
                <p><strong>Sede:</strong> {selectedTicket.sede}</p>
                <p><strong>Código Asignatura:</strong> {selectedTicket.cod_asig}</p>
                <p><strong>Sección:</strong> {selectedTicket.seccion}</p>
                <p><strong>Categoría:</strong> {selectedTicket.categoria}</p>
                <p><strong>Descripción:</strong> {selectedTicket.descripcion}</p>
                <p><strong>Estado:</strong> <Tag>{selectedTicket.estado}</Tag></p>
                <p><strong>Programa:</strong> {selectedTicket.programa}</p>
                <p><strong>RUT:</strong> {selectedTicket.rut}</p>
                <p><strong>Estado Modificado:</strong> {selectedTicket.estado_modificado}</p>
                <p><strong>Datos Adjuntos:</strong> {selectedTicket.datos_adjuntos}</p>
                <p><strong>Creado:</strong> {selectedTicket.creado}</p>
                <p><strong>Creado Por:</strong> {selectedTicket.creado_por}</p>
              </Card>
            ) : (
              <Text type="secondary">Selecciona una solicitud para ver sus detalles.</Text>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default TicketsPage;
