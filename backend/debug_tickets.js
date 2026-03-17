const axios = require('axios');

async function checkTickets() {
    try {
        const res = await axios.get('http://localhost:3001/api/stats/calificaciones');
        console.log('Stats Calificaciones:', res.data.length ? 'OK' : 'Empty');
        
        const tickets = await axios.get('http://localhost:3001/api/tickets-pendientes');
        console.log('Tickets Response:', JSON.stringify(tickets.data, null, 2));

        const logs = await axios.get('http://localhost:3001/api/logs');
        const latestWithTickets = logs.data.find(l => l.tickets_pendientes !== null);
        console.log('Latest log with tickets field:', JSON.stringify(latestWithTickets, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkTickets();
