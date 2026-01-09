const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'hexo-theme-shokax', 'scripts', 'helpers', 'engine.js');

if (!fs.existsSync(target)) {
  console.warn('shokax engine.js not found, skipping patch');
  process.exit(0);
}

let src = fs.readFileSync(target, 'utf8');

// idempotent replacement: insert safe fallback when image_list empty
if (src.includes("image_list is empty — using placeholder images")) {
  console.log('patch already applied');
  process.exit(0);
}

src = src.replace(
  /if \(count && count > 1\) \{[\s\S]*?while \(shuffled.length <= 6\) \{[\s\S]*?\}\n\s*\}/,
  `if (count && count > 1) {
    let shuffled = image_list.slice(0);
    if (image_list.length < 1) {
      console.warn("image_list is empty — using placeholder images to avoid crash.");
      const placeholder = ['/assets/404.png'];
      shuffled = placeholder.slice(0);
    }
    // ensure we have enough items to slice from
    while (shuffled.length <= 6) {
      shuffled = shuffled.concat(shuffled.slice(0));
    }
  }`
);

if (!src.includes("image_list is empty — using placeholder images")) {
  console.warn('patch pattern not found, aborting');
  process.exit(1);
}

fs.writeFileSync(target, src, 'utf8');
console.log('shokax engine.js patched');
