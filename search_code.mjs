import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('D:/UPLIFT20/uplift-web/app/admin/page.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- Search for Drawer usage in app/admin/page.tsx ---');
lines.forEach((line, i) => {
  if (line.includes('Drawer') || line.includes('Session') || line.includes('selected') || line.includes('store') || line.includes('layout')) {
    if (line.includes('selectedSession') || line.includes('openDrawer') || line.includes('setSelectedSession') || line.includes('useAdminLayoutStore')) {
      console.log(`L${i+1}: ${line.trim()}`);
    }
  }
});
