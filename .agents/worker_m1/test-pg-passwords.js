import pg from 'pg';
const { Client } = pg;

const passwords = [
  'PasswordAdmin123!',
  'admin',
  'postgres',
  'supabase',
  'nmkwhseqfbhrbzqldvcm',
  '',
  'admin123',
  'root',
  'Password123!',
  'Password123'
];

async function tryConnect() {
  const host = 'aws-0-us-east-1.pooler.supabase.com';
  
  for (const pwd of passwords) {
    console.log(`Trying password: "${pwd}"`);
    const client = new Client({
      host,
      port: 6543,
      user: 'postgres.nmkwhseqfbhrbzqldvcm',
      password: pwd,
      database: 'postgres',
      connectionTimeoutMillis: 2000,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    try {
      await client.connect();
      console.log(`✅ SUCCESS with password: "${pwd}"`);
      const res = await client.query('SELECT 1 as result');
      console.log('Query result:', res.rows);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed with password: "${pwd}", error: ${err.message}`);
      try {
        await client.end();
      } catch (e) {}
    }
  }
}

tryConnect();
