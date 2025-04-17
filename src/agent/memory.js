const conversations = new Map();

const getMessages = (conversationId) => {
  if (!conversations.has(conversationId)) {
    conversations.set(conversationId, []);
  }
  return conversations.get(conversationId);
};

const addMessage = (conversationId, message) => {
  getMessages(conversationId).push(message);
};

export default { getMessages, addMessage };
