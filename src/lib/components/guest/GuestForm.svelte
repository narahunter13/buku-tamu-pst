<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Check, ChevronsUpDown } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Field from '$lib/components/ui/field';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { guestSchema } from '$lib/schemas/guest';
	import { guestStore } from '$lib/stores/guests.svelte';
	import { provinces } from '$lib/constants/provinces';
	import {
		genderOptions,
		pekerjaanOptions,
		pendidikanOptions,
		tipeDisabilitasOptions,
		keperluanOptions
	} from '$lib/constants/options';

	const currentYear = new Date().getFullYear();
	const tahunOptions: string[] = Array.from({ length: currentYear - 1940 + 1 }, (_, i) =>
		String(currentYear - i)
	);
	const negaraOptions = ['Indonesia', 'Malaysia', 'Singapore', 'Japan', 'Lainnya'] as const;

	type FormState = {
		nama: string;
		gender: string;
		instansi: string;
		hp: string;
		email: string;
		pekerjaan: string;
		pekerjaanLainnya: string;
		tahun_lahir: string;
		pendidikan: string;
		negara: string;
		provinsi: string;
		kab_kota: string;
		disabilitas: string;
		tipeDisabilitas: string;
		keperluan: string;
		keperluanLainnya: string;
	};

	const createInitialForm = (): FormState => ({
		nama: '',
		gender: '',
		instansi: '',
		hp: '',
		email: '',
		pekerjaan: '',
		pekerjaanLainnya: '',
		tahun_lahir: '',
		pendidikan: '',
		negara: 'Indonesia',
		provinsi: '',
		kab_kota: '',
		disabilitas: '',
		tipeDisabilitas: '',
		keperluan: '',
		keperluanLainnya: ''
	});

	let form: FormState = $state(createInitialForm());
	let errors: Record<string, string> = $state({});
	let isSubmitting = $state(false);
	let successVisible = $state(false);
	let provinsiOpen = $state(false);
	let provinsiTriggerRef = $state<HTMLButtonElement>(null!);

	const closeAndFocusProvinsi = (): void => {
		provinsiOpen = false;
		tick().then(() => {
			provinsiTriggerRef?.focus();
		});
	};

	const showPekerjaanLainnya = $derived(form.pekerjaan === 'Lainnya');
	const showProvinsi = $derived(form.negara === 'Indonesia');
	const showTipeDisabilitas = $derived(form.disabilitas === 'Ya');
	const showKeperluanLainnya = $derived(form.keperluan === 'Lainnya');

	$effect(() => {
		if (!showPekerjaanLainnya && form.pekerjaanLainnya) {
			form.pekerjaanLainnya = '';
		}
	});

	$effect(() => {
		if (!showProvinsi && form.provinsi) {
			form.provinsi = '';
		}
	});

	$effect(() => {
		if (!showTipeDisabilitas && form.tipeDisabilitas) {
			form.tipeDisabilitas = '';
		}
	});

	$effect(() => {
		if (!showKeperluanLainnya && form.keperluanLainnya) {
			form.keperluanLainnya = '';
		}
	});

	onMount(() => {
		guestStore.init();
	});

	const handleHpInput = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		const digits = target.value.replace(/\D/g, '').slice(0, 15);
		form.hp = digits;
		target.value = digits;
	};

	const handleReset = (): void => {
		form = createInitialForm();
		errors = {};
		successVisible = false;
	};

	const handleSubmit = (e: SubmitEvent): void => {
		e.preventDefault();
		isSubmitting = true;
		errors = {};
		successVisible = false;

		const payload = {
			nama: form.nama.trim(),
			gender: form.gender,
			instansi: form.instansi.trim(),
			hp: form.hp.trim(),
			email: form.email.trim(),
			pekerjaan: form.pekerjaan,
			pekerjaan_lainnya: showPekerjaanLainnya ? form.pekerjaanLainnya.trim() || null : null,
			tahun_lahir: form.tahun_lahir ? Number(form.tahun_lahir) : Number.NaN,
			pendidikan: form.pendidikan,
			negara: form.negara.trim(),
			provinsi: showProvinsi ? (form.provinsi ? form.provinsi : null) : null,
			kab_kota: form.kab_kota.trim(),
			disabilitas: form.disabilitas,
			tipe_disabilitas: showTipeDisabilitas ? form.tipeDisabilitas || null : null,
			keperluan: form.keperluan,
			keperluan_lainnya: showKeperluanLainnya ? form.keperluanLainnya.trim() || null : null
		};

		const result = guestSchema.safeParse(payload);

		if (!result.success) {
			const mapped: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !mapped[key]) {
					mapped[key] = issue.message;
				}
			}
			errors = mapped;
			isSubmitting = false;
			const firstError = result.error.issues[0]?.message ?? 'Periksa kembali isian form';
			toast.error(firstError);
			return;
		}

		guestStore.add(result.data);
		toast.success('Terima kasih, kunjungan tercatat');
		successVisible = true;
		form = createInitialForm();
		isSubmitting = false;
	};

	const goToDaftar = (): void => {
		goto('/daftar');
	};
</script>

<Card.Root class="mx-auto w-full max-w-3xl p-6 shadow-sm">
	<Card.Header>
		<Card.Title class="text-2xl font-[var(--font-cal-sans)] font-semibold tracking-tight"
			>Buku Tamu PST - BPS Kota Pagar Alam</Card.Title
		>
		<Card.Description class="text-sm text-slate"
			>Silakan isi 16 field berikut sesuai pedoman. Field bertanda * wajib diisi.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		{#if successVisible}
			<div
				class="mb-4 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-800"
			>
				Data kunjungan berhasil disimpan. Terima kasih telah mengisi buku tamu.
				<button type="button" class="ml-2 text-xs underline" onclick={goToDaftar}
					>Lihat daftar</button
				>
			</div>
		{/if}
		<form id="guest-form" novalidate onsubmit={handleSubmit} class="grid gap-5 md:grid-cols-2">
			<Field.Field data-invalid={errors.nama ? true : undefined}>
				<Field.Label for="nama">1. Nama Lengkap *</Field.Label>
				<Input
					id="nama"
					name="nama"
					placeholder="Nama lengkap"
					bind:value={form.nama}
					aria-invalid={errors.nama ? true : undefined}
					data-invalid={errors.nama ? 'true' : undefined}
					autocomplete="name"
				/>
				{#if errors.nama}
					<Field.Error>{errors.nama}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.gender ? true : undefined}>
				<Field.Label for="gender">2. Jenis Kelamin *</Field.Label>
				<Select.Root type="single" bind:value={form.gender}>
					<Select.Trigger
						id="gender"
						aria-invalid={errors.gender ? true : undefined}
						data-invalid={errors.gender ? 'true' : undefined}
						class="w-full"
					>
						<span data-slot="select-value">
							{form.gender || 'Pilih jenis kelamin'}
						</span>
					</Select.Trigger>
					<Select.Content>
						{#each genderOptions as opt (opt)}
							<Select.Item value={opt} label={opt}>{opt}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors.gender}
					<Field.Error>{errors.gender}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.instansi ? true : undefined}>
				<Field.Label for="instansi">3. Asal Instansi *</Field.Label>
				<Input
					id="instansi"
					name="instansi"
					placeholder="Asal instansi"
					bind:value={form.instansi}
					aria-invalid={errors.instansi ? true : undefined}
					data-invalid={errors.instansi ? 'true' : undefined}
				/>
				{#if errors.instansi}
					<Field.Error>{errors.instansi}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.hp ? true : undefined}>
				<Field.Label for="hp">4. Nomor HP *</Field.Label>
				<Input
					id="hp"
					name="hp"
					placeholder="0812..."
					inputmode="numeric"
					maxlength={15}
					value={form.hp}
					oninput={handleHpInput}
					aria-invalid={errors.hp ? true : undefined}
					data-invalid={errors.hp ? 'true' : undefined}
					autocomplete="tel"
				/>
				<Field.Description>8-15 digit, angka saja</Field.Description>
				{#if errors.hp}
					<Field.Error>{errors.hp}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.email ? true : undefined}>
				<Field.Label for="email">5. Email *</Field.Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="nama@email.com"
					bind:value={form.email}
					aria-invalid={errors.email ? true : undefined}
					data-invalid={errors.email ? 'true' : undefined}
					autocomplete="email"
				/>
				{#if errors.email}
					<Field.Error>{errors.email}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.pekerjaan ? true : undefined}>
				<Field.Label for="pekerjaan">6. Pekerjaan *</Field.Label>
				<Select.Root type="single" bind:value={form.pekerjaan}>
					<Select.Trigger
						id="pekerjaan"
						aria-invalid={errors.pekerjaan ? true : undefined}
						data-invalid={errors.pekerjaan ? 'true' : undefined}
						class="w-full"
					>
						<span data-slot="select-value">
							{form.pekerjaan || 'Pilih pekerjaan'}
						</span>
					</Select.Trigger>
					<Select.Content>
						{#each pekerjaanOptions as opt (opt)}
							<Select.Item value={opt} label={opt}>{opt}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors.pekerjaan}
					<Field.Error>{errors.pekerjaan}</Field.Error>
				{/if}
			</Field.Field>

			{#if showPekerjaanLainnya}
				<Field.Field data-invalid={errors.pekerjaan_lainnya ? true : undefined}>
					<Field.Label for="pekerjaanLainnya">7. Tuliskan pekerjaan Anda *</Field.Label>
					<Input
						id="pekerjaanLainnya"
						name="pekerjaanLainnya"
						placeholder="Tuliskan pekerjaan"
						bind:value={form.pekerjaanLainnya}
						aria-invalid={errors.pekerjaan_lainnya ? true : undefined}
						data-invalid={errors.pekerjaan_lainnya ? 'true' : undefined}
					/>
					{#if errors.pekerjaan_lainnya}
						<Field.Error>{errors.pekerjaan_lainnya}</Field.Error>
					{/if}
				</Field.Field>
			{/if}

			<Field.Field data-invalid={errors.tahun_lahir ? true : undefined}>
				<Field.Label for="tahun_lahir">8. Tahun Lahir *</Field.Label>
				<Select.Root type="single" bind:value={form.tahun_lahir}>
					<Select.Trigger
						id="tahun_lahir"
						aria-invalid={errors.tahun_lahir ? true : undefined}
						data-invalid={errors.tahun_lahir ? 'true' : undefined}
						class="w-full"
					>
						<span data-slot="select-value">
							{form.tahun_lahir || 'Pilih tahun lahir'}
						</span>
					</Select.Trigger>
					<Select.Content class="max-h-60">
						{#each tahunOptions as y (y)}
							<Select.Item value={y} label={y}>{y}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors.tahun_lahir}
					<Field.Error>{errors.tahun_lahir}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.pendidikan ? true : undefined}>
				<Field.Label for="pendidikan">9. Pendidikan Tertinggi *</Field.Label>
				<Select.Root type="single" bind:value={form.pendidikan}>
					<Select.Trigger
						id="pendidikan"
						aria-invalid={errors.pendidikan ? true : undefined}
						data-invalid={errors.pendidikan ? 'true' : undefined}
						class="w-full"
					>
						<span data-slot="select-value">
							{form.pendidikan || 'Pilih pendidikan'}
						</span>
					</Select.Trigger>
					<Select.Content>
						{#each pendidikanOptions as opt (opt)}
							<Select.Item value={opt} label={opt}>{opt}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors.pendidikan}
					<Field.Error>{errors.pendidikan}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.negara ? true : undefined}>
				<Field.Label for="negara">10. Negara *</Field.Label>
				<Select.Root type="single" bind:value={form.negara}>
					<Select.Trigger
						id="negara"
						aria-invalid={errors.negara ? true : undefined}
						data-invalid={errors.negara ? 'true' : undefined}
						class="w-full"
					>
						<span data-slot="select-value">
							{form.negara || 'Pilih negara'}
						</span>
					</Select.Trigger>
					<Select.Content>
						{#each negaraOptions as opt (opt)}
							<Select.Item value={opt} label={opt}>{opt}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors.negara}
					<Field.Error>{errors.negara}</Field.Error>
				{/if}
			</Field.Field>

			{#if showProvinsi}
				<Field.Field data-invalid={errors.provinsi ? true : undefined}>
					<Field.Label for="provinsi">11. Provinsi *</Field.Label>
					<Popover.Root bind:open={provinsiOpen}>
						<Popover.Trigger bind:ref={provinsiTriggerRef}>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="outline"
									role="combobox"
									aria-expanded={provinsiOpen}
									aria-invalid={errors.provinsi ? true : undefined}
									data-invalid={errors.provinsi ? true : undefined}
									class="h-9 w-full justify-between rounded-sm px-3 text-xs font-normal"
								>
									{form.provinsi || 'Pilih provinsi'}
									<ChevronsUpDown class="size-4 opacity-50" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content
							class="w-[var(--bits-popover-anchor-width)] rounded-sm p-0"
							align="start"
						>
							<Command.Root>
								<Command.Input placeholder="Cari provinsi..." class="h-9 text-xs" />
								<Command.List class="max-h-60 overflow-y-auto">
									<Command.Empty class="p-2 text-xs">Tidak ditemukan.</Command.Empty>
									<Command.Group>
										{#each provinces as prov (prov)}
											<Command.Item
												value={prov}
												onSelect={() => {
													form.provinsi = prov;
													closeAndFocusProvinsi();
												}}
												class="text-xs"
											>
												{prov}
												<Check
													class="ml-auto size-4 {form.provinsi === prov
														? 'opacity-100'
														: 'opacity-0'}"
												/>
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
					{#if errors.provinsi}
						<Field.Error>{errors.provinsi}</Field.Error>
					{/if}
				</Field.Field>
			{/if}

			<Field.Field data-invalid={errors.kab_kota ? true : undefined}>
				<Field.Label for="kab_kota">12. Kabupaten/Kota *</Field.Label>
				<Input
					id="kab_kota"
					name="kab_kota"
					placeholder="Kabupaten/Kota"
					bind:value={form.kab_kota}
					aria-invalid={errors.kab_kota ? true : undefined}
					data-invalid={errors.kab_kota ? 'true' : undefined}
				/>
				{#if errors.kab_kota}
					<Field.Error>{errors.kab_kota}</Field.Error>
				{/if}
			</Field.Field>

			<Field.Field data-invalid={errors.disabilitas ? true : undefined} class="md:col-span-2">
				<Field.Label>13. Apakah Anda Penyandang Disabilitas? *</Field.Label>
				<RadioGroup.Root
					bind:value={form.disabilitas}
					class="flex gap-4"
					aria-invalid={errors.disabilitas ? true : undefined}
					data-invalid={errors.disabilitas ? 'true' : undefined}
				>
					<div class="flex items-center gap-2">
						<RadioGroup.Item value="Ya" id="dis-ya" />
						<Label for="dis-ya">Ya</Label>
					</div>
					<div class="flex items-center gap-2">
						<RadioGroup.Item value="Tidak" id="dis-tidak" />
						<Label for="dis-tidak">Tidak</Label>
					</div>
				</RadioGroup.Root>
				{#if errors.disabilitas}
					<Field.Error>{errors.disabilitas}</Field.Error>
				{/if}
			</Field.Field>

			{#if showTipeDisabilitas}
				<Field.Field data-invalid={errors.tipe_disabilitas ? true : undefined}>
					<Field.Label for="tipeDisabilitas">14. Tipe Disabilitas *</Field.Label>
					<Select.Root type="single" bind:value={form.tipeDisabilitas}>
						<Select.Trigger
							id="tipeDisabilitas"
							aria-invalid={errors.tipe_disabilitas ? true : undefined}
							data-invalid={errors.tipe_disabilitas ? 'true' : undefined}
							class="w-full"
						>
							<span data-slot="select-value">
								{form.tipeDisabilitas || 'Pilih tipe disabilitas'}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each tipeDisabilitasOptions as opt (opt)}
								<Select.Item value={opt} label={opt}>{opt}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errors.tipe_disabilitas}
						<Field.Error>{errors.tipe_disabilitas}</Field.Error>
					{/if}
				</Field.Field>
			{/if}

			<Field.Field data-invalid={errors.keperluan ? true : undefined} class="md:col-span-2">
				<Field.Label>15. Keperluan *</Field.Label>
				<RadioGroup.Root
					bind:value={form.keperluan}
					class="grid gap-2"
					aria-invalid={errors.keperluan ? true : undefined}
					data-invalid={errors.keperluan ? 'true' : undefined}
				>
					{#each keperluanOptions as opt (opt)}
						<div class="flex items-center gap-2">
							<RadioGroup.Item value={opt} id={`keperluan-${opt}`} />
							<Label for={`keperluan-${opt}`}>{opt}</Label>
						</div>
					{/each}
				</RadioGroup.Root>
				{#if errors.keperluan}
					<Field.Error>{errors.keperluan}</Field.Error>
				{/if}
			</Field.Field>

			{#if showKeperluanLainnya}
				<Field.Field
					data-invalid={errors.keperluan_lainnya ? true : undefined}
					class="md:col-span-2"
				>
					<Field.Label for="keperluanLainnya">16. Tuliskan keperluan kunjungan Anda *</Field.Label>
					<Textarea
						id="keperluanLainnya"
						name="keperluanLainnya"
						placeholder="Tuliskan keperluan"
						bind:value={form.keperluanLainnya}
						aria-invalid={errors.keperluan_lainnya ? true : undefined}
						data-invalid={errors.keperluan_lainnya ? 'true' : undefined}
						rows={3}
					/>
					{#if errors.keperluan_lainnya}
						<Field.Error>{errors.keperluan_lainnya}</Field.Error>
					{/if}
				</Field.Field>
			{/if}
		</form>
	</Card.Content>
	<Card.Footer class="justify-end gap-2">
		<Button type="button" variant="outline" class="text-xs" onclick={handleReset}>Reset</Button>
		<Button type="submit" form="guest-form" class="text-xs" disabled={isSubmitting}>
			{isSubmitting ? 'Menyimpan...' : 'Simpan Kunjungan'}
		</Button>
	</Card.Footer>
</Card.Root>
