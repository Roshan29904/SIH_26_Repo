import { useEffect, useRef, useState } from "react";
import {
  PanelLeft,
  SquarePen,
  Search,
  Settings,
  Circle,
  UserRound,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useUser } from "../context/UserContext";
import SearchChatModal from "./SearchChatModal";
import ProfileModal from "./ProfileModal";
import SystemStatsPopover from "./SystemStatsPopover";

export default function ChatSidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    startNewChat,
    conversations,
    activeConversation,
    selectChat,
  } = useChat();
  const [searchOpen, setSearchOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!sidebarOpen) return;

    function handleClickOutside(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {sidebarOpen ? (
        <aside ref={sidebarRef} className="chat-sidebar chat-sidebar--expanded">
          <div className="chat-sidebar__header">
            <button
              className="icon-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
            >
              <PanelLeft size={18} />
            </button>
            <span className="chat-sidebar__brand">SOVEREIGN AI</span>
          </div>

          <button className="chat-sidebar__nav-item" onClick={startNewChat}>
            <SquarePen size={16} />
            New chat
          </button>
          <button
            className="chat-sidebar__nav-item"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            Search chat
          </button>

          <div className="chat-sidebar__section-label">Recent Chat</div>
          <div className="chat-sidebar__list">
            {conversations.length === 0 && (
              <p className="chat-sidebar__empty">No conversations yet.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                className={
                  "chat-sidebar__chat-item" +
                  (activeConversation?.id === c.id ? " chat-sidebar__chat-item--active" : "")
                }
                onClick={() => selectChat(c.id)}
              >
                {c.title}
              </button>
            ))}
          </div>

          <ChatSidebarFooter expanded />
        </aside>
      ) : (
        <div
          className="chat-rail"
          onClick={() => setSidebarOpen(true)}
        >
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Expand sidebar"
          >
            <PanelLeft size={20} />
          </button>
          <button className="icon-btn" onClick={startNewChat} aria-label="New chat">
            <SquarePen size={20} />
          </button>
          <button
            className="icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search chat"
          >
            <Search size={20} />
          </button>

          <div className="chat-rail__spacer" />

          <ChatSidebarFooter expanded={false} />
        </div>
      )}

      {searchOpen && <SearchChatModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function ChatSidebarFooter({ expanded }) {
  const { user } = useUser();
  const [statsOpen, setStatsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.username || "Account";

  return (
    <div className={expanded ? "chat-sidebar__footer" : "chat-rail__footer"}>
      <button
        className={expanded ? "chat-sidebar__nav-item" : "icon-btn"}
        onClick={() => console.log("TODO: open settings")}
      >
        <Settings size={expanded ? 16 : 20} />
        {expanded && "Setting"}
      </button>

      <button
        className={expanded ? "chat-sidebar__nav-item" : "icon-btn"}
        onClick={() => setStatsOpen(true)}
      >
        <Circle size={expanded ? 16 : 20} />
        {expanded && "System"}
      </button>

      <button
        className={expanded ? "chat-sidebar__nav-item chat-sidebar__profile" : "icon-btn icon-btn--avatar"}
        onClick={() => setProfileOpen(true)}
      >
        <UserRound size={expanded ? 16 : 20} />
        {expanded && displayName}
      </button>

      {statsOpen && <SystemStatsPopover onClose={() => setStatsOpen(false)} />}
      {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
