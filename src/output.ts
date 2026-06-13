import * as vscode from "vscode";
import { LogLevel, LogOutputChannel } from "vscode";
let outputChannel: vscode.OutputChannel | null = null;
export function initOutput(context: vscode.ExtensionContext) {
  if (outputChannel === null) {
    outputChannel = vscode.window.createOutputChannel("I18n Hero");
    context.subscriptions.push(outputChannel);
  }
}
export function getOutputChannel(): vscode.OutputChannel {
  return runDeterminate((output) => output);
}
function runDeterminate<T>(fn: (output: vscode.OutputChannel) => T): T {
  if (outputChannel === null) {
    throw new Error(
      "Output channel not initialized. Call init(context) first.",
    );
  }
  return fn(outputChannel!);
}
export function showMessageInfo(message: string) {
  vscode.window.showInformationMessage(message);
}
export function showMessageError(message: string) {
  vscode.window.showErrorMessage(message);
}

export function showMessageWarning(message: string) {
  vscode.window.showWarningMessage(message);
}

export function clearOutputChannel() {
  runDeterminate((output) => output.clear());
}

export function append(line: string) {
  appendLineToOutputChannel(line);
}
export function appendLineToOutputChannel(line: string) {
  runDeterminate((output) => output.appendLine(line));
}
export function showOutputChannel() {
  runDeterminate((output) => output.show(true));
}

export function makeLogOutputChannel(): LogOutputChannel {
  return runDeterminate((output) => {
    const noLogLevelChange: vscode.Event<LogLevel> = () => ({
      dispose: () => {},
    });
    return {
      name: output.name,
      append: output.append.bind(output),
      appendLine: output.appendLine.bind(output),
      clear: output.clear.bind(output),
      show: output.show.bind(output),
      hide: output.hide.bind(output),
      dispose: output.dispose.bind(output),
      trace: output.appendLine.bind(output),
      debug: output.appendLine.bind(output),
      info: output.appendLine.bind(output),
      warn: output.appendLine.bind(output),
      error: output.appendLine.bind(output),
      logLevel: LogLevel.Info,
      onDidChangeLogLevel: noLogLevelChange,
      replace: (value: string) => {
        if (output !== null) {
          output.clear();
          output.append(value);
        }
      },
    };
  });
}
