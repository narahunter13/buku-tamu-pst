import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const guestSchema = z
	.object({
		nama: z.string().min(1, 'Nama wajib diisi').trim(),
		gender: z.enum(['Laki-laki', 'Perempuan'], {
			errorMap: () => ({ message: 'Jenis kelamin wajib dipilih' })
		}),
		instansi: z.string().min(1, 'Instansi wajib diisi').trim(),
		hp: z.string().regex(/^[0-9]{8,15}$/, 'HP harus 8-15 digit'),
		email: z.string().trim().email('Email tidak valid'),
		pekerjaan: z.enum(
			[
				'Pelajar/Mahasiswa',
				'Peneliti/Dosen',
				'ASN/TNI/Polri',
				'Pegawai BUMN/BUMD',
				'Pegawai Swasta',
				'Wiraswasta',
				'Lainnya'
			],
			{ errorMap: () => ({ message: 'Pekerjaan wajib dipilih' }) }
		),
		pekerjaan_lainnya: z.string().nullable(),
		tahun_lahir: z
			.number()
			.int()
			.min(1940, 'Tahun minimal 1940')
			.max(currentYear, `Tahun maksimal ${currentYear}`),
		pendidikan: z.enum(
			[
				'Tidak/Belum Sekolah',
				'SD/Sederajat',
				'SMP/Sederajat',
				'SMA/Sederajat',
				'D1/D2/D3',
				'D4/S1',
				'S2',
				'S3'
			],
			{ errorMap: () => ({ message: 'Pendidikan wajib dipilih' }) }
		),
		negara: z.string().min(1, 'Negara wajib diisi').trim(),
		provinsi: z.string().nullable(),
		kab_kota: z.string().min(1, 'Kabupaten/Kota wajib diisi').trim(),
		disabilitas: z.enum(['Ya', 'Tidak'], {
			errorMap: () => ({ message: 'Disabilitas wajib dipilih' })
		}),
		tipe_disabilitas: z
			.enum(['Fisik', 'Intelektual', 'Mental', 'Sensorik'], {
				errorMap: () => ({ message: 'Tipe disabilitas wajib dipilih' })
			})
			.nullable(),
		keperluan: z.enum(
			[
				'Kunjungan Perpustakaan',
				'Pembelian Produk Statistik Berbayar',
				'Konsultansi Statistik',
				'Rekomendasi Kegiatan Statistik',
				'Cek Desil DTSEN',
				'Update Data untuk DTSEN',
				'Lainnya'
			],
			{ errorMap: () => ({ message: 'Keperluan wajib dipilih' }) }
		),
		keperluan_lainnya: z.string().nullable()
	})
	.superRefine((data, ctx) => {
		if (data.pekerjaan === 'Lainnya') {
			if (!data.pekerjaan_lainnya || data.pekerjaan_lainnya.trim().length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['pekerjaan_lainnya'],
					message: 'Pekerjaan lainnya wajib diisi jika memilih Lainnya'
				});
			}
		} else {
			if (data.pekerjaan_lainnya !== null && data.pekerjaan_lainnya.trim().length > 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['pekerjaan_lainnya'],
					message: 'Pekerjaan lainnya harus kosong jika bukan Lainnya'
				});
			}
		}

		if (data.keperluan === 'Lainnya') {
			if (!data.keperluan_lainnya || data.keperluan_lainnya.trim().length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['keperluan_lainnya'],
					message: 'Keperluan lainnya wajib diisi jika memilih Lainnya'
				});
			}
		} else {
			if (data.keperluan_lainnya !== null && data.keperluan_lainnya.trim().length > 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['keperluan_lainnya'],
					message: 'Keperluan lainnya harus kosong jika bukan Lainnya'
				});
			}
		}

		if (data.disabilitas === 'Ya') {
			if (!data.tipe_disabilitas) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['tipe_disabilitas'],
					message: 'Tipe disabilitas wajib diisi jika Ya'
				});
			}
		} else {
			if (data.tipe_disabilitas !== null) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['tipe_disabilitas'],
					message: 'Tipe disabilitas harus kosong jika Tidak'
				});
			}
		}

		if (data.negara === 'Indonesia') {
			if (!data.provinsi || data.provinsi.trim().length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['provinsi'],
					message: 'Provinsi wajib diisi jika negara Indonesia'
				});
			}
		} else {
			if (data.provinsi !== null) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['provinsi'],
					message: 'Provinsi harus kosong jika negara bukan Indonesia'
				});
			}
		}
	});

export type GuestFormData = z.infer<typeof guestSchema>;

export const parseGuest = (data: unknown) => guestSchema.safeParse(data);

export const parseGuestOrThrow = (data: unknown) => guestSchema.parse(data);
