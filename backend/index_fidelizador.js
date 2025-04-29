const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importar el middleware CORS
const app = express();
const PORT = process.env.PORT || 3002;

// Variables de cliente
const CLIENT_ID = '1270_31qjsi5drbsw8go80gc4og00sg0ks4ogokwo0ws4wos44gwo4g';
const CLIENT_SECRET = 'jz9y03wdb2oc08s4cgoc40kw04sgcgcg0sos0cosks4swcs4k';

// Middleware para habilitar CORS
app.use(cors()); // Habilita CORS para permitir peticiones desde otros dominios
app.use(express.json());

// Endpoint para obtener el token desde Fidelizador
app.post('/get-token', async (req, res) => {
  try {
    // Prepara los datos para la solicitud del token
    const qs = new URLSearchParams();
    qs.append('grant_type', 'client_credentials');
    qs.append('client_id', CLIENT_ID);
    qs.append('client_secret', CLIENT_SECRET);

    // Realiza la solicitud POST al endpoint de token de Fidelizador
    const response = await axios.post('https://api.fidelizador.com/oauth/v2/token', qs, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, expires_in, token_type } = response.data;
    res.json({ access_token, expires_in, token_type }); // Retorna el token obtenido
  } catch (error) {
    console.error('Error al obtener el token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener el token' }); // Responde con error si algo falla
  }
});


app.get('/api/fidelizador/reports/delivery', async (req, res) => {
    try {
      // Obtener el token primero
      const tokenResponse = await axios.post('https://api.fidelizador.com/oauth/v2/token', qs, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
  
      const accessToken = tokenResponse.data.access_token;
  
      // Hacer la solicitud para obtener el CSV
      const apiResponse = await axios.get('https://api.fidelizador.com/1.1/reports/delivery/consolidated.csv', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'text',
      });
  
      console.log(apiResponse.data); // Loguear la respuesta de la API para verificar
      res.send(apiResponse.data); // Enviar los datos del CSV al cliente
  
    } catch (error) {
      console.error('Error al consultar los reportes de correos enviados:', error.response?.data || error.message);
      res.status(500).send(`Error al consultar los reportes de correos enviados: ${error.response?.data || error.message}`);
    }
  });
  
  

// Inicia el servidor en el puerto configurado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
