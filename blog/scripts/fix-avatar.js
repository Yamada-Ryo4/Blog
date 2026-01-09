const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Critical CSS fixes for scroll jitter - injected directly into HTML
// These complement the rules in app.styl to ensure highest priority
const scrollFixesCSS = `<style>
/* Reclaim native browser scrolling */
html, body { overflow: auto !important; scrollbar-gutter: stable; }
/* Break sidebar affix death loop - sticky keeps in doc flow */
#sidebar.affix { position: sticky !important; top: 0; z-index: 10; }
/* Force single-layer rendering */
#main { opacity: 1 !important; background-color: white !important; }
/* Immobilize header background */
#imgs { position: fixed !important; transform: none !important; }
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
