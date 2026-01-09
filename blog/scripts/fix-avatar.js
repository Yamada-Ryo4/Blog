const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      const fixed = content.replace(/\/assets\/(https?:)\/+/g, '$1//');
      if (fixed !== content) {
        fs.writeFileSync(full, fixed, 'utf8');
        console.log('Patched', full);
      }
    }
  }
}

if (fs.existsSync(publicDir)) {
  walk(publicDir);
} else {
  console.warn('Public directory not found (skipping):', publicDir);
}
