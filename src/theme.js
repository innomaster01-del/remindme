// Design tokens — three colours only: a neutral background, ink, and one accent (indigo).
// Every other tone is a transparency of those three, which gives the frosted-glass look.
// `C` is mutated in place when the theme switches; styles are computed at render time.

const LIGHT = {
  scheme: 'light',
  bgFrom: '#F4F5F9',
  bgTo: '#E4E6EE',
  bg: '#EEEFF4',
  ink: '#15171C',
  muted: 'rgba(21,23,28,0.58)',
  faint: 'rgba(21,23,28,0.32)',
  line: 'rgba(21,23,28,0.08)',
  sunken: 'rgba(21,23,28,0.05)',
  card: 'rgba(255,255,255,0.66)',
  glass: 'rgba(255,255,255,0.72)',
  glassStrong: 'rgba(250,250,253,0.94)',
  glassBorder: 'rgba(255,255,255,0.85)',
  primary: '#5856D6',
  primarySoft: 'rgba(88,86,214,0.12)',
  onPrimary: '#FFFFFF',
  orb: 'rgba(88,86,214,0.16)',
  overlay: 'rgba(15,16,22,0.28)',
  tabBar: 'rgba(255,255,255,0.93)',
  shadow: '#20223A',
  danger: '#D93A3A',
  dangerSoft: 'rgba(217,58,58,0.10)',
};

const DARK = {
  scheme: 'dark',
  bgFrom: '#0C0D12',
  bgTo: '#171925',
  bg: '#101118',
  ink: '#F2F3F7',
  muted: 'rgba(242,243,247,0.62)',
  faint: 'rgba(242,243,247,0.34)',
  line: 'rgba(242,243,247,0.09)',
  sunken: 'rgba(242,243,247,0.06)',
  card: 'rgba(255,255,255,0.06)',
  glass: 'rgba(30,31,42,0.66)',
  glassStrong: 'rgba(24,25,34,0.96)',
  glassBorder: 'rgba(255,255,255,0.10)',
  primary: '#7D7AFF',
  primarySoft: 'rgba(125,122,255,0.16)',
  onPrimary: '#FFFFFF',
  orb: 'rgba(125,122,255,0.20)',
  overlay: 'rgba(0,0,0,0.5)',
  tabBar: 'rgba(28,29,38,0.95)',
  shadow: '#000000',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255,107,107,0.14)',
};

// Category colours collapse onto the same three: accent for tasks/actions, ink for the rest.
function derive(p) {
  return {
    ...p,
    bday: p.primary, bdaySoft: p.primarySoft,
    shop: p.primary, shopSoft: p.primarySoft,
    holiday: p.primary, holidaySoft: p.primarySoft,
    high: p.primary,
  };
}

export const C = { ...derive(LIGHT) };
export function applyTheme(scheme) {
  Object.assign(C, derive(scheme === 'dark' ? DARK : LIGHT));
}

export const R = { sm: 12, md: 16, lg: 24, xl: 32, pill: 999 };

// Glass surfaces: translucent fill + a thin bright edge + a very soft shadow.
export function shadow(level = 1) {
  const edge = { borderWidth: 1, borderColor: C.glassBorder };
  if (C.scheme === 'dark') return edge;
  return {
    ...edge,
    shadowColor: C.shadow,
    shadowOpacity: level === 2 ? 0.10 : 0.05,
    shadowRadius: level === 2 ? 24 : 12,
    shadowOffset: { width: 0, height: level === 2 ? 10 : 4 },
    elevation: 0,
  };
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
