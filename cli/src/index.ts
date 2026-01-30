#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { registerLoginCommand } from './commands/login';
import { registerStatusCommand } from './commands/status';
import { registerAuthorizeCommand } from './commands/authorize';
import { registerAgentsCommand } from './commands/agents';
import { registerPoliciesCommand } from './commands/policies';
import { registerConsentsCommand } from './commands/consents';
import { registerLogsCommand } from './commands/logs';
import { registerKeysCommand } from './commands/keys';
import { registerTestCommand } from './commands/test';
import { registerDashboardCommand } from './commands/dashboard';

const program = new Command();

program
  .name('agentauth')
  .version('1.0.0')
  .description(
    chalk.bold('AgentAuth CLI') +
    ' — Authorization Layer for AI Agents\n\n' +
    '  Manage agents, policies, consents, and monitor\n' +
    '  authorization decisions from your terminal.'
  )
  .option('--format <type>', 'Output format: table, json, yaml', 'table')
  .option('--no-color', 'Disable colors')
  .option('--api-url <url>', 'Override API URL');

// Register all commands
registerLoginCommand(program);
registerStatusCommand(program);
registerAuthorizeCommand(program);
registerAgentsCommand(program);
registerPoliciesCommand(program);
registerConsentsCommand(program);
registerLogsCommand(program);
registerKeysCommand(program);
registerTestCommand(program);
registerDashboardCommand(program);

// Default action — show help with branding
program.action(() => {
  console.log('');
  console.log(chalk.hex('#a78bfa').bold('  ╔═══════════════════════════════════════╗'));
  console.log(chalk.hex('#a78bfa').bold('  ║        ') + chalk.white.bold('AGENTAUTH CLI v1.0.0') + chalk.hex('#a78bfa').bold('        ║'));
  console.log(chalk.hex('#a78bfa').bold('  ║  ') + chalk.gray('Authorization Layer for AI Agents') + chalk.hex('#a78bfa').bold('  ║'));
  console.log(chalk.hex('#a78bfa').bold('  ╚═══════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.white('  Quick Start:'));
  console.log(chalk.gray('  $ ') + chalk.cyan('agentauth login'));
  console.log(chalk.gray('  $ ') + chalk.cyan('agentauth authorize --agent my-bot --action purchase --amount 100'));
  console.log(chalk.gray('  $ ') + chalk.cyan('agentauth dashboard'));
  console.log('');
  program.outputHelp();
});

program.parse(process.argv);
