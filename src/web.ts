import { WebPlugin } from '@capacitor/core';

import type { EchoOptions, EchoResult, RichNotificationsPlugin, PluginVersionResult } from './definitions';

export class RichNotificationsWeb extends WebPlugin implements RichNotificationsPlugin {
  async echo(options: EchoOptions): Promise<EchoResult> {
    return options;
  }

  async getPluginVersion(): Promise<PluginVersionResult> {
    return {
      version: 'web',
    };
  }
}
