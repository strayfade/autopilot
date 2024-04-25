# autopilot

**autopilot** is a free AI code generation extension for Visual Studio Code.

 - Cross-platform compatibility
 - Incredibly fast
 - Understands context
  
> **autopilot** is a proof of concept. There are many issues currently, and this is not meant to be a definitive replacement for GitHub Copilot.

# Usage

1. Download and install Ollama for your operating system:
    - [Windows](https://ollama.com/download/OllamaSetup.exe)
    - [MacOS](https://ollama.com/download/Ollama-darwin.zip)
    - Linux: `curl -fsSL https://ollama.com/install.sh | sh`
2. Test Ollama first with your intended LLM to make sure that all model files are downloaded and prepared, and that interactions are working. This can be done by running the `ollama run codegemma` command on your system (with `codegemma` being your public LLM of choice).
3. Install the Visual Studio Code extension (this repository!)
4. Navigate to the source file you wish to generate code for, and position the cursor on a line where code should be generated.
5. Press `Ctrl + Shift + P` to open the Command Palette, then run the command **Autopilot: Generate code** to generate code at the cursor's position.

# Settings

 - Context Size - Defines the number of lines (before *and* after) the cursor position to include in the context for the LLM prompt to generate code.
   - Type: `integer`
   - Default value: `50`
   - Identifier: `autopilot.contextSize`
 - Model Name - This is the name of the Ollama model that will be interacted with to perform generation requests.
   - Type: `string`
   - Default value: `llama3`
   - Identifer: `autopilot.modelName`
 - Prompt Type - This is the format of the prompt that will be generated, which is required when interacting with LLMs such as `codegemma` with nonstandard formatting.
   - Type: `enum` (of values `generic`, `codegemma`)
   - Default value: `generic`
   - Identifier: `autopilot.promptType`
 - URL - This is the API endpoint created by Ollama on your computer or on another server. This notably *includes* the API path `/api/generate`.
   - Type: `string`
   - Default value: `http://localhost:11434/api/generate`
   - Identifier: `autopilot.url`