import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envContent = fs.readFileSync(path.resolve(__dirname, './.env.local'), 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function diagnose() {
  console.log('Tentative de connexion avec admin@uplift.io...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@uplift.io',
    password: 'PasswordAdmin123!'
  });

  if (error) {
    console.error('❌ Échec de la connexion standard:', error.message);
    
    console.log('Recherche de l\'utilisateur admin dans TOUTE la liste des utilisateurs auth...');
    let page = 1;
    let adminUser = null;
    
    while (true) {
      console.log(`Lecture de la page ${page} des utilisateurs...`);
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: 100
      });
      
      if (listError) {
        console.error('Erreur lors du listage:', listError.message);
        break;
      }
      
      if (!users || users.length === 0) {
        console.log('Fin de la liste des utilisateurs atteinte.');
        break;
      }
      
      adminUser = users.find(u => u.email?.toLowerCase() === 'admin@uplift.io');
      if (adminUser) {
        console.log(`✅ Admin trouvé à la page ${page} ! ID: ${adminUser.id}`);
        break;
      }
      
      page++;
    }
    
    if (adminUser) {
      console.log(`Mise à jour du mot de passe pour l'utilisateur ID: ${adminUser.id}...`);
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
        password: 'PasswordAdmin123!',
        user_metadata: { role: 'admin', verified: true }
      });
      if (updateError) {
        console.error('❌ Échec de la mise à jour:', updateError.message);
      } else {
        console.log('✅ Mot de passe mis à jour avec succès via admin API.');
        
        // Re-tester la connexion
        const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
          email: 'admin@uplift.io',
          password: 'PasswordAdmin123!'
        });
        if (error2) {
          console.error('❌ Deuxième échec de connexion:', error2.message);
        } else {
          console.log('✅ Connexion standard réussie après mise à jour !');
        }
      }
    } else {
      console.log('Admin non trouvé après parcours complet. Suppression s\'il existe de manière fantôme puis création...');
      // Tentative de création directe quand même
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@uplift.io',
        password: 'PasswordAdmin123!',
        email_confirm: true,
        user_metadata: { role: 'admin', verified: true }
      });
      if (createError) {
        console.error('❌ Échec de la création directe:', createError.message);
      } else {
        console.log('✅ Admin créé avec succès.');
      }
    }
  } else {
    console.log('✅ Connexion réussie ! Token :', data.session?.access_token ? 'Présent' : 'Absent');
  }
}

diagnose();
