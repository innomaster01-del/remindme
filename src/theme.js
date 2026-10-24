// Design tokens. `C` is mutated in place when the theme switches (light/dark);
// every style is computed at render time, so a re-render picks up the new values.

const LIGHT = {
  scheme: 'light',
  bg: '#F1F3F8',
  card: '#FFFFFF',
  sunken: '#E7EAF2',
  ink: '#151C33',
  muted: '#5F6883',
  faint: '#9AA2B8',
  line: '#E2E6EF',
  primary: '#4B57D6', // iris — tasks & main actions
  primarySoft: '#E6E8FB',
  onPrimary: '#FFFFFF',
  bday: '#D93D78', // raspberry — birthdays
  bdaySoft: '#FBE4EE',
  shop: '#0E9C83', // sea green — shopping
  shopSoft: '#DDF3EE',
  holiday: '#B7791F',
  holidaySoft: '#FBF0DC',
  danger: '#D2333F',
  dangerSoft: '#FCE6E8',
  high: '#E5484D',
  overlay: 'rgba(12,16,32,0.42)',
  tabBar: 'rgba(255,255,255,0.97)',
  shadow: '#1A2350',
};

const DARK = {
  scheme: 'dark',
  bg: '#0D1120',
  card: '#181D31',
  sunken: '#11162A',
  ink: '#EDF0FA',
  muted: '#A2A9C2',
  faint: '#6A7290',
  line: '#262C45',
  primary: '#8C96FF',
  primarySoft: '#262C57',
  onPrimary: '#0D1120',
  bday: '#FF7AAA',
  bdaySoft: '#3D1D2E',
  shop: '#4FD1B5',
  shopSoft: '#123530',
  holiday: '#F0B95A',
  holidaySoft: '#3A2D14',
  danger: '#FF6B74',
  dangerSoft: '#3D1A20',
  high: '#FF6B74',
  overlay: 'rgba(0,0,0,0.6)',
  tabBar: 'rgba(24,29,49,0.98)',
  shadow: '#000000',
};

export const C = { ...LIGHT };
export function applyTheme(scheme) {
  Object.assign(C, scheme === 'dark' ? DARK : LIGHT);
}

export const R = { sm: 10, md: 14, lg: 22, xl: 28, pill: 999 };

export function shadow(level = 1) {
  if (C.scheme === 'dark') return { borderWidth: 1, borderColor: C.line };
  return {
    shadowColor: C.shadow,
    shadowOpacity: level === 2 ? 0.12 : 0.05,
    shadowRadius: level === 2 ? 18 : 8,
    shadowOffset: { width: 0, height: level === 2 ? 8 : 2 },
    elevation: level === 2 ? 6 : 1,
  };
}

// Sky gradients for the Today hero — the one bold element of the design.
export function skyFor(hour) {
  if (C.scheme === 'dark') {
    if (hour >= 5 && hour < 11) return ['#2A3A78', '#5A4C8F', '#B0708A'];
    if (hour >= 11 && hour < 17) return ['#22337A', '#3550A8', '#4F7BC4'];
    if (hour >= 17 && hour < 21) return ['#2D1F55', '#6B3B78', '#B4587A'];
    return ['#0B1030', '#1A2152', '#2B2F6B'];
  }
  if (hour >= 5 && hour < 11) return ['#FFB88C', '#F9A8B8', '#9DB4FF']; // dawn
  if (hour >= 11 && hour < 17) return ['#5B8CFF', '#6E7CF2', '#9A8CF0']; // day
  if (hour >= 17 && hour < 21) return ['#5B4BC4', '#B05AA8', '#FF8A7A']; // dusk
  return ['#141B44', '#2B2F7A', '#4A3E95']; // night
}

// Font families (Rubik covers Hebrew, Cyrillic and Latin). Falls back to system fonts.
export const fontState = { loaded: false };
const FAMILY = {
  400: 'Rubik_400Regular',
  500: 'Rubik_500Medium',
  600: 'Rubik_600SemiBold',
  700: 'Rubik_700Bold',
  800: 'Rubik_800ExtraBold',
};
export function ff(weight = 400) {
  const w = Number(weight) || 400;
  if (fontState.loaded) return { fontFamily: FAMILY[w] || FAMILY[400] };
  return { fontWeight: String(w) };
}
