import { load } from '@tauri-apps/plugin-store';
import type { AppSettings } from '../types/index';
import { DEFAULT_SETTINGS } from '../constants';

let store: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!store) {
    store = await load('settings.json', {
      defaults: DEFAULT_SETTINGS as unknown as Record<string, unknown>,
    });
  }
  return store;
}

export async function loadSettings(): Promise<AppSettings> {
  const s = await getStore();
  const saved: Partial<AppSettings> = {};

  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]) {
    const val = await s.get(key);
    if (val !== null && val !== undefined) {
      (saved as Record<string, unknown>)[key] = val;
    }
  }

  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<void> {
  const s = await getStore();
  for (const [key, value] of Object.entries(partial)) {
    await s.set(key, value);
  }
  await s.save();
}

export async function isFirstLaunch(): Promise<boolean> {
  const s = await getStore();
  const city = await s.get('city');
  return city === null || city === undefined;
}
