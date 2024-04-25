// VS Code extensibility API
const vscode = require("vscode");

// Web requests
const axios = require("axios");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Register command to VSC context
  context.subscriptions.push(
    vscode.commands.registerCommand("autopilot.run", function () {
      // Get the name of the active editor file
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        const activeFile = activeEditor.document.fileName;

        // Read context size from settings
        const contextSize = vscode.workspace
          .getConfiguration()
          .get("autopilot.contextSize");
        if (contextSize > 1000) {
          vscode.window.showInformationMessage(`Context Size is set too high (must be less than 1000)!`);
          return;
        }
        if (contextSize < 0) {
          vscode.window.showInformationMessage(`Context Size is set too low (must be greater than 0)!`);
          return;
        }
        const currentPosition = activeEditor.selection.active;
        const startPosition = new vscode.Position(
          Math.max(0, currentPosition.line - contextSize),
          0
        );
        const endPosition = new vscode.Position(
          Math.min(
            activeEditor.document.getText().split("\n").length,
            currentPosition.line + contextSize
          ),
          0
        );
        const range1 = new vscode.Range(startPosition, currentPosition);
        const range2 = new vscode.Range(currentPosition, endPosition);

        let Prompt = ``;
        switch (
          vscode.workspace.getConfiguration().get("autopilot.promptType")
        ) {
          case "generic":
            Prompt = `
The following is a snippet of a source code file named "${activeFile}".
You are to create code that will be inserted in the missing portion of the file.
You may observe comments or other code around the missing portion of the file to find context for what code you are being requested to generate, as well as to determine the programming language of that code.
Write code that is necessary to perform the requested operation or achieve the intended functionality.
Always attempt to write code that is functional and of high quality.
Do NOT write the output code in Markdown format, or include the name of the programming language. ONLY output the raw, unformatted code requested by the developer.
In response, you will reply with ONLY the missing code requested, and never including any additional text or comments.

The file (with a missing portion) is shown below:

${activeEditor.document.getText(range1)}
[MISSING PORTION]
${activeEditor.document.getText(range2)}
					`;
            break;
          case "codegemma":
            Prompt = `<|fim_prefix|>${activeEditor.document.getText(
              range1
            )}<|fim_suffix|>${activeEditor.document.getText(
              range2
            )}<|fim_middle|>`;
            break;
        }

        vscode.window.showInformationMessage(`Generating code...`);

        axios
          .post(vscode.workspace.getConfiguration().get("autopilot.url"), {
            model: vscode.workspace
              .getConfiguration()
              .get("autopilot.modelName"),
            prompt: Prompt,
            stream: false,
          })
          .then((response) => {
            let GeneratedCode = response.data.response;

            // Remove markdown formatting if necessary
            if (
              vscode.workspace
                .getConfiguration()
                .get("autopilot.promptType") === "generic"
            ) {
              if (GeneratedCode.startsWith(`\`\`\``))
                GeneratedCode = GeneratedCode.slice(3, GeneratedCode.length);
              if (GeneratedCode.endsWith(`\`\`\``))
                GeneratedCode = GeneratedCode.substr(
                  0,
                  GeneratedCode.length - 3
                );
            }

            const Edit = new vscode.TextEdit(
              new vscode.Range(
                currentPosition.line,
                currentPosition.character,
                currentPosition.line,
                currentPosition.character
              ),
              GeneratedCode.trim()
            );
            const editBuilder = new vscode.WorkspaceEdit();
            editBuilder.set(activeEditor.document.uri, [Edit]);
            vscode.workspace.applyEdit(editBuilder);

            // Show the completion message
            vscode.window.showInformationMessage(
              `Added ${GeneratedCode.split("\n").length} line${
                GeneratedCode.split("\n").length == 1 ? "" : "s"
              } of code!`
            );
          })
          .catch(function (error) {
            vscode.window.showInformationMessage(`An error occurred:`);
            vscode.window.showInformationMessage(error);
          });
      } else {
        // Show error message
        vscode.window.showInformationMessage(
          `Navigate to a file to generate code in!`
        );
      }
    })
  );
}

// Extension deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
