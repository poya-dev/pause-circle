// Digital Wellbeing App Colors - Dark Theme Only
// Exact colors from your shared image
module.exports = {
  // Base dark background - from your image
  base: {
    DEFAULT: '#0B1020', // main background
    900: '#080E19', // deeper background
  },

  // Primary cyan-teal gradient - from your image
  primary: {
    light: '#22D3EE', // cyan accent (main highlight)
    DEFAULT: '#14B8A6', // teal accent
    dark: '#0D9488', // deeper teal
    // Aliases for compatibility
    300: '#22D3EE', // light cyan
    400: '#22D3EE',
    500: '#14B8A6',
    600: '#0D9488',
  },

  // Secondary blue accents
  secondary: {
    light: '#60A5FA', // sky blue
    DEFAULT: '#3B82F6', // blue
    400: '#60A5FA',
    500: '#3B82F6',
  },

  // Text colors for dark theme
  text: {
    primary: '#FFFFFF', // white text
    secondary: '#CBD5E1', // light gray
    muted: '#64748B', // muted gray
  },

  // Glass morphism effects - exact from your config
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.1)',

  // Status indicators
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // App brand colors
  apps: {
    tiktok: '#FF0050',
    instagram: '#E4405F',
    whatsapp: '#25D366',
    youtube: '#FF0000',
    twitter: '#1DA1F2',
    facebook: '#1877F2',
    snapchat: '#FFFC00',
    discord: '#5865F2',
  },

  // For icon compatibility
  neutral: {
    400: '#94A3B8', // lighter gray
    500: '#64748B', // same as text.muted
    800: '#1E293B', // darker gray for backgrounds
  },

  // Compatibility colors
  white: '#FFFFFF',
  black: '#000000',

  // Legacy charcoal color for old components
  charcoal: {
    400: '#475569', // gray for unchecked states
  },
};
