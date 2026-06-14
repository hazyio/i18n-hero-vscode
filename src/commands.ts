import * as vscode from "vscode";
import * as cliManager from "./cli_manager";
import * as output from "./output";
import { getCurrentWorkingDirectory } from "./utils";
export function startExtensionServices() {
  cliManager.start();
}
export function stopExtensionServices() {
  cliManager.stop();
}

export function registerCommands(context: vscode.ExtensionContext) {
  // Register the init command
  context.subscriptions.push(
    vscode.commands.registerCommand("i18n-hero-vscode.init", init),
  );
  // Register the  command
  context.subscriptions.push(
    vscode.commands.registerCommand("i18n-hero-vscode.restart", restart),
  );
}

function restart() {
  try {
    cliManager.restart();
  } catch (err) {
    output.append(
      `restart(): threw: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
  }
}
function init() {
  const terminal = vscode.window.createTerminal("i18n-hero init");
  terminal.show();
  terminal.sendText(`${cliManager.cliLocation()} init`);
}
