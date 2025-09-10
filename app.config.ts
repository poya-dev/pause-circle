import type { AppIconBadgeConfig } from 'app-icon-badge/types';
import { type ConfigContext, type ExpoConfig } from 'expo/config';

import { Env, withEnvSuffix } from './env';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.APP_ENV !== 'production',
  badges: [
    {
      text: Env.APP_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: withEnvSuffix(Env.NAME),
  description: 'Take control of your digital life with friends and family',
  slug: 'pause-circle',
  scheme: Env.SCHEME,
  version: Env.VERSION,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#3B82F6',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.BUNDLE_ID,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#3B82F6',
    },
    package: Env.PACKAGE,
    permissions: [
      'android.permission.QUERY_ALL_PACKAGES',
      'android.permission.PACKAGE_USAGE_STATS',
    ],
    blockedPermissions: [],
  },
  extra: {
    eas: {
      projectId: Env.EAS_PROJECT_ID,
    },
    ...Env,
  },
  plugins: [
    'expo-localization',
    'expo-notifications',
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.1',
        },
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
          manifest: {
            queries: [
              {
                intent: [
                  {
                    action: 'android.intent.action.MAIN',
                    category: ['android.intent.category.LAUNCHER'],
                  },
                ],
              },
            ],
          },
        },
      },
    ],
    ['app-icon-badge', appIconBadgeConfig],
  ],
});
