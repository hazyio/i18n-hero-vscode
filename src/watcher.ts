import * as vscode from "vscode";
import { startExtensionServices, stopExtensionServices } from "./commands";
import { getConfigLocation } from "./utils";
export function registerConfigWatcher(context: vscode.ExtensionContext) {
  getConfigLocation().then((configLocation) => {
    let fileName = "**/i18n-hero.toml";
    if (configLocation) {
      startExtensionServices();
      // If a config location is specified, watch that specific file instead of the default
      fileName = `**/${configLocation}`;
    }
    //   Create a filesystem watcher
    const watcher = vscode.workspace.createFileSystemWatcher(fileName);
    // Check if the file already exists on startup
    vscode.workspace.findFiles(fileName, null, 1).then((files) => {
      if (files.length > 0) {
        startExtensionServices();
      }
    });
    // Handle file creation (if the extension wasn't running)
    watcher.onDidCreate(() => {
      console.log("Target file created.");
      startExtensionServices();
    });
    // Handle file deletion
    watcher.onDidDelete(() => {
      console.log("Target file deleted.");
      stopExtensionServices();
    });

    // Clean up the watcher when the extension is deactivated
    context.subscriptions.push(watcher);
  });
}
