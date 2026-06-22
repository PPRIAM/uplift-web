import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ce script tente de se connecter directement à l'hôte de la base de données Supabase sur le port 5432
// et applique le schéma pour la table des sponsors.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.resolve(__dirname, '../supabase_schema_sponsors.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function run() {
  const connectionString = 'postgresql://postgres:PasswordAdmin123!@db.nmkwhseqfbhrbzqldvcm.supabase.co:5432/postgres';
  console.log('Connexion à la base de données via la chaîne de connexion directe...');
  
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connexion directe réussie !');
    
    console.log('Exécution de la migration SQL...');
    await client.query(sql);
    console.log('🎉 Migration de la table des sponsors appliquée avec succès !');
  } catch (err) {
    console.error('❌ Erreur de connexion ou d\'exécution :', err.message);
  } finally {
    await client.end();
  }
}

run();
