/**
 * Local rich notifications for Capacitor.
 *
 * Does not implement remote push. Use `@capgo/capacitor-notifications` for FCM/APNs.
 */
import { registerPlugin } from '@capacitor/core';

import type { RichNotificationsPlugin } from './definitions';

const RichNotifications = registerPlugin<RichNotificationsPlugin>('RichNotifications', {
  web: () => import('./web').then((m) => new m.RichNotificationsWeb()),
});

export * from './definitions';
export { RichNotifications };
