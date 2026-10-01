# @capgo/capacitor-rich-notifications

<a href="https://capgo.app/"><img src="https://capgo.app/readme-banner.svg?repo=Cap-go/capacitor-rich-notifications" alt="Capgo - Instant updates for Capacitor" /></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin_rich_notifications"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin_rich_notifications"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>

<p align="center">
  <img src="./screenshots/android-demo.webp" alt="Android notification shade showing a download progress notification from the example app" width="280" />
</p>

## Snapshot

- **Plugin name:** `Rich Notifications`
- **One-line value:** `Local notifications with channels, actions, progress, and schedules.`
- **Maintainer:** `Capgo`
- **Status:** `beta`

## Pre-Release Checklist

- [x] Placeholder values in this README are filled in.
- [x] Capgo CTA links use this plugin's ref slug.
- [x] README banner points at this repository.
- [x] `package.json` keywords are filled in.
- [x] Git remote points at this repository.
- [x] Bootstrap init script and templates are removed.
- [x] Compatibility table starts at Capacitor 8.
- [x] Update `src/definitions.ts` with the real public API and JSDoc.
- [x] Run `bun run docgen` and review generated API docs below.
- [x] Confirm examples in this file run against the real implementation.
- [ ] Set GitHub repo description to start with `Capacitor plugin for ...`.
- [x] GitHub homepage is `https://capgo.app/docs/plugins/rich-notifications/`.
- [ ] Create a GitHub repository custom social preview from `assets/github-social-template.svg`, export it to `assets/github-social-preview.png`, and upload it at GitHub **Settings** -> **General** -> **Social preview**.
- [ ] Open docs/website PR and follow the complete website integration checklist in section **3) Open docs/website pull request**.
- [x] Run `bun run verify` before publishing (iOS, Android, and web verified in CI on this branch).

## Problem & Scope

### Why this plugin exists

`The stock local notification plugin cannot express channels, progress, inline replies, full-screen alerts, or foreground-service notifications.`

## Capgo Links

- **Plugin docs URL:** `https://capgo.app/docs/plugins/rich-notifications/`
- **Plugin tutorial URL:** `https://capgo.app/docs/plugins/rich-notifications/`
- **Website/docs repo:** `https://github.com/Cap-go/website`

### What it does

- `Creates Android channels and groups, progress notifications, ongoing notifications, and full-screen alerts.`
- `Shows big-text, picture, and inbox layouts, images, and action buttons that can include an inline text reply.`
- `Schedules exact alarms, reports taps and dismissals in the foreground and background, and tells you which notification opened the app.`

### What it does not do

- `Does not register for remote push or talk to APNs or FCM. Use @capgo/capacitor-notifications for that.`
- `Does not send notifications to other users. It only shows local notifications on this device.`

## Compatibility

| Plugin version | Capacitor compatibility | Maintained |
| -------------- | ----------------------- | ---------- |
| v8.\*.\*       | v8.\*.\*                | ✅          |
| v7.\*.\*       | v7.\*.\*                | On demand   |
| v6.\*.\*       | v6.\*.\*                | On demand   |

Policy:

- New plugins start at version `8.0.0` (Capacitor 8 baseline).
- Backward compatibility for older Capacitor majors is supported on demand.

## Development

```bash
bun install
bun run verify
```


## Capgo Example App Deploy Setup

The `Deploy example app to Capgo` GitHub Actions workflow publishes the built `example-app/` web bundle to Capgo when a GitHub release is published or the workflow is manually dispatched. It checks out the release tag, builds the plugin and example app with Bun, and uploads the bundle with one direct Capgo CLI command.

Required setup for every plugin created from this template:

1. Create a Capgo app for the example app id from `example-app/capacitor.config.ts`.
   The default id is `app.capgo.richnotifications.example`; after `bun run init-plugin ...`, verify both `appId` values in that file match the new plugin package id plus `.example`.
2. Keep the Capgo channel named `production`, or edit `.github/workflows/deploy_example_app.yml` if the example app should publish to a different default channel.

`CAPGO_TOKEN` is already configured as a Capgo organization GitHub Actions secret and is read by the workflow through `${{ secrets.CAPGO_TOKEN }}`. Do not create a duplicate repository secret for new plugin repositories.

## Capacitor Hook Scripts (Recommended)

For plugins that need automated setup during `cap sync` / `cap update`, define Capacitor lifecycle hooks in `package.json`.

Example:

```json
{
  "scripts": {
    "generate:version-share": "bun run scripts/generate-version-share-data.mjs",
    "configure:dependencies": "bun run scripts/configure-dependencies.mjs",
    "capacitor:sync:before": "bun run generate:version-share",
    "capacitor:update:before": "bun run generate:version-share",
    "capacitor:sync:after": "bun run configure:dependencies"
  }
}
```

Guideline:
- Use `*:before` for generated inputs needed by native sync/update.
- Use `*:after` for native patching that depends on files created by sync/update.
- Keep hook scripts idempotent.

## Public Launch (Required)

### 1) Publish in Capgo GitHub org as public

```bash
gh repo create Cap-go/capacitor-rich-notifications --public --source=. --remote=origin --push
```

If the repo already exists and is private:

```bash
gh repo edit Cap-go/capacitor-rich-notifications --visibility public --accept-visibility-change-consequences
```

### 2) Set GitHub description, homepage, and custom social preview

Description must always start with: `Capacitor plugin for ...`

```bash
gh repo edit Cap-go/capacitor-rich-notifications \
  --description "Capacitor plugin for showing local rich notifications." \
  --homepage "https://capgo.app/docs/plugins/rich-notifications/"
```

Create the GitHub repository custom social preview before launch. GitHub uses this image for repository cards, link unfurls, and social shares; it is separate from the README banner and website docs images.

1. Open `assets/github-social-template.svg`.
2. Replace the sample headline, accent line, description, and badges with plugin-specific copy.
3. Keep the terminal command as `npm i @capgo/capacitor-rich-notifications` because social and docs copy should use public npm install syntax.
4. Export the SVG as a 1280 x 640 PNG at `assets/github-social-preview.png`.
5. Have the agent try to upload the PNG in GitHub under repository **Settings** -> **General** -> **Social preview** -> **Edit**.
6. Prefer a supported GitHub API if one exists. GitHub currently does not expose a supported public REST/GraphQL endpoint for this upload, so the practical automation path is an authenticated browser session with repository admin access.
7. If the agent cannot access an authenticated GitHub web session with admin rights, keep `assets/github-social-preview.png` in the repo and report that only the GitHub UI upload is blocked.
8. Do not treat the repository as launch-ready until this custom GitHub social preview is uploaded.
9. Copy targets: headline 4-9 words, accent line 2-6 words, description 60-110 characters, badges 1-3 words each. These are guardrails, not hard failures; the SVG clips longer text inside safe regions, so only shorten copy when the rendered image is hard to read or visibly clipped.

### 3) Open docs/website pull request

Create a PR on `https://github.com/Cap-go/website` (or the local `landing/` folder in the monorepo) with all of the following:

1. Add the plugin entry in `src/config/plugins.ts`.
2. Add a plugin `LinkCard` in `src/content/docs/docs/plugins/index.mdx`.
3. Create docs pages in `src/content/docs/docs/plugins/<plugin-doc-slug>/`:
   `index.mdx`, `getting-started.mdx`, and optionally `ios.mdx` + `android.mdx` when platform setup differs.
4. Update `astro.config.mjs`:
   add `docs/plugins/<plugin-doc-slug>/**` in pagefind path buckets and add a sidebar section for the plugin pages.
5. Add the SEO tutorial page in `src/content/plugins-tutorials/en/<plugin-repo-slug>.md`.
6. Add icon asset `public/icons/plugins/<plugin-doc-slug>.svg` if the docs hero uses a plugin icon.
7. Cross-link docs and tutorial pages.

Slug mapping rules:

- `<plugin-doc-slug>` is the docs route slug used under `/docs/plugins/<plugin-doc-slug>/`.
- `<plugin-repo-slug>` is extracted from the GitHub repo URL in `src/config/plugins.ts` and is used by `/plugins/<slug>/`.
- Example: repo `https://github.com/Cap-go/capacitor-app-attest/` requires tutorial file
  `src/content/plugins-tutorials/en/capacitor-app-attest.md`.

Starter snippets:

`src/config/plugins.ts`

```ts
{
  name: '@capgo/capacitor-rich-notifications',
  author: 'github.com/Cap-go',
  description: 'Capacitor plugin for showing local rich notifications',
  href: 'https://github.com/Cap-go/capacitor-rich-notifications/',
  title: 'Rich Notifications',
  icon: ShieldCheckIcon,
},
```

`astro.config.mjs` sidebar entry

```ts
{
  label: 'Rich Notifications',
  items: [
    { label: 'Overview', link: '/docs/plugins/<plugin-doc-slug>/' },
    { label: 'Getting started', link: '/docs/plugins/<plugin-doc-slug>/getting-started' },
    { label: 'iOS setup', link: '/docs/plugins/<plugin-doc-slug>/ios' },
    { label: 'Android setup', link: '/docs/plugins/<plugin-doc-slug>/android' },
  ],
  collapsed: true,
},
```

Required docs files:

- `src/content/docs/docs/plugins/<plugin-doc-slug>/index.mdx`
- `src/content/docs/docs/plugins/<plugin-doc-slug>/getting-started.mdx`
- `src/content/docs/docs/plugins/<plugin-doc-slug>/ios.mdx` (if iOS-specific setup exists)
- `src/content/docs/docs/plugins/<plugin-doc-slug>/android.mdx` (if Android-specific setup exists)
- `src/content/plugins-tutorials/en/<plugin-repo-slug>.md`

## Install

You can use our AI-Assisted Setup to install the plugin. Add the Capgo skills to your AI tool using the following command:

```bash
npx skills add https://github.com/cap-go/capacitor-skills --skill capacitor-plugins
```

Then use the following prompt:

```text
Use the `capacitor-plugins` skill from `cap-go/capacitor-skills` to install the `@capgo/capacitor-rich-notifications` plugin in my project.
```

If you prefer Manual Setup, install the plugin by running the following commands and follow the platform-specific instructions below:

```bash
npm install @capgo/capacitor-rich-notifications
npx cap sync
```

## Minimal Usage

```typescript
import { RichNotifications } from '@capgo/capacitor-rich-notifications';

await RichNotifications.requestPermission();
const { id } = await RichNotifications.display({
  title: 'Hello Capgo',
  body: 'Local rich notification',
});
console.log('shown', id);
```

## Integration Notes

- **iOS:** Uses `UNUserNotificationCenter` categories, time-sensitive interruption levels, badges, and scheduled triggers. No extra usage string beyond the system permission prompt.
- **Android:** Uses `NotificationCompat`. The library declares `POST_NOTIFICATIONS` because it posts notifications. `SCHEDULE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`, and `FOREGROUND_SERVICE` stay opt-in. Run `bun run scripts/apply-notification-permissions.mjs --project <your-app>` to add those plus the foreground service declaration.
- **Web:** Falls back to the browser Notification API. `schedule` uses `setTimeout` and only fires while the page stays open. Channels/groups are no-ops; `foregroundService` / `fullScreen` reject as Android-only.

## Example App

The `example-app/` folder is linked via `file:..` and is intended for validating native wiring during development.

<p align="center">
  <img src="./screenshots/android-demo.webp" alt="Android notification shade showing a download progress notification from the example app" width="280" />
</p>

## API

<docgen-index>

* [`checkPermission()`](#checkpermission)
* [`requestPermission()`](#requestpermission)
* [`createChannel(...)`](#createchannel)
* [`createChannelGroup(...)`](#createchannelgroup)
* [`deleteChannel(...)`](#deletechannel)
* [`display(...)`](#display)
* [`schedule(...)`](#schedule)
* [`cancel(...)`](#cancel)
* [`cancelAll()`](#cancelall)
* [`getDisplayed()`](#getdisplayed)
* [`getPending()`](#getpending)
* [`getInitialNotification()`](#getinitialnotification)
* [`setBadge(...)`](#setbadge)
* [`registerActions(...)`](#registeractions)
* [`getPluginVersion()`](#getpluginversion)
* [`addListener('press', ...)`](#addlistenerpress-)
* [`addListener('dismiss', ...)`](#addlistenerdismiss-)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Local rich notifications for Capacitor (no remote push).

### checkPermission()

```typescript
checkPermission() => Promise<PermissionResult>
```

Check the current local notification permission status.

**Returns:** <code>Promise&lt;<a href="#permissionresult">PermissionResult</a>&gt;</code>

--------------------


### requestPermission()

```typescript
requestPermission() => Promise<PermissionResult>
```

Request local notification permission from the user.

**Returns:** <code>Promise&lt;<a href="#permissionresult">PermissionResult</a>&gt;</code>

--------------------


### createChannel(...)

```typescript
createChannel(channel: NotificationChannel) => Promise<void>
```

Create an Android notification channel. Resolves as a no-op on iOS/web.

| Param         | Type                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`channel`** | <code><a href="#notificationchannel">NotificationChannel</a></code> |

--------------------


### createChannelGroup(...)

```typescript
createChannelGroup(group: NotificationChannelGroup) => Promise<void>
```

Create an Android notification channel group. Resolves as a no-op on iOS/web.

| Param       | Type                                                                          |
| ----------- | ----------------------------------------------------------------------------- |
| **`group`** | <code><a href="#notificationchannelgroup">NotificationChannelGroup</a></code> |

--------------------


### deleteChannel(...)

```typescript
deleteChannel(options: NotificationIdOptions) => Promise<void>
```

Delete an Android notification channel. Resolves as a no-op on iOS/web.

| Param         | Type                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| **`options`** | <code><a href="#notificationidoptions">NotificationIdOptions</a></code> |

--------------------


### display(...)

```typescript
display(notification: RichNotification) => Promise<NotificationIdResult>
```

Display a local notification immediately.

| Param              | Type                                                          |
| ------------------ | ------------------------------------------------------------- |
| **`notification`** | <code><a href="#richnotification">RichNotification</a></code> |

**Returns:** <code>Promise&lt;<a href="#notificationidresult">NotificationIdResult</a>&gt;</code>

--------------------


### schedule(...)

```typescript
schedule(options: ScheduleOptions) => Promise<NotificationIdResult>
```

Schedule a local notification for later.

On web, scheduling uses `setTimeout` and only works while the page stays open.

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code><a href="#scheduleoptions">ScheduleOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#notificationidresult">NotificationIdResult</a>&gt;</code>

--------------------


### cancel(...)

```typescript
cancel(options: NotificationIdOptions) => Promise<void>
```

Cancel a pending or displayed notification by id.

| Param         | Type                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| **`options`** | <code><a href="#notificationidoptions">NotificationIdOptions</a></code> |

--------------------


### cancelAll()

```typescript
cancelAll() => Promise<void>
```

Cancel every pending and displayed local notification managed by this plugin.

--------------------


### getDisplayed()

```typescript
getDisplayed() => Promise<NotificationListResult>
```

List notifications currently shown in the notification shade / center.

**Returns:** <code>Promise&lt;<a href="#notificationlistresult">NotificationListResult</a>&gt;</code>

--------------------


### getPending()

```typescript
getPending() => Promise<NotificationListResult>
```

List notifications that are scheduled but not yet shown.

**Returns:** <code>Promise&lt;<a href="#notificationlistresult">NotificationListResult</a>&gt;</code>

--------------------


### getInitialNotification()

```typescript
getInitialNotification() => Promise<InitialNotificationResult>
```

Return the notification that opened the app, if any.

**Returns:** <code>Promise&lt;<a href="#initialnotificationresult">InitialNotificationResult</a>&gt;</code>

--------------------


### setBadge(...)

```typescript
setBadge(options: BadgeOptions) => Promise<void>
```

Set the app icon badge count.

| Param         | Type                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code><a href="#badgeoptions">BadgeOptions</a></code> |

--------------------


### registerActions(...)

```typescript
registerActions(options: RegisterActionsOptions) => Promise<void>
```

Register a reusable action category (iOS category / Android action set).

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code><a href="#registeractionsoptions">RegisterActionsOptions</a></code> |

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<PluginVersionResult>
```

Returns the platform implementation version marker.

**Returns:** <code>Promise&lt;<a href="#pluginversionresult">PluginVersionResult</a>&gt;</code>

--------------------


### addListener('press', ...)

```typescript
addListener(eventName: 'press', listenerFunc: (event: PressEvent) => void) => Promise<PluginListenerHandle>
```

Listen for notification presses and action replies.

| Param              | Type                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| **`eventName`**    | <code>'press'</code>                                                  |
| **`listenerFunc`** | <code>(event: <a href="#pressevent">PressEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('dismiss', ...)

```typescript
addListener(eventName: 'dismiss', listenerFunc: (event: DismissEvent) => void) => Promise<PluginListenerHandle>
```

Listen for notification dismissals.

| Param              | Type                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **`eventName`**    | <code>'dismiss'</code>                                                    |
| **`listenerFunc`** | <code>(event: <a href="#dismissevent">DismissEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### PermissionResult

Permission check/request result.

| Prop         | Type                                                          | Description                |
| ------------ | ------------------------------------------------------------- | -------------------------- |
| **`status`** | <code><a href="#permissionstatus">PermissionStatus</a></code> | Current permission status. |


#### NotificationChannel

Android notification channel definition.

| Prop              | Type                                                            | Description                                |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------ |
| **`id`**          | <code>string</code>                                             | Unique channel id.                         |
| **`name`**        | <code>string</code>                                             | User-visible channel name.                 |
| **`description`** | <code>string</code>                                             | Optional channel description.              |
| **`importance`**  | <code><a href="#channelimportance">ChannelImportance</a></code> | Channel importance. Defaults to `default`. |
| **`sound`**       | <code>string</code>                                             | Optional sound resource name.              |
| **`vibration`**   | <code>boolean</code>                                            | Whether the channel vibrates.              |


#### NotificationChannelGroup

Android notification channel group.

| Prop       | Type                | Description              |
| ---------- | ------------------- | ------------------------ |
| **`id`**   | <code>string</code> | Unique group id.         |
| **`name`** | <code>string</code> | User-visible group name. |


#### NotificationIdOptions

Identifier used by cancel helpers.

| Prop     | Type                | Description                |
| -------- | ------------------- | -------------------------- |
| **`id`** | <code>string</code> | Notification id to cancel. |


#### NotificationIdResult

Result containing a notification id.

| Prop     | Type                | Description                                    |
| -------- | ------------------- | ---------------------------------------------- |
| **`id`** | <code>string</code> | Notification id that was created or scheduled. |


#### RichNotification

Payload used to display or schedule a local notification.

| Prop                    | Type                                                                  | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **`id`**                | <code>string</code>                                                   | Notification id. Generated when omitted.                              |
| **`title`**             | <code>string</code>                                                   | Notification title.                                                   |
| **`body`**              | <code>string</code>                                                   | Notification body text.                                               |
| **`image`**             | <code>string</code>                                                   | Image as an https URL or data URL.                                    |
| **`badge`**             | <code>number</code>                                                   | App icon badge count to apply when the notification is shown (iOS).   |
| **`ongoing`**           | <code>boolean</code>                                                  | Keep the notification until explicitly cancelled (Android).           |
| **`progress`**          | <code><a href="#notificationprogress">NotificationProgress</a></code> | Progress indicator for download/upload style notifications (Android). |
| **`fullScreen`**        | <code>boolean</code>                                                  | Show as a full-screen intent suitable for calls/alarms (Android).     |
| **`foregroundService`** | <code>boolean</code>                                                  | Promote the notification to a foreground service (Android, opt-in).   |
| **`style`**             | <code><a href="#notificationstyle">NotificationStyle</a></code>       | Expanded style layout.                                                |
| **`lines`**             | <code>string[]</code>                                                 | Lines used when `style` is `inbox`.                                   |
| **`channelId`**         | <code>string</code>                                                   | Android channel id.                                                   |
| **`groupId`**           | <code>string</code>                                                   | Android notification group id.                                        |
| **`categoryId`**        | <code>string</code>                                                   | iOS category id / Android registered action set id.                   |
| **`interruptionLevel`** | <code><a href="#interruptionlevel">InterruptionLevel</a></code>       | iOS interruption level.                                               |
| **`actions`**           | <code>NotificationAction[]</code>                                     | Actions attached only to this notification.                           |


#### NotificationProgress

Progress bar shown on Android notifications.

| Prop                | Type                 | Description                                           |
| ------------------- | -------------------- | ----------------------------------------------------- |
| **`current`**       | <code>number</code>  | Current progress value.                               |
| **`max`**           | <code>number</code>  | Maximum progress value.                               |
| **`indeterminate`** | <code>boolean</code> | When true, shows an indeterminate progress indicator. |


#### NotificationAction

A single notification action button.

| Prop        | Type                                                                         | Description                                                                        |
| ----------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **`id`**    | <code>string</code>                                                          | Stable action identifier delivered in press events.                                |
| **`title`** | <code>string</code>                                                          | Visible button title.                                                              |
| **`input`** | <code>boolean \| <a href="#actioninputoptions">ActionInputOptions</a></code> | When true, shows a plain reply field. Pass an object to customize the placeholder. |


#### ActionInputOptions

Inline reply configuration for an action button.

| Prop              | Type                | Description                           |
| ----------------- | ------------------- | ------------------------------------- |
| **`placeholder`** | <code>string</code> | Placeholder shown in the reply field. |


#### ScheduleOptions

Arguments for scheduling a notification.

| Prop               | Type                                                          | Description                                          |
| ------------------ | ------------------------------------------------------------- | ---------------------------------------------------- |
| **`notification`** | <code><a href="#richnotification">RichNotification</a></code> | Notification payload to show when the trigger fires. |
| **`trigger`**      | <code><a href="#scheduletrigger">ScheduleTrigger</a></code>   | When to show the notification.                       |


#### TimestampTrigger

Fire once at a unix timestamp in milliseconds.

| Prop            | Type                     | Description                     |
| --------------- | ------------------------ | ------------------------------- |
| **`type`**      | <code>'timestamp'</code> | Trigger kind.                   |
| **`timestamp`** | <code>number</code>      | Unix timestamp in milliseconds. |


#### IntervalTrigger

Fire after an interval measured in seconds.

| Prop           | Type                    | Description                                     |
| -------------- | ----------------------- | ----------------------------------------------- |
| **`type`**     | <code>'interval'</code> | Trigger kind.                                   |
| **`interval`** | <code>number</code>     | Delay in seconds before the first fire.         |
| **`repeats`**  | <code>boolean</code>    | When true, keep repeating at the same interval. |


#### NotificationListResult

List of displayed or pending notifications.

| Prop                | Type                               | Description             |
| ------------------- | ---------------------------------- | ----------------------- |
| **`notifications`** | <code>NotificationSummary[]</code> | Matching notifications. |


#### NotificationSummary

Summary of a displayed or pending notification.

| Prop        | Type                | Description                    |
| ----------- | ------------------- | ------------------------------ |
| **`id`**    | <code>string</code> | Notification id.               |
| **`title`** | <code>string</code> | Optional title when available. |


#### InitialNotificationResult

Result of getInitialNotification.

| Prop               | Type                                                                        | Description                                                        |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **`notification`** | <code><a href="#initialnotification">InitialNotification</a> \| null</code> | Launch notification, or null when the app was not opened from one. |


#### InitialNotification

Notification that opened the app, when available.

| Prop           | Type                | Description                               |
| -------------- | ------------------- | ----------------------------------------- |
| **`id`**       | <code>string</code> | Notification id that opened the app.      |
| **`actionId`** | <code>string</code> | Action id when an action button was used. |
| **`input`**    | <code>string</code> | Inline reply text when present.           |


#### BadgeOptions

Badge update payload.

| Prop        | Type                | Description                             |
| ----------- | ------------------- | --------------------------------------- |
| **`count`** | <code>number</code> | Badge count to display on the app icon. |


#### RegisterActionsOptions

Action category registration payload.

| Prop          | Type                              | Description                                          |
| ------------- | --------------------------------- | ---------------------------------------------------- |
| **`id`**      | <code>string</code>               | Category / action-set id referenced by `categoryId`. |
| **`actions`** | <code>NotificationAction[]</code> | Actions belonging to this category.                  |


#### PluginVersionResult

Plugin version payload.

| Prop          | Type                | Description                                                 |
| ------------- | ------------------- | ----------------------------------------------------------- |
| **`version`** | <code>string</code> | Version identifier returned by the platform implementation. |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### PressEvent

Fired when the user taps a notification or one of its actions.

| Prop           | Type                | Description                                        |
| -------------- | ------------------- | -------------------------------------------------- |
| **`id`**       | <code>string</code> | Notification id that was pressed.                  |
| **`actionId`** | <code>string</code> | Action id when an action button or reply was used. |
| **`input`**    | <code>string</code> | Inline reply text when present.                    |


#### DismissEvent

Fired when the user dismisses a notification.

| Prop     | Type                | Description                         |
| -------- | ------------------- | ----------------------------------- |
| **`id`** | <code>string</code> | Notification id that was dismissed. |


### Type Aliases


#### PermissionStatus

Permission status returned by check/request helpers.

<code>'granted' | 'denied' | 'blocked' | 'unavailable'</code>


#### ChannelImportance

Android channel importance levels.

<code>'none' | 'min' | 'low' | 'default' | 'high' | 'max'</code>


#### NotificationStyle

Expanded notification layout styles.

<code>'bigtext' | 'picture' | 'inbox'</code>


#### InterruptionLevel

iOS interruption level for the notification.

<code>'passive' | 'active' | 'timeSensitive' | 'critical'</code>


#### ScheduleTrigger

Schedule trigger for local notifications.

<code><a href="#timestamptrigger">TimestampTrigger</a> | <a href="#intervaltrigger">IntervalTrigger</a></code>

</docgen-api>
