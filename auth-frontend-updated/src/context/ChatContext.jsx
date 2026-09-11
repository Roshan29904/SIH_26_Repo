import { createContext, useContext, useState } from "react";
import { createAIJob, getAIJob, uploadDocument } from "../services/api";
import { MODEL_OPTIONS } from "../components/ModelMenu";

const ChatContext = createContext(null);

let nextLocalId = 1;

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(MODEL_OPTIONS[0].id);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  function startNewChat() {
    setActiveId(null);
    setEngaged(false);
  }

  function selectChat(id) {
    setActiveId(id);
    setEngaged(true);
  }

  function appendMessage(conversationId, message) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c
      )
    );
  }

  async function pollJob(jobId, conversationId) {
    const maxAttempts = 30;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const job = await getAIJob(jobId);

      if (job.status === "COMPLETED") {
        appendMessage(conversationId, {
          role: "assistant",
          text: job.result || "The AI job completed without a response.",
        });
        return;
      }

      if (job.status === "FAILED") {
        throw new Error(job.errorMessage || "The AI job failed.");
      }
    }

    appendMessage(conversationId, {
      role: "assistant",
      text: "Your request was queued successfully, but the backend has not completed it yet.",
    });
  }

  async function sendMessage(text, attachedFile = null) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setEngaged(true);

    let conversationId = activeId;

    if (!conversationId) {
      conversationId = nextLocalId++;
      const title = trimmed.length > 40 ? trimmed.slice(0, 40) + "…" : trimmed;

      setConversations((prev) => [
        { id: conversationId, title, messages: [] },
        ...prev,
      ]);
      setActiveId(conversationId);
    }

    appendMessage(conversationId, { role: "user", text: trimmed });
    setSending(true);

    try {
      let documentId = null;

      if (attachedFile) {
        const document = await uploadDocument(attachedFile);
        documentId = document.id;
      }

      const job = await createAIJob({
        documentId,
        taskType: attachedFile ? "DOCUMENT_CHAT" : "CHAT",
        prompt: trimmed,
      });

      if (job.status === "COMPLETED") {
        appendMessage(conversationId, {
          role: "assistant",
          text: job.result || "The AI job completed without a response.",
        });
      } else if (job.status === "FAILED") {
        throw new Error(job.errorMessage || "The AI job failed.");
      } else {
        await pollJob(job.id, conversationId);
      }
    } catch (error) {
      appendMessage(conversationId, {
        role: "assistant",
        text: `Unable to complete the request: ${error.message}`,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        startNewChat,
        selectChat,
        sendMessage,
        sending,
        sidebarOpen,
        setSidebarOpen,
        engaged,
        setEngaged,
        selectedModelId,
        setSelectedModelId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
