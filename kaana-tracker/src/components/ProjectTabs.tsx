import { NavLink, useParams } from 'react-router-dom';
import { PROJECT_TABS, PROJECT_TAB_LABELS, type ProjectTab } from '../types';

export function ProjectTabs({
  basePath,
  unreadUpdates = 0,
  highlightUpdates = false,
}: {
  basePath: string;
  unreadUpdates?: number;
  highlightUpdates?: boolean;
}) {
  const { tab = 'board' } = useParams<{ tab?: ProjectTab }>();

  return (
    <div className="project-tabs">
      {PROJECT_TABS.map((t) => (
        <NavLink
          key={t}
          to={`${basePath}/${t}`}
          className={`tab${tab === t ? ' active' : ''}${t === 'updates' && highlightUpdates ? ' tab-highlight' : ''}`}
        >
          {PROJECT_TAB_LABELS[t]}
          {t === 'updates' && unreadUpdates > 0 && (
            <span className="tab-unread-badge">{unreadUpdates > 99 ? '99+' : unreadUpdates}</span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
