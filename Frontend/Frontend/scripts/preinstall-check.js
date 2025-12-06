"use strict";
function getOriginalCmd() {
  const argv = process.env.npm_config_argv;
  if (argv) {
    try {
      const parsed = JSON.parse(argv);
      if (Array.isArray(parsed.original)) return parsed.original.join(' ');
    } catch (e) { /* ignore */ }
  }
  const exec = process.env.npm_execpath || '';
  const npmCommand = process.env.npm_command || '';
  return `${exec} ${npmCommand}`.trim();
}
const cmd = getOriginalCmd().toLowerCase();
if (cmd.includes('install') && !cmd.includes('ci')) {
  console.error(`
 Aborted: Please use "npm ci" instead of "npm install".
This repository enforces installation from the lockfile (package-lock.json).
`);
  process.exit(1);
}
process.exit(0);