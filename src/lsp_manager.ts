import * as vscode from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
} from "vscode-languageclient/node";
import {
  appendLineToOutputChannel,
  makeLogOutputChannel,
  showMessageError,
  showMessageInfo,
} from "./output";
import { getConfigLocation } from "./utils";
let client: LanguageClient;

export async function start() {
  let config = await getConfigLocation();
  if (!config) {
    showMessageError(
      "i18n-hero LSP cannot start because the config file location is not set. Please set it in the extension settings or use the init in command palette.",
    );
    return;
  }
  if (isRunning()) {
    appendLineToOutputChannel("i18n-hero LSP is already running.");
    return;
  }
  const serverOptions: ServerOptions = {
    command:
      "/home/daniel/Projects/i18n-hero/i18n-hero-cli/target/debug/i18n-hero-cli",
    args: [
      "lsp",
      "--config",
      config.configLocation,
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
