import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { MODEL_OPTIONS } from "./ModelMenu";

export default function SystemStatsPopover({ onClose }) {

  // Later these values will come from the backend
  const [gpu, setGpu] = useState(0);
  const [memory, setMemory] = useState(0);

  const { selectedModelId } = useChat();

  const selectedModel =
    MODEL_OPTIONS.find((m) => m.id === selectedModelId) || MODEL_OPTIONS[0];

  return (
    <div className="search-modal__backdrop" onClick={onClose}>
      <div
        className="stats-popover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-modal__header">
          <span>System (this chat)</span>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <StatBar label="GPU usage" value={gpu} />
        <StatBar label="Memory (RAM)" value={memory} />

        <div className="stats-popover__model-row">
          <span>Model</span>
          <span>{selectedModel.label}</span>
        </div>

        <p className="stats-popover__note">
          System usage will be loaded from the backend.
        </p>
      </div>
    </div>
  );
}

function StatBar({ label, value }) {
  return (
    <div className="stats-popover__stat">
      <div className="stats-popover__stat-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="stats-popover__bar-track">
        <div
          className="stats-popover__bar-fill"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}