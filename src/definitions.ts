import type { PluginListenerHandle } from '@capacitor/core';

/**
 * Permission status returned by `checkPermission` and `requestPermission`.
 *
 * @since 8.0.0
 */
export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

/**
 * Android notification channel importance levels (maps to `NotificationManager` importance).
 *
 * @since 8.0.0
 */
export type ChannelImportance = 'none' | 'min' | 'low' | 'default' | 'high' | 'max';

/**
 * Expanded notification layout styles (Android `NotificationCompat` styles).
 *
 * @since 8.0.0
 */
export type NotificationStyle = 'bigtext' | 'picture' | 'inbox';

/**
 * iOS interruption level for the notification (`UNNotificationInterruptionLevel`).
 *
 * `critical` requires Apple's Critical Alerts entitlement.
 *
 * @since 8.0.0
 */
export type InterruptionLevel = 'passive' | 'active' | 'timeSensitive' | 'critical';

/**
 * Inline reply configuration for an action button.
 *
 * @since 8.0.0
 */
export interface ActionInputOptions {
  /**
   * Placeholder shown in the reply field.
   *
   * @default "Reply" on iOS when omitted
   */
  placeholder?: string;
}

/**
 * A single notification action button (iOS `UNNotificationAction`, Android action).
 *
 * @since 8.0.0
 */
export interface NotificationAction {
  /**
   * Stable action identifier delivered in `press` events as `actionId`.
   */
  id: string;
  /**
   * Visible button title.
   */
  title: string;
  /**
   * When `true`, shows a plain reply field. Pass an object to customize the placeholder.
   */
  input?: boolean | ActionInputOptions;
}

/**
 * Progress bar shown on Android notifications.
 *
 * @since 8.0.0
 */
export interface NotificationProgress {
  /**
   * Current progress value (0 to `max` unless `indeterminate` is true).
   */
  current: number;
  /**
   * Maximum progress value.
   *
   * @default 100
   */
  max: number;
  /**
   * When true, shows an indeterminate progress indicator.
   *
   * @default false
   */
  indeterminate?: boolean;
}

/**
 * Payload used to display or schedule a local notification.
 *
 * @since 8.0.0
 */
export interface RichNotification {
  /**
   * Notification id. A UUID string is generated when omitted.
   */
  id?: string;
  /**
   * Notification title (required).
   */
  title: string;
  /**
   * Notification body text.
   */
  body?: string;
  /**
   * Large image as an `https` URL or `data:` URL (Android big picture / iOS attachment).
   */
  image?: string;
  /**
   * App icon badge count to apply when the notification is shown (iOS).
   */
  badge?: number;
  /**
   * Keep the notification until explicitly cancelled (Android ongoing notification).
   *
   * @default false
   */
  ongoing?: boolean;
  /**
   * Progress indicator for download or upload style notifications (Android).
   */
  progress?: NotificationProgress;
  /**
   * Show as a full-screen intent suitable for calls or alarms (Android).
   * Requires `USE_FULL_SCREEN_INTENT` in the host app.
   *
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Promote the notification to a foreground service (Android).
   * Requires opt-in manifest permissions and `RichForegroundService`.
   *
   * @default false
   */
  foregroundService?: boolean;
  /**
   * Expanded style layout (Android). Use `lines` when `style` is `inbox`.
   */
  style?: NotificationStyle;
  /**
   * Inbox lines when `style` is `inbox`.
   */
  lines?: string[];
  /**
   * Android channel id (create with `createChannel` before posting).
   */
  channelId?: string;
  /**
   * Android notification group id (optional grouping in the shade).
   */
  groupId?: string;
  /**
   * iOS category id or Android registered action set id from `registerActions`.
   */
  categoryId?: string;
  /**
   * iOS interruption level (iOS 15+).
   *
   * @default "active"
   */
  interruptionLevel?: InterruptionLevel;
  /**
   * Actions attached only to this notification (in addition to `categoryId` actions).
   */
  actions?: NotificationAction[];
}

/**
 * Android notification channel definition (`NotificationChannel`).
 *
 * @since 8.0.0
 */
export interface NotificationChannel {
  /**
   * Unique channel id referenced by `channelId` on notifications.
   */
  id: string;
  /**
   * User-visible channel name.
   */
  name: string;
  /**
   * Optional channel description shown in system settings.
   */
  description?: string;
  /**
   * Channel importance.
   *
   * @default "default"
   */
  importance?: ChannelImportance;
  /**
   * Optional raw sound resource name in the Android app (`res/raw`).
   */
  sound?: string;
  /**
   * Whether the channel vibrates.
   *
   * @default false
   */
  vibration?: boolean;
}

/**
 * Android notification channel group.
 *
 * @since 8.0.0
 */
export interface NotificationChannelGroup {
  /**
   * Unique group id referenced by `groupId` on notifications.
   */
  id: string;
  /**
   * User-visible group name in system settings.
   */
  name: string;
}

/**
 * Schedule trigger that fires once at a Unix timestamp in milliseconds.
 *
 * @since 8.0.0
 */
export interface TimestampTrigger {
  /**
   * Trigger kind discriminator.
   */
  type: 'timestamp';
  /**
   * Unix timestamp in milliseconds (`Date.now()` scale).
   */
  timestamp: number;
}

/**
 * Schedule trigger that fires after a delay in seconds.
 *
 * @since 8.0.0
 */
export interface IntervalTrigger {
  /**
   * Trigger kind discriminator.
   */
  type: 'interval';
  /**
   * Delay in seconds before the first fire (minimum 1 second on iOS).
   */
  interval: number;
  /**
   * When true, keep repeating at the same interval.
   *
   * @default false
   */
  repeats?: boolean;
}

/**
 * Schedule trigger for local notifications.
 *
 * @since 8.0.0
 */
export type ScheduleTrigger = TimestampTrigger | IntervalTrigger;

/**
 * Arguments for `schedule`.
 *
 * @since 8.0.0
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
 * Identifier used by `cancel` and `deleteChannel` (channel id for `deleteChannel`).
 *
 * @since 8.0.0
 */
export interface NotificationIdOptions {
  /**
   * Notification id to cancel, or Android channel id to delete.
   */
  id: string;
}

/**
 * Result containing a notification id from `display` or `schedule`.
 *
 * @since 8.0.0
 */
export interface NotificationIdResult {
  /**
   * Notification id that was created or scheduled.
   */
  id: string;
}

/**
 * Summary of a displayed or pending notification.
 *
 * @since 8.0.0
 */
export interface NotificationSummary {
  /**
   * Notification id.
   */
  id: string;
  /**
   * Title when the platform exposes it.
   */
  title?: string;
}

/**
 * List of displayed or pending notifications.
 *
 * @since 8.0.0
 */
export interface NotificationListResult {
  /**
   * Matching notifications.
   */
  notifications: NotificationSummary[];
}

/**
 * Notification that opened the app, when available.
 *
 * @since 8.0.0
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
   * Inline reply text when the user submitted a text input action.
   */
  input?: string;
}

/**
 * Result of `getInitialNotification`.
 *
 * @since 8.0.0
 */
export interface InitialNotificationResult {
  /**
   * Launch notification, or `null` when the app was not opened from one.
   */
  notification: InitialNotification | null;
}

/**
 * Permission check or request result.
 *
 * @since 8.0.0
 */
export interface PermissionResult {
  /**
   * Current permission status.
   */
  status: PermissionStatus;
}

/**
 * Badge update payload for `setBadge`.
 *
 * @since 8.0.0
 */
export interface BadgeOptions {
  /**
   * Badge count to display on the app icon (iOS). Use `0` to clear.
   */
  count: number;
}

/**
 * Action category registration payload for `registerActions`.
 *
 * @since 8.0.0
 */
export interface RegisterActionsOptions {
  /**
   * Category or action-set id referenced by `categoryId` on notifications.
   */
  id: string;
  /**
   * Actions belonging to this category.
   */
  actions: NotificationAction[];
}

/**
 * Plugin version payload from `getPluginVersion`.
 *
 * @since 8.0.0
 */
export interface PluginVersionResult {
  /**
   * Version marker from the native implementation (for example `native` or `web`).
   */
  version: string;
}

/**
 * Event payload for the `press` listener (notification tap or action).
 *
 * @since 8.0.0
 */
export interface PressEvent {
  /**
   * Notification id that was pressed.
   */
  id: string;
  /**
   * Action id when an action button or inline reply was used.
   */
  actionId?: string;
  /**
   * Inline reply text when present.
   */
  input?: string;
}

/**
 * Event payload for the `dismiss` listener.
 *
 * @since 8.0.0
 */
export interface DismissEvent {
  /**
   * Notification id that was dismissed.
   */
  id: string;
}

/**
 * Local rich notifications for Capacitor (no remote push).
 *
 * Use `@capgo/capacitor-notifications` for FCM and APNs remote push.
 *
 * @since 8.0.0
 */
export interface RichNotificationsPlugin {
  /**
   * Check the current local notification permission status without prompting.
   *
   * @since 8.0.0
   */
  checkPermission(): Promise<PermissionResult>;

  /**
   * Request local notification permission from the user.
   *
   * On Android 13+, this maps to `POST_NOTIFICATIONS`. On iOS, uses `UNUserNotificationCenter`.
   *
   * @since 8.0.0
   * @example
   * ```typescript
   * const { status } = await RichNotifications.requestPermission();
   * if (status !== 'granted') return;
   * ```
   */
  requestPermission(): Promise<PermissionResult>;

  /**
   * Create an Android notification channel.
   *
   * Resolves as a no-op on iOS and web.
   *
   * @since 8.0.0
   * @example
   * ```typescript
   * await RichNotifications.createChannel({
   *   id: 'alerts',
   *   name: 'Alerts',
   *   importance: 'high',
   * });
   * ```
   */
  createChannel(channel: NotificationChannel): Promise<void>;

  /**
   * Create an Android notification channel group.
   *
   * Resolves as a no-op on iOS and web.
   *
   * @since 8.0.0
   */
  createChannelGroup(group: NotificationChannelGroup): Promise<void>;

  /**
   * Delete an Android notification channel by id.
   *
   * Resolves as a no-op on iOS and web.
   *
   * @since 8.0.0
   */
  deleteChannel(options: NotificationIdOptions): Promise<void>;

  /**
   * Display a local notification immediately.
   *
   * Returns the notification id (generated when omitted in the payload).
   *
   * @since 8.0.0
   * @example
   * ```typescript
   * const { id } = await RichNotifications.display({
   *   title: 'Hello',
   *   body: 'Tap to open',
   *   channelId: 'alerts',
   * });
   * ```
   */
  display(notification: RichNotification): Promise<NotificationIdResult>;

  /**
   * Schedule a local notification for later.
   *
   * On Android, exact timing may require `SCHEDULE_EXACT_ALARM` in the host app.
   * On web, scheduling uses `setTimeout` and only works while the page stays open.
   *
   * @since 8.0.0
   * @example
   * ```typescript
   * await RichNotifications.schedule({
   *   notification: { title: 'Reminder', channelId: 'alerts' },
   *   trigger: { type: 'interval', interval: 60 },
   * });
   * ```
   */
  schedule(options: ScheduleOptions): Promise<NotificationIdResult>;

  /**
   * Cancel a pending or displayed notification by id.
   *
   * @since 8.0.0
   */
  cancel(options: NotificationIdOptions): Promise<void>;

  /**
   * Cancel every pending and displayed local notification managed by this plugin.
   *
   * @since 8.0.0
   */
  cancelAll(): Promise<void>;

  /**
   * List notifications currently shown in the notification shade or Notification Center.
   *
   * @since 8.0.0
   */
  getDisplayed(): Promise<NotificationListResult>;

  /**
   * List notifications that are scheduled but not yet shown.
   *
   * @since 8.0.0
   */
  getPending(): Promise<NotificationListResult>;

  /**
   * Return the notification that opened the app, if any.
   *
   * Call early on startup to handle cold-start taps.
   *
   * @since 8.0.0
   */
  getInitialNotification(): Promise<InitialNotificationResult>;

  /**
   * Set the app icon badge count (iOS).
   *
   * @since 8.0.0
   */
  setBadge(options: BadgeOptions): Promise<void>;

  /**
   * Register a reusable action category (iOS `UNNotificationCategory`, Android action set).
   *
   * Reference the same id in `categoryId` when displaying notifications.
   *
   * @since 8.0.0
   */
  registerActions(options: RegisterActionsOptions): Promise<void>;

  /**
   * Returns the platform implementation version marker (`native` or `web`).
   *
   * @since 8.0.0
   */
  getPluginVersion(): Promise<PluginVersionResult>;

  /**
   * Listen for notification presses and action replies.
   *
   * @since 8.0.0
   */
  addListener(eventName: 'press', listenerFunc: (event: PressEvent) => void): Promise<PluginListenerHandle>;

  /**
   * Listen for notification dismissals (swipe away on Android, dismiss on iOS where supported).
   *
   * @since 8.0.0
   */
  addListener(eventName: 'dismiss', listenerFunc: (event: DismissEvent) => void): Promise<PluginListenerHandle>;
}
