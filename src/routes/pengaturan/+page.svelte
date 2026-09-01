<script lang="ts">
	import { guestStore } from '$lib/stores/guests.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { autostartStore } from '$lib/stores/autostart.svelte';

	let autostartToggling = $state(false);
	let dbBusyClear = $state(false);
	let dbBusyReset = $state(false);
	let dbBusyExport = $state(false);
	let dbBusyReveal = $state(false);
	let dbPath = $state<string | null>(null);

	const fetchDbPath = async (): Promise<void> => {
		try {
			const { invoke } = await import('@tauri-apps/api/core');
			const p = await invoke<string>('get_db_path');
			dbPath = p;
		} catch {
			// ignore - bukan Tauri atau belum siap
		}
	};

	onMount(() => {
		autostartStore.init();
		fetchDbPath();
	});

	let total = $derived(guestStore.visits.length);

	const handleAutostartToggle = async (next: boolean): Promise<void> => {
		if (next === autostartStore.enabled) return;
		if (autostartToggling) return;
		autostartToggling = true;
		try {
			await autostartStore.toggle();
			toast.success(autostartStore.enabled ? 'Autostart diaktifkan' : 'Autostart dinonaktifkan');
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			toast.error(`Gagal mengubah autostart: ${msg}`);
		} finally {
			autostartToggling = false;
		}
	};

	const handleClear = async (): Promise<void> => {
		if (dbBusyClear || dbBusyReset) return;
		const ok = await (async () => {
			try {
				const { confirm } = await import('@tauri-apps/plugin-dialog');
				return await confirm('Hapus semua data kunjungan? Tindakan tidak bisa dibatalkan.', {
					title: 'Hapus Semua',
					kind: 'warning'
				});
			} catch {
				return window.confirm('Hapus semua data kunjungan?');
			}
		})();
		if (!ok) return;
		dbBusyClear = true;
		try {
			await guestStore.clear();
			toast.success('Semua data dihapus');
		} catch (e) {
			toast.error(`Gagal hapus: ${e instanceof Error ? e.message : String(e)}`);
		} finally {
			dbBusyClear = false;
		}
	};

	const handleResetDummy = async (): Promise<void> => {
		if (dbBusyClear || dbBusyReset) return;
		const ok = await (async () => {
			try {
				const { confirm } = await import('@tauri-apps/plugin-dialog');
				return await confirm('Reset database ke 25 data dummy? Data saat ini akan diganti.', {
					title: 'Reset ke Dummy',
					kind: 'warning'
				});
			} catch {
				return window.confirm('Reset ke 25 data dummy?');
			}
		})();
		if (!ok) return;
		dbBusyReset = true;
		try {
			await guestStore.resetToDummy();
			toast.success('Database direset ke dummy (25 record)');
		} catch (e) {
			toast.error(`Gagal reset: ${e instanceof Error ? e.message : String(e)}`);
		} finally {
			dbBusyReset = false;
		}
	};

	const handleExport = async (): Promise<void> => {
		if (dbBusyExport) return;
		dbBusyExport = true;
		try {
			const { save } = await import('@tauri-apps/plugin-dialog');
			const { invoke } = await import('@tauri-apps/api/core');
			const dest = await save({
				defaultPath: 'buku-tamu-backup.db',
				filters: [{ name: 'SQLite', extensions: ['db'] }]
			});
			if (!dest) return;
			await invoke<string>('export_db', { dest });
			toast.success(`Backup tersimpan: ${dest}`);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			if (msg.includes('not allowed') || msg.includes('invoke')) {
				toast.error('Ekspor hanya tersedia di aplikasi desktop');
			} else {
				toast.error(`Gagal ekspor: ${msg}`);
			}
		} finally {
			dbBusyExport = false;
		}
	};

	const handleReveal = async (): Promise<void> => {
		if (dbBusyReveal) return;
		dbBusyReveal = true;
		try {
			const { invoke } = await import('@tauri-apps/api/core');
			const { revealItemInDir } = await import('@tauri-apps/plugin-opener');
			const p = dbPath ?? (await invoke<string>('get_db_path'));
			dbPath = p;
			await revealItemInDir(p);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			if (msg.includes('invoke') || msg.includes('not allowed')) {
				toast.error('Buka folder hanya di aplikasi desktop');
			} else {
				toast.error(`Gagal buka folder: ${msg}`);
			}
		} finally {
			dbBusyReveal = false;
		}
	};
</script>

<div class="mb-6 flex flex-col gap-1">
	<h1 class="text-2xl font-[var(--font-cal-sans)] font-semibold tracking-tight">Pengaturan</h1>
	<p class="text-sm text-muted-foreground">
		Kelola autostart dan database SQLite. Total data saat ini: {total} kunjungan.
	</p>
</div>

<div class="grid gap-4 lg:grid-cols-2">
	<section aria-labelledby="autostart-heading">
		<h2 id="autostart-heading" class="sr-only">Autostart</h2>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm leading-none font-medium">Autostart</Card.Title>
				<Card.Description class="text-sm">Mulai otomatis saat Windows dinyalakan</Card.Description>
			</Card.Header>
			<Card.Content class="flex items-start justify-between gap-4">
				<div class="flex flex-col gap-1">
					<Label for="autostart-toggle" class="text-sm font-medium">
						Mulai otomatis saat Windows mulai
					</Label>
					<p class="text-sm text-muted-foreground">
						{#if autostartStore.available}
							Aktifkan agar aplikasi terbuka sendiri ketika Windows dinyalakan.
						{:else}
							Tersedia di aplikasi desktop.
						{/if}
					</p>
				</div>
				<Switch
					id="autostart-toggle"
					checked={autostartStore.enabled}
					disabled={!autostartStore.available || !autostartStore.initialized || autostartToggling}
					onCheckedChange={(v) => handleAutostartToggle(Boolean(v))}
				/>
			</Card.Content>
		</Card.Root>
	</section>

	<section aria-labelledby="db-heading">
		<h2 id="db-heading" class="sr-only">Database</h2>
		<Card.Root class="h-full flex flex-col">
			<Card.Header class="pb-2 grow-0">
				<Card.Title class="text-sm leading-none font-medium">Kelola Database SQLite</Card.Title>
				<Card.Description class="text-sm break-all">
					{#if dbPath}
						Lokasi: {dbPath}
					{:else}
						Kelola data kunjungan - hapus, reset dummy, backup, atau buka folder database.
					{/if}
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-wrap gap-2 grow">
				<Button
					variant="destructive"
					size="sm"
					disabled={dbBusyClear || dbBusyReset || total === 0}
					onclick={handleClear}
				>
					{dbBusyClear ? 'Menghapus...' : 'Hapus Semua Data'}
				</Button>
				<Button
					variant="secondary"
					size="sm"
					disabled={dbBusyClear || dbBusyReset}
					onclick={handleResetDummy}
				>
					{dbBusyReset ? 'Mereset...' : 'Reset ke Dummy (25)'}
				</Button>
				<Button variant="outline" size="sm" disabled={dbBusyExport} onclick={handleExport}>
					{dbBusyExport ? 'Mengekspor...' : 'Ekspor / Backup .db'}
				</Button>
				<Button variant="outline" size="sm" disabled={dbBusyReveal} onclick={handleReveal}>
					{dbBusyReveal ? 'Membuka...' : 'Buka Folder DB'}
				</Button>
			</Card.Content>
		</Card.Root>
	</section>
</div>

<Separator class="my-6" />

<Card.Root>
	<Card.Header class="pb-2">
		<Card.Title class="text-sm leading-none font-medium">Info Aplikasi</Card.Title>
		<Card.Description class="text-sm">
			Buku Tamu PST - BPS Kota Pagar Alam. Database disimpan di folder AppData aplikasi.
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-wrap gap-2 text-sm text-muted-foreground">
		<span>Versi 0.1.0</span>
		<span aria-hidden="true">-</span>
		<span>Tauri v2 + SQLite</span>
	</Card.Content>
</Card.Root>