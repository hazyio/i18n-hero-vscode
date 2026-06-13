import * as vscode from "vscode";
import { appendLineToOutputChannel } from "./output";

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
    appendLineToOutputChannel("No workspace folder found");
    return undefined;
  }
  // only get the config location for the current workspace folder if it exists
  const configSetInSettings = vscode.workspace
    .getConfiguration("i18n-hero-vscode", workspaceFolder.uri)
    .get<string>("configLocation");
  if (configSetInSettings) {
    let buildConfigLocation =
      workspaceFolder.uri.fsPath + "/" + configSetInSettings;
    let configExists = await vscode.workspace.fs.stat(
      vscode.Uri.file(buildConfigLocation),
    );
    if (!configExists) {
      return undefined;
    }

    return { workspaceFolder, configLocation: configSetInSettings };
  }
  appendLineToOutputChannel("Config is not set in .vscode");

  const configInWorkspaceDir =
    workspaceFolder.uri.fsPath + "/" + "i18n-hero.toml";
  let configExists = await vscode.workspace.fs.stat(
    vscode.Uri.file(configInWorkspaceDir),
  );
  if (!configExists) {
    return undefined;
  }
  return {
    workspaceFolder: workspaceFolder,
    configLocation: "i18n-hero.toml",
  };
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
