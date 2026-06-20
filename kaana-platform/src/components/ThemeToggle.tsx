import { Monitor, Sun, Moon } from './KaanaIcons';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import './theme-toggle.css';

const OPTIONS: { id: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { id: 'system', label: 'Auto', Icon: Monitor },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, setPreference } = useTheme();
  const activeIndex = OPTIONS.findIndex((o) => o.id === preference);

  return (
    <div className={`theme-toggle${compact ? ' theme-toggle--compact' : ''}`} role="group" aria-label="Appearance">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`theme-toggle-btn ${preference === id ? 'active' : ''}`}
          onClick={() => setPreference(id)}
          aria-pressed={preference === id}
          aria-label={label}
          title={label}
        >
          <Icon size={15} strokeWidth={2} aria-hidden="true" />
          <span className="theme-toggle-label">{label}</span>
        </button>
      ))}
      <span
        className="theme-toggle-indicator"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
        aria-hidden="true"
      />
    </div>
  );
}
