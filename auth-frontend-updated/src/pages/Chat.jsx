import { useEffect, useRef } from "react";
import StarsBackground from "../components/StarsBackground";
import ChatSidebar from "../components/ChatSidebar";
import ChatComposer from "../components/ChatComposer";
import { useChat } from "../context/ChatContext";

export default function Chat() {
  const { activeConversation, sidebarOpen, engaged, setEngaged } = useChat();

  const showWelcome = !activeConversation && !engaged;
  const atBottom = engaged || !!activeConversation;
  const composerWrapRef = useRef(null);     //helping to know , user clicked where ,inside or outside the menu

  useEffect(() => {
    if (!engaged || activeConversation) return;

    function handleOutsideMouseDown(e) {
      if (composerWrapRef.current && !composerWrapRef.current.contains(e.target)) {
        setEngaged(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, [engaged, activeConversation, setEngaged]);

  return (
    <div className="chat-page">
      {}
      {!atBottom && <StarsBackground starColor="#fff" speed={60} factor={0.06} />}
      <ChatSidebar />

      <main
        className={
          "chat-main" +
          (sidebarOpen ? " chat-main--with-sidebar" : "") +
          (atBottom ? " chat-main--bottom" : "")
        }
      >
        {showWelcome && (
          <div className="chat-welcome">
            <h1 className="chat-welcome__title">Hi, How can I assist you ?</h1>
          </div>
        )}

        {activeConversation && <ChatMessages conversation={activeConversation} />}

        <div className="chat-composer-wrap" ref={composerWrapRef}>
          <ChatComposer onEngage={() => setEngaged(true)} />
        </div>
      </main>
    </div>
  );
}

function ChatMessages({ conversation }) {
  return (
    <div className="chat-messages">
      {conversation.messages.map((msg, i) => (
        <div
          key={i}
          className={
            "chat-bubble " +
            (msg.role === "user" ? "chat-bubble--user" : "chat-bubble--assistant")
          }
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
