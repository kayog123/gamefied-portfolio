import {
  Bot,
  Brain,
  CalendarCheck,
  Landmark,
  LockKeyhole,
  RadioTower,
  Smartphone,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Named icon lookup for data-driven icons (presets, features — `content/presets.ts`).
 * Explicit imports only, so unused Lucide icons stay out of the client bundle
 * (an `import * as Icons from 'lucide-react'` would ship the whole library).
 * Add an entry here whenever `content/` references a new icon name.
 */
export const ICONS: Record<string, LucideIcon> = {
  store: Store,
  bot: Bot,
  'calendar-check': CalendarCheck,
  wallet: Wallet,
  smartphone: Smartphone,
  'lock-keyhole': LockKeyhole,
  landmark: Landmark,
  brain: Brain,
  'radio-tower': RadioTower,
};
