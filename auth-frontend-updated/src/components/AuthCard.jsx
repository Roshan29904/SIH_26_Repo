export default function AuthCard({ title, children }) {
  return (
    <div className="auth-card">
      <h1 className="auth-card__title">{title}</h1>
      {children}
    </div>
  );
}
