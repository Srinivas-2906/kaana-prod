export function SettingsView() {
  return (
    <div className="settings-view panel">
      <h3>Settings</h3>
      <div className="settings-group">
        <label>Default assigned agent</label>
        <select defaultValue="Ravi Kapoor">
          <option>Ravi Kapoor</option>
          <option>Priya Nair</option>
          <option>Anil Sharma</option>
        </select>
      </div>
      <div className="settings-group">
        <label>Follow-up reminder</label>
        <select defaultValue="daily">
          <option value="daily">Daily digest</option>
          <option value="instant">Instant alerts</option>
        </select>
      </div>
      <div className="settings-group">
        <label>AI scoring sensitivity</label>
        <input type="range" min={1} max={10} defaultValue={7} />
      </div>
      <button type="button" className="btn btn-primary">Save preferences</button>
    </div>
  );
}
