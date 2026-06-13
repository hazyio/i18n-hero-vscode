import * as vscode from "vscode";

export async function configAvailable(): Promise<boolean> {
  const configLocation = await getConfigLocation();
  if (!configLocation) {
    return false;
  }
  return true;
}

/**
 * Returns the configured location (relative path) of the i18n-hero config file
 * for the current workspace folder, or undefined when no such configuration exists.
 *
 * Behavior:
 * - Resolves the current workspace folder via getCurrentWorkingDirectory().
 * - Reads the "i18n-hero-vscode.configLocation" workspace setting scoped to that folder.
 * - If the setting is missing or empty, returns undefined.
 * - Attempts to verify that the resolved file exists; if it doesn't, returns undefined.

 */
export async function getConfigLocation(): Promise<
  | { workspaceFolder: vscode.WorkspaceFolder; configLocation: string }
  | undefined
> {
  let workspaceFolder = getCurrentWorkingDirectory();
  if (!workspaceFolder) {
    return undefined;
  }
  // only get the config location for the current workspace folder if it exists
  const configLocation = vscode.workspace
    .getConfiguration("i18n-hero-vscode", workspaceFolder.uri)
    .get<string>("configLocation");
  if (!configLocation) {
    return undefined;
  }
  let buildConfigLocation = workspaceFolder.uri.fsPath + "/" + configLocation;
  let configExists = await vscode.workspace.fs.stat(
    vscode.Uri.file(buildConfigLocation),
  );
  if (!configExists) {
    return undefined;
  }

  return { workspaceFolder, configLocation };
}

export function setConfigLocation(location: string) {}

export function getCurrentWorkingDirectory():
  | vscode.WorkspaceFolder
  | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const editor = vscode.window.activeTextEditor;

  // Prefer the workspace folder that contains the active editor
  if (editor) {
    const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    if (folder) {
      return folder;
    }
  }

  // Fallback to the first workspace folder (single-root or no active editor)
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0];
  }

  console.log("No workspace folder is currently open.");
  return undefined;
}
