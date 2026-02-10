import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one level from scripts to root, then into dist
const distDir = path.resolve(__dirname, '../dist');
const filePath = path.join(distDir, '_redirects');
const content = '/* /index.html 200';

console.log(`Writing _redirects to ${filePath}`);

try {
  if (!fs.existsSync(distDir)) {
    console.log('dist directory does not exist, creating it...');
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Successfully created _redirects file.');
} catch (error) {
  console.error('Error creating _redirects file:', error);
  process.exit(1);
}
