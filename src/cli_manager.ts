import * as vscode from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
} from "vscode-languageclient/node";
import { spawn } from "child_process";
import {
  appendLineToOutputChannel,
  makeLogOutputChannel,
  showMessageError,
  showMessageInfo,
} from "./output";
import { getConfigLocation } from "./utils";
let client: LanguageClient;
export function runCommand(
  args: string[],
  showSuccessMessage: boolean = false,
) {
  let cc = {
    command: cliLocation(),
    args: args,
  };

  // Get the workspace root directory context
  const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  // Execute the binary
  const process = spawn(cc.command, cc.args, { cwd });

  let stdout = "";
  let stderr = "";

  process.stdout.on("data", (data) => (stdout += data.toString()));
  process.stderr.on("data", (data) => (stderr += data.toString()));

  process.on("close", (code) => {
    if (code === 0) {
      if (showSuccessMessage) {
        showMessageInfo(`Success: ${stdout}`);
      }
    } else {
      showMessageError(`Error (Code ${code}): ${stderr}`);
    }
  });

  process.on("error", (err) => {
    showMessageError(`Failed to execute binary: ${err.message}`);
  });
}
export function cliLocation(): string {
  return "/home/daniel/Projects/i18n-hero/target/debug/i18n-hero";
}
export async function start() {
  let config = await getConfigLocation();
  if (config === undefined) {
    showMessageError(
      "i18n-hero LSP cannot start because the config file location is not set. Use the Create i18n-hero.toml command in the command palette to create it.",
    );
    return;
  }
  if (isRunning()) {
    appendLineToOutputChannel("i18n-hero LSP is already running.");
    return;
  }
  const serverOptions: ServerOptions = {
    command: cliLocation(),
    args: [
      "lsp",
      "--workspace",
      config.workspaceFolder.uri.fsPath,
    ],
  };
  appendLineToOutputChannel("i18n-hero lsp loading");

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "*" }],
    traceOutputChannel: makeLogOutputChannel(),
    revealOutputChannelOn: RevealOutputChannelOn.Info,
    outputChannel: makeLogOutputChannel(),
  };

  client = new LanguageClient(
    "i18n-hero",
    "i18n-hero LSP",
    serverOptions,
    clientOptions,
  );
  appendLineToOutputChannel("i18n-hero lsp starting");
  client.start().catch((err) => {
    appendLineToOutputChannel(
      `client.start() failed: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
    vscode.window.showErrorMessage("Failed to start i18n-hero LSP...");
  });
  // client.setTrace(Trace.Verbose); // optional: very chatty LSP trace logs
}

export function restart() {
  showMessageInfo("Restarting i18n-hero LSP...");
  if (!isRunning()) {
    appendLineToOutputChannel("i18n-hero LSP is not running. Starting it now.");
    start();
    return;
  }
  client
    .stop()
    .then(() => {
      start();
      appendLineToOutputChannel("i18n-hero LSP restarted successfully.");
      showMessageInfo("i18n-hero LSP restarted successfully.");
    })
    .catch((err) => {
      showMessageError(
        `Failed to restart i18n-hero LSP: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
      );
      appendLineToOutputChannel(
        `Failed to restart i18n-hero LSP: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
      );
    });
}
export function isRunning(): boolean {
  return client !== undefined && client.state === 2;
}

export function stop(): Thenable<void> | undefined {
  if (!isRunning()) {
    return undefined;
  }
  return client.stop().catch((err) => {
    showMessageError(
      `Failed to stop i18n-hero LSP: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
  });
}
