import './ultimate-bg.css';

/** Cinematic grid + spotlight — replaces iOS mesh */
export function UltimateBackground() {
  return (
    <div className="ultimate-bg" aria-hidden="true">
      <div className="ultimate-spotlight ultimate-spotlight-1" />
      <div className="ultimate-spotlight ultimate-spotlight-2" />
      <div className="ultimate-grid-lines" />
      <div className="ultimate-vignette" />
    </div>
  );
}
