const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('JSX.Element')) {
        content = content.replace(/JSX\.Element/g, 'React.JSX.Element');
        if (!content.includes("import React")) {
          content = "import React from 'react';\n" + content;
        }
        fs.writeFileSync(fullPath, content);
      }
    }
  });
}

walk('src');
console.log('Fixed JSX references');
