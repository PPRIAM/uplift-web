import pg from 'pg';

// Ce script teste la connexion à la base de données Supabase à travers différents poolers régionaux
// sur le port 6543 (port du pooler de transactions PgBouncer) pour identifier la région.
const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-central-2',
  'eu-north-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1'
];

async function scan() {
  const user = 'postgres.nmkwhseqfbhrbzqldvcm';
  const password = 'PasswordAdmin123!';
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Essai de connexion sur l'hôte : ${host} port 6543...`);
    
    const client = new pg.Client({
      host,
      port: 6543,
      user,
      password,
      database: 'postgres',
      connectionTimeoutMillis: 2000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
      await client.connect();
      console.log(`\n🎉 TROUVÉ ! Connexion réussie sur la région : ${region}`);
      console.log(`Hôte : ${host}`);
      await client.end();
      return host;
    } catch (err) {
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        // Le locataire n'est pas dans cette région, c'est normal.
        continue;
      }
      console.log(`Erreur pour ${region} : ${err.message}`);
    }
  }
  console.log('\n❌ Aucune région n\'a fonctionné sur le port 6543.');
  return null;
}

scan().then(host => {
  if (host) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
