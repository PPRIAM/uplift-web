import pg from 'pg';

const { Client } = pg;

const passwords = [
  'PasswordAdmin123!',
  'admin',
  'postgres',
  'supabase'
];

async function trySni() {
  const host = 'aws-0-us-east-1.pooler.supabase.com';
  const servername = 'db.nmkwhseqfbhrbzqldvcm.supabase.co';
  
  for (const pwd of passwords) {
    console.log(`Trying SNI connection with password: ${pwd}`);
    const client = new Client({
      host,
      port: 6543,
      user: 'postgres',
      password: pwd,
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false,
        servername
      }
    });
    try {
      await client.connect();
      console.log(`✅ SUCCESS with password: ${pwd}`);
      const res = await client.query('SELECT 1 as result');
      console.log('Query result:', res.rows);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed with password: ${pwd}, error: ${err.message}`);
      try {
        await client.end();
      } catch (e) {}
    }
  }
}

trySni();
