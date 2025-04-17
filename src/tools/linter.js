// ESLint tool
import { ESLint } from "eslint";
import fs from "fs";

const runLinter = async ({ codeContent, filePath }) => {
  let codeToLint = codeContent;
  let useFilePath = filePath || "__temp_lint__.js";

  if (!codeToLint && filePath) {
    try {
      codeToLint = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      return { error: `Error reading file ${filePath}: ${err.message}` };
    }
  } else if (!codeToLint && !filePath) {
    return { error: "Either 'codeContent' or 'filePath' is required." };
  }

  let tempFileUsed = false;
  if (!filePath && codeContent) {
    try {
      fs.writeFileSync(useFilePath, codeContent);
      tempFileUsed = true;
    } catch (err) {
      return { error: `Error writing temporary file: ${err.message}` };
    }
  }

  try {
    const eslint = new ESLint({ fix: false });
    const results = await eslint.lintFiles([useFilePath]);

    const errors = results.flatMap((result) =>
      result.messages.map((msg) => ({
        line: msg.line,
        column: msg.column,
        ruleId: msg.ruleId,
        severity: msg.severity === 2 ? "error" : "warning",
        message: msg.message,
      }))
    );

    // Clean up temporary file
    if (tempFileUsed) {
      try {
        fs.unlinkSync(useFilePath);
      } catch {}
    }

    if (errors.length === 0) {
      return { result: "No linting errors found!" };
    } else {
      return { errors: JSON.stringify(errors, null, 2) };
    }
  } catch (err) {
    if (tempFileUsed) {
      try {
        fs.unlinkSync(useFilePath);
      } catch {}
    }
    console.error("Error running ESLint:", err);
    return { error: `Error running ESLint: ${err.message}` };
  }
};

export default {
  name: "runLinter",
  description:
    "Runs ESLint on a JavaScript code snippet or file to find linting and style errors. Returns a list of errors found or a message indicating that there are no errors.",
  parameters: {
    type: "object",
    properties: {
      codeContent: {
        type: "string",
        description:
          "The JavaScript code content to check. Use if filePath is not provided.",
      },
      filePath: {
        type: "string",
        description:
          "The path to the JavaScript file to check. Will be used if codeContent is not provided.",
      },
    },
  },
  function: runLinter,
};
