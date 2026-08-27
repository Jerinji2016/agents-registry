#!/usr/bin/env node

const { listRegistry, linkPlugin, checkStatus, runValidation } = require('../src/index.js');

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
\x1b[1mAgents Hub — Customizations & Guidelines Registry CLI\x1b[0m

\x1b[1mUsage:\x1b[0m
  agents-hub <command> [options]

\x1b[1mCommands:\x1b[0m
  list                      List all available stacks, rules, and skills in the registry
  validate                  Validate all manifests, rule files, and skill frontmatter
  link <stack> [--target]   Link a stack plugin into a target project (.agents/plugins.json)
  status [--target]         Check active plugins and local overrides in a project workspace

\x1b[1mExamples:\x1b[0m
  agents-hub list
  agents-hub validate
  agents-hub link flutter-stack --target /path/to/my-app
  agents-hub status
`);
}

switch (command) {
  case 'list':
    listRegistry();
    break;

  case 'validate':
  case 'test':
    runValidation();
    break;

  case 'link': {
    const stack = args[1];
    if (!stack) {
      console.error('\x1b[31mError:\x1b[0m Please specify a stack name to link (e.g. flutter-stack, react-stack).');
      process.exit(1);
    }
    const targetIdx = args.indexOf('--target');
    const targetDir = targetIdx !== -1 && args[targetIdx + 1] ? args[targetIdx + 1] : process.cwd();
    linkPlugin(stack, targetDir);
    break;
  }

  case 'status': {
    const targetIdx = args.indexOf('--target');
    const targetDir = targetIdx !== -1 && args[targetIdx + 1] ? args[targetIdx + 1] : process.cwd();
    checkStatus(targetDir);
    break;
  }

  case '--help':
  case '-h':
  case 'help':
  default:
    printUsage();
    break;
}
