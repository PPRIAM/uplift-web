import fs from 'fs';
import path from 'path';

const searchDir = 'D:\\UPLIFT20\\uplift-web';
const files = fs.readdirSync(searchDir);

files.forEach(file => {
  if (file.endsWith('.sql')) {
    const content = fs.readFileSync(path.join(searchDir, file), 'utf8');
    if (content.toLowerCase().includes('rls_auto_enable')) {
      console.log(`Found rls_auto_enable in: ${file}`);
    }
  }
});
