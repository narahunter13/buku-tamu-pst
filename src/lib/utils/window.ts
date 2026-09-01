import { getCurrentWindow } from '@tauri-apps/api/window';
import { confirm } from '@tauri-apps/plugin-dialog';
import { isTauri } from '@tauri-apps/api/core';

let forceClose = false;
let registered = false;

const doDestroy = async (): Promise<void> => {
	const win = getCurrentWindow();
	try {
		await win.destroy();
		return;
	} catch {
		// fallback ke close jika destroy ditolak ACL atau gagal
	}
	try {
		await win.close();
	} catch {
		// biarkan sistem handle; jangan macet
	}
};

export const setupCloseHandler = async (): Promise<void> => {
	if (registered) return;
	if (typeof window === 'undefined') return;
	let isTauriEnv: boolean;
	try {
		isTauriEnv = isTauri();
	} catch {
		isTauriEnv = false;
	}
	if (!isTauriEnv) return;
	registered = true;

	await getCurrentWindow().onCloseRequested(async (event) => {
		if (forceClose) return;
		event.preventDefault();
		try {
			const confirmed = await confirm('Apakah Anda yakin ingin menutup aplikasi?', {
				title: 'Konfirmasi',
				kind: 'warning'
			});
			if (confirmed) {
				forceClose = true;
				await doDestroy();
			}
		} catch {
			// Jika dialog gagal, tutup langsung untuk menghindari aplikasi macet.
			forceClose = true;
			await doDestroy();
		}
	});
};
