import { useRef } from "react";
import { Camera, FileText, FileSpreadsheet, Presentation, Image } from "lucide-react";


const OPTIONS = [
  { key: "camera", label: "Camera", icon: Camera, accept: "image/*", capture: "environment" },
  { key: "photo", label: "Photo", icon: Image, accept: "image/*" },
  { key: "pdf", label: "PDF", icon: FileText, accept: "application/pdf" },
  {
    key: "excel",
    label: "Excel",
    icon: FileSpreadsheet,
    accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    key: "ppt",
    label: "PowerPoint",
    icon: Presentation,
    accept: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
];

export default function AttachMenu({ onFileSelected, onClose }) {
  const fileInputRef = useRef(null);

  function handleOptionClick(option) {
    const input = fileInputRef.current;
    if (!input) return;
    input.accept = option.accept;
    if (option.capture) {
      input.setAttribute("capture", option.capture);
    } else {
      input.removeAttribute("capture");
    }
    input.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = ""; // reset so picking the same file again still fires onChange
    onClose();
  }

  return (
    <div className="attach-menu">
      {OPTIONS.map(({ key, label, icon: Icon, ...opts }) => (
        <button
          key={key}
          className="attach-menu__item"
          onClick={() => handleOptionClick(opts)}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
