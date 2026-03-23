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
    const resA = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'informe_alumnos';");
    console.log('--- informe_alumnos ---');
    console.log(resA.rows.map(r => r.column_name));
    
    const resS = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'informes_secciones';");
    console.log('--- informes_secciones ---');
    console.log(resS.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
