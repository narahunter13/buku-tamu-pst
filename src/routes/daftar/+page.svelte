<script lang="ts">
	import { onMount } from 'svelte';
	import type { GuestVisit } from '$lib/types';
	import { guestStore } from '$lib/stores/guests.svelte';
	import { keperluanOptions } from '$lib/constants/options';
	import GuestTable from '$lib/components/guest/GuestTable.svelte';
	import GuestDetail from '$lib/components/guest/GuestDetail.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';

	let searchQuery = $state('');
	let filterKeperluan = $state('all');
	let filterGender = $state('all');
	let page = $state(1);
	const pageSize = 10;

	let selected = $state<GuestVisit | null>(null);
	let dialogOpen = $state(false);

	let visits = $derived(guestStore.visits);

	const filtered = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		let result = visits;
		if (q) {
			result = result.filter(
				(v) => v.nama.toLowerCase().includes(q) || v.instansi.toLowerCase().includes(q)
			);
		}
		if (filterKeperluan !== 'all') {
			result = result.filter((v) => v.keperluan === filterKeperluan);
		}
		if (filterGender !== 'all') {
			result = result.filter((v) => v.gender === filterGender);
		}
		return result;
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));

	const paginated = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	const handleView = (visit: GuestVisit): void => {
		selected = visit;
		dialogOpen = true;
	};

	const handleClose = (): void => {
		dialogOpen = false;
		selected = null;
	};

	const handleReset = (): void => {
		searchQuery = '';
		filterKeperluan = 'all';
		filterGender = 'all';
		page = 1;
	};

	const handlePrev = (): void => {
		if (page > 1) page -= 1;
	};

	const handleNext = (): void => {
		if (page < totalPages) page += 1;
	};

	onMount(() => {
		guestStore.init();
	});

	$effect(() => {
		void searchQuery;
		void filterKeperluan;
		void filterGender;
		page = 1;
	});

	$effect(() => {
		if (page > totalPages) page = totalPages;
	});
</script>

<div class="min-h-screen bg-background">
	<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
			<a href="/" class="text-xs font-semibold">BPS Kota Pagar Alam - PST</a>
			<nav class="flex items-center gap-1">
				<Button href="/" variant="ghost" size="sm">Form</Button>
				<Button href="/daftar" variant="secondary" size="sm">Daftar</Button>
				<Button href="/statistik" variant="ghost" size="sm">Statistik</Button>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-6">
		<div class="mb-4 flex flex-col gap-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<h1 class="text-2xl font-[var(--font-cal-sans)] font-semibold tracking-tight">
						Daftar Kunjungan
					</h1>
					<Badge variant="secondary">{filtered.length} dari {visits.length}</Badge>
				</div>
				<Button variant="outline" size="sm" onclick={handleReset}>Reset filter</Button>
			</div>

			<Card.Root>
				<Card.Content class="flex flex-col gap-3 pt-4 md:flex-row md:items-center">
					<div class="flex-1">
						<Input
							placeholder="Cari nama atau instansi..."
							bind:value={searchQuery}
							aria-label="Cari tamu"
						/>
					</div>

					<div class="flex flex-wrap gap-2">
						<Select.Root type="single" bind:value={filterKeperluan}>
							<Select.Trigger class="w-56">
								<span data-slot="select-value">
									{filterKeperluan === 'all' ? 'Semua Keperluan' : filterKeperluan}
								</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all" label="Semua Keperluan">Semua Keperluan</Select.Item>
								{#each keperluanOptions as opt (opt)}
									<Select.Item value={opt} label={opt}>{opt}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<Select.Root type="single" bind:value={filterGender}>
							<Select.Trigger class="w-40">
								<span data-slot="select-value">
									{filterGender === 'all' ? 'Semua Gender' : filterGender}
								</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all" label="Semua Gender">Semua Gender</Select.Item>
								<Select.Item value="Laki-laki" label="Laki-laki">Laki-laki</Select.Item>
								<Select.Item value="Perempuan" label="Perempuan">Perempuan</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		{#if filtered.length === 0}
			<Card.Root>
				<Card.Content class="py-12 text-center">
					<p class="text-sm font-medium">Tidak ada data yang cocok</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Coba ubah kata kunci pencarian atau filter keperluan/gender.
					</p>
					<Button variant="outline" size="sm" class="mt-4" onclick={handleReset}>
						Reset filter
					</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<GuestTable visits={paginated} onView={handleView} />

			<div class="mt-4 flex flex-wrap items-center justify-between gap-2">
				<p class="text-xs text-muted-foreground">
					Halaman {page} dari {totalPages} - menampilkan {paginated.length} dari {filtered.length} data
				</p>
				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" disabled={page <= 1} onclick={handlePrev}>
						Prev
					</Button>
					<span class="text-xs tabular-nums">{page} / {totalPages}</span>
					<Button variant="outline" size="sm" disabled={page >= totalPages} onclick={handleNext}>
						Next
					</Button>
				</div>
			</div>
		{/if}

		<GuestDetail bind:open={dialogOpen} visit={selected} onClose={handleClose} />
	</main>
</div>
