export default function FormField({ label, type = "text", name, value, onChange, ...rest }) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      <input
        className="form-field__input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        {...rest}
      />
    </label>
  );
}
