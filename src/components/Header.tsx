import type { Screen } from "../types";

interface HeaderProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const screens: Array<{ id: Screen; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Lançamentos" },
  { id: "insights", label: "Onde Gasto Mais" },
  { id: "settings", label: "Configurações" }
];

export function Header({ activeScreen, onScreenChange }: HeaderProps) {
  return (
    <header className="hero-card">
      <div className="brand-block">
        <div className="brand-row">
          <img
            src="/branding/mt%20logo.png"
            alt="MoneyTrack"
            className="brand-logo brand-logo-full"
          />
          <img
            src="/branding/mt%20icone.png"
            alt="MoneyTrack"
            className="brand-logo brand-logo-compact"
          />
          <h1 className="sr-only">MoneyTrack</h1>
        </div>
      </div>

      <nav className="tab-nav" aria-label="Navegação principal">
        {screens.map((screen) => (
          <button
            key={screen.id}
            type="button"
            className={screen.id === activeScreen ? "tab active" : "tab"}
            onClick={() => onScreenChange(screen.id)}
          >
            {screen.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
