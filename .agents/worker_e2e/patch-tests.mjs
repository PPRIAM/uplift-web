import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const e2eDir = path.resolve(__dirname, '../../e2e-tests');

function patchFile(filename) {
  const filePath = path.join(e2eDir, filename);
  console.log(`Patching ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace simple insert patterns with error checks
  // e.g. const { data: event } = await supabase.from('events').insert({ ... }).select().single();
  // We can match: const { data: (\w+) } = await supabase.from\('events'\).insert\(\{([\s\S]*?)\}\).select\(\).single\(\);
  content = content.replace(
    /const \{\s*data:\s*(\w+)\s*\} = await supabase\.from\('events'\)\.insert\(\{([\s\S]*?)\}\)\.select\(\)\.single\(\);/g,
    (match, varName, body) => {
      return `const { data: ${varName}, error: err_${varName} } = await supabase.from('events').insert({${body}}).select().single();\n    if (err_${varName}) throw new Error('Insert failed: ' + err_${varName}.message);`;
    }
  );

  // Also match non-single inserts if any
  // const { data, error } = await supabase.from('events').insert({ ... }).select();
  // These usually already have checks.

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${filename} successfully.`);
}

patchFile('tier2.mjs');
patchFile('tier3.mjs');
patchFile('tier4.mjs');
