import './style.css';

import { Capacitor } from '@capacitor/core';
import { RichNotifications } from '@capgo/capacitor-rich-notifications';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const output = document.getElementById('plugin-output');
const eventLog = document.getElementById('event-log');

const setOutput = (value) => {
  output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
};

const appendEvent = (label, value) => {
  const line = `${new Date().toISOString()} ${label} ${JSON.stringify(value)}`;
  eventLog.textContent = `${line}\n${eventLog.textContent}`.trim();
};

const run = (label, fn) => async () => {
  try {
    const result = await fn();
    setOutput(result ?? { ok: true });
  } catch (error) {
    setOutput(`Error (${label}): ${error?.message ?? error}`);
  }
};

if (Capacitor.isNativePlatform()) {
  void CapacitorUpdater.notifyAppReady().catch((error) => {
    console.error('CapacitorUpdater.notifyAppReady failed', error);
  });
}

void RichNotifications.addListener('press', (event) => appendEvent('press', event));
void RichNotifications.addListener('dismiss', (event) => appendEvent('dismiss', event));

document.getElementById('check-permission').addEventListener(
  'click',
  run('checkPermission', () => RichNotifications.checkPermission()),
);

document.getElementById('request-permission').addEventListener(
  'click',
  run('requestPermission', () => RichNotifications.requestPermission()),
);

document.getElementById('create-channel').addEventListener(
  'click',
  run('createChannel', () =>
    RichNotifications.createChannel({
      id: 'demo',
      name: 'Demo',
      importance: 'high',
      vibration: true,
    }),
  ),
);

document.getElementById('simple').addEventListener(
  'click',
  run('display', () =>
    RichNotifications.display({
      title: 'Hello Capgo',
      body: 'Local rich notification',
      channelId: 'demo',
    }),
  ),
);

document.getElementById('progress').addEventListener(
  'click',
  run('progress', () =>
    RichNotifications.display({
      title: 'Downloading',
      body: '42%',
      channelId: 'demo',
      ongoing: true,
      progress: { current: 42, max: 100 },
    }),
  ),
);

document.getElementById('bigtext').addEventListener(
  'click',
  run('bigtext', () =>
    RichNotifications.display({
      title: 'Big text',
      body: 'This is a longer body that expands with the bigtext style on Android.',
      style: 'bigtext',
      channelId: 'demo',
    }),
  ),
);

document.getElementById('reply').addEventListener(
  'click',
  run('reply', async () => {
    await RichNotifications.registerActions({
      id: 'reply-cat',
      actions: [{ id: 'reply', title: 'Reply', input: { placeholder: 'Type a reply' } }],
    });
    return RichNotifications.display({
      title: 'Message',
      body: 'Tap Reply to send text',
      categoryId: 'reply-cat',
      channelId: 'demo',
    });
  }),
);

document.getElementById('schedule').addEventListener(
  'click',
  run('schedule', () =>
    RichNotifications.schedule({
      notification: {
        title: 'Scheduled',
        body: 'Fired after 5 seconds',
        channelId: 'demo',
      },
      trigger: { type: 'interval', interval: 5 },
    }),
  ),
);

document.getElementById('badge').addEventListener(
  'click',
  run('badge', () => RichNotifications.setBadge({ count: 3 })),
);

document.getElementById('cancel-all').addEventListener(
  'click',
  run('cancelAll', () => RichNotifications.cancelAll()),
);

void RichNotifications.getInitialNotification()
  .then((result) => {
    if (result.notification) {
      appendEvent('initial', result.notification);
    }
  })
  .catch(() => undefined);
