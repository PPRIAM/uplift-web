import pg from 'pg';

// Ce script vérifie si une instance locale de base de données PostgreSQL est en cours d'exécution
// sur le port 5432 ou 54322 (utilisé par la CLI locale de Supabase).
const ports = [5432, 54322];

async function checkLocal() {
  for (const port of ports) {
    console.log(`Essai de connexion sur localhost:${port}...`);
    const client = new pg.Client({
      host: 'localhost',
      port: port,
      user: 'postgres',
      password: 'postgres',
      database: 'postgres',
      connectionTimeoutMillis: 1000
    });
    try {
      await client.connect();
      console.log(`\n🎉 TROUVÉ ! Connexion réussie sur localhost:${port}`);
      await client.end();
      return port;
    } catch (err) {
      console.log(`Erreur pour le port ${port} : ${err.message}`);
    }
  }
  console.log('\n❌ Aucun port local n\'est accessible.');
  return null;
}

checkLocal();
