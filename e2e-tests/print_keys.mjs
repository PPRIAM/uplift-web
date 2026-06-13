import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const keys = [];
envContent.split(/\r?\n/).forEach(line => {
  const match = line.trim().match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    keys.push(match[1]);
  }
});

console.log('Environment keys in .env.local:', keys);
