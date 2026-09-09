import { createContext, useContext, useState } from "react";
import { sendChatMessage } from "../services/api";
import { MODEL_OPTIONS } from "../components/ModelMenu";

const ChatContext = createContext(null);

let nextId = 1;   // just for testing , need to change, conversationId must be returned by teh backend

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [sending, setSending] = useState(false);
  const [engaged, setEngaged] = useState(false);  //tells when the ask question menu need to go down
  const [selectedModelId, setSelectedModelId] = useState(MODEL_OPTIONS[0].id);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  function startNewChat() {   // the newchat function
    setActiveId(null);
    setEngaged(false);
  }

  function selectChat(id) {    // serach and select an existing function 
    setActiveId(id);
    setEngaged(true);
  }

  function appendMessage(conversationId, message) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
      )
    );
  }



  
      //NEED BACKEND RESPONSE

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setEngaged(true);

    let conversationId = activeId;

    if (!conversationId) {
      conversationId = nextId++;     // MUST BEE UPDATED USING THE BACKEND 
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
      const reply = await sendChatMessage({ conversationId, text: trimmed });     //NEED BACKEND REPLY
      appendMessage(conversationId, { role: "assistant", text: reply.text });
    } catch {
      appendMessage(conversationId, {
        role: "assistant",
        text: "(Backend isn't connected yet )",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <ChatContext.Provider    //AVAILABLE TO CHILD COMPONENTS
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
