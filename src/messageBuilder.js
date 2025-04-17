const buildMessages = (messages) => {
  return messages.map((msg) => {
    if (msg.role === "tool") {
      return {
        role: "tool",
        tool_call_id: msg.tool_call_id,
        name: msg.name,
        content: msg.content,
      };
    }

    if (msg.tool_calls) {
      return {
        role: msg.role,
        content: "",
        tool_calls: msg.tool_calls,
      };
    }

    return {
      role: msg.role,
      content: msg.content,
    };
  });
};

export default { buildMessages };
