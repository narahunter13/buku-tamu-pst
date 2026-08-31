export type Gender = 'Laki-laki' | 'Perempuan';

export type Pekerjaan =
	| 'Pelajar/Mahasiswa'
	| 'Peneliti/Dosen'
	| 'ASN/TNI/Polri'
	| 'Pegawai BUMN/BUMD'
	| 'Pegawai Swasta'
	| 'Wiraswasta'
	| 'Lainnya';

export type Pendidikan =
	| 'Tidak/Belum Sekolah'
	| 'SD/Sederajat'
	| 'SMP/Sederajat'
	| 'SMA/Sederajat'
	| 'D1/D2/D3'
	| 'D4/S1'
	| 'S2'
	| 'S3';

export type Disabilitas = 'Ya' | 'Tidak';

export type TipeDisabilitas = 'Fisik' | 'Intelektual' | 'Mental' | 'Sensorik';

export type Keperluan =
	| 'Kunjungan Perpustakaan'
	| 'Pembelian Produk Statistik Berbayar'
	| 'Konsultansi Statistik'
	| 'Rekomendasi Kegiatan Statistik'
	| 'Cek Desil DTSEN'
	| 'Update Data untuk DTSEN'
	| 'Lainnya';

export type GuestVisit = {
	id: number;
	nama: string;
	gender: Gender;
	instansi: string;
	hp: string;
	email: string;
	pekerjaan: Pekerjaan;
	pekerjaan_lainnya: string | null;
	tahun_lahir: number;
	pendidikan: Pendidikan;
	negara: string;
	provinsi: string | null;
	kab_kota: string;
	disabilitas: Disabilitas;
	tipe_disabilitas: TipeDisabilitas | null;
	keperluan: Keperluan;
	keperluan_lainnya: string | null;
	visit_date: string;
	created_at: string;
};

export type GuestInput = Omit<GuestVisit, 'id' | 'visit_date' | 'created_at'>;

export const isGender = (v: string): v is Gender => v === 'Laki-laki' || v === 'Perempuan';

export const isPekerjaan = (v: string): v is Pekerjaan =>
	(
		[
			'Pelajar/Mahasiswa',
			'Peneliti/Dosen',
			'ASN/TNI/Polri',
			'Pegawai BUMN/BUMD',
			'Pegawai Swasta',
			'Wiraswasta',
			'Lainnya'
		] as const
	).includes(v as Pekerjaan);

export const isPendidikan = (v: string): v is Pendidikan =>
	(
		[
			'Tidak/Belum Sekolah',
			'SD/Sederajat',
			'SMP/Sederajat',
			'SMA/Sederajat',
			'D1/D2/D3',
			'D4/S1',
			'S2',
			'S3'
		] as const
	).includes(v as Pendidikan);
