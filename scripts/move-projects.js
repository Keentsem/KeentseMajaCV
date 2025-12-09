import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceDir = path.join(rootDir, 'dist', 'public', 'projects');
const targetDir = path.join(rootDir, 'dist', 'projects');

console.log('Moving project pages from dist/public/projects to dist/projects...');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Move all HTML files
if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);

  files.forEach(file => {
    if (file.endsWith('.html')) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ Moved ${file}`);
    }
  });

  console.log('✓ Project pages moved successfully!');
} else {
  console.log('⚠ No source directory found, skipping...');
}
