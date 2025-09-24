import { AppState, type AppStateStatus } from 'react-native';

import { storage } from './mmkv';

export type BlockingRule = {
  id: string;
  name: string;
  blockedApps: string[]; // package names
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  isActive: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FocusSession = {
  id: string;
  duration: number; // in minutes
  blockedApps: string[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
};

export type BlockedAppAttempt = {
  packageName: string;
  appName: string;
  timestamp: Date;
  ruleId?: string;
  sessionId?: string;
};

type AppBlockingListener = (attempt: BlockedAppAttempt) => void;

class AppBlockingService {
  private static instance: AppBlockingService;
  private listeners: AppBlockingListener[] = [];
  private appStateListener: ((nextAppState: AppStateStatus) => void) | null =
    null;
  private currentAppState: AppStateStatus = 'active';
  private activeFocusSession: FocusSession | null = null;
  private activeRules: BlockingRule[] = [];

  public static getInstance(): AppBlockingService {
    if (!AppBlockingService.instance) {
      AppBlockingService.instance = new AppBlockingService();
    }
    return AppBlockingService.instance;
  }

  constructor() {
    this.loadActiveRules();
    this.loadActiveFocusSession();
    this.startAppStateMonitoring();
  }

  // Blocking Rules Management
  public createRule(
    ruleData: Omit<BlockingRule, 'id' | 'createdAt' | 'updatedAt'>
  ): BlockingRule {
    const rule: BlockingRule = {
      ...ruleData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveRule(rule);
    this.updateActiveRules();
    return rule;
  }

  public updateRule(
    id: string,
    updates: Partial<BlockingRule>
  ): BlockingRule | null {
    const rules = this.getAllRules();
    const ruleIndex = rules.findIndex((r) => r.id === id);

    if (ruleIndex === -1) return null;

    const updatedRule = {
      ...rules[ruleIndex],
      ...updates,
      updatedAt: new Date(),
    };

    rules[ruleIndex] = updatedRule;
    this.saveAllRules(rules);
    this.updateActiveRules();

    return updatedRule;
  }

  public deleteRule(id: string): boolean {
    const rules = this.getAllRules();
    const filteredRules = rules.filter((r) => r.id !== id);

    if (filteredRules.length === rules.length) return false;

    this.saveAllRules(filteredRules);
    this.updateActiveRules();
    return true;
  }

  public getAllRules(): BlockingRule[] {
    try {
      const rulesJson = storage.getString('blocking-rules');
      return rulesJson
        ? JSON.parse(rulesJson).map((rule: any) => ({
            ...rule,
            createdAt: new Date(rule.createdAt),
            updatedAt: new Date(rule.updatedAt),
          }))
        : [];
    } catch {
      return [];
    }
  }

  public getActiveRules(): BlockingRule[] {
    return this.activeRules;
  }

  private saveRule(rule: BlockingRule): void {
    const rules = this.getAllRules();
    const existingIndex = rules.findIndex((r) => r.id === rule.id);

    if (existingIndex >= 0) {
      rules[existingIndex] = rule;
    } else {
      rules.push(rule);
    }

    this.saveAllRules(rules);
  }

  private saveAllRules(rules: BlockingRule[]): void {
    storage.set('blocking-rules', JSON.stringify(rules));
  }

  private loadActiveRules(): void {
    this.updateActiveRules();
  }

  private updateActiveRules(): void {
    const allRules = this.getAllRules();
    const now = new Date();
    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      now.getDay()
    ];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.activeRules = allRules.filter((rule) => {
      if (!rule.isActive) return false;
      if (!rule.days.includes(currentDay)) return false;

      // Check if current time is within rule's time range
      return this.isTimeInRange(currentTime, rule.startTime, rule.endTime);
    });
  }

  private isTimeInRange(
    currentTime: string,
    startTime: string,
    endTime: string
  ): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      // Same day range (e.g., 09:00 to 17:00)
      return current >= start && current <= end;
    } else {
      // Overnight range (e.g., 22:00 to 06:00)
      return current >= start || current <= end;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Focus Session Management
  public startFocusSession(
    duration: number,
    blockedApps: string[]
  ): FocusSession {
    const session: FocusSession = {
      id: Date.now().toString(),
      duration,
      blockedApps,
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 60 * 1000),
      isActive: true,
    };

    this.activeFocusSession = session;
    this.saveFocusSession(session);
    return session;
  }

  public pauseFocusSession(): void {
    if (this.activeFocusSession) {
      this.activeFocusSession.isActive = false;
      this.saveFocusSession(this.activeFocusSession);
      this.activeFocusSession = null;
    }
  }

  public getActiveFocusSession(): FocusSession | null {
    return this.activeFocusSession;
  }

  private loadActiveFocusSession(): void {
    try {
      const sessionJson = storage.getString('active-focus-session');
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        session.startTime = new Date(session.startTime);
        session.endTime = new Date(session.endTime);

        // Check if session is still valid
        if (session.isActive && new Date() < session.endTime) {
          this.activeFocusSession = session;
        } else {
          // Clean up expired session
          storage.delete('active-focus-session');
        }
      }
    } catch {
      // Invalid session data, remove it
      storage.delete('active-focus-session');
    }
  }

  private saveFocusSession(session: FocusSession): void {
    storage.set('active-focus-session', JSON.stringify(session));
  }

  // App State Monitoring
  private startAppStateMonitoring(): void {
    this.appStateListener = (nextAppState: AppStateStatus) => {
      if (this.currentAppState === 'background' && nextAppState === 'active') {
        // App is coming to foreground, check if it should be blocked
        this.handleAppResume();
      }
      this.currentAppState = nextAppState;
    };

    AppState.addEventListener('change', this.appStateListener);
  }

  private handleAppResume(): void {
    // This is a simplified version - in a real implementation with dev builds,
    // you would need to detect which app was launched
    // For now, we'll provide methods for manual blocking checks
    this.updateActiveRules();
  }

  // Blocking Logic
  public isAppBlocked(packageName: string): {
    blocked: boolean;
    reason?: 'rule' | 'focus';
    rule?: BlockingRule;
    session?: FocusSession;
  } {
    // Check focus session first
    if (
      this.activeFocusSession?.isActive &&
      this.activeFocusSession.blockedApps.includes(packageName)
    ) {
      return {
        blocked: true,
        reason: 'focus',
        session: this.activeFocusSession,
      };
    }

    // Check active rules
    for (const rule of this.activeRules) {
      if (rule.blockedApps.includes(packageName)) {
        return {
          blocked: true,
          reason: 'rule',
          rule,
        };
      }
    }

    return { blocked: false };
  }

  public recordBlockedAttempt(
    packageName: string,
    appName: string,
    options?: { ruleId?: string; sessionId?: string }
  ): void {
    const attempt: BlockedAppAttempt = {
      packageName,
      appName,
      timestamp: new Date(),
      ruleId: options?.ruleId,
      sessionId: options?.sessionId,
    };

    // Save to storage for analytics
    this.saveBlockedAttempt(attempt);

    // Notify listeners
    this.listeners.forEach((listener) => listener(attempt));
  }

  private saveBlockedAttempt(attempt: BlockedAppAttempt): void {
    try {
      const attemptsJson = storage.getString('blocked-attempts');
      const attempts: BlockedAppAttempt[] = attemptsJson
        ? JSON.parse(attemptsJson)
        : [];

      attempts.push({
        ...attempt,
        timestamp: attempt.timestamp.toISOString(),
      } as any);

      // Keep only last 1000 attempts
      if (attempts.length > 1000) {
        attempts.splice(0, attempts.length - 1000);
      }

      storage.set('blocked-attempts', JSON.stringify(attempts));
    } catch (error) {
      console.error('Failed to save blocked attempt:', error);
    }
  }

  public getBlockedAttempts(limit = 100): BlockedAppAttempt[] {
    try {
      const attemptsJson = storage.getString('blocked-attempts');
      const attempts: any[] = attemptsJson ? JSON.parse(attemptsJson) : [];

      return attempts
        .map((attempt) => ({
          ...attempt,
          timestamp: new Date(attempt.timestamp),
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  // Event Listeners
  public addBlockingListener(listener: AppBlockingListener): void {
    this.listeners.push(listener);
  }

  public removeBlockingListener(listener: AppBlockingListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  // Cleanup
  public destroy(): void {
    if (this.appStateListener) {
      // In newer React Native versions, use the subscription pattern
      // AppState.removeEventListener('change', this.appStateListener);
      this.appStateListener = null;
    }
    this.listeners = [];
  }
}

export default AppBlockingService.getInstance();
