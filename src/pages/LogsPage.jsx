import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Badge } from 'antd';

const { Text } = Typography;

const API = 'http://localhost:3001';

const fmt = (isoStr) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const StatusBadge = ({ marcaTemporal }) => {
    const isLive = marcaTemporal ? (new Date() - new Date(marcaTemporal)) / 60000 < 6 : false;
    // Colores más vibrantes pero profesionales
    const color = isLive ? '#28a745' : '#dc3545'; 
    const glowColor = isLive ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {/* LUZ LED (Ampolleta) */}
            <div style={{ 
                width: 7, 
                height: 7, 
                borderRadius: '50%', 
                backgroundColor: color, 
                boxShadow: `0 0 8px ${glowColor}`,
                animation: isLive ? 'pulse 2s infinite' : 'none' 
            }} />
            
            {/* TEXTO CON RESPLANDOR */}
            <span style={{ 
                fontSize: 11, 
                fontWeight: 300, 
                color: color,
                textShadow: `0 0 4px ${glowColor}`,
                letterSpacing: '0.5px'
            }}>
                {isLive ? 'Live' : 'Off'}
            </span>

            {/* Inyectamos una pequeña animación de pulso si está Live */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

// --- Card de Forms (Len_parciales / Mat_parciales) ---
const FormsCard = ({ title, log, idLocal, lecturaForm }) => {
    if (!log) return null;

    const idRegistrado = lecturaForm?.imagen_recepcionada ?? '-';
    const idCalificado = lecturaForm?.imagen_calificada ?? '-';
    const marcaCalif = lecturaForm?.marca_temporal_calificacion;

    // Colores más serios: #2e86c1 (azul), #239b56 (verde), #b7950b (pardo/oro)
    return (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 14px', minWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: '#34495e' }}>{title}</Text>
                <StatusBadge marcaTemporal={log.marca_temporal} />
            </div>

            {/* Flujo: últ id registrado → últ id local → últ id calificado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#888' }}>últ id registrado</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#2e86c1' }}>{idRegistrado}</div>
                </div>
                <div style={{ fontSize: 16, color: '#aaa' }}>→</div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#888' }}>últ id local</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#239b56' }}>{idLocal ?? '-'}</div>
                </div>
                <div style={{ fontSize: 16, color: '#aaa' }}>→</div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#888' }}>últ id calificado</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#b7950b' }}>
                        {idCalificado}
                        {marcaCalif && <span style={{ fontSize: 10, fontWeight: 'normal', color: '#888', marginLeft: 4 }}>({fmt(marcaCalif)})</span>}
                    </div>
                </div>
            </div>

            {/* Img. Prep, Arch. Transfer, Marca Temporal Calificación en una línea */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: '#888' }}>
                    Img. Prep: <b style={{ fontSize: 11 }}>{log.imagenes_preparacion ?? '-'}</b>
                </span>
                <span style={{ fontSize: 10, color: '#888' }}>
                    Arch. Transfer: <b style={{ fontSize: 11 }}>{log.archivos_transfer ?? '-'}</b>
                </span>
                <span style={{ fontSize: 10, color: '#888' }}>
                    Marca Temporal Calificación: <b style={{ fontSize: 11 }}>{fmt(marcaCalif)}</b>
                </span>
            </div>
        </div>
    );
};

// --- Card de Sudcra (tickets) ---
const SudcraCard = ({ log }) => {
    if (!log) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 14px', minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: '#34495e' }}>sudcra</Text>
                <StatusBadge marcaTemporal={log.marca_temporal || log.tickets_hora || log.id_lista_sharepoint_hora} />
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#888' }}>
                    Tickets pendientes: <b style={{ fontSize: 15, color: log.tickets_pendientes > 0 ? '#922b21' : '#239b56' }}>{log.tickets_pendientes ?? '-'}</b>
                </span>
                {log.tickets_hora && (
                    <span style={{ fontSize: 10, color: '#888' }}>({fmt(log.tickets_hora)})</span>
                )}
            </div>
            {log.id_lista_sharepoint && (
                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                    Sharepoint ID: <b style={{ fontSize: 11 }}>{log.id_lista_sharepoint}</b>
                    {log.id_lista_sharepoint_hora && <span style={{ marginLeft: 4 }}>({fmt(log.id_lista_sharepoint_hora)})</span>}
                </div>
            )}
        </div>
    );
};

// --- Card de Pendientes ---
const PendientesCard = ({ data }) => {
    const items = [
        { label: 'Secciones pendientes de aprobación', count: data.pendAprob, color: '#a93226' }, 
        { label: 'Mail de sección pendientes', count: data.pendMailSecc, color: '#ba4a00' }, 
        { label: 'Mail de alumnos pendientes', count: data.pendMailAlum, color: '#af601a' }, 
        { label: 'Secciones sin inscritos', count: data.sinInscritos, color: '#117864' }, 
    ];

    return (
        <div style={{ 
            background: '#fff', 
            border: '1px solid #e0e0e0', 
            borderRadius: 6, 
            padding: '8px 16px', 
            display: 'inline-block' // El card solo ocupa el ancho necesario
        }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'nowrap' }}>
                {items.map((item, idx) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#5d6d7e', whiteSpace: 'nowrap' }}>{item.label}</span>
                            <b style={{ 
                                fontSize: 15, 
                                color: item.count > 0 ? item.color : '#239b56',
                                minWidth: '15px',
                                textAlign: 'right'
                            }}>
                                {item.count ?? 0}
                            </b>
                        </div>
                        {idx < items.length - 1 && (
                            <div style={{ width: 1, height: 16, background: '#e0e0e0' }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Tabla de actividad con paginación ---
const ActivityTable = ({ title, data, color }) => {
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const rows = useMemo(() => {
        return [...data]
            .sort((a, b) => b.hora.localeCompare(a.hora))
            .map(d => ({ hora: d.hora, total: parseInt(d.total) }));
    }, [data]);

    useEffect(() => { setPage(1); }, [data]);

    const totalPages = Math.ceil(rows.length / PAGE_SIZE);
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div style={{ background: '#fff', padding: '10px', borderRadius: 4, border: '1px solid #ddd', flex: 1 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6, color }}>{title}</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <th style={{ textAlign: 'left', padding: '3px 8px', color: '#888', fontWeight: 'normal' }}>Hora</th>
                        <th style={{ textAlign: 'right', padding: '3px 8px', color: '#888', fontWeight: 'normal' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map(r => (
                        <tr key={r.hora} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '3px 8px' }}>{r.hora}</td>
                            <td style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 'bold', color }}>{r.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 11 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        style={{ padding: '2px 8px', cursor: page === 1 ? 'default' : 'pointer', border: '1px solid #ddd', borderRadius: 3, background: '#fff', color: page === 1 ? '#ccc' : '#333' }}>
                        ‹
                    </button>
                    <span style={{ color: '#888' }}>{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        style={{ padding: '2px 8px', cursor: page === totalPages ? 'default' : 'pointer', border: '1px solid #ddd', borderRadius: 3, background: '#fff', color: page === totalPages ? '#ccc' : '#333' }}>
                        ›
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Componente Principal ---
const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [idListaData, setIdListaData] = useState([]);
    const [lecturasForm, setLecturasForm] = useState([]);
    const [statsCalificaciones, setStatsCalificaciones] = useState([]);
    const [statsInformes, setStatsInformes] = useState([]);
    const [pendientes, setPendientes] = useState({
        pendAprob: 0,
        pendMailSecc: 0,
        pendMailAlum: 0,
        sinInscritos: 0
    });

    const fetchAllData = async () => {
        try {
            const [logsRes, idListaRes, lecturasRes, statsCalifRes, statsInfRes, pendAprobRes, pendMailSeccRes, pendMailAlumRes, sinInscritosRes] = await Promise.all([
                fetch(`${API}/api/logs`),
                fetch(`${API}/api/ultimo_idlista`),
                fetch(`${API}/api/ultimas-lecturas-form-2`),
                fetch(`${API}/api/stats/calificaciones`),
                fetch(`${API}/api/stats/informes`),
                fetch(`${API}/api/informes/pendientes`),
                fetch(`${API}/api/informes/pendientes-mail`),
                fetch(`${API}/api/informes/pendientes-mail-alumnos`),
                fetch(`${API}/api/secciones_sin_inscritos`),
            ]);
            setLogs(await logsRes.json());
            setIdListaData(await idListaRes.json());
            setLecturasForm(await lecturasRes.json());
            setStatsCalificaciones(await statsCalifRes.json());
            setStatsInformes(await statsInfRes.json());

            // Procesar pendientes (pueden ser 404 si no hay datos)
            const getCount = async (res) => {
                if (!res.ok) return 0;
                const data = await res.json();
                return Array.isArray(data) ? data.length : (data.count || 0);
            };

            setPendientes({
                pendAprob: await getCount(pendAprobRes),
                pendMailSecc: await getCount(pendMailSeccRes),
                pendMailAlum: await getCount(pendMailAlumRes),
                sinInscritos: await getCount(sinInscritosRes)
            });

        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Extraer último log por equipo
    const latestByEquipo = useMemo(() => {
        const map = {};
        for (const log of logs) {
            if (!map[log.nombre_equipo]) map[log.nombre_equipo] = log;
        }
        return map;
    }, [logs]);

    const getIdLocal = (programa) => {
        const row = idListaData.find(r => r.cod_programa === programa);
        return row?.id_lista ?? null;
    };

    const getLecturaForm = (programa) => {
        return lecturasForm.find(r => r.cod_programa === programa) ?? null;
    };

    return (
        <div style={{ padding: '16px 16px 16px 10px', minHeight: '60vh', background: '#f4f6f7' }}>
            
            {/* 1. Informes Pendientes (Ahora al inicio) */}
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12, color: '#2c3e50' }}>Informes pendientes</Text>
            <div style={{ marginBottom: 24 }}>
                <PendientesCard data={pendientes} />
            </div>

            {/* 2. Monitor de Procesos */}
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12, color: '#2c3e50' }}>Monitor de Procesos</Text>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                <FormsCard
                    title="forms_ingles (Len_parciales)"
                    log={latestByEquipo['forms_ingles(Len_parciales)']}
                    idLocal={getIdLocal('len')}
                    lecturaForm={getLecturaForm('len')}
                />
                <FormsCard
                    title="forms_len (Mat_parciales)"
                    log={latestByEquipo['forms_len(Mat_parciales)']}
                    idLocal={getIdLocal('mat')}
                    lecturaForm={getLecturaForm('mat')}
                />
                <SudcraCard log={latestByEquipo['sudcra']} />
            </div>

            {/* 3. Actividad del Día */}
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8, color: '#2c3e50' }}>Actividad del Día</Text>
            <div style={{ display: 'flex', gap: 16 }}>
                <ActivityTable
                    title="Calificaciones de evaluaciones (Hoy)"
                    data={statsCalificaciones}
                    color="#2e86c1"
                />
                <ActivityTable
                    title="Informes emitidos (Hoy)"
                    data={statsInformes}
                    color="#239b56"
                />
            </div>
        </div>
    );
};

export default LogsPage;
