import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nmkwhseqfbhrbzqldvcm',
  password: 'PasswordAdmin123!',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT 1 as result');
    console.log('Query result:', res.rows);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
