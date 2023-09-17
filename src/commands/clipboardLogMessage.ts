import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties } from '../entities';
import { getTabSize } from '../utilities';

export function clipboardLogMessageCommand(): Command {
  return {
    name: 'turboConsoleLog.clipboardLogMessage',
    handler: async (
      extensionProperties: ExtensionProperties,
      jsDebugMessage: DebugMessage,
    ) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;
      const selection = editor.selection;
      const lineNumber = selection.start.line;
      let clipboardText = await vscode.env.clipboard.readText();
      clipboardText = clipboardText.trim();
      const prefix = extensionProperties.logMessagePrefix;
      const quote = extensionProperties.quote;
      const suffix = extensionProperties.logMessageSuffix;
      const logType = extensionProperties.logType;

      const txt = `console.${logType}(${quote}${prefix} ~ ${clipboardText}${suffix}${quote}, ${clipboardText})`;
      const idx = document.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
      const ind = document.lineAt(lineNumber).text.substring(0, idx);

      editor
        .edit((e: { delete: (arg0: any) => void }) => {
          e.delete(
            new vscode.Range(
              new vscode.Position(lineNumber, 0),
              new vscode.Position(
                lineNumber,
                document.lineAt(lineNumber).range.end.character,
              ),
            ),
          );
        })
        .then(() => {
          editor.edit((e: { insert: (arg0: any, arg1: any) => void }) => {
            e.insert(new vscode.Position(lineNumber, 0), ind.concat(txt));
          });
        });
    },
  };
}
