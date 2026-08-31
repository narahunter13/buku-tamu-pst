<script lang="ts">
	import { onMount } from 'svelte';
	import type { GuestVisit } from '$lib/types';
	import { guestStore } from '$lib/stores/guests.svelte';
	import { keperluanOptions } from '$lib/constants/options';
	import GuestDataTable from '$lib/components/guest/GuestDataTable.svelte';
	import GuestDetail from '$lib/components/guest/GuestDetail.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';

	let searchQuery = $state('');
	let filterKeperluan = $state('all');
	let filterGender = $state('all');

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

	const filteredSorted = $derived(
		[...filtered].sort(
			(a, b) => b.visit_date.localeCompare(a.visit_date) || b.created_at.localeCompare(a.created_at)
		)
	);

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
	};

	onMount(() => {
		guestStore.init();
	});
</script>

<div class="mb-4 flex flex-col gap-3">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<h1 class="text-2xl font-[var(--font-cal-sans)] font-semibold tracking-tight">
				Daftar Kunjungan
			</h1>
			<Badge variant="secondary">{filteredSorted.length} dari {visits.length}</Badge>
		</div>
		<Button variant="outline" size="sm" onclick={handleReset}>Reset filter</Button>
	</div>

	<Card.Root>
		<Card.Content class="flex flex-col gap-3 md:flex-row md:items-center">
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

{#if filteredSorted.length === 0}
	<Card.Root>
		<Card.Content class="py-12 text-center">
			<p class="text-sm font-medium">Tidak ada data yang cocok</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Coba ubah kata kunci pencarian atau filter keperluan/gender.
			</p>
			<Button variant="outline" size="sm" class="mt-4" onclick={handleReset}>Reset filter</Button>
		</Card.Content>
	</Card.Root>
{:else}
	<GuestDataTable data={filteredSorted} onView={handleView} />
{/if}

<GuestDetail bind:open={dialogOpen} visit={selected} onClose={handleClose} />
