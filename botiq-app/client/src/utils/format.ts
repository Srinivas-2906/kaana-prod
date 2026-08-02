export function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#7C3AED', '#2563EB', '#25D366', '#F59E0B', '#EC4899', '#0EA5E9', '#10B981', '#EF4444'];

export function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}
