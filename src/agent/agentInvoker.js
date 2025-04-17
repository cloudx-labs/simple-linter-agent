// src/agent/agentInvoker.js
import fetch from "node-fetch";
import config from "../config.js";
import memory from "./memory.js";
import messageBuilder from "../messageBuilder.js";
import linterTool from "../tools/linter.js";

// OpenAI API tools definition
const tools = [
  {
    type: "function",
    function: {
      name: linterTool.name,
      description: linterTool.description,
      parameters: linterTool.parameters,
    },
  },
];

// Call LLM function
const callLLM = async (messages) => {
  console.log("📡 Calling OpenAI API...");
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: config.systemPrompt },
          ...messageBuilder.buildMessages(messages),
        ],
        tools: tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error de API: ${response.status} ${errorText}`);
      throw new Error(`Error de API: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error in callLLM:", error);
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: `<final_code>\n// Error calling LLM: ${error.message}\n</final_code>`,
          },
        },
      ],
    };
  }
};

// Handle tool calls
const handleToolCall = async (toolCall) => {
  if (toolCall.function.name === linterTool.name) {
    console.log(`🔧 Executing tool: ${linterTool.name}`);
    try {
      const args = JSON.parse(toolCall.function.arguments || "{}");
      return await linterTool.function(args);
    } catch (error) {
      console.error(
        `❌ Error parsing arguments or executing ${linterTool.name}:`,
        error
      );
      return {
        error: `Internal error in tool ${linterTool.name}: ${error.message}`,
      };
    }
  }
  console.warn(`⚠️ Attempted to call unknown tool: ${toolCall.function.name}`);
  return { error: `Unknown tool: ${toolCall.function.name}` };
};

// Main agent invoker
const invokeAgent = async (conversationId, inputs) => {
  const { codeContent, filePath } = inputs;

  if (!codeContent && !filePath) {
    return "<final_code>// Error: Initial codeContent or filePath required.</final_code>";
  }

  let userMessageContent =
    "Please fix the linting errors in the following code:\n\n```javascript\n";
  if (codeContent) {
    userMessageContent += codeContent + "\n```";
  } else {
    userMessageContent += `// Code from file: ${filePath}\n\`\`\``;
  }

  memory.addMessage(conversationId, {
    role: "user",
    content: userMessageContent,
  });

  const MAX_ITERATIONS = 3;
  let finalCode = null;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`\n📋 --- Iteration ${i + 1} ---`);
    const messages = memory.getMessages(conversationId);
    const llmResponse = await callLLM(messages);

    const assistantMessage = llmResponse.choices?.[0]?.message;
    if (!assistantMessage) {
      console.error("❌ Invalid LLM response:", llmResponse);
      finalCode = "<final_code>// Error: Invalid LLM response.</final_code>";
      break;
    }

    memory.addMessage(conversationId, assistantMessage);

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log("🛠️ LLM requested to use tools");
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type === "function") {
          const toolResult = await handleToolCall(toolCall);
          const toolResultContent =
            typeof toolResult === "string"
              ? toolResult
              : JSON.stringify(toolResult);

          memory.addMessage(conversationId, {
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: toolResultContent,
          });
          console.log(
            `✅ Result from ${toolCall.function.name}:`,
            toolResultContent
          );
        }
      }
    } else if (assistantMessage.content) {
      console.log("💬 LLM responded with content");
      const match = assistantMessage.content.match(
        /<final_code>([\s\S]*?)<\/final_code>/
      );
      if (match && match[1]) {
        console.log("✅ Final code found in LLM response");
        finalCode = match[0];
        break;
      } else {
        console.warn(
          "⚠️ LLM response without tool_calls or <final_code>. Using content as possible final result."
        );
        finalCode = `<final_code>\n${assistantMessage.content}\n</final_code>`;
        break;
      }
    } else {
      console.warn("⚠️ Empty or unexpected LLM response");
      finalCode =
        "<final_code>// Error: Empty or unexpected LLM response.</final_code>";
      break;
    }
  }

  if (!finalCode) {
    console.warn(
      "⚠️ Maximum iterations reached without explicit <final_code>. Searching in the last message..."
    );
    const lastMessages = memory.getMessages(conversationId);
    const lastAssistantMsg = lastMessages
      .reverse()
      .find((m) => m.role === "assistant" && m.content);
    if (lastAssistantMsg && lastAssistantMsg.content) {
      const match = lastAssistantMsg.content.match(
        /<final_code>([\s\S]*?)<\/final_code>/
      );
      if (match && match[1]) {
        finalCode = match[0];
      } else {
        finalCode = `<final_code>\n// (Tentative final response after ${MAX_ITERATIONS} iterations)\n${lastAssistantMsg.content}\n</final_code>`;
      }
    } else {
      finalCode = `<final_code>// Error: Could not obtain a final response after ${MAX_ITERATIONS} iterations.</final_code>`;
    }
  }

  return finalCode;
};

export default { invokeAgent };
