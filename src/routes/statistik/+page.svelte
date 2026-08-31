<script lang="ts">
	import { onMount } from 'svelte';
	import { guestStore } from '$lib/stores/guests.svelte';
	import { keperluanOptions, pendidikanOptions } from '$lib/constants/options';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';

	const getTodayIso = (): string => {
		const now = new Date();
		return now.toISOString().split('T')[0] ?? '';
	};

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

	const todayIso = getTodayIso();

	const todayCount = $derived(visits.filter((v) => v.visit_date === todayIso).length);

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

	onMount(() => {
		guestStore.init();
	});
</script>

<div class="min-h-screen bg-background">
	<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
			<a
				href="/"
				class="rounded-sm text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				BPS Kota Pagar Alam - PST
			</a>
			<nav class="flex items-center gap-1" aria-label="Navigasi utama">
				<Button href="/" variant="ghost" size="sm">Form</Button>
				<Button href="/daftar" variant="ghost" size="sm">Daftar</Button>
				<Button href="/statistik" variant="secondary" size="sm" aria-current="page"
					>Statistik</Button
				>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-6">
		<div class="mb-6 flex flex-col gap-1">
			<h1 class="text-xl font-semibold tracking-tight">Statistik Kunjungan</h1>
			<p class="text-sm text-muted-foreground">
				Ringkasan kunjungan PST berdasarkan data tersimpan di browser (localStorage). Total data: {total}
				kunjungan.
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
						<p class="text-xs text-muted-foreground">
							Seluruh data kunjungan tersimpan (dummy + input baru).
						</p>
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
						<p class="text-xs text-muted-foreground">
							Filter visit_date === {todayIso} (ISO hari ini).
						</p>
						<div class="mt-3 flex items-center gap-2">
							<Badge variant={todayCount > 0 ? 'default' : 'secondary'}>
								{todayCount} hari ini
							</Badge>
							<span class="text-xs text-muted-foreground">
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
						<p class="text-xs text-muted-foreground">
							Persentase kunjungan hari ini terhadap total.
						</p>
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
				<h2 id="keperluan-heading" class="text-base font-semibold">By Keperluan</h2>
				<Badge variant="outline">{keperluanOptions.length} kategori</Badge>
			</div>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
				{#each byKeperluan as item (item.key)}
					<Card.Root>
						<Card.Header class="pb-2">
							<Card.Title class="text-sm leading-none font-medium">{item.key}</Card.Title>
							<Card.Description class="text-xs">
								{item.count} kunjungan - {item.percent}%
							</Card.Description>
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
				<h2 id="pendidikan-heading" class="text-base font-semibold">By Pendidikan</h2>
				<Badge variant="outline">{pendidikanOptions.length} jenjang</Badge>
			</div>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
				{#each byPendidikan as item (item.key)}
					<Card.Root>
						<Card.Header class="pb-2">
							<Card.Title class="text-sm leading-none font-medium">{item.key}</Card.Title>
							<Card.Description class="text-xs">
								{item.count} kunjungan - {item.percent}%
							</Card.Description>
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
					<h2 id="gender-heading" class="text-base font-semibold">By Gender</h2>
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
					<h2 id="disabilitas-heading" class="text-base font-semibold">By Disabilitas</h2>
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
					<p class="text-sm font-medium">Belum ada data kunjungan</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Isi form di halaman utama untuk melihat statistik.
					</p>
					<Button href="/" variant="outline" size="sm" class="mt-4">Ke Form</Button>
				</Card.Content>
			</Card.Root>
		{/if}

		<div
			class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground"
		>
			<p>
				Data bersumber dari localStorage key <code class="rounded bg-muted px-1 py-0.5"
					>btpst_mock_visits</code
				>.
			</p>
			<div class="flex items-center gap-2">
				<Button href="/" variant="ghost" size="sm">Form</Button>
				<Button href="/daftar" variant="ghost" size="sm">Daftar</Button>
			</div>
		</div>
	</main>
</div>
