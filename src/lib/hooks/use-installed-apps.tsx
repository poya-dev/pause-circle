import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import AppDetectionService, { type AppCategory } from '../app-detection';

const QUERY_KEYS = {
  installedApps: ['installed-apps'] as const,
  appsByCategory: (category: AppCategory) =>
    ['installed-apps', 'category', category] as const,
  searchApps: (query: string) => ['installed-apps', 'search', query] as const,
};

export function useInstalledApps() {
  const queryClient = useQueryClient();

  const {
    data: apps = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.installedApps,
    queryFn: () => AppDetectionService.getInstalledApps(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const refreshApps = useCallback(async () => {
    AppDetectionService.clearCache();
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.installedApps,
    });
    return refetch();
  }, [queryClient, refetch]);

  return {
    apps,
    isLoading,
    error,
    refreshApps,
  };
}

export function useAppsByCategory(category: AppCategory) {
  return useQuery({
    queryKey: QUERY_KEYS.appsByCategory(category),
    queryFn: () => AppDetectionService.getAppsByCategory(category),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSearchApps(query: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.searchApps(query),
    queryFn: () => AppDetectionService.searchApps(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  });
}

export function useAppInfo() {
  return useCallback((packageName: string) => {
    return AppDetectionService.getAppInfo(packageName);
  }, []);
}
