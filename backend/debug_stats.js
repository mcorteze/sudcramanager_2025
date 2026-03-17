const axios = require('axios');

async function checkStats() {
    try {
        const resCal = await axios.get('http://localhost:3001/api/stats/calificaciones');
        console.log('Stat Calificaciones Data:', JSON.stringify(resCal.data, null, 2));
        
        const resInf = await axios.get('http://localhost:3001/api/stats/informes');
        console.log('\nStat Informes Data:', JSON.stringify(resInf.data, null, 2));

        // Check raw dates from DB to see if CURRENT_DATE is filtering too much
        const rawDates = await axios.get('http://localhost:3001/api/ultimas-lecturas-form');
        console.log('\nSample Raw Dates from lecturas:', rawDates.data.slice(0, 2).map(r => r.marcatemporal));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkStats();
