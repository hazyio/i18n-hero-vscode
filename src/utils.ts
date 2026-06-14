import * as vscode from "vscode";
import * as fs from "fs/promises";

import { appendLineToOutputChannel } from "./output";
import path from "path";

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

  const configInWorkspaceDir = path.join(
    workspaceFolder.uri.fsPath,
    "i18n-hero.toml",
  );
  try {
    await fs.access(configInWorkspaceDir);
    appendLineToOutputChannel("Config file exists");
    return {
      workspaceFolder: workspaceFolder,
      configLocation: "i18n-hero.toml",
    };
  } catch {
    appendLineToOutputChannel("Config file not found");
    return undefined;
  }
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
