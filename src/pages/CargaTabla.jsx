import React, { useState } from 'react';
import { Table, Button, message } from 'antd';

const CargaTabla = () => {
    const [files, setFiles] = useState([]); // Para guardar los archivos seleccionados
    const [loading, setLoading] = useState(false); // Para mostrar el estado de carga

    // Definir las columnas de la tabla
    const columns = [
        {
            title: 'Nombre de Archivo',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Tamaño',
            dataIndex: 'size',
            key: 'size',
            render: (size) => `${(size / 1024).toFixed(2)} KB`, // Convertir tamaño a KB
        },
    ];

    // Filtrar archivos .xlsm
    const handleFolderSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);  // Convertir los archivos seleccionados a un array
        
        // Filtrar solo los archivos con extensión .xlsm
        const xlsmFiles = selectedFiles.filter(file => file.name.endsWith('.xlsm'));
        
        setFiles(xlsmFiles.map(file => ({
            name: file.name,
            size: file.size,
        })));
    };

    // Enviar la ruta de la carpeta al backend para procesamiento
    const handleSubmit = async () => {
        setLoading(true);

        // Crear un objeto FormData para enviar la carpeta (en este caso, solo pasamos los archivos)
        const formData = new FormData();
        files.forEach(file => {
            formData.append('archivo', file);  // Agregar cada archivo al FormData
        });

        try {
            const response = await fetch('http://127.0.0.1:8000/gestion/cargar_tabla/', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.status === 'success') {
                message.success('Archivos cargados correctamente');
            } else {
                message.error('Error al cargar los archivos');
            }
        } catch (error) {
            message.error('Hubo un error en la conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Cargar Archivos de una Carpeta</h1>
            
            {/* Input para seleccionar una carpeta */}
            <input
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleFolderSelect}
                style={{ marginBottom: 20 }}
            />

            {/* Tabla para mostrar los archivos seleccionados */}
            <Table
                dataSource={files}
                columns={columns}
                rowKey="name"
                pagination={false}
                style={{ marginTop: 20 }}
            />

            {/* Botón para enviar los archivos al servidor */}
            <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                style={{ marginTop: 20 }}
            >
                Cargar Archivos
            </Button>
        </div>
    );
};

export default CargaTabla;
