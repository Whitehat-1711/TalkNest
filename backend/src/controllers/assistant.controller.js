import crypto from "crypto";
import Groq from "groq-sdk";

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are TalkNest AI, a helpful chat assistant inside a messaging app.
Respond with concise, practical answers.
If a request is unsafe or illegal, refuse briefly and suggest a safe alternative.`;

const ASSISTANT_ID = "assistant-groq";
const conversationStore = new Map();

const getConversation = (userId) => {
  if (!conversationStore.has(userId)) {
    conversationStore.set(userId, []);
  }

  return conversationStore.get(userId);
};

const buildMessage = ({ senderId, receiverId, text }) => ({
  _id: crypto.randomUUID(),
  senderId,
  receiverId,
  text,
  createdAt: new Date().toISOString(),
});

const toGroqHistory = (messages) =>
  messages.map((message) => ({
    role: message.senderId === ASSISTANT_ID ? "assistant" : "user",
    content: message.text,
  }));

export const getAssistantHistory = (req, res) => {
  const userId = req.user._id.toString();
  const history = getConversation(userId);
  res.status(200).json(history);
};

export const chatWithAssistant = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        message: "GROQ_API_KEY is not configured on the server",
      });
    }

    const text = req.body?.message?.trim();

    if (!text) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = req.user._id.toString();
    const history = getConversation(userId);
    const userMessage = buildMessage({
      senderId: userId,
      receiverId: ASSISTANT_ID,
      text,
    });

    history.push(userMessage);
    const recentHistory = toGroqHistory(history.slice(-12));

    const completion = await groqClient.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 600,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...recentHistory],
    });

    const assistantText =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I could not generate a response this time. Please try again.";

    const assistantMessage = buildMessage({
      senderId: ASSISTANT_ID,
      receiverId: userId,
      text: assistantText,
    });

    history.push(assistantMessage);

    // Keep memory bounded per user session.
    if (history.length > 24) {
      conversationStore.set(userId, history.slice(-24));
    }

    return res.status(200).json({ userMessage, assistantMessage });
  } catch (error) {
    console.error("Error in chatWithAssistant controller:", error);
    return res.status(500).json({
      message: "Failed to get response from AI assistant",
      error: error.message,
    });
  }
};
