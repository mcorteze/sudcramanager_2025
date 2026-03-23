const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '10.211.128.151',
  database: 'sudcra',
  password: 'fec4a5n5',
  port: 5432,
});

async function check() {
  try {
    const resCO = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'calificaciones_obtenidas';");
    console.log('--- calificaciones_obtenidas ---');
    console.log(resCO.rows.map(r => r.column_name));
    
    const resC = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'calificaciones';");
    console.log('--- calificaciones ---');
    console.log(resC.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
