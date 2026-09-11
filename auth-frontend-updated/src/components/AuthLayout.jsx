import StarsBackground from "./StarsBackground";

export default function AuthLayout({ children }) {
  return (
    <div className="app-shell">
      <StarsBackground starColor="#fff" speed={60} factor={0.06} />
      {children}
    </div>
  );
}
