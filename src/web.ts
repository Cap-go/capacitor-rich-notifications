import { WebPlugin } from '@capacitor/core';

import type {
  InitialNotificationResult,
  NotificationIdOptions,
  NotificationIdResult,
  NotificationListResult,
  PermissionResult,
  PluginVersionResult,
  RichNotification,
  RichNotificationsPlugin,
  ScheduleOptions,
} from './definitions';

function mapPermission(permission: NotificationPermission): PermissionResult['status'] {
  if (permission === 'granted') {
    return 'granted';
  }
  if (permission === 'denied') {
    return 'denied';
  }
  return 'denied';
}

function ensureId(notification: RichNotification): string {
  return notification.id ?? `rn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class RichNotificationsWeb extends WebPlugin implements RichNotificationsPlugin {
  private pending = new Map<string, { title?: string; timer?: ReturnType<typeof setTimeout> }>();
  private displayed = new Map<string, Notification>();
  private lastOpened: InitialNotificationResult['notification'] = null;

  async checkPermission(): Promise<PermissionResult> {
    if (typeof Notification === 'undefined') {
      return { status: 'unavailable' };
    }
    return { status: mapPermission(Notification.permission) };
  }

  async requestPermission(): Promise<PermissionResult> {
    if (typeof Notification === 'undefined') {
      return { status: 'unavailable' };
    }
    const permission = await Notification.requestPermission();
    return { status: mapPermission(permission) };
  }

  async createChannel(): Promise<void> {
    // Android-only. No-op on web.
  }

  async createChannelGroup(): Promise<void> {
    // Android-only. No-op on web.
  }

  async deleteChannel(): Promise<void> {
    // Android-only. No-op on web.
  }

  async display(notification: RichNotification): Promise<NotificationIdResult> {
    if (notification.foregroundService === true) {
      throw this.unavailable('foregroundService is Android-only');
    }
    if (notification.fullScreen === true) {
      throw this.unavailable('fullScreen is Android-only');
    }
    const id = ensureId(notification);
    await this.showBrowserNotification(id, notification);
    return { id };
  }

  async schedule(options: ScheduleOptions): Promise<NotificationIdResult> {
    if (options.notification.foregroundService === true) {
      throw this.unavailable('foregroundService is Android-only');
    }
    if (options.notification.fullScreen === true) {
      throw this.unavailable('fullScreen is Android-only');
    }
    const id = ensureId(options.notification);
    const delayMs =
      options.trigger.type === 'timestamp'
        ? Math.max(0, options.trigger.timestamp - Date.now())
        : Math.max(0, options.trigger.interval * 1000);

    const fire = () => {
      void this.showBrowserNotification(id, options.notification);
      if (options.trigger.type === 'interval' && options.trigger.repeats === true) {
        const timer = setTimeout(fire, options.trigger.interval * 1000);
        this.pending.set(id, { title: options.notification.title, timer });
      } else {
        this.pending.delete(id);
      }
    };

    const timer = setTimeout(fire, delayMs);
    this.pending.set(id, { title: options.notification.title, timer });
    return { id };
  }

  async cancel(options: NotificationIdOptions): Promise<void> {
    const pending = this.pending.get(options.id);
    if (pending?.timer) {
      clearTimeout(pending.timer);
    }
    this.pending.delete(options.id);
    this.displayed.get(options.id)?.close();
    this.displayed.delete(options.id);
  }

  async cancelAll(): Promise<void> {
    for (const [id, entry] of this.pending) {
      if (entry.timer) {
        clearTimeout(entry.timer);
      }
      this.pending.delete(id);
    }
    for (const [id, notification] of this.displayed) {
      notification.close();
      this.displayed.delete(id);
    }
  }

  async getDisplayed(): Promise<NotificationListResult> {
    return {
      notifications: [...this.displayed.keys()].map((id) => ({ id })),
    };
  }

  async getPending(): Promise<NotificationListResult> {
    return {
      notifications: [...this.pending.entries()].map(([id, entry]) => ({
        id,
        title: entry.title,
      })),
    };
  }

  async getInitialNotification(): Promise<InitialNotificationResult> {
    return { notification: this.lastOpened };
  }

  async setBadge(): Promise<void> {
    // No badge API on web.
  }

  async registerActions(): Promise<void> {
    // Action categories are native-only. No-op on web.
  }

  async getPluginVersion(): Promise<PluginVersionResult> {
    return { version: 'web' };
  }

  private async showBrowserNotification(id: string, notification: RichNotification): Promise<void> {
    if (typeof Notification === 'undefined') {
      throw this.unavailable('Notifications are not available in this browser');
    }
    if (Notification.permission !== 'granted') {
      throw this.unavailable('Notification permission is not granted');
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      tag: id,
      icon: notification.image,
    });

    browserNotification.onclick = () => {
      this.lastOpened = { id };
      this.notifyListeners('press', { id });
      browserNotification.close();
    };

    browserNotification.onclose = () => {
      this.displayed.delete(id);
    };

    this.displayed.set(id, browserNotification);
  }
}
