<script lang="ts">
	import { guestStore } from '$lib/stores/guests.svelte';
	import { keperluanOptions } from '$lib/constants/options';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import GuestDataTable from '$lib/components/guest/GuestDataTable.svelte';
	import GuestDetail from '$lib/components/guest/GuestDetail.svelte';
	import type { GuestVisit } from '$lib/types';
	import { getTodayIsoJakarta } from '$lib/utils/date';
	import { toast } from 'svelte-sonner';

	const monthNames: { id: string; label: string }[] = [
		{ id: '01', label: 'Januari' },
		{ id: '02', label: 'Februari' },
		{ id: '03', label: 'Maret' },
		{ id: '04', label: 'April' },
		{ id: '05', label: 'Mei' },
		{ id: '06', label: 'Juni' },
		{ id: '07', label: 'Juli' },
		{ id: '08', label: 'Agustus' },
		{ id: '09', label: 'September' },
		{ id: '10', label: 'Oktober' },
		{ id: '11', label: 'November' },
		{ id: '12', label: 'Desember' }
	];

	const currentYear = getTodayIsoJakarta().slice(0, 4);

	let selectedYear: string = $state(currentYear);
	let selectedMonth: string = $state('all');
	let searchQuery = $state('');
	let selected = $state<GuestVisit | null>(null);
	let dialogOpen = $state(false);

	let visits = $derived(guestStore.visits);

	const availableYears = $derived.by(() => {
		const years: string[] = [];
		for (const v of visits) {
			const y = v.visit_date.slice(0, 4);
			if (/^\d{4}$/.test(y) && !years.includes(y)) years.push(y);
		}
		if (years.length === 0) years.push(currentYear);
		return years.sort();
	});

	const filteredByPeriod = $derived.by(() => {
		let result = visits;
		if (selectedYear) {
			if (selectedMonth === 'all') {
				result = result.filter((v) => v.visit_date.startsWith(selectedYear + '-'));
			} else {
				result = result.filter((v) => v.visit_date.startsWith(`${selectedYear}-${selectedMonth}`));
			}
		}
		const q = searchQuery.trim().toLowerCase();
		if (q) {
			result = result.filter(
				(v) => v.nama.toLowerCase().includes(q) || v.instansi.toLowerCase().includes(q)
			);
		}
		return [...result].sort(
			(a, b) => b.visit_date.localeCompare(a.visit_date) || b.created_at.localeCompare(a.created_at)
		);
	});

	const totalPeriod = $derived(filteredByPeriod.length);

	const byMonthOverview = $derived.by(() => {
		return monthNames.map((m) => {
			const key = `${selectedYear}-${m.id}`;
			const count = visits.filter((v) => v.visit_date.startsWith(key)).length;
			return { ...m, key, count };
		});
	});

	const byKeperluanPeriod = $derived.by(() => {
		return keperluanOptions.map((k) => ({
			key: k,
			count: filteredByPeriod.filter((v) => v.keperluan === k).length
		}));
	});

	const topKeperluan = $derived.by(() => {
		let max = 0;
		let top = '-';
		for (const it of byKeperluanPeriod) {
			if (it.count > max) {
				max = it.count;
				top = it.key;
			}
		}
		return max === 0 ? '-' : `${top} (${max})`;
	});

	const labelPeriode = $derived.by(() => {
		if (selectedMonth === 'all') return `Tahun ${selectedYear} - semua bulan`;
		const m = monthNames.find((x) => x.id === selectedMonth)?.label ?? selectedMonth;
		return `${m} ${selectedYear}`;
	});

	const handleView = (visit: GuestVisit): void => {
		selected = visit;
		dialogOpen = true;
	};

	const handleClose = (): void => {
		dialogOpen = false;
		selected = null;
	};

	const handleReset = (): void => {
		selectedYear = currentYear;
		selectedMonth = 'all';
		searchQuery = '';
	};

	const handleExportCsv = (): void => {
		if (filteredByPeriod.length === 0) {
			toast.error('Tidak ada data untuk diekspor');
			return;
		}
		const header = [
			'id',
			'nama',
			'gender',
			'instansi',
			'hp',
			'email',
			'pekerjaan',
			'pekerjaan_lainnya',
			'tahun_lahir',
			'pendidikan',
			'negara',
			'provinsi',
			'kab_kota',
			'disabilitas',
			'tipe_disabilitas',
			'keperluan',
			'keperluan_lainnya',
			'visit_date',
			'created_at'
		];
		const esc = (v: unknown): string => {
			const s = v == null ? '' : String(v);
			if (s.includes(',') || s.includes('"') || s.includes('\n'))
				return `"${s.replace(/"/g, '""')}"`;
			return s;
		};
		const rows = filteredByPeriod.map((v) =>
			header.map((k) => esc((v as Record<string, unknown>)[k])).join(',')
		);
		const csv = [header.join(','), ...rows].join('\r\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const suffix = selectedMonth === 'all' ? selectedYear : `${selectedYear}-${selectedMonth}`;
		a.href = url;
		a.download = `rekap-${suffix}.csv`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
		toast.success(`CSV diekspor: ${filteredByPeriod.length} baris`);
	};
</script>

<div class="mb-6 flex flex-col gap-1">
	<h1 class="text-2xl font-[var(--font-cal-sans)] font-semibold tracking-tight">Rekap Bulanan</h1>
	<p class="text-sm text-muted-foreground">
		Rekap kunjungan tiap bulan - filter tahun dan bulan, lihat ringkasan, dan ekspor CSV.
	</p>
</div>

<Card.Root>
	<Card.Content class="flex flex-col gap-3 md:flex-row md:items-end">
		<div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
			<div class="flex flex-col gap-1.5">
				<span class="text-sm font-medium">Tahun</span>
				<Select.Root type="single" bind:value={selectedYear}>
					<Select.Trigger class="w-36">
						<span data-slot="select-value">{selectedYear}</span>
					</Select.Trigger>
					<Select.Content>
						{#each availableYears as y (y)}
							<Select.Item value={y} label={y}>{y}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex flex-col gap-1.5">
				<span class="text-sm font-medium">Bulan</span>
				<Select.Root type="single" bind:value={selectedMonth}>
					<Select.Trigger class="w-44">
						<span data-slot="select-value">
							{selectedMonth === 'all'
								? 'Semua Bulan'
								: (monthNames.find((m) => m.id === selectedMonth)?.label ?? selectedMonth)}
						</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all" label="Semua Bulan">Semua Bulan</Select.Item>
						{#each monthNames as m (m.id)}
							<Select.Item value={m.id} label={m.label}>{m.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex flex-1 flex-col gap-1.5">
				<span class="text-sm font-medium">Cari</span>
				<Input
					placeholder="Nama atau instansi..."
					bind:value={searchQuery}
					aria-label="Cari rekap"
				/>
			</div>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={handleReset}>Reset</Button>
			<Button variant="secondary" size="sm" onclick={handleExportCsv} disabled={totalPeriod === 0}
				>Ekspor CSV</Button
			>
		</div>
	</Card.Content>
</Card.Root>

<div class="mt-4 flex flex-wrap items-center gap-2">
	<Badge variant="secondary">{labelPeriode}</Badge>
	<Badge variant="outline">{totalPeriod} kunjungan</Badge>
	<span class="text-sm text-muted-foreground">Terbanyak: {topKeperluan}</span>
</div>

{#if selectedMonth === 'all'}
	<section aria-labelledby="overview-heading" class="mt-6">
		<div class="mb-3 flex items-center justify-between">
			<h2
				id="overview-heading"
				class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
			>
				Ringkasan 12 Bulan
			</h2>
			<Badge variant="outline">{selectedYear}</Badge>
		</div>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{#each byMonthOverview as item (item.key)}
				<Card.Root
					class="cursor-pointer transition-shadow hover:shadow-sm {selectedMonth === item.id
						? 'ring-1 ring-foreground/20'
						: ''}"
				>
					<button
						type="button"
						class="w-full text-left"
						onclick={() => (selectedMonth = item.id)}
						aria-label={`Pilih ${item.label}`}
					>
						<Card.Header class="pb-2">
							<Card.Title class="text-sm font-medium">{item.label}</Card.Title>
							<Card.Description class="text-sm">{item.count} kunjungan</Card.Description>
						</Card.Header>
						<Card.Content>
							<span class="text-2xl font-semibold tabular-nums">{item.count}</span>
						</Card.Content>
					</button>
				</Card.Root>
			{/each}
		</div>
	</section>
	<Separator class="my-6" />
{/if}

<section aria-labelledby="keperluan-periode-heading" class="mt-6">
	<div class="mb-3 flex items-center justify-between">
		<h2
			id="keperluan-periode-heading"
			class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
		>
			By Keperluan - {labelPeriode}
		</h2>
		<Badge variant="outline">{keperluanOptions.length} kategori</Badge>
	</div>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
		{#each byKeperluanPeriod as item (item.key)}
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm leading-none font-medium">{item.key}</Card.Title>
					<Card.Description class="text-sm">{item.count} kunjungan</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<span class="text-2xl font-semibold tabular-nums">{item.count}</span>
						<Badge variant={item.count > 0 ? 'secondary' : 'outline'}>
							{totalPeriod === 0 ? 0 : Math.round((item.count / totalPeriod) * 100)}%
						</Badge>
					</div>
					<div
						class="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
						role="progressbar"
						aria-valuenow={totalPeriod === 0 ? 0 : Math.round((item.count / totalPeriod) * 100)}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`Progress ${item.key}`}
					>
						<div
							class="h-full rounded-full bg-primary transition-all"
							style:width={`${totalPeriod === 0 ? 0 : Math.round((item.count / totalPeriod) * 100)}%`}
						></div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</section>

<Separator class="my-6" />

{#if filteredByPeriod.length === 0}
	<Card.Root>
		<Card.Content class="py-12 text-center">
			<p class="text-base font-medium">Tidak ada data pada periode ini</p>
			<p class="mt-1 text-sm text-muted-foreground">
				Coba ubah filter tahun/bulan atau kata kunci pencarian.
			</p>
			<Button variant="outline" size="sm" class="mt-4" onclick={handleReset}>Reset filter</Button>
		</Card.Content>
	</Card.Root>
{:else}
	<div class="mb-3 flex items-center justify-between">
		<h2 class="text-xl font-[var(--font-cal-sans)] font-semibold tracking-tight">
			Detail Kunjungan
		</h2>
		<Badge variant="secondary">{filteredByPeriod.length} baris</Badge>
	</div>
	<GuestDataTable data={filteredByPeriod} onView={handleView} />
{/if}

<GuestDetail bind:open={dialogOpen} visit={selected} onClose={handleClose} />

<div
	class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground"
>
	<p>Rekap disaring dari kunjungan dengan visit_date YYYY-MM-DD (Asia/Jakarta).</p>
	<div class="flex items-center gap-2">
		<Button href="/statistik" variant="ghost" size="sm">Statistik</Button>
		<Button href="/daftar" variant="ghost" size="sm">Daftar</Button>
	</div>
</div>
