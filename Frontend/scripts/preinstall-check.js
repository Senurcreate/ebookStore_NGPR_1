// scripts/preinstall-check.js
const raw = process.env.npm_config_argv;
if (!raw) process.exit(0);

try {
  const parsed = JSON.parse(raw);
  const cmd = (parsed.original?.[0]) || (parsed.cooked?.[0]) || '';
  if (cmd === 'install') {
    console.error('\n\x1b[31mERROR:\x1b[0m Please run "npm ci" instead of "npm install".');
    console.error('If you are intentionally changing dependencies, use "npm install <pkg> --save-exact" and commit the updated package-lock.json.\n');
    process.exit(1);
  }
} catch (e) {
  // permissive if parsing fails
  process.exit(0);
}
