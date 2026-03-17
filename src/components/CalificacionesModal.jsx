import React, { useState, useEffect } from 'react';
import { Drawer, Table, Spin, message } from 'antd';
import axios from 'axios';

const CalificacionesModal = ({ visible, onClose, idEval }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && idEval) {
            fetchData();
        }
    }, [visible, idEval]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/api/calificaciones_por_eval/${idEval}`);
            setData(response.data);
        } catch (err) {
            console.error('Error fetching calificaciones:', err);
            message.error('Error al cargar las calificaciones.');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id_calificacion', key: 'id_calificacion' },
        { title: 'Puntaje Inf', dataIndex: 'puntaje_inf', key: 'puntaje_inf' },
        { title: 'Puntaje Sup', dataIndex: 'puntaje_sup', key: 'puntaje_sup' },
        { title: 'Condición', dataIndex: 'condicion', key: 'condicion' },
        { title: 'Desc. Condición', dataIndex: 'condicion_desc', key: 'condicion_desc' },
        { title: 'Mensaje', dataIndex: 'mensaje', key: 'mensaje' },
        { title: 'ID Eval', dataIndex: 'id_eval', key: 'id_eval' },
        { title: 'Nota', dataIndex: 'nota', key: 'nota' },
    ];

    const columnsSinMensaje = columns.filter(col => col.key !== 'mensaje');

    // Notas que definen el Esquema de Calificación: Unidades de Competencia (Módulo/UC)
    const notasBaseUC = [0, 1, 10, 11];
    const notasExtendidasUC = [0, 1, 10, 11, 100, 101, 110, 111];

    // Verificar si están presentes los 4 registros base (0, 1, 10, 11)
    const notasPresentes = data.map(item => Number(item.nota));
    const tieneEsquemaUC = notasBaseUC.every(nota => notasPresentes.includes(nota));

    // Esquema 1: Unidades de Competencia (SÓLO SI ESTÁ PRESENTE LA BASE)
    const esquemaUC = tieneEsquemaUC
        ? data.filter(item => notasExtendidasUC.includes(Number(item.nota)))
        : [];

    // Esquema 2: Logro General (Nota/Nivel)
    const esquemaLogro = tieneEsquemaUC
        ? data.filter(item => !notasExtendidasUC.includes(Number(item.nota)))
        : data;

    // Ordenar Logro General para cálculos
    const esquemaLogroOrdenado = [...esquemaLogro].sort((a, b) => Number(a.nota) - Number(b.nota));

    // Extraer mensajes para el Esquema de Logro General
    const mensajesLogroNotaMenor4 = [...new Set(esquemaLogroOrdenado.filter(item => Number(item.nota) < 4).map(item => item.mensaje))].filter(Boolean);
    const mensajesLogroNotaMayorIgual4 = [...new Set(esquemaLogroOrdenado.filter(item => Number(item.nota) >= 4).map(item => item.mensaje))].filter(Boolean);

    // Primer registro >= 4 en Logro General
    const primerRegistroLogroNota4 = esquemaLogroOrdenado.find(item => Number(item.nota) >= 4);

    return (
        <Drawer
            title={`Calificaciones para Evaluación: ${idEval}`}
            placement="right"
            width={1100}
            onClose={onClose}
            open={visible}
        >
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* Esquema 1: Unidades de Competencia - SÓLO SI ESTÁ EL ESQUEMA PRESENTE */}
                    {esquemaUC.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ borderBottom: '2px solid #1677ff', paddingBottom: '8px', color: '#1677ff', marginBottom: '16px' }}>
                                Esquema de Calificación: por Unidades de Competencia
                            </h3>
                            <Table
                                dataSource={esquemaUC}
                                columns={columns}
                                rowKey="id_calificacion"
                                pagination={false}
                                size="small"
                                bordered
                            />
                        </div>
                    )}

                    {/* Esquema 2: Logro General */}
                    {esquemaLogro.length > 0 && (
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ borderBottom: '2px solid #52c41a', paddingBottom: '8px', color: '#52c41a', marginBottom: '8px' }}>
                                Esquema de Calificación: por Logro General
                            </h3>

                            <div style={{ padding: '15px', backgroundColor: '#f6ffed', borderLeft: '4px solid #52c41a', marginBottom: '16px', fontSize: '0.9em' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong style={{ color: '#237804' }}>Puntos para aprobación (Nota &gt;= 4):</strong>
                                    {primerRegistroLogroNota4 ? (
                                        <span style={{ marginLeft: '10px', fontSize: '1.2em', fontWeight: 'bold' }}>
                                            Puntaje minimo: {primerRegistroLogroNota4.puntaje_inf} - Puntaje maximo: {primerRegistroLogroNota4.puntaje_sup}
                                        </span>
                                    ) : 'No se encontró registro de aprobación.'}
                                </div>

                                <div style={{ borderTop: '1px solid #d9f7be', paddingTop: '10px' }}>
                                    <strong>Nota &lt; 4:</strong>
                                    <div style={{ marginTop: '5px', paddingLeft: '10px', color: '#444' }}>
                                        {mensajesLogroNotaMenor4.length > 0 ? mensajesLogroNotaMenor4.join(', ') : 'N/A'}
                                    </div>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Nota &gt;= 4:</strong>
                                    <div style={{ marginTop: '5px', paddingLeft: '10px', color: '#444' }}>
                                        {mensajesLogroNotaMayorIgual4.length > 0 ? mensajesLogroNotaMayorIgual4.join(', ') : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <Table
                                dataSource={esquemaLogroOrdenado}
                                columns={columnsSinMensaje}
                                rowKey="id_calificacion"
                                pagination={false}
                                size="small"
                                bordered
                            />
                        </div>
                    )}

                    {data.length === 0 && !loading && (
                        <p style={{ textAlign: 'center', color: '#999' }}>No hay registros de calificaciones para esta evaluación.</p>
                    )}
                </>
            )}
        </Drawer>
    );
};

export default CalificacionesModal;
