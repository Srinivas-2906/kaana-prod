import { NavLink, useParams } from 'react-router-dom';
import { PROJECT_TABS, type ProjectTab } from '../types';

export function ProjectTabs({ basePath }: { basePath: string }) {
  const { tab = 'overview' } = useParams<{ tab?: ProjectTab }>();

  return (
    <div className="project-tabs">
      {PROJECT_TABS.map((t) => (
        <NavLink key={t} to={`${basePath}/${t}`} className={`tab${tab === t ? ' active' : ''}`}>
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </NavLink>
      ))}
    </div>
  );
}
