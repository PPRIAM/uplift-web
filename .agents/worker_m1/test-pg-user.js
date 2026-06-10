import pg from 'pg';

const { Client } = pg;

async function testUser(user) {
  const host = 'aws-0-us-east-1.pooler.supabase.com';
  console.log(`Trying username: ${user}`);
  const client = new Client({
    host,
    port: 6543,
    user,
    password: 'PasswordAdmin123!',
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });
  try {
    await client.connect();
    console.log(`✅ SUCCESS with user: ${user}`);
    await client.end();
  } catch (err) {
    console.log(`❌ Failed with user: ${user}, error: ${err.message}`);
    try {
      await client.end();
    } catch (e) {}
  }
}

async function run() {
  await testUser('postgres');
  await testUser('postgres.nmkwhseqfbhrbzqldvcm');
  await testUser('nmkwhseqfbhrbzqldvcm');
}

run();
