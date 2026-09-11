import { useState } from "react";
import { Search, X } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function SearchChatModal({ onClose }) {
  const { conversations, selectChat } = useChat();
  const [query, setQuery] = useState("");

  const results = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  function handleSelect(id) {
    selectChat(id);
    onClose();
  }

  return (
    <div className="search-modal__backdrop" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal__input-row">
          <Search size={16} />
          <input
            autoFocus
            className="search-modal__input"
            placeholder="Search chats by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="icon-btn" onClick={onClose} aria-label="Close search">
            <X size={16} />
          </button>
        </div>

        <div className="search-modal__results">
          {conversations.length === 0 && (
            <p className="chat-sidebar__empty">No conversations yet.</p>
          )}
          {conversations.length > 0 && results.length === 0 && (
            <p className="chat-sidebar__empty">No chats match "{query}".</p>
          )}
          {results.map((c) => (
            <button
              key={c.id}
              className="search-modal__result"
              onClick={() => handleSelect(c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
