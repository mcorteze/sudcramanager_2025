import React, { useState, useEffect } from 'react';
import { Drawer, Table, Spin, message, Tabs, Tag } from 'antd';
import axios from 'axios';

const CalificacionesModal = ({ visible, onClose, idEval }) => {
    const [data, setData] = useState([]);
    const [mapaAcademico, setMapaAcademico] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && idEval) {
            fetchData();
        }
    }, [visible, idEval]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [calResp, mapaResp] = await Promise.all([
                axios.get(`http://localhost:3001/api/calificaciones_por_eval/${idEval}`),
                axios.get(`http://localhost:3001/api/mapa_academico/${idEval}`),
            ]);
            setData(calResp.data);
            setMapaAcademico(mapaResp.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            message.error('Error al cargar los datos.');
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

    const interpretarNotaUC = (nota) => {
        const n = parseInt(nota, 10);
        const areas = [];
        if (n % 10 >= 1)        areas.push('Área 1');
        if (Math.floor(n / 10) % 10 >= 1)  areas.push('Área 2');
        if (Math.floor(n / 100) % 10 >= 1) areas.push('Área 3');
        return areas.length > 0 ? areas.join(' + ') : 'Ninguna';
    };

    const colNotaUC = {
        title: 'Áreas logradas',
        key: 'areas',
        render: (_, r) => interpretarNotaUC(r.nota),
    };

    const columnsSinMensaje = columns.filter(col => col.key !== 'mensaje');
    const columnsUC = [
        ...columns.filter(col => col.key !== 'id_eval' && col.key !== 'condicion_desc'),
        colNotaUC,
    ];

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
                <Tabs defaultActiveKey="mapa" items={[
                  {
                    key: 'mapa',
                    label: 'Mapa Académico',
                    children: (
                      <>
                    {mapaAcademico.length > 0 && (() => {
                        const medidaMap = {};
                        mapaAcademico.forEach(r => { medidaMap[r.id_medida] = r; });

                        const ucRows = mapaAcademico.filter(r => r.tipo_medida_cod === 'UC');
                        const aeRows = mapaAcademico.filter(r => r.tipo_medida_cod === 'AE');
                        const ilRows = mapaAcademico.filter(r => r.tipo_medida_cod === 'IL');

                        // Construir jerarquía: por cada UC, sus AE, y por cada AE sus IL
                        const jerarquia = ucRows.map(uc => {
                            const aesDeUc = aeRows.filter(ae => ae.dependencia === uc.id_medida);
                            return {
                                uc,
                                aes: aesDeUc.map(ae => ({
                                    ae,
                                    ils: ilRows.filter(il => il.dependencia === ae.id_medida),
                                })),
                            };
                        });

                        // Si no hay UC, mostrar AE e IL directamente
                        const sinUc = ucRows.length === 0;

                        const colsAeIl = [
                            ...(aeRows.length > 0 ? [
                                { title: 'N°', dataIndex: 'ae_orden', key: 'ae_orden', width: 45 },
                                { title: 'AE — Aprendizaje Esperado', dataIndex: 'ae_desc', key: 'ae_desc' },
                            ] : []),
                            ...(ilRows.length > 0 ? [
                                { title: 'N°', dataIndex: 'il_orden', key: 'il_orden', width: 45 },
                                { title: 'IL — Indicador de Logro', dataIndex: 'il_desc', key: 'il_desc' },
                            ] : []),
                        ];

                        return (
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ borderBottom: '2px solid #722ed1', paddingBottom: '8px', color: '#722ed1', marginBottom: '16px' }}>
                                    Mapa Académico
                                </h3>

                                {sinUc ? (
                                    <Table
                                        dataSource={aeRows.map(ae => ({
                                            key: ae.id_medida,
                                            ae_orden: ae.orden,
                                            ae_desc: ae.desc_corta,
                                            il_orden: '',
                                            il_desc: '',
                                        }))}
                                        columns={colsAeIl}
                                        rowKey="key"
                                        pagination={false}
                                        size="small"
                                        bordered
                                    />
                                ) : (
                                    jerarquia.map(({ uc, aes }) => {
                                        // Aplanar AE+IL en filas para la tabla interna
                                        let filasInner = [];
                                        if (aes.length > 0) {
                                            aes.forEach(({ ae, ils }) => {
                                                if (ils.length > 0) {
                                                    ils.forEach(il => filasInner.push({
                                                        key: il.id_medida,
                                                        ae_orden: ae.orden,
                                                        ae_desc: ae.desc_corta,
                                                        il_orden: il.orden,
                                                        il_desc: il.desc_corta,
                                                        _aeId: ae.id_medida,
                                                        _aeCopiaUc: ae.desc_corta.trim() === uc.desc_corta.trim(),
                                                    }));
                                                } else {
                                                    filasInner.push({
                                                        key: ae.id_medida,
                                                        ae_orden: ae.orden,
                                                        ae_desc: ae.desc_corta,
                                                        il_orden: '',
                                                        il_desc: '',
                                                        _aeId: ae.id_medida,
                                                        _aeCopiaUc: ae.desc_corta.trim() === uc.desc_corta.trim(),
                                                    });
                                                }
                                            });
                                        }

                                        // Colores alternos por AE dentro de la tabla
                                        const aeIds = [...new Set(filasInner.map(f => f._aeId))];
                                        const aeColorMap = {};
                                        aeIds.forEach((id, i) => { aeColorMap[id] = i % 2 === 0 ? '#f0f7ff' : '#ffffff'; });

                                        const colsInner = [
                                            ...(aeRows.length > 0 ? [
                                                { title: 'N°', dataIndex: 'ae_orden', key: 'ae_orden', width: 45,
                                                  onCell: (r) => ({ style: { backgroundColor: r._aeCopiaUc ? '#fff7e6' : aeColorMap[r._aeId] } }) },
                                                { title: 'AE — Aprendizaje Esperado', dataIndex: 'ae_desc', key: 'ae_desc',
                                                  onCell: (r) => ({ style: { backgroundColor: r._aeCopiaUc ? '#fff7e6' : aeColorMap[r._aeId] } }),
                                                  render: (text, r) => r._aeCopiaUc
                                                    ? <span title="Texto idéntico al de la UC">{text} <span style={{ color: '#fa8c16', fontSize: '0.8em', fontWeight: 600 }}>= UC</span></span>
                                                    : text,
                                                },
                                            ] : []),
                                            ...(ilRows.length > 0 ? [
                                                { title: 'N°', dataIndex: 'il_orden', key: 'il_orden', width: 45,
                                                  onCell: (r) => ({ style: { backgroundColor: r._aeCopiaUc ? '#fff7e6' : aeColorMap[r._aeId] } }) },
                                                { title: 'IL — Indicador de Logro', dataIndex: 'il_desc', key: 'il_desc',
                                                  onCell: (r) => ({ style: { backgroundColor: r._aeCopiaUc ? '#fff7e6' : aeColorMap[r._aeId] } }) },
                                            ] : []),
                                        ];

                                        // Calcular coincidencia UC vs AE para esta UC
                                        const aesDeEstaUc = aes.map(({ ae }) => ae);
                                        const totalAes = aesDeEstaUc.length;
                                        const aesIgualesUc = aesDeEstaUc.filter(ae => ae.desc_corta.trim() === uc.desc_corta.trim()).length;
                                        let tagCoincidencia = null;
                                        if (totalAes > 0) {
                                            if (aesIgualesUc === totalAes) {
                                                tagCoincidencia = <Tag color="error">UC = AE en todos los registros</Tag>;
                                            } else if (aesIgualesUc > 0) {
                                                tagCoincidencia = <Tag color="warning">UC = AE en {aesIgualesUc} de {totalAes} registros</Tag>;
                                            } else {
                                                tagCoincidencia = <Tag color="success">UC ≠ AE</Tag>;
                                            }
                                        }

                                        return (
                                            <div key={uc.id_medida} style={{ marginBottom: '24px', border: '1px solid #d3adf7', borderRadius: '6px', overflow: 'hidden' }}>
                                                <div style={{ backgroundColor: '#722ed1', color: '#fff', padding: '8px 12px', fontWeight: 600, fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span>UC {uc.orden} — {uc.desc_corta}</span>
                                                    {tagCoincidencia}
                                                </div>
                                                {filasInner.length > 0 ? (
                                                    <Table
                                                        dataSource={filasInner}
                                                        columns={colsInner}
                                                        rowKey="key"
                                                        pagination={false}
                                                        size="small"
                                                        bordered={false}
                                                        style={{ margin: 0 }}
                                                    />
                                                ) : (
                                                    <div style={{ padding: '8px 12px', color: '#999', fontSize: '0.85em' }}>Sin AE ni IL asociados.</div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        );
                    })()}
                    {mapaAcademico.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999' }}>No hay mapa académico para esta evaluación.</p>
                    )}
                      </>
                    ),
                  },
                  {
                    key: 'esquemas',
                    label: 'Esquemas de Calificación',
                    children: (
                      <>
                    {/* Esquema 1: Unidades de Competencia - SÓLO SI ESTÁ EL ESQUEMA PRESENTE */}
                    {esquemaUC.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ borderBottom: '2px solid #1677ff', paddingBottom: '8px', color: '#1677ff', marginBottom: '16px' }}>
                                Esquema de Calificación: por Unidades de Competencia
                            </h3>
                            <Table
                                dataSource={esquemaUC}
                                columns={columnsUC}
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
                    ),
                  },
                ]} />
            )}
        </Drawer>
    );
};

export default CalificacionesModal;
