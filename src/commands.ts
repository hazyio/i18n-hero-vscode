import * as vscode from "vscode";
import * as lspManager from "./lsp_manager";
import * as output from "./output";
export function startExtensionServices() {
  lspManager.start();
}
export function stopExtensionServices() {
  lspManager.stop();
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
  // Register the set-config command
  context.subscriptions.push(
    vscode.commands.registerCommand("i18n-hero-vscode.set-config", setConfig),
  );
}

function restart() {
  try {
    lspManager.restart();
  } catch (err) {
    output.append(
      `restart(): threw: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
  }
}
function init() {
  try {
    lspManager.restart();
  } catch (err) {
    output.append(
      `restart(): threw: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
  }
}
function setConfig() {
  try {
    lspManager.restart();
  } catch (err) {
    output.append(
      `restart(): threw: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
  }
}
