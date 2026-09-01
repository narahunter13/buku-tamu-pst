import { isTauri } from '@tauri-apps/api/core';
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';

const AUTO_KEY = 'btpst_autostart_init';

export const createAutostartStore = () => {
	let enabled = $state(false);
	let available = $state(false);
	let initialized = $state(false);

	const isTauriEnv = (): boolean => {
		if (typeof window === 'undefined') return false;
		try {
			return isTauri();
		} catch {
			return false;
		}
	};

	const init = async (): Promise<void> => {
		if (!isTauriEnv()) {
			available = false;
			enabled = false;
			initialized = true;
			return;
		}
		available = true;
		try {
			enabled = await isEnabled();
			if (typeof window !== 'undefined') {
				const ran = window.localStorage.getItem(AUTO_KEY);
				if (!ran && !enabled) {
					await enable();
					enabled = true;
				}
				window.localStorage.setItem(AUTO_KEY, '1');
			}
		} finally {
			initialized = true;
		}
	};

	const toggle = async (): Promise<void> => {
		if (!isTauriEnv()) return;
		try {
			if (enabled) {
				await disable();
			} else {
				await enable();
			}
			enabled = await isEnabled();
		} catch (err) {
			enabled = await isEnabled().catch(() => enabled);
			throw err;
		}
	};

	return {
		get enabled(): boolean {
			return enabled;
		},
		get available(): boolean {
			return available;
		},
		get initialized(): boolean {
			return initialized;
		},
		init,
		toggle
	};
};

export const autostartStore = createAutostartStore();
