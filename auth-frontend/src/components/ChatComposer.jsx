import { useEffect, useRef, useState } from "react";
import { Plus, ChevronDown, Mic, X } from "lucide-react";
import { useChat } from "../context/ChatContext";
import AttachMenu from "./AttachMenu";
import ModelMenu from "./ModelMenu";

export default function ChatComposer({ onEngage }) {
  const { sendMessage, sending, selectedModelId, setSelectedModelId } = useChat();
  const [value, setValue] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const attachRef = useRef(null);
  const modelMenuRef = useRef(null);

  // Close the "+" attach menu when clicking anywhere outside of it.
  useEffect(() => {
    if (!attachOpen) return;

    function handleClickOutside(e) {
      if (attachRef.current && !attachRef.current.contains(e.target)) {
        setAttachOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [attachOpen]);

  // Close the model dropdown when clicking anywhere outside of it.
  useEffect(() => {
    if (!modelMenuOpen) return;

    function handleClickOutside(e) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setModelMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modelMenuOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    if ((!value.trim() && !attachedFile) || sending) return;
   
    const text = attachedFile ? `${value} [attached: ${attachedFile.name}]`.trim() : value;
    sendMessage(text);
    setValue("");
    setAttachedFile(null);
  }

  return (
    <div className="chat-composer-stack">
      {attachedFile && (
        <div className="composer-file-chip">
          <span>{attachedFile.name}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setAttachedFile(null)}
            aria-label="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form className="chat-composer" onSubmit={handleSubmit}>
        <div className="attach-menu-anchor" ref={attachRef}>
          <button
            type="button"
            className="chat-composer__icon-btn"
            aria-label="Add attachment"
            onClick={() => setAttachOpen((v) => !v)}
          >
            <Plus size={18} />
          </button>
          {attachOpen && (
            <AttachMenu
              onFileSelected={(file) => setAttachedFile(file)}
              onClose={() => setAttachOpen(false)}
            />
          )}
        </div>

        <input
          className="chat-composer__input"
          placeholder="Ask questions"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={onEngage}
          disabled={sending}
        />
        <div className="model-menu-anchor" ref={modelMenuRef}>
          <button
            type="button"
            className="chat-composer__icon-btn"
            aria-label="Options"
            onClick={() => setModelMenuOpen((v) => !v)}
          >
            <ChevronDown size={18} />
          </button>
          {modelMenuOpen && (
            <ModelMenu
              selectedModelId={selectedModelId}
              onSelect={(id) => {
                setSelectedModelId(id);
                setModelMenuOpen(false);
              }}
            />
          )}
        </div>
        <button
          type="submit"
          className="chat-composer__icon-btn"
          aria-label="Voice input"
        >
          <Mic size={18} />
        </button>
      </form>
    </div>
  );
}
