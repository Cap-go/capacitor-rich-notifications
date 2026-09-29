#!/usr/bin/env bun
/**
 * Opt-in helper: adds Android notification permissions and the foreground service
 * declaration to an app AndroidManifest.xml. Does not run unless --project is set
 * and the manifest file exists. Safe to re-run (idempotent).
 *
 * Usage:
 *   bun run scripts/apply-notification-permissions.mjs --project ./my-app
 *   bun run scripts/apply-notification-permissions.mjs --project ./my-app/android/app/src/main/AndroidManifest.xml
 */
import fs from 'node:fs';
import path from 'node:path';

const PERMISSIONS = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.USE_FULL_SCREEN_INTENT',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
];

const SERVICE_SNIPPET = `
        <service
            android:name="app.capgo.richnotifications.RichForegroundService"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="rich_local_notifications" />
        </service>`;

function parseArgs(argv) {
  let project = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--project' && argv[i + 1]) {
      project = argv[++i];
    }
  }
  return { project };
}

function resolveManifest(project) {
  if (!project) return null;
  const abs = path.resolve(project);
  if (fs.existsSync(abs) && abs.endsWith('AndroidManifest.xml')) {
    return abs;
  }
  const candidates = [
    path.join(abs, 'android/app/src/main/AndroidManifest.xml'),
    path.join(abs, 'app/src/main/AndroidManifest.xml'),
    path.join(abs, 'src/main/AndroidManifest.xml'),
    abs,
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && candidate.endsWith('AndroidManifest.xml')) ?? null;
}

function ensurePermission(xml, permission) {
  if (xml.includes(`android:name="${permission}"`)) {
    return xml;
  }
  const tag = `    <uses-permission android:name="${permission}" />\n`;
  if (xml.includes('<application')) {
    return xml.replace(/<application/, `${tag}\n    <application`);
  }
  return xml.replace(/<manifest([^>]*)>/, (match) => `${match}\n${tag}`);
}

function ensureService(xml) {
  if (xml.includes('app.capgo.richnotifications.RichForegroundService')) {
    return xml;
  }
  if (xml.includes('</application>')) {
    return xml.replace('</application>', `${SERVICE_SNIPPET}\n    </application>`);
  }
  return xml;
}

function main() {
  const { project } = parseArgs(process.argv.slice(2));
  if (!project) {
    console.log('Pass --project <app-root-or-manifest> to apply opt-in Android permissions.');
    process.exit(0);
  }
  const manifestPath = resolveManifest(project);
  if (!manifestPath) {
    console.log(`No AndroidManifest.xml found for --project ${project}; nothing to do.`);
    process.exit(0);
  }

  let xml = fs.readFileSync(manifestPath, 'utf8');
  const before = xml;
  for (const permission of PERMISSIONS) {
    xml = ensurePermission(xml, permission);
  }
  xml = ensureService(xml);

  if (xml === before) {
    console.log(`Already up to date: ${manifestPath}`);
    return;
  }
  fs.writeFileSync(manifestPath, xml);
  console.log(`Updated: ${manifestPath}`);
}

main();
