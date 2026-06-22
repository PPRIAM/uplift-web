import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ce script applique le schéma SQL de la table des sponsors à la base de données PostgreSQL de Supabase.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lecture du fichier de schéma SQL des sponsors
const sqlPath = path.resolve(__dirname, '../supabase_schema_sponsors.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Identifiants de connexion à la base de données
const passwords = ['PasswordAdmin123!'];
const hosts = [
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com'
];
const users = [
  'postgres.nmkwhseqfbhrbzqldvcm',
  'postgres'
];
const ports = [5432, 6543];

async function tryConnectAndMigrate() {
  for (const host of hosts) {
    for (const port of ports) {
      for (const user of users) {
        for (const pwd of passwords) {
          console.log(`Tentative de connexion à ${host}:${port} avec l'utilisateur ${user}...`);
          const client = new pg.Client({
            host,
            port,
            user,
            password: pwd,
            database: 'postgres',
            connectionTimeoutMillis: 3000,
            ssl: {
              rejectUnauthorized: false
            }
          });
          try {
            await client.connect();
            console.log('✅ Connexion établie avec succès !');
            console.log('Exécution du script de migration SQL pour les sponsors...');
            await client.query(sql);
            console.log('🎉 Migration SQL appliquée avec succès !');
            await client.end();
            return true;
          } catch (err) {
            console.log(`❌ Échec de la connexion/migration : ${err.message}`);
            try {
              await client.end();
            } catch (e) {}
          }
        }
      }
    }
  }
  return false;
}

tryConnectAndMigrate().then(success => {
  if (success) {
    process.exit(0);
  } else {
    console.error('Impossible de se connecter à la base de données pour appliquer la migration.');
    process.exit(1);
  }
});
