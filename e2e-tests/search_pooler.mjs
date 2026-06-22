import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ce script recherche récursivement dans les fichiers du répertoire e2e-tests
// pour trouver des mentions de chaînes de connexion ou d'hôtes de base de données.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderToSearch = path.resolve(__dirname, './');

function searchInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('pooler') || content.includes('DATABASE_URL') || content.includes('postgresql://')) {
    console.log(`Trouvé dans : ${filePath}`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('pooler') || line.includes('DATABASE_URL') || line.includes('postgresql://')) {
        console.log(`  Ligne ${idx + 1}: ${line.trim()}`);
      }
    });
  }
}

fs.readdirSync(folderToSearch).forEach(file => {
  const fullPath = path.join(folderToSearch, file);
  if (fs.statSync(fullPath).isFile() && file.endsWith('.mjs')) {
    searchInFile(fullPath);
  }
});
