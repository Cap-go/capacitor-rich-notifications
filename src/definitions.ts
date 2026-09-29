import type { PluginListenerHandle } from '@capacitor/core';

/**
 * Permission status returned by check/request helpers.
 */
export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

/**
 * Android channel importance levels.
 */
export type ChannelImportance = 'none' | 'min' | 'low' | 'default' | 'high' | 'max';

/**
 * Expanded notification layout styles.
 */
export type NotificationStyle = 'bigtext' | 'picture' | 'inbox';

/**
 * iOS interruption level for the notification.
 */
export type InterruptionLevel = 'passive' | 'active' | 'timeSensitive' | 'critical';

/**
 * Inline reply configuration for an action button.
 */
export interface ActionInputOptions {
  /**
   * Placeholder shown in the reply field.
   */
  placeholder?: string;
}

/**
 * A single notification action button.
 */
export interface NotificationAction {
  /**
   * Stable action identifier delivered in press events.
   */
  id: string;
  /**
   * Visible button title.
   */
  title: string;
  /**
   * When true, shows a plain reply field. Pass an object to customize the placeholder.
   */
  input?: boolean | ActionInputOptions;
}

/**
 * Progress bar shown on Android notifications.
 */
export interface NotificationProgress {
  /**
   * Current progress value.
   */
  current: number;
  /**
   * Maximum progress value.
   */
  max: number;
  /**
   * When true, shows an indeterminate progress indicator.
   */
  indeterminate?: boolean;
}

/**
 * Payload used to display or schedule a local notification.
 */
export interface RichNotification {
  /**
   * Notification id. Generated when omitted.
   */
  id?: string;
  /**
   * Notification title.
   */
  title: string;
  /**
   * Notification body text.
   */
  body?: string;
  /**
   * Image as an https URL or data URL.
   */
  image?: string;
  /**
   * App icon badge count to apply when the notification is shown (iOS).
   */
  badge?: number;
  /**
   * Keep the notification until explicitly cancelled (Android).
   */
  ongoing?: boolean;
  /**
   * Progress indicator for download/upload style notifications (Android).
   */
  progress?: NotificationProgress;
  /**
   * Show as a full-screen intent suitable for calls/alarms (Android).
   */
  fullScreen?: boolean;
  /**
   * Promote the notification to a foreground service (Android, opt-in).
   */
  foregroundService?: boolean;
  /**
   * Expanded style layout.
   */
  style?: NotificationStyle;
  /**
   * Lines used when `style` is `inbox`.
   */
  lines?: string[];
  /**
   * Android channel id.
   */
  channelId?: string;
  /**
   * Android notification group id.
   */
  groupId?: string;
  /**
   * iOS category id / Android registered action set id.
   */
  categoryId?: string;
  /**
   * iOS interruption level.
   */
  interruptionLevel?: InterruptionLevel;
  /**
   * Actions attached only to this notification.
   */
  actions?: NotificationAction[];
}

/**
 * Android notification channel definition.
 */
export interface NotificationChannel {
  /**
   * Unique channel id.
   */
  id: string;
  /**
   * User-visible channel name.
   */
  name: string;
  /**
   * Optional channel description.
   */
  description?: string;
  /**
   * Channel importance. Defaults to `default`.
   */
  importance?: ChannelImportance;
  /**
   * Optional sound resource name.
   */
  sound?: string;
  /**
   * Whether the channel vibrates.
   */
  vibration?: boolean;
}

/**
 * Android notification channel group.
 */
export interface NotificationChannelGroup {
  /**
   * Unique group id.
   */
  id: string;
  /**
   * User-visible group name.
   */
  name: string;
}

/**
 * Fire once at a unix timestamp in milliseconds.
 */
export interface TimestampTrigger {
  /**
   * Trigger kind.
   */
  type: 'timestamp';
  /**
   * Unix timestamp in milliseconds.
   */
  timestamp: number;
}

/**
 * Fire after an interval measured in seconds.
 */
export interface IntervalTrigger {
  /**
   * Trigger kind.
   */
  type: 'interval';
  /**
   * Delay in seconds before the first fire.
   */
  interval: number;
  /**
   * When true, keep repeating at the same interval.
   */
  repeats?: boolean;
}

/**
 * Schedule trigger for local notifications.
 */
export type ScheduleTrigger = TimestampTrigger | IntervalTrigger;

/**
 * Arguments for scheduling a notification.
 */
export interface ScheduleOptions {
  /**
   * Notification payload to show when the trigger fires.
   */
  notification: RichNotification;
  /**
   * When to show the notification.
   */
  trigger: ScheduleTrigger;
}

/**
 * Identifier used by cancel helpers.
 */
export interface NotificationIdOptions {
  /**
   * Notification id to cancel.
   */
  id: string;
}

/**
 * Result containing a notification id.
 */
export interface NotificationIdResult {
  /**
   * Notification id that was created or scheduled.
   */
  id: string;
}

/**
 * Summary of a displayed or pending notification.
 */
export interface NotificationSummary {
  /**
   * Notification id.
   */
  id: string;
  /**
   * Optional title when available.
   */
  title?: string;
}

/**
 * List of displayed or pending notifications.
 */
export interface NotificationListResult {
  /**
   * Matching notifications.
   */
  notifications: NotificationSummary[];
}

/**
 * Notification that opened the app, when available.
 */
export interface InitialNotification {
  /**
   * Notification id that opened the app.
   */
  id: string;
  /**
   * Action id when an action button was used.
   */
  actionId?: string;
  /**
   * Inline reply text when present.
   */
  input?: string;
}

/**
 * Result of getInitialNotification.
 */
export interface InitialNotificationResult {
  /**
   * Launch notification, or null when the app was not opened from one.
   */
  notification: InitialNotification | null;
}

/**
 * Permission check/request result.
 */
export interface PermissionResult {
  /**
   * Current permission status.
   */
  status: PermissionStatus;
}

/**
 * Badge update payload.
 */
export interface BadgeOptions {
  /**
   * Badge count to display on the app icon.
   */
  count: number;
}

/**
 * Action category registration payload.
 */
export interface RegisterActionsOptions {
  /**
   * Category / action-set id referenced by `categoryId`.
   */
  id: string;
  /**
   * Actions belonging to this category.
   */
  actions: NotificationAction[];
}

/**
 * Plugin version payload.
 */
export interface PluginVersionResult {
  /**
   * Version identifier returned by the platform implementation.
   */
  version: string;
}

/**
 * Fired when the user taps a notification or one of its actions.
 */
export interface PressEvent {
  /**
   * Notification id that was pressed.
   */
  id: string;
  /**
   * Action id when an action button or reply was used.
   */
  actionId?: string;
  /**
   * Inline reply text when present.
   */
  input?: string;
}

/**
 * Fired when the user dismisses a notification.
 */
export interface DismissEvent {
  /**
   * Notification id that was dismissed.
   */
  id: string;
}

/**
 * Local rich notifications for Capacitor (no remote push).
 */
export interface RichNotificationsPlugin {
  /**
   * Check the current local notification permission status.
   */
  checkPermission(): Promise<PermissionResult>;

  /**
   * Request local notification permission from the user.
   */
  requestPermission(): Promise<PermissionResult>;

  /**
   * Create an Android notification channel. Resolves as a no-op on iOS/web.
   */
  createChannel(channel: NotificationChannel): Promise<void>;

  /**
   * Create an Android notification channel group. Resolves as a no-op on iOS/web.
   */
  createChannelGroup(group: NotificationChannelGroup): Promise<void>;

  /**
   * Delete an Android notification channel. Resolves as a no-op on iOS/web.
   */
  deleteChannel(options: NotificationIdOptions): Promise<void>;

  /**
   * Display a local notification immediately.
   */
  display(notification: RichNotification): Promise<NotificationIdResult>;

  /**
   * Schedule a local notification for later.
   *
   * On web, scheduling uses `setTimeout` and only works while the page stays open.
   */
  schedule(options: ScheduleOptions): Promise<NotificationIdResult>;

  /**
   * Cancel a pending or displayed notification by id.
   */
  cancel(options: NotificationIdOptions): Promise<void>;

  /**
   * Cancel every pending and displayed local notification managed by this plugin.
   */
  cancelAll(): Promise<void>;

  /**
   * List notifications currently shown in the notification shade / center.
   */
  getDisplayed(): Promise<NotificationListResult>;

  /**
   * List notifications that are scheduled but not yet shown.
   */
  getPending(): Promise<NotificationListResult>;

  /**
   * Return the notification that opened the app, if any.
   */
  getInitialNotification(): Promise<InitialNotificationResult>;

  /**
   * Set the app icon badge count.
   */
  setBadge(options: BadgeOptions): Promise<void>;

  /**
   * Register a reusable action category (iOS category / Android action set).
   */
  registerActions(options: RegisterActionsOptions): Promise<void>;

  /**
   * Returns the platform implementation version marker.
   */
  getPluginVersion(): Promise<PluginVersionResult>;

  /**
   * Listen for notification presses and action replies.
   */
  addListener(eventName: 'press', listenerFunc: (event: PressEvent) => void): Promise<PluginListenerHandle>;

  /**
   * Listen for notification dismissals.
   */
  addListener(eventName: 'dismiss', listenerFunc: (event: DismissEvent) => void): Promise<PluginListenerHandle>;
}
