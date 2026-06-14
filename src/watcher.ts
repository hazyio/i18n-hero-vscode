import * as vscode from "vscode";
import { startExtensionServices, stopExtensionServices } from "./commands";
import { getConfigLocation } from "./utils";
export function registerConfigWatcher(context: vscode.ExtensionContext) {
  getConfigLocation().then((configLocation) => {
    const fileName = `**/${configLocation}`;
    if (configLocation) {
      // If a config location is specified, start extesion
      startExtensionServices();
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
