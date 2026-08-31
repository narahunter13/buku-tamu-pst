<script lang="ts">
	import type { GuestVisit } from '$lib/types';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	let {
		visits,
		onView
	}: {
		visits: GuestVisit[];
		onView: (visit: GuestVisit) => void;
	} = $props();

	const formatPekerjaan = (visit: GuestVisit): string => {
		if (visit.pekerjaan === 'Lainnya' && visit.pekerjaan_lainnya) {
			return `Lainnya: ${visit.pekerjaan_lainnya}`;
		}
		return visit.pekerjaan;
	};

	const formatKeperluan = (visit: GuestVisit): string => {
		if (visit.keperluan === 'Lainnya' && visit.keperluan_lainnya) {
			return `Lainnya: ${visit.keperluan_lainnya}`;
		}
		return visit.keperluan;
	};
</script>

{#if visits.length === 0}
	<Card.Root>
		<Card.Content class="py-10 text-center">
			<p class="text-sm text-muted-foreground">Belum ada data kunjungan.</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Data akan muncul setelah tamu mengisi buku tamu.
			</p>
		</Card.Content>
	</Card.Root>
{:else}
	<div class="rounded-sm border bg-card">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-12">No</Table.Head>
					<Table.Head>Nama</Table.Head>
					<Table.Head>Gender</Table.Head>
					<Table.Head>Instansi</Table.Head>
					<Table.Head>Pekerjaan</Table.Head>
					<Table.Head>Keperluan</Table.Head>
					<Table.Head>Tahun Lahir</Table.Head>
					<Table.Head>Kab/Kota</Table.Head>
					<Table.Head>Tanggal</Table.Head>
					<Table.Head class="text-right">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each visits as visit, i (visit.id)}
					<Table.Row>
						<Table.Cell class="text-muted-foreground">{i + 1}</Table.Cell>
						<Table.Cell class="max-w-32 truncate font-medium">{visit.nama}</Table.Cell>
						<Table.Cell>
							<Badge variant={visit.gender === 'Perempuan' ? 'secondary' : 'outline'}>
								{visit.gender}
							</Badge>
						</Table.Cell>
						<Table.Cell class="max-w-32 truncate">{visit.instansi}</Table.Cell>
						<Table.Cell class="max-w-40 truncate" title={formatPekerjaan(visit)}>
							{formatPekerjaan(visit)}
						</Table.Cell>
						<Table.Cell class="max-w-40 truncate" title={formatKeperluan(visit)}>
							<Badge variant="secondary" class="max-w-40 truncate">
								{formatKeperluan(visit)}
							</Badge>
						</Table.Cell>
						<Table.Cell>{visit.tahun_lahir}</Table.Cell>
						<Table.Cell class="max-w-28 truncate">{visit.kab_kota}</Table.Cell>
						<Table.Cell class="text-xs whitespace-nowrap">{visit.visit_date}</Table.Cell>
						<Table.Cell class="text-right">
							<Button variant="outline" size="sm" onclick={() => onView(visit)}>Detail</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}
