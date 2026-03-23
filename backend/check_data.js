const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: '10.211.128.151',
  database: 'sudcra',
  password: 'fec4a5n5',
  port: 5432,
});

async function checkData() {
  try {
    const res = await pool.query("SELECT id_eval, maildisponible FROM eval LIMIT 10;");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkData();
