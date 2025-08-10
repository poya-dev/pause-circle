import type { Theme } from '@react-navigation/native';
import { DarkTheme as _DarkTheme } from '@react-navigation/native';

import colors from '@/components/ui/colors';

const AppTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary.light,
    background: colors.base.DEFAULT,
    text: colors.text.primary,
    border: colors.cardBorder,
    card: colors.card,
  },
};

export function useThemeConfig() {
  return AppTheme;
}
