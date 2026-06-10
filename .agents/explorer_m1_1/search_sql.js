import fs from 'fs';
import path from 'path';

const searchDir = 'D:\\UPLIFT20\\uplift-web';
const files = fs.readdirSync(searchDir);

files.forEach(file => {
  if (file.endsWith('.sql')) {
    const content = fs.readFileSync(path.join(searchDir, file), 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('create policy')) {
        console.log(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
});
