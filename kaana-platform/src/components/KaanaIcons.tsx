import {
  MessageCircle,
  Bot,
  Inbox,
  Kanban,
  Globe,
  Calendar,
  CreditCard,
  Megaphone,
  Bell,
  Sparkles,
  BarChart3,
  QrCode,
  Star,
  FileText,
  Building2,
  Link2,
  Zap,
  Users,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Clock,
  AtSign,
  UtensilsCrossed,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react';

export {
  MessageCircle,
  Bot,
  Inbox,
  Kanban,
  Globe,
  Calendar,
  CreditCard,
  Megaphone,
  Bell,
  Sparkles,
  BarChart3,
  QrCode,
  Star,
  FileText,
  Building2,
  Link2,
  Zap,
  Users,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Clock,
};

/** Platform capability icons (Lucide) */
export const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  whatsapp: MessageCircle,
  bot: Bot,
  inbox: Inbox,
  crm: Kanban,
  web: Globe,
  calendar: Calendar,
  payment: CreditCard,
  broadcast: Megaphone,
  reminder: Bell,
  ai: Sparkles,
  analytics: BarChart3,
  qr: QrCode,
  reviews: Star,
  docs: FileText,
  multi: Building2,
  api: Link2,
  instagram: AtSign,
  ordering: UtensilsCrossed,
  webchat: MessagesSquare,
};

export const SHOWCASE_ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  inbox: Inbox,
  crm: Kanban,
  minisite: Globe,
};

export function IconBadge({
  icon: Icon,
  size = 22,
  className = '',
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`icon-badge ${className}`}>
      <Icon size={size} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}
