// index.js
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import agentInvoker from "./src/agent/agentInvoker.js";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error(
    "Error: OPENAI_API_KEY environment variable required in .env file"
  );
  process.exit(1);
}

const TARGET_FILE_PATH = "target_code.js";

const runAgent = async () => {
  if (!fs.existsSync(TARGET_FILE_PATH)) {
    console.error(
      `❌ Error: Target file "${TARGET_FILE_PATH}" does not exist.`
    );
    console.error(
      "Please create the file with JavaScript code containing linting errors."
    );
    process.exit(1);
  }

  let initialCodeContent;
  try {
    initialCodeContent = fs.readFileSync(TARGET_FILE_PATH, "utf-8");
    console.log(`📄 --- Initial Content of ${TARGET_FILE_PATH} ---`);
    console.log(initialCodeContent);
    console.log("---------------------------------------\n");
  } catch (err) {
    console.error(`❌ Error reading file ${TARGET_FILE_PATH}: ${err.message}`);
    process.exit(1);
  }

  const conversationId = `lintfix-${Date.now()}`;
  console.log(`🚀 Starting agent with conversation ID: ${conversationId}`);
  console.log("⏳ Processing...\n");

  try {
    const result = await agentInvoker.invokeAgent(conversationId, {
      codeContent: initialCodeContent,
      filePath: TARGET_FILE_PATH,
    });

    console.log("\n📋 ==== COMPLETE AGENT RESPONSE ====\n");
    console.log(result);

    const finalCodeMatch = result.match(/<final_code>([\s\S]*?)<\/final_code>/);
    if (finalCodeMatch && finalCodeMatch[1]) {
      const finalCode = finalCodeMatch[1].trim();
      console.log("\n✨ ==== FINAL CORRECTED CODE ====\n");
      console.log(finalCode);

      const outputPath = path.join(
        path.dirname(TARGET_FILE_PATH),
        `${path.basename(TARGET_FILE_PATH, ".js")}_corrected.js`
      );
      try {
        fs.writeFileSync(outputPath, finalCode);
        console.log(`\n✅ Corrected code saved to: ${outputPath}`);
      } catch (err) {
        console.error(`\n❌ Error saving the corrected file: ${err.message}`);
      }
    } else {
      console.log(
        "\n❌ Could not extract the final code from the agent's response."
      );
    }
  } catch (error) {
    console.error("\n❌ ==== ERROR DURING AGENT EXECUTION ====");
    console.error(error.message);
  }
};

runAgent();
