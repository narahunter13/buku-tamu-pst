<script lang="ts">
	import type { GuestVisit } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field';
	import { Badge } from '$lib/components/ui/badge';

	let {
		open = $bindable(false),
		visit,
		onClose
	}: {
		open: boolean;
		visit: GuestVisit | null;
		onClose: () => void;
	} = $props();

	const handleOpenChange = (next: boolean): void => {
		open = next;
		if (!next) onClose();
	};

	const displayPekerjaan = $derived(
		visit
			? visit.pekerjaan === 'Lainnya' && visit.pekerjaan_lainnya
				? `Lainnya: ${visit.pekerjaan_lainnya}`
				: visit.pekerjaan
			: '-'
	);

	const displayKeperluan = $derived(
		visit
			? visit.keperluan === 'Lainnya' && visit.keperluan_lainnya
				? `Lainnya: ${visit.keperluan_lainnya}`
				: visit.keperluan
			: '-'
	);

	const displayProvinsi = $derived(
		visit
			? visit.provinsi
				? visit.provinsi
				: visit.negara !== 'Indonesia'
					? 'Luar Negeri'
					: '-'
			: '-'
	);

	const displayTipeDisabilitas = $derived(visit?.tipe_disabilitas ?? '-');
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-xl">
			<Dialog.Header>
				<Dialog.Title>Detail Kunjungan</Dialog.Title>
				<Dialog.Description>
					{#if visit}
						ID #{visit.id} - {visit.visit_date}
					{:else}
						Tidak ada data
					{/if}
				</Dialog.Description>
			</Dialog.Header>

			{#if visit}
				<div class="grid gap-4">
					<Field.Group class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">1. Nama Lengkap</Field.Label>
							<p class="text-sm font-medium">{visit.nama}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">2. Jenis Kelamin</Field.Label>
							<div>
								<Badge variant={visit.gender === 'Perempuan' ? 'secondary' : 'outline'}>
									{visit.gender}
								</Badge>
							</div>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">3. Asal Instansi</Field.Label>
							<p class="text-sm">{visit.instansi}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">4. Nomor HP</Field.Label>
							<p class="text-sm">{visit.hp}</p>
						</Field.Field>

						<Field.Field class="sm:col-span-2">
							<Field.Label class="text-xs text-muted-foreground">5. Email</Field.Label>
							<p class="text-sm break-all">{visit.email}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">6. Pekerjaan</Field.Label>
							<p class="text-sm">{displayPekerjaan}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">8. Tahun Lahir</Field.Label>
							<p class="text-sm">{visit.tahun_lahir}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">9. Pendidikan</Field.Label>
							<p class="text-sm">{visit.pendidikan}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">10. Negara</Field.Label>
							<p class="text-sm">{visit.negara}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">11. Provinsi</Field.Label>
							<p class="text-sm">{displayProvinsi}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">12. Kabupaten/Kota</Field.Label>
							<p class="text-sm">{visit.kab_kota}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">13. Disabilitas</Field.Label>
							<p class="text-sm">{visit.disabilitas}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">14. Tipe Disabilitas</Field.Label>
							<p class="text-sm">{displayTipeDisabilitas}</p>
						</Field.Field>

						<Field.Field class="sm:col-span-2">
							<Field.Label class="text-xs text-muted-foreground">15. Keperluan</Field.Label>
							<div>
								<Badge variant="secondary">{displayKeperluan}</Badge>
							</div>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">Meta - ID</Field.Label>
							<p class="text-sm">{visit.id}</p>
						</Field.Field>

						<Field.Field>
							<Field.Label class="text-xs text-muted-foreground">Meta - Tanggal Kunjung</Field.Label
							>
							<p class="text-sm">{visit.visit_date}</p>
						</Field.Field>

						<Field.Field class="sm:col-span-2">
							<Field.Label class="text-xs text-muted-foreground">Meta - Created At</Field.Label>
							<p class="text-sm text-xs break-all text-muted-foreground">{visit.created_at}</p>
						</Field.Field>
					</Field.Group>
				</div>
			{:else}
				<p class="py-6 text-center text-sm text-muted-foreground">
					Tidak ada data untuk ditampilkan.
				</p>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
