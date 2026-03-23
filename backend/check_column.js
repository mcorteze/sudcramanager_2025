const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: '10.211.128.151',
  database: 'sudcra',
  password: 'fec4a5n5',
  port: 5432,
});

async function checkColumn() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'eval' AND column_name = 'maildisponible';");
    console.log(JSON.stringify(res.rows));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkColumn();
