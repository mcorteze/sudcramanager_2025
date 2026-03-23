// ConfiguraPlanilla.jsx
import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Card, Input } from 'antd';
import 'antd/dist/reset.css';

const ConfiguraPlanilla = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchEvalData();
    }, []);

    const fetchEvalData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/eval-config');
            if (!response.ok) {
                throw new Error('Error al obtener los datos de configuración');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Asignatura',
            dataIndex: 'cod_asig',
            key: 'cod_asig',
            sorter: (a, b) => a.cod_asig.localeCompare(b.cod_asig),
        },
        {
            title: 'N° Prueba',
            dataIndex: 'num_prueba',
            key: 'num_prueba',
            sorter: (a, b) => a.num_prueba - b.num_prueba,
        },
        {
            title: 'Nombre Evaluación',
            dataIndex: 'nombre_prueba',
            key: 'nombre_prueba',
            sorter: (a, b) => a.nombre_prueba.localeCompare(b.nombre_prueba),
        },
        {
            title: 'Sufijo',
            key: 'sufijo',
            width: 150,
            render: () => <Input placeholder="Sufijo..." />
        },
    ];

    const filteredData = data.filter(item => 
        item.cod_asig.toLowerCase().includes(searchText.toLowerCase()) ||
        item.nombre_prueba.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="page-full">
            <h1 style={{ marginBottom: 24 }}>Configuración de Planillas</h1>
            
            <Card className="shadow-2xl rounded-2xl">
                <Input.Search
                    placeholder="Buscar por asignatura o nombre de prueba..."
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, maxWidth: 400 }}
                />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" tip="Cargando configuración..." />
                    </div>
                ) : error ? (
                    <Alert message="Error" description={error} type="error" showIcon />
                ) : (
                    <Table
                        dataSource={filteredData}
                        columns={columns}
                        rowKey={(record) => `${record.cod_asig}-${record.num_prueba}`}
                        pagination={{ pageSize: 12 }}
                        className="table-small-font"
                        bordered
                    />
                )}
            </Card>
        </div>
    );
};

export default ConfiguraPlanilla;
