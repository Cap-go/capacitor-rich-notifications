import { afterEach, describe, expect, it } from 'bun:test';

import { RichNotificationsWeb } from './web';

class MockNotification {
  static permission: NotificationPermission = 'granted';

  static async requestPermission(): Promise<NotificationPermission> {
    return 'granted';
  }

  onclick: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(
    public title: string,
    public options?: NotificationOptions,
  ) {}

  close(): void {
    this.onclose?.();
  }
}

function installMockNotification(): void {
  // @ts-expect-error test shim
  globalThis.Notification = MockNotification;
}

describe('RichNotificationsWeb', () => {
  const plugin = new RichNotificationsWeb();

  afterEach(async () => {
    await plugin.cancelAll();
  });

  it('returns web as the plugin version', async () => {
    await expect(plugin.getPluginVersion()).resolves.toEqual({ version: 'web' });
  });

  it('reports unavailable when the Notification API is missing', async () => {
    const original = globalThis.Notification;
    try {
      // @ts-expect-error test shim
      globalThis.Notification = undefined;
      await expect(plugin.checkPermission()).resolves.toEqual({ status: 'unavailable' });
    } finally {
      globalThis.Notification = original;
    }
  });

  it('maps requestPermission to granted when the browser grants access', async () => {
    const original = globalThis.Notification;
    try {
      installMockNotification();
      await expect(plugin.requestPermission()).resolves.toEqual({ status: 'granted' });
    } finally {
      MockNotification.permission = 'granted';
      globalThis.Notification = original;
    }
  });

  it('maps denied permission in checkPermission and blocks display', async () => {
    const original = globalThis.Notification;
    try {
      MockNotification.permission = 'denied';
      installMockNotification();
      await expect(plugin.checkPermission()).resolves.toEqual({ status: 'denied' });
      await expect(plugin.display({ title: 'Blocked' })).rejects.toMatchObject({ code: 'UNAVAILABLE' });
    } finally {
      MockNotification.permission = 'granted';
      globalThis.Notification = original;
    }
  });

  it('displays a notification and lists it in getDisplayed when permission is granted', async () => {
    const original = globalThis.Notification;
    try {
      installMockNotification();
      const { id } = await plugin.display({ title: 'Visible' });
      const displayed = await plugin.getDisplayed();
      expect(displayed.notifications.some((entry) => entry.id === id)).toBe(true);
    } finally {
      globalThis.Notification = original;
    }
  });

  it('rejects Android-only foregroundService displays', async () => {
    await expect(
      plugin.display({
        title: 'Test',
        foregroundService: true,
      }),
    ).rejects.toMatchObject({ code: 'UNAVAILABLE' });
  });

  it('rejects Android-only fullScreen displays', async () => {
    await expect(
      plugin.display({
        title: 'Test',
        fullScreen: true,
      }),
    ).rejects.toMatchObject({ code: 'UNAVAILABLE' });
  });

  it('rejects Android-only options when scheduling', async () => {
    await expect(
      plugin.schedule({
        notification: { title: 'Later', foregroundService: true },
        trigger: { type: 'interval', interval: 1 },
      }),
    ).rejects.toMatchObject({ code: 'UNAVAILABLE' });
  });

  it('tracks pending schedules and can cancel one', async () => {
    const { id } = await plugin.schedule({
      notification: { title: 'Pending title' },
      trigger: { type: 'interval', interval: 60 },
    });
    const pending = await plugin.getPending();
    expect(pending.notifications.some((entry) => entry.id === id)).toBe(true);
    await plugin.cancel({ id });
    const afterCancel = await plugin.getPending();
    expect(afterCancel.notifications.some((entry) => entry.id === id)).toBe(false);
  });

  it('cancelAll clears pending and displayed notifications', async () => {
    const original = globalThis.Notification;
    try {
      installMockNotification();
      await plugin.display({ title: 'One' });
      await plugin.schedule({
        notification: { title: 'Two' },
        trigger: { type: 'interval', interval: 120 },
      });
      await plugin.cancelAll();
      expect((await plugin.getDisplayed()).notifications).toHaveLength(0);
      expect((await plugin.getPending()).notifications).toHaveLength(0);
    } finally {
      globalThis.Notification = original;
    }
  });

  it('resolves channel helpers as no-ops on web', async () => {
    await expect(plugin.createChannel({ id: 'web', name: 'Web' })).resolves.toBeUndefined();
    await expect(plugin.createChannelGroup({ id: 'g', name: 'Group' })).resolves.toBeUndefined();
    await expect(plugin.deleteChannel({ id: 'web' })).resolves.toBeUndefined();
    await expect(plugin.registerActions({ id: 'cat', actions: [] })).resolves.toBeUndefined();
    await expect(plugin.setBadge({ count: 1 })).resolves.toBeUndefined();
  });

  it('returns null initial notification before any press', async () => {
    await expect(plugin.getInitialNotification()).resolves.toEqual({ notification: null });
  });
});
