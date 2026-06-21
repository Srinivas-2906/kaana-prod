import {
  Building2,
  Stethoscope,
  GraduationCap,
  Scissors,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Dumbbell,
  BookOpen,
  Wrench,
  Car,
  Plane,
  Shield,
  Camera,
  PawPrint,
  Truck,
  Heart,
  Sparkles,
  CalendarHeart,
  type LucideIcon,
} from 'lucide-react';
import type { IndustryCategory, IndustryId } from '../data/industries';

export const INDUSTRY_ICONS: Record<IndustryId, LucideIcon> = {
  'real-estate': Building2,
  clinic: Stethoscope,
  coaching: GraduationCap,
  salon: Scissors,
  retail: Store,
  restaurant: UtensilsCrossed,
  ecommerce: ShoppingBag,
  professional: Briefcase,
  fitness: Dumbbell,
  education: BookOpen,
  'home-services': Wrench,
  automotive: Car,
};

export const MORE_INDUSTRY_ICONS: Record<string, LucideIcon> = {
  'Travel & Tours': Plane,
  Insurance: Shield,
  'Events & Weddings': CalendarHeart,
  Photography: Camera,
  'Pet Care': PawPrint,
  Logistics: Truck,
  'Non-profits': Heart,
  'Custom / Other': Sparkles,
};

export const CATEGORY_ICONS: Record<IndustryCategory, LucideIcon> = {
  property: Building2,
  health: Stethoscope,
  retail: Store,
  services: GraduationCap,
};

interface CategoryProps {
  id: IndustryCategory;
  size?: number;
  className?: string;
}

export function CategoryIcon({ id, size = 20, className = '' }: CategoryProps) {
  const Icon = CATEGORY_ICONS[id];
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}

interface Props {
  id: IndustryId;
  size?: number;
  className?: string;
}

/** Modern Lucide icon for each industry vertical */
export function IndustryIcon({ id, size = 20, className = '' }: Props) {
  const Icon = INDUSTRY_ICONS[id];
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}

interface MoreProps {
  name: string;
  size?: number;
  className?: string;
}

export function MoreIndustryIcon({ name, size = 16, className = '' }: MoreProps) {
  const Icon = MORE_INDUSTRY_ICONS[name] ?? Sparkles;
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}

/** Glass tile wrapper for industry icons — 2026 style */
export function IndustryIconTile({
  id,
  size = 20,
  active = false,
}: {
  id: IndustryId;
  size?: number;
  active?: boolean;
}) {
  return (
    <span className={`industry-icon-tile ${active ? 'active' : ''}`}>
      <IndustryIcon id={id} size={size} />
    </span>
  );
}
