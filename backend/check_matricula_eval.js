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
    const resM = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'matricula_eval';");
    console.log('--- matricula_eval ---');
    console.log(resM.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
