// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  registerCommands,
  startExtensionServices,
  stopExtensionServices,
} from "./commands";
import { initOutput } from "./output";
import { registerConfigWatcher } from "./watcher";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  initOutput(context);
  registerConfigWatcher(context);
  // startExtensionServices();

  // try {
  //   const result = start({ output });
  //   Promise.resolve(result).catch((err) =>
  //     output.appendLine(
  //       `start(): failed: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  //     ),
  //   );
  // } catch (err) {
  //   output.appendLine(
  //     `start(): threw: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  //   );
  // }
}

// This method is called when your extension is deactivated
export function deactivate() {
  stopExtensionServices();
}
