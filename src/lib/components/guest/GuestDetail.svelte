<script lang="ts">
	import type { GuestVisit } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field';
	import { Separator } from '$lib/components/ui/separator';
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
		<Dialog.Content class="max-h-[80vh] scrollbar-thin overflow-y-auto sm:max-w-xl">
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
				<div class="grid gap-6">
					<div>
						<h4 class="text-xs font-medium tracking-widest text-slate uppercase">Personal</h4>
						<Separator class="my-2" />
						<Field.Group class="grid gap-3 sm:grid-cols-2">
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Nama Lengkap</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.nama}</p>
							</Field.Field>
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Jenis Kelamin</Field.Label>
								<div>
									<Badge variant={visit.gender === 'Perempuan' ? 'secondary' : 'outline'}>
										{visit.gender}
									</Badge>
								</div>
							</Field.Field>
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Tahun Lahir</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.tahun_lahir}</p>
							</Field.Field>
						</Field.Group>
					</div>

					<div>
						<h4 class="text-xs font-medium tracking-widest text-slate uppercase">Kontak</h4>
						<Separator class="my-2" />
						<Field.Group class="grid gap-3 sm:grid-cols-2">
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Asal Instansi</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.instansi}</p>
							</Field.Field>
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Nomor HP</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.hp}</p>
							</Field.Field>
							<Field.Field class="gap-1.5 sm:col-span-2">
								<Field.Label class="text-sm text-muted-foreground">Email</Field.Label>
								<p class="text-sm font-medium break-all text-foreground">{visit.email}</p>
							</Field.Field>
						</Field.Group>
					</div>

					<div>
						<h4 class="text-xs font-medium tracking-widest text-slate uppercase">
							Pekerjaan & Pendidikan
						</h4>
						<Separator class="my-2" />
						<Field.Group class="grid gap-3 sm:grid-cols-2">
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Pekerjaan</Field.Label>
								<p class="text-sm font-medium text-foreground">{displayPekerjaan}</p>
							</Field.Field>
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Pendidikan</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.pendidikan}</p>
							</Field.Field>
						</Field.Group>
					</div>

					<div>
						<h4 class="text-xs font-medium tracking-widest text-slate uppercase">Domisili</h4>
						<Separator class="my-2" />
						<Field.Group class="grid gap-3 sm:grid-cols-2">
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Negara</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.negara}</p>
							</Field.Field>
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Provinsi</Field.Label>
								<p class="text-sm font-medium text-foreground">{displayProvinsi}</p>
							</Field.Field>
							<Field.Field class="gap-1.5 sm:col-span-2">
								<Field.Label class="text-sm text-muted-foreground">Kabupaten/Kota</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.kab_kota}</p>
							</Field.Field>
						</Field.Group>
					</div>

					<div>
						<h4 class="text-xs font-medium tracking-widest text-slate uppercase">Disabilitas</h4>
						<Separator class="my-2" />
						<Field.Group class="grid gap-3 sm:grid-cols-2">
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Disabilitas</Field.Label>
								<p class="text-sm font-medium text-foreground">{visit.disabilitas}</p>
							</Field.Field>
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Tipe Disabilitas</Field.Label>
								<p class="text-sm font-medium text-foreground">{displayTipeDisabilitas}</p>
							</Field.Field>
						</Field.Group>
					</div>

					<div>
						<h4 class="text-xs font-medium tracking-widest text-slate uppercase">Keperluan</h4>
						<Separator class="my-2" />
						<Field.Group class="grid gap-3">
							<Field.Field class="gap-1.5">
								<Field.Label class="text-sm text-muted-foreground">Keperluan</Field.Label>
								<div>
									<Badge variant="secondary">{displayKeperluan}</Badge>
								</div>
							</Field.Field>
						</Field.Group>
					</div>
				</div>
			{:else}
				<p class="py-6 text-center text-base text-muted-foreground">
					Tidak ada data untuk ditampilkan.
				</p>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
