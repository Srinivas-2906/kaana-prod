import { properties } from '../../data/mockData';

export function PropertiesView() {
  return (
    <div className="cards-grid">
      {properties.map((p) => (
        <div key={p.title} className="property-card panel">
          <h4>{p.title}</h4>
          <div className="meta">{p.beds}</div>
          <div className="meta">{p.status}</div>
          <div className="budget-val price">{p.price}</div>
          <div className="meta">{p.match} matching leads</div>
        </div>
      ))}
    </div>
  );
}
