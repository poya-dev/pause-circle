import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { ActivityIndicator, TextInput } from 'react-native';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import type { InstalledApp } from '@/lib/app-detection';
import { useAppInfo, useInstalledApps, useSearchApps } from '@/lib/hooks';

type AppSelectionProps = {
  selectedApps: string[]; // package names
  onSelectionChange: (selectedApps: string[]) => void;
  maxSelection?: number;
  categories?: (
    | 'social'
    | 'entertainment'
    | 'productivity'
    | 'games'
    | 'news'
    | 'shopping'
    | 'other'
  )[];
  title?: string;
  description?: string;
};

export function AppSelection({
  selectedApps,
  onSelectionChange,
  maxSelection,
  categories,
  title = 'Select Apps',
  description = 'Choose apps to include',
}: AppSelectionProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const { apps, isLoading, error } = useInstalledApps();
  const { data: searchResults } = useSearchApps(
    searchQuery,
    searchQuery.length > 0
  );
  const getAppInfo = useAppInfo();

  const availableCategories = React.useMemo(() => {
    const allCategories = [
      'all',
      'social',
      'entertainment',
      'productivity',
      'games',
      'news',
      'shopping',
      'other',
    ];
    return categories ? ['all', ...categories] : allCategories;
  }, [categories]);

  const filteredApps = React.useMemo(() => {
    let appsToFilter = searchQuery.length > 0 ? searchResults || [] : apps;

    // Filter by category
    if (selectedCategory !== 'all') {
      appsToFilter = appsToFilter.filter((app) => {
        const appInfo = getAppInfo(app.packageName);
        return appInfo.category === selectedCategory;
      });
    }

    // Filter by categories prop if provided
    if (categories) {
      appsToFilter = appsToFilter.filter((app) => {
        const appInfo = getAppInfo(app.packageName);
        return categories.includes(appInfo.category);
      });
    }

    return appsToFilter;
  }, [
    apps,
    searchResults,
    searchQuery,
    selectedCategory,
    categories,
    getAppInfo,
  ]);

  const toggleApp = React.useCallback(
    (app: InstalledApp) => {
      const isSelected = selectedApps.includes(app.packageName);

      if (isSelected) {
        onSelectionChange(
          selectedApps.filter((pkg) => pkg !== app.packageName)
        );
      } else {
        if (maxSelection && selectedApps.length >= maxSelection) {
          // Optional: Show a toast or alert about max selection
          return;
        }
        onSelectionChange([...selectedApps, app.packageName]);
      }
    },
    [selectedApps, onSelectionChange, maxSelection]
  );

  const selectAll = React.useCallback(() => {
    const currentVisible = filteredApps.slice(
      0,
      maxSelection || filteredApps.length
    );
    const packageNames = currentVisible.map((app) => app.packageName);
    onSelectionChange(packageNames);
  }, [filteredApps, maxSelection, onSelectionChange]);

  const clearAll = React.useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  if (error) {
    return (
      <View className="items-center py-8">
        <Ionicons name="warning-outline" size={48} color={colors.text.muted} />
        <Text className="mt-4 text-center text-gray-400">
          Unable to load installed apps
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          Please check your permissions and try again
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="mb-4">
        <Text
          className="text-lg font-semibold"
          style={{ color: colors.text.primary }}
        >
          {title}
        </Text>
        {description && (
          <Text
            className="mt-1 text-sm"
            style={{ color: colors.text.secondary }}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Search Bar */}
      <View className="mb-4">
        <View className="bg-white/8 flex-row items-center rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color={colors.text.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search apps..."
            placeholderTextColor={colors.text.muted}
            className="ml-3 flex-1 text-base"
            style={{ color: colors.text.primary }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text.muted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        <View className="flex-row gap-2">
          {availableCategories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 ${
                selectedCategory === category
                  ? 'bg-primary-light'
                  : 'bg-white/8'
              }`}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    selectedCategory === category
                      ? colors.base.DEFAULT
                      : colors.text.primary,
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Selection Controls */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm" style={{ color: colors.text.secondary }}>
          {selectedApps.length} selected
          {maxSelection && ` of ${maxSelection} max`}
        </Text>

        <View className="flex-row gap-2">
          <Pressable
            onPress={selectAll}
            className="bg-white/8 rounded-lg px-3 py-1"
            disabled={
              maxSelection !== undefined && filteredApps.length > maxSelection
            }
          >
            <Text
              className="text-xs font-medium"
              style={{ color: colors.text.primary }}
            >
              Select All
            </Text>
          </Pressable>

          <Pressable
            onPress={clearAll}
            className="bg-white/8 rounded-lg px-3 py-1"
          >
            <Text
              className="text-xs font-medium"
              style={{ color: colors.text.primary }}
            >
              Clear
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Apps List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color={colors.primary.light} />
          <Text className="mt-4 text-center text-gray-400">
            Loading installed apps...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredApps.length > 0 ? (
            <View className="flex-row flex-wrap gap-4">
              {filteredApps.map((app) => {
                const isSelected = selectedApps.includes(app.packageName);
                const appInfo = getAppInfo(app.packageName);
                const isDisabled =
                  !isSelected &&
                  maxSelection &&
                  selectedApps.length >= maxSelection;

                return (
                  <Pressable
                    key={app.id}
                    onPress={() => !isDisabled && toggleApp(app)}
                    className="items-center"
                    style={{ opacity: isDisabled ? 0.5 : 1 }}
                    disabled={isDisabled || undefined}
                  >
                    <View
                      className={`size-16 items-center justify-center rounded-xl ${
                        isSelected ? 'border-2 border-primary-light' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? `${appInfo.color}20`
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Ionicons
                        name={appInfo.icon as any}
                        size={24}
                        color={
                          isSelected ? colors.primary.light : appInfo.color
                        }
                      />

                      {isSelected && (
                        <View className="absolute -right-1 -top-1 size-6 items-center justify-center rounded-full bg-primary-light">
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.base.DEFAULT}
                          />
                        </View>
                      )}
                    </View>

                    <Text
                      className="mt-2 w-16 text-center text-xs"
                      numberOfLines={2}
                      style={{
                        color: isSelected
                          ? colors.primary.light
                          : colors.text.primary,
                      }}
                    >
                      {app.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="items-center py-8">
              <Ionicons
                name="apps-outline"
                size={48}
                color={colors.text.muted}
              />
              <Text className="mt-4 text-center text-gray-400">
                {searchQuery ? 'No apps found' : 'No apps available'}
              </Text>
              {searchQuery && (
                <Text className="mt-1 text-center text-sm text-gray-500">
                  Try a different search term
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
