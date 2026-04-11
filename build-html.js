const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');
const tplPath = path.join(__dirname, 'src', 'index.tpl.html');
const outPath = path.join(__dirname, 'src', 'index.html');

let template = fs.readFileSync(tplPath, 'utf8');

const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

let combinedViews = files.map(f => fs.readFileSync(path.join(viewsDir, f), 'utf8')).join('\n\n');

template = template.replace('<!-- WORKSPACE -->', combinedViews);

fs.writeFileSync(outPath, template);
console.log("Built index.html successfully");