const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// CSS fixes for scroll performance
const scrollFixesCSS = `<style>
html, body { scrollbar-gutter: stable; }
.waves { will-change: transform; transform: translateZ(0); -webkit-backface-visibility: hidden; backface-visibility: hidden; contain: layout style paint; }
#sidebar.affix { z-index: 10; position: fixed; will-change: position; }
#sidebar .panels { max-height: calc(100vh - 120px); overflow-y: auto; overflow-x: hidden; contain: layout; }
#footer { min-height: 100px; contain: layout style; }
#container { contain: content; }
main { contain: content; }
</style>`;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let cssInjected = 0;
  
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      const fixed = content.replace(/\/assets\/(https?:)\/+/g, '$1//');
      
      // Inject scroll fixes CSS if not already present
      let finalContent = fixed;
      if (!finalContent.includes('scrollbar-gutter: stable')) {
        finalContent = finalContent.replace('</head>', scrollFixesCSS + '</head>');
        cssInjected++;
      }
      
      if (finalContent !== content) {
        fs.writeFileSync(full, finalContent, 'utf8');
        console.log('Patched', full);
      }
    }
  }
  
  return cssInjected;
}

if (fs.existsSync(publicDir)) {
  const injected = walk(publicDir);
  console.log(`✓ Injected scroll fixes in ${injected} files`);
} else {
  console.warn('Public directory not found (skipping):', publicDir);
}
