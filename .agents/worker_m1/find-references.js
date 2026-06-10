import fs from 'fs';
import path from 'path';

const keywords = ['DATABASE_URL', 'PrismaClient', 'createClient', 'postgres', 'pg', '5432'];

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.agents') {
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.mjs') || file.endsWith('.json') || file.endsWith('.local') || file.endsWith('.sql'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          console.log(`Match: ${fullPath} contains "${keyword}"`);
        }
      }
    }
  }
}

searchDir('.');
