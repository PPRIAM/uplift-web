import fs from 'fs';
import path from 'path';

const searchDir = 'D:\\UPLIFT20\\uplift-web';
const excludes = ['node_modules', '.next', '.vercel', '.git', '.agents'];
const results = [];

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludes.includes(file)) {
        searchFiles(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('events') || content.includes('featured')) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('events') || line.includes('featured') || line.includes('is_featured') || line.includes('is_live')) {
            results.push(`${fullPath}:${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchFiles(searchDir);
fs.writeFileSync('D:\\UPLIFT20\\uplift-web\\.agents\\explorer_m1_1\\search_results.txt', results.join('\n'));
console.log(`Saved ${results.length} results.`);
