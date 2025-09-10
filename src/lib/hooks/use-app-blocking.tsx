import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import AppBlockingService, {
  type BlockedAppAttempt,
  type BlockingRule,
} from '../app-blocking';

const QUERY_KEYS = {
  blockingRules: ['blocking-rules'] as const,
  activeFocusSession: ['active-focus-session'] as const,
  blockedAttempts: ['blocked-attempts'] as const,
  activeRules: ['active-rules'] as const,
};

export function useBlockingRules() {
  const queryClient = useQueryClient();

  const {
    data: rules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.blockingRules,
    queryFn: () => AppBlockingService.getAllRules(),
    staleTime: 0, // Always fetch fresh data
  });

  const createRuleMutation = useMutation({
    mutationFn: (
      ruleData: Omit<BlockingRule, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise.resolve(AppBlockingService.createRule(ruleData)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blockingRules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRules });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<BlockingRule>;
    }) => Promise.resolve(AppBlockingService.updateRule(id, updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blockingRules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRules });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) =>
      Promise.resolve(AppBlockingService.deleteRule(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blockingRules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRules });
    },
  });

  return {
    rules,
    isLoading,
    error,
    createRule: createRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
  };
}

export function useActiveRules() {
  return useQuery({
    queryKey: QUERY_KEYS.activeRules,
    queryFn: () => AppBlockingService.getActiveRules(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to catch time changes
  });
}

export function useFocusSession() {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: QUERY_KEYS.activeFocusSession,
    queryFn: () => AppBlockingService.getActiveFocusSession(),
    staleTime: 0,
    refetchInterval: 1000, // Refetch every second for timer updates
  });

  const startSessionMutation = useMutation({
    mutationFn: ({
      duration,
      blockedApps,
    }: {
      duration: number;
      blockedApps: string[];
    }) =>
      Promise.resolve(
        AppBlockingService.startFocusSession(duration, blockedApps)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.activeFocusSession,
      });
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: () => Promise.resolve(AppBlockingService.pauseFocusSession()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.activeFocusSession,
      });
    },
  });

  return {
    session,
    isLoading,
    startSession: startSessionMutation.mutate,
    pauseSession: pauseSessionMutation.mutate,
    isStarting: startSessionMutation.isPending,
    isPausing: pauseSessionMutation.isPending,
  };
}

export function useAppBlocking() {
  const [blockedAttempts, setBlockedAttempts] = useState<BlockedAppAttempt[]>(
    []
  );

  useEffect(() => {
    // Load initial blocked attempts
    const attempts = AppBlockingService.getBlockedAttempts();
    setBlockedAttempts(attempts);

    // Listen for new blocked attempts
    const handleBlockedAttempt = (attempt: BlockedAppAttempt) => {
      setBlockedAttempts((prev) => [attempt, ...prev.slice(0, 99)]); // Keep last 100
    };

    AppBlockingService.addBlockingListener(handleBlockedAttempt);

    return () => {
      AppBlockingService.removeBlockingListener(handleBlockedAttempt);
    };
  }, []);

  const checkIfBlocked = useCallback((packageName: string) => {
    return AppBlockingService.isAppBlocked(packageName);
  }, []);

  const recordAttempt = useCallback((packageName: string, appName: string) => {
    const blockStatus = AppBlockingService.isAppBlocked(packageName);
    if (blockStatus.blocked) {
      AppBlockingService.recordBlockedAttempt(packageName, appName, {
        ruleId: blockStatus.rule?.id,
        sessionId: blockStatus.session?.id,
      });
    }
  }, []);

  return {
    blockedAttempts,
    checkIfBlocked,
    recordAttempt,
  };
}

export function useBlockedAttempts(limit = 50) {
  return useQuery({
    queryKey: [...QUERY_KEYS.blockedAttempts, limit],
    queryFn: () => AppBlockingService.getBlockedAttempts(limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}
