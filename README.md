# Simple Linter AI Agent

A basic Node.js example demonstrating the "LLM + Loop + Tools" pattern for an AI agent. This agent uses an LLM (like GPT-4o Mini) and ESLint via a custom tool to automatically fix JavaScript linting errors in a target file.

## Prerequisites

- Node.js (v18 or later recommended)
- npm (usually comes with Node.js)
- An OpenAI API Key

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory-name>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure your API Key:**
    - Create a file named `.env` in the root of the project.
    - Add your OpenAI API key to the `.env` file:
      ```dotenv
      OPENAI_API_KEY=sk-YourSecretOpenAiApiKeyGoesHere
      ```

## Running the Agent

1.  **Prepare the target file:** Ensure the file `target_code.js` exists in the root directory and contains JavaScript code with linting errors (according to the `.eslintrc.json` rules). You can modify this file or create your own.
2.  **Run the agent:**
    ```bash
    node index.js
    ```

## What it Does

- Reads the content of `target_code.js`.
- Calls the OpenAI API (configured model, e.g., `gpt-4o-mini`).
- Uses the `runLinter` tool, which executes ESLint to find errors.
- The LLM analyzes the errors and attempts to fix the code.
- It uses the `runLinter` tool _again_ to verify the fixes.
- Prints the final corrected code to the console.
- Saves the corrected code to `target_code_corrected.js`.

## Customization

- **Target File:** Change the `TARGET_FILE_PATH` variable in `index.js` to point to a different file.
- **Linting Rules:** Modify the `.eslintrc.json` file to adjust ESLint rules.
- **LLM Model:** Change the `model` value in `src/config.js`.
- **System Prompt:** Adjust the instructions in `src/config.js` (be careful, this affects agent behavior significantly).
