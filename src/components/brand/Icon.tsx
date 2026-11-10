import {
  BarChart3,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CircleAlert,
  ChevronLeft,
  Heart,
  Image,
  LocateFixed,
  Map,
  Maximize,
  MapPin,
  Pencil,
  Plus,
  Route,
  Search,
  Settings,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { colors } from '@/theme/colors';

/** The only icons the app draws. Add a name here before using a new Lucide icon. */
export const ICONS = {
  map: Map,
  journeys: BookOpen,
  stats: BarChart3,
  settings: Settings,
  plus: Plus,
  close: X,
  search: Search,
  chevronLeft: ChevronLeft,
  check: Check,
  mapPin: MapPin,
  image: Image,
  calendar: Calendar,
  route: Route,
  alert: CircleAlert,
  heart: Heart,
  edit: Pencil,
  camera: Camera,
  video: Video,
  locate: LocateFixed,
  fit: Maximize,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Design brief: 22 in tabs and buttons, 18 inline. */
export type IconSize = 22 | 18;

interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
}

/** Outline icon (1.75 stroke, never filled). */
export const Icon = ({ name, size = 22, color = colors.ink }: IconProps): ReactNode => {
  const Glyph = ICONS[name];
  return <Glyph size={size} color={color} strokeWidth={1.75} />;
};
