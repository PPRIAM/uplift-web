import fs from 'fs';
import https from 'https';
import path from 'path';

const fonts = [
  { name: 'theboldfont.woff', url: 'https://fonts.cdnfonts.com/s/15153/theboldfont.woff' },
  { name: 'geoform-regular.woff', url: 'https://fonts.cdnfonts.com/s/107907/Geoform-BF6556c6e73002d.woff' },
  { name: 'geoform-bold.woff', url: 'https://fonts.cdnfonts.com/s/107907/Geoform-Bold-BF6556c6e7190d1.woff' }
];

const dir = path.join(process.cwd(), 'public', 'fonts');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download() {
  for (const font of fonts) {
    const dest = path.join(dir, font.name);
    console.log(`Downloading ${font.name}...`);
    await new Promise((resolve, reject) => {
      https.get(font.url, (res) => {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', reject);
    });
  }
}

download().catch(console.error);
