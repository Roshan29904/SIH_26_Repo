import { Check } from "lucide-react";

export const MODEL_OPTIONS = [
  { id: "model-1", label: "Model 1 (Default)" },
  { id: "model-2", label: "Model 2" },
  { id: "model-3", label: "Model 3" },
  { id: "model-4", label: "Model 4" },
];

export default function ModelMenu({ selectedModelId, onSelect }) {
  return (
    <div className="model-menu">
      {MODEL_OPTIONS.map((model) => (
        <button
          type="button"
          key={model.id}
          className={
            "model-menu__item" +
            (model.id === selectedModelId ? " model-menu__item--active" : "")
          }
          onClick={() => onSelect(model.id)}
        >
          <span>{model.label}</span>
          {model.id === selectedModelId && <Check size={14} />}
        </button>
      ))}
    </div>
  );
}
