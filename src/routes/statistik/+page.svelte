<script lang="ts">
	import { guestStore } from '$lib/stores/guests.svelte';
	import { keperluanOptions, pendidikanOptions } from '$lib/constants/options';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
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
			// fallback untuk pnpm dev browser: tidak ada Tauri
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

	import { getTodayIsoJakarta } from '$lib/utils/date';

	const calcPercent = (count: number, total: number): number => {
		if (total === 0) return 0;
		return Math.round((count / total) * 100);
	};

	const countByKeperluan = (visits: { keperluan: string }[], key: string): number =>
		visits.filter((v) => v.keperluan === key).length;

	const countByPendidikan = (visits: { pendidikan: string }[], key: string): number =>
		visits.filter((v) => v.pendidikan === key).length;

	let visits = $derived(guestStore.visits);

	const total = $derived(visits.length);

	const todayIso = $derived(getTodayIsoJakarta());

	const todayCount = $derived(
		visits.filter((v) => String(v.visit_date).slice(0, 10) === todayIso).length
	);

	const byKeperluan = $derived.by(() => {
		const map = keperluanOptions.map((k) => ({
			key: k,
			count: countByKeperluan(visits, k),
			percent: calcPercent(countByKeperluan(visits, k), total)
		}));
		return map;
	});

	const byPendidikan = $derived.by(() => {
		const map = pendidikanOptions.map((k) => ({
			key: k,
			count: countByPendidikan(visits, k),
			percent: calcPercent(countByPendidikan(visits, k), total)
		}));
		return map;
	});

	const byGender = $derived.by(() => {
		const laki = visits.filter((v) => v.gender === 'Laki-laki').length;
		const perempuan = visits.filter((v) => v.gender === 'Perempuan').length;
		return [
			{ key: 'Laki-laki', count: laki, percent: calcPercent(laki, total) },
			{ key: 'Perempuan', count: perempuan, percent: calcPercent(perempuan, total) }
		];
	});

	const byDisabilitas = $derived.by(() => {
		const ya = visits.filter((v) => v.disabilitas === 'Ya').length;
		const tidak = visits.filter((v) => v.disabilitas === 'Tidak').length;
		return [
			{ key: 'Ya', count: ya, percent: calcPercent(ya, total) },
			{ key: 'Tidak', count: tidak, percent: calcPercent(tidak, total) }
		];
	});
</script>

<div class="mb-6 flex flex-col gap-1">
	<h1 class="text-2xl font-[var(--font-cal-sans)] font-semibold tracking-tight">
		Statistik Kunjungan
	</h1>
	<p class="text-sm text-muted-foreground">
		Ringkasan kunjungan PST berdasarkan data tamu. Total data: {total} kunjungan.
	</p>
</div>

<section aria-labelledby="summary-heading" class="mb-6">
	<h2 id="summary-heading" class="sr-only">Ringkasan total dan hari ini</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Total Kunjungan</Card.Description>
				<Card.Title class="text-3xl tabular-nums">{total}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="mt-3 flex items-center gap-2">
					<Badge variant="secondary">{total} record</Badge>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Hari Ini</Card.Description>
				<Card.Title class="text-3xl tabular-nums">{todayCount}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="mt-3 flex items-center gap-2">
					<Badge variant={todayCount > 0 ? 'default' : 'secondary'}>{todayCount} hari ini</Badge>
					<span class="text-sm text-muted-foreground">
						{calcPercent(todayCount, total)}% dari total
					</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="md:col-span-2 lg:col-span-1">
			<Card.Header class="pb-2">
				<Card.Description>Rasio Hari Ini</Card.Description>
				<Card.Title class="text-3xl tabular-nums">{calcPercent(todayCount, total)}%</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">Persentase kunjungan hari ini terhadap total.</p>
				<div class="mt-3">
					<div
						class="h-2 w-full overflow-hidden rounded-full bg-muted"
						role="progressbar"
						aria-valuenow={calcPercent(todayCount, total)}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label="Persentase hari ini"
					>
						<div
							class="h-full rounded-full bg-primary transition-all"
							style:width={`${calcPercent(todayCount, total)}%`}
						></div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</section>

<Separator class="my-6" />

<section aria-labelledby="keperluan-heading" class="mb-6">
	<div class="mb-3 flex items-center justify-between">
		<h2
			id="keperluan-heading"
			class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
		>
			By Keperluan
		</h2>
		<Badge variant="outline">{keperluanOptions.length} kategori</Badge>
	</div>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
		{#each byKeperluan as item (item.key)}
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm leading-none font-medium">{item.key}</Card.Title>
					<Card.Description class="text-sm"
						>{item.count} kunjungan - {item.percent}%</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<span class="text-2xl font-semibold tabular-nums">{item.count}</span>
						<Badge variant={item.count > 0 ? 'secondary' : 'outline'}>{item.percent}%</Badge>
					</div>
					<div
						class="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
						role="progressbar"
						aria-valuenow={item.percent}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`Progress ${item.key}`}
					>
						<div
							class="h-full rounded-full bg-primary transition-all"
							style:width={`${item.percent}%`}
						></div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</section>

<Separator class="my-6" />

<section aria-labelledby="pendidikan-heading" class="mb-6">
	<div class="mb-3 flex items-center justify-between">
		<h2
			id="pendidikan-heading"
			class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
		>
			By Pendidikan
		</h2>
		<Badge variant="outline">{pendidikanOptions.length} jenjang</Badge>
	</div>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
		{#each byPendidikan as item (item.key)}
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm leading-none font-medium">{item.key}</Card.Title>
					<Card.Description class="text-sm"
						>{item.count} kunjungan - {item.percent}%</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<span class="text-2xl font-semibold tabular-nums">{item.count}</span>
						<Badge variant={item.count > 0 ? 'secondary' : 'outline'}>{item.percent}%</Badge>
					</div>
					<div
						class="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
						role="progressbar"
						aria-valuenow={item.percent}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`Progress ${item.key}`}
					>
						<div
							class="h-full rounded-full bg-primary transition-all"
							style:width={`${item.percent}%`}
						></div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</section>

<Separator class="my-6" />

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	<section aria-labelledby="gender-heading">
		<div class="mb-3 flex items-center justify-between">
			<h2
				id="gender-heading"
				class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
			>
				By Gender
			</h2>
			<Badge variant="outline">2 kategori</Badge>
		</div>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
			{#each byGender as item (item.key)}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium">{item.key}</Card.Title>
						<Card.Description>{item.count} kunjungan</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center justify-between">
							<span class="text-2xl font-semibold tabular-nums">{item.count}</span>
							<Badge variant="secondary">{item.percent}%</Badge>
						</div>
						<div
							class="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
							role="progressbar"
							aria-valuenow={item.percent}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`Progress ${item.key}`}
						>
							<div
								class="h-full rounded-full bg-primary transition-all"
								style:width={`${item.percent}%`}
							></div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</section>

	<section aria-labelledby="disabilitas-heading">
		<div class="mb-3 flex items-center justify-between">
			<h2
				id="disabilitas-heading"
				class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
			>
				By Disabilitas
			</h2>
			<Badge variant="outline">Ya / Tidak</Badge>
		</div>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
			{#each byDisabilitas as item (item.key)}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium">{item.key}</Card.Title>
						<Card.Description>{item.count} kunjungan</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center justify-between">
							<span class="text-2xl font-semibold tabular-nums">{item.count}</span>
							<Badge variant={item.key === 'Ya' && item.count > 0 ? 'default' : 'secondary'}>
								{item.percent}%
							</Badge>
						</div>
						<div
							class="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
							role="progressbar"
							aria-valuenow={item.percent}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`Progress disabilitas ${item.key}`}
						>
							<div
								class="h-full rounded-full bg-primary transition-all"
								style:width={`${item.percent}%`}
							></div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</section>
</div>

{#if total === 0}
	<Card.Root class="mt-6">
		<Card.Content class="py-10 text-center">
			<p class="text-base font-medium">Belum ada data kunjungan</p>
			<p class="mt-1 text-sm text-muted-foreground">
				Isi form di halaman utama untuk melihat statistik.
			</p>
			<Button href="/" variant="outline" size="sm" class="mt-4">Ke Form</Button>
		</Card.Content>
	</Card.Root>
{/if}

<Separator class="my-8" />

<section aria-labelledby="settings-heading" class="mb-4">
	<h2
		id="settings-heading"
		class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
	>
		Pengaturan
	</h2>
	<Card.Root class="mt-4">
		<Card.Content class="flex items-start justify-between gap-4 py-4">
			<div class="flex flex-col gap-1">
				<Label for="autostart-toggle" class="text-base font-medium">
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

	<Card.Root class="mt-4">
		<Card.Header class="pb-2">
			<Card.Title class="text-sm leading-none font-medium">Kelola Database SQLite</Card.Title>
			<Card.Description class="text-sm break-all">
				{#if dbPath}
					Lokasi: {dbPath}
				{:else}
					Kelola data kunjungan - hapus, reset dummy, backup, atau buka folder database.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-wrap gap-2">
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

<div
	class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground"
>
	<p>Data kunjungan tersimpan di database aplikasi.</p>
	<div class="flex items-center gap-2">
		<Button href="/" variant="ghost" size="sm">Form</Button>
		<Button href="/daftar" variant="ghost" size="sm">Daftar</Button>
	</div>
</div>
