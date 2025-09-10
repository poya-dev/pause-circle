import { Platform } from 'react-native';

export type InstalledApp = {
  id: string;
  name: string;
  packageName: string;
  icon?: string;
  version?: string;
  isSystemApp: boolean;
};

export type AppCategory =
  | 'social'
  | 'entertainment'
  | 'productivity'
  | 'games'
  | 'news'
  | 'shopping'
  | 'other';

// Popular apps database with their package names and categories
const POPULAR_APPS_DATABASE: Record<
  string,
  {
    name: string;
    category: AppCategory;
    icon: string;
    color: string;
  }
> = {
  // Social Media
  'com.instagram.android': {
    name: 'Instagram',
    category: 'social',
    icon: 'logo-instagram',
    color: '#E4405F',
  },
  'com.zhiliaoapp.musically': {
    name: 'TikTok',
    category: 'social',
    icon: 'logo-tiktok',
    color: '#FF2D55',
  },
  'com.twitter.android': {
    name: 'Twitter',
    category: 'social',
    icon: 'logo-twitter',
    color: '#1DA1F2',
  },
  'com.facebook.katana': {
    name: 'Facebook',
    category: 'social',
    icon: 'logo-facebook',
    color: '#1877F2',
  },
  'com.snapchat.android': {
    name: 'Snapchat',
    category: 'social',
    icon: 'logo-snapchat',
    color: '#FFFC00',
  },
  'com.linkedin.android': {
    name: 'LinkedIn',
    category: 'social',
    icon: 'logo-linkedin',
    color: '#0077B5',
  },
  'com.discord': {
    name: 'Discord',
    category: 'social',
    icon: 'logo-discord',
    color: '#5865F2',
  },

  // Entertainment & Video
  'com.google.android.youtube': {
    name: 'YouTube',
    category: 'entertainment',
    icon: 'logo-youtube',
    color: '#FF0000',
  },
  'com.netflix.mediaclient': {
    name: 'Netflix',
    category: 'entertainment',
    icon: 'tv-outline',
    color: '#E50914',
  },
  'com.spotify.music': {
    name: 'Spotify',
    category: 'entertainment',
    icon: 'musical-notes-outline',
    color: '#1ED760',
  },
  'com.amazon.avod.thirdpartyclient': {
    name: 'Prime Video',
    category: 'entertainment',
    icon: 'tv-outline',
    color: '#00A8E1',
  },

  // Games
  'com.supercell.clashofclans': {
    name: 'Clash of Clans',
    category: 'games',
    icon: 'game-controller-outline',
    color: '#FFC40C',
  },
  'com.king.candycrushsaga': {
    name: 'Candy Crush',
    category: 'games',
    icon: 'game-controller-outline',
    color: '#FF6B9D',
  },
  'com.mojang.minecraftpe': {
    name: 'Minecraft',
    category: 'games',
    icon: 'game-controller-outline',
    color: '#00AF54',
  },

  // Shopping
  'com.amazon.mShop.android.shopping': {
    name: 'Amazon',
    category: 'shopping',
    icon: 'storefront-outline',
    color: '#FF9900',
  },
  'com.ebay.mobile': {
    name: 'eBay',
    category: 'shopping',
    icon: 'storefront-outline',
    color: '#E53238',
  },

  // Productivity
  'com.microsoft.office.outlook': {
    name: 'Outlook',
    category: 'productivity',
    icon: 'mail-outline',
    color: '#0078D4',
  },
  'com.slack': {
    name: 'Slack',
    category: 'productivity',
    icon: 'logo-slack',
    color: '#4A154B',
  },
  'com.google.android.gm': {
    name: 'Gmail',
    category: 'productivity',
    icon: 'mail-outline',
    color: '#EA4335',
  },

  // News
  'com.reddit.frontpage': {
    name: 'Reddit',
    category: 'news',
    icon: 'logo-reddit',
    color: '#FF4500',
  },
};

class AppDetectionService {
  private static instance: AppDetectionService;
  private installedAppsCache: InstalledApp[] | null = null;
  private lastCacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): AppDetectionService {
    if (!AppDetectionService.instance) {
      AppDetectionService.instance = new AppDetectionService();
    }
    return AppDetectionService.instance;
  }

  /**
   * Get list of installed apps
   * Note: This is a mock implementation for development/testing.
   * In production with dev builds, you'd need to implement native modules.
   */
  public async getInstalledApps(): Promise<InstalledApp[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (
      this.installedAppsCache &&
      now - this.lastCacheTime < this.CACHE_DURATION
    ) {
      return this.installedAppsCache;
    }

    try {
      if (Platform.OS === 'android') {
        return await this.getAndroidInstalledApps();
      } else if (Platform.OS === 'ios') {
        return await this.getIOSInstalledApps();
      } else {
        return this.getMockInstalledApps();
      }
    } catch (error) {
      console.warn('Failed to get installed apps, using mock data:', error);
      return this.getMockInstalledApps();
    }
  }

  private async getAndroidInstalledApps(): Promise<InstalledApp[]> {
    // For now, return mock data
    // In a real implementation with dev builds, you would:
    // 1. Create a native Android module
    // 2. Use PackageManager to query installed apps
    // 3. Filter out system apps
    // 4. Return app details

    console.log('Android: Using mock installed apps data');
    return this.getMockInstalledApps();
  }

  private async getIOSInstalledApps(): Promise<InstalledApp[]> {
    // iOS doesn't allow querying installed apps due to privacy restrictions
    // Return common apps that users can manually select
    console.log('iOS: Using predefined popular apps');
    return this.getPopularApps();
  }

  private getMockInstalledApps(): InstalledApp[] {
    // Mock data for development - simulates commonly installed apps
    const mockApps: InstalledApp[] = [
      {
        id: 'com.instagram.android',
        name: 'Instagram',
        packageName: 'com.instagram.android',
        isSystemApp: false,
        version: '2024.1.0',
      },
      {
        id: 'com.zhiliaoapp.musically',
        name: 'TikTok',
        packageName: 'com.zhiliaoapp.musically',
        isSystemApp: false,
        version: '30.8.4',
      },
      {
        id: 'com.google.android.youtube',
        name: 'YouTube',
        packageName: 'com.google.android.youtube',
        isSystemApp: false,
        version: '19.02.39',
      },
      {
        id: 'com.twitter.android',
        name: 'Twitter',
        packageName: 'com.twitter.android',
        isSystemApp: false,
        version: '10.14.0',
      },
      {
        id: 'com.facebook.katana',
        name: 'Facebook',
        packageName: 'com.facebook.katana',
        isSystemApp: false,
        version: '448.0.0',
      },
      {
        id: 'com.netflix.mediaclient',
        name: 'Netflix',
        packageName: 'com.netflix.mediaclient',
        isSystemApp: false,
        version: '8.95.0',
      },
      {
        id: 'com.spotify.music',
        name: 'Spotify',
        packageName: 'com.spotify.music',
        isSystemApp: false,
        version: '8.8.98',
      },
      {
        id: 'com.reddit.frontpage',
        name: 'Reddit',
        packageName: 'com.reddit.frontpage',
        isSystemApp: false,
        version: '2024.2.0',
      },
    ];

    // Cache the result
    this.installedAppsCache = mockApps;
    this.lastCacheTime = Date.now();

    return mockApps;
  }

  private getPopularApps(): InstalledApp[] {
    // Return popular apps for iOS or as fallback
    return Object.entries(POPULAR_APPS_DATABASE).map(
      ([packageName, appInfo]) => ({
        id: packageName,
        name: appInfo.name,
        packageName,
        isSystemApp: false,
      })
    );
  }

  /**
   * Get app info including category and icon for a given package name
   */
  public getAppInfo(packageName: string) {
    return (
      POPULAR_APPS_DATABASE[packageName] || {
        name: packageName,
        category: 'other' as AppCategory,
        icon: 'apps-outline',
        color: '#6B7280',
      }
    );
  }

  /**
   * Get apps filtered by category
   */
  public async getAppsByCategory(
    category: AppCategory
  ): Promise<InstalledApp[]> {
    const allApps = await this.getInstalledApps();
    return allApps.filter((app) => {
      const appInfo = this.getAppInfo(app.packageName);
      return appInfo.category === category;
    });
  }

  /**
   * Search for apps by name
   */
  public async searchApps(query: string): Promise<InstalledApp[]> {
    const allApps = await this.getInstalledApps();
    const lowercaseQuery = query.toLowerCase();

    return allApps.filter(
      (app) =>
        app.name.toLowerCase().includes(lowercaseQuery) ||
        app.packageName.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Clear cache to force refresh on next call
   */
  public clearCache(): void {
    this.installedAppsCache = null;
    this.lastCacheTime = 0;
  }

  /**
   * Check if app is currently running (mock implementation)
   */
  public async isAppRunning(_packageName: string): Promise<boolean> {
    // This would require additional permissions and native implementation
    // For now, return false
    return false;
  }
}

export default AppDetectionService.getInstance();
