// scripts/pin-deps.js
import fs from 'fs';

const path = 'package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));

['dependencies','devDependencies','peerDependencies','optionalDependencies'].forEach(section=>{
  if (!pkg[section]) return;
  Object.keys(pkg[section]).forEach(dep=>{
    pkg[section][dep] = pkg[section][dep].replace(/^[~^]/, '');
  });
});

fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
console.log('Pinned dependency specifiers in package.json (removed ^ and ~).');
