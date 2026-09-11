import { X, UserRound, Mail, Phone } from "lucide-react";

export default function ProfileModal({ user, onClose }) {
  return (
    <div className="search-modal__backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal__header">
          <span>Account</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="profile-modal__row">
          <UserRound size={16} />
          <span>{user?.username || "Unknown"}</span>
        </div>
        <div className="profile-modal__row">
          <Mail size={16} />
          <span>{user?.email || "Not available"}</span>
        </div>
        <div className="profile-modal__row">
          <Phone size={16} />
          <span>{user?.phone || "Not added"}</span>
        </div>
      </div>
    </div>
  );
}
