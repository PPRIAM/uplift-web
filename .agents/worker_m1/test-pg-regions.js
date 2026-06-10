import pg from 'pg';

const { Client } = pg;

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2', 'ap-south-1',
  'ca-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-south-1', 'eu-north-1',
  'me-south-1', 'sa-east-1'
];

async function tryRegions() {
  const pwd = 'PasswordAdmin123!';
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    console.log(`Trying ${host}...`);
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
      console.log(`✅ SUCCESS on ${host}!`);
      const res = await client.query('SELECT 1 as result');
      console.log('Query result:', res.rows);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed on ${host}: ${err.message}`);
      try {
        await client.end();
      } catch (e) {}
    }
  }
}

tryRegions();
