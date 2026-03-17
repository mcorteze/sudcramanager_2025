const axios = require('axios');

async function test() {
    try {
        const ultimos = await axios.get('http://localhost:3001/api/ultimo-id-recepcionado');
        console.log('--- ultimo-id-recepcionado ---');
        console.log(JSON.stringify(ultimos.data, null, 2));

        const lecturas = await axios.get('http://localhost:3001/api/ultimas-lecturas-form');
        console.log('\n--- ultimas-lecturas-form ---');
        console.log(JSON.stringify(lecturas.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

test();
