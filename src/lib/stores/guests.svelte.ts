import Database from '@tauri-apps/plugin-sql';
import { isTauri } from '@tauri-apps/api/core';
import { getNowJakartaParts } from '$lib/utils/date';
import type {
	Disabilitas,
	Gender,
	GuestInput,
	GuestVisit,
	Keperluan,
	Pekerjaan,
	Pendidikan,
	TipeDisabilitas
} from '$lib/types';
import { dummyVisits } from '$lib/data/dummy';

const STORAGE_KEY = 'btpst_mock_visits';

const INSERT_COLUMNS =
	'(nama,gender,instansi,hp,email,pekerjaan,pekerjaan_lainnya,tahun_lahir,pendidikan,negara,provinsi,kab_kota,disabilitas,tipe_disabilitas,keperluan,keperluan_lainnya)';
const INSERT_PLACEHOLDERS = '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16';
const INSERT_SQL = `INSERT INTO visits ${INSERT_COLUMNS} VALUES (${INSERT_PLACEHOLDERS})`;
const SELECT_ALL_SQL = 'SELECT * FROM visits ORDER BY created_at DESC, id DESC';

export const loadFromStorage = (): GuestVisit[] | null => {
	if (typeof window === 'undefined') return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as GuestVisit[];
		return Array.isArray(parsed) ? parsed : null;
	} catch {
		return null;
	}
};

const rowToVisit = (row: Record<string, unknown>): GuestVisit => ({
	id: Number(row.id),
	nama: String(row.nama),
	gender: row.gender as Gender,
	instansi: String(row.instansi),
	hp: String(row.hp),
	email: String(row.email),
	pekerjaan: row.pekerjaan as Pekerjaan,
	pekerjaan_lainnya: row.pekerjaan_lainnya == null ? null : String(row.pekerjaan_lainnya),
	tahun_lahir: Number(row.tahun_lahir),
	pendidikan: row.pendidikan as Pendidikan,
	negara: String(row.negara),
	provinsi: row.provinsi == null ? null : String(row.provinsi),
	kab_kota: String(row.kab_kota),
	disabilitas: row.disabilitas as Disabilitas,
	tipe_disabilitas:
		row.tipe_disabilitas == null ? null : (String(row.tipe_disabilitas) as TipeDisabilitas),
	keperluan: row.keperluan as Keperluan,
	keperluan_lainnya: row.keperluan_lainnya == null ? null : String(row.keperluan_lainnya),
	visit_date: String(row.visit_date),
	created_at: String(row.created_at)
});

const insertParams = (input: GuestInput): (string | number | null)[] => [
	input.nama,
	input.gender,
	input.instansi,
	input.hp,
	input.email,
	input.pekerjaan,
	input.pekerjaan_lainnya,
	input.tahun_lahir,
	input.pendidikan,
	input.negara,
	input.provinsi,
	input.kab_kota,
	input.disabilitas,
	input.tipe_disabilitas,
	input.keperluan,
	input.keperluan_lainnya
];

export const createGuestStore = () => {
	let visits = $state.raw<GuestVisit[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let db: Database | null = $state(null);

	const nextId = $derived(
		visits.length === 0 ? 1 : Math.max(...visits.map((v: GuestVisit) => v.id)) + 1
	);

	const isTauriEnv = (): boolean => {
		if (typeof window === 'undefined') return false;
		try {
			return isTauri();
		} catch {
			return false;
		}
	};

	const persist = (data: GuestVisit[]): void => {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch {
			// ignore quota errors
		}
	};

	const initLocalStorage = (): void => {
		const stored = loadFromStorage();
		if (stored && stored.length > 0) {
			visits = stored;
		} else {
			visits = [...dummyVisits];
			persist(visits);
		}
	};

	const refresh = async (): Promise<void> => {
		if (db) {
			const rows = await db.select<Record<string, unknown>[]>(SELECT_ALL_SQL);
			visits = rows.map(rowToVisit);
		}
	};

	const seedIfEmpty = async (): Promise<void> => {
		if (!db) return;
		const countRows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM visits');
		if (countRows[0]?.count === 0) {
			for (const dummy of dummyVisits) {
				await db.execute(INSERT_SQL, insertParams(dummy));
			}
		}
	};

	const init = async (): Promise<void> => {
		loading = true;
		error = null;
		try {
			if (isTauriEnv()) {
				db = await Database.load('sqlite:buku-tamu.db');
				await db.execute('PRAGMA journal_mode=WAL');
				await seedIfEmpty();
				await refresh();
			} else {
				initLocalStorage();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			loading = false;
		}
	};

	const add = async (input: GuestInput): Promise<GuestVisit> => {
		if (isTauriEnv() && db) {
			await db.execute(INSERT_SQL, insertParams(input));
			const rows = await db.select<Record<string, unknown>[]>(
				'SELECT * FROM visits WHERE id = last_insert_rowid()'
			);
			const created = rows[0] ? rowToVisit(rows[0]) : mappedFromInput(input);
			await refresh();
			return created;
		}
		const jakarta = getNowJakartaParts();
		const newVisit: GuestVisit = {
			id: nextId,
			nama: input.nama,
			gender: input.gender,
			instansi: input.instansi,
			hp: input.hp,
			email: input.email,
			pekerjaan: input.pekerjaan,
			pekerjaan_lainnya: input.pekerjaan_lainnya,
			tahun_lahir: input.tahun_lahir,
			pendidikan: input.pendidikan,
			negara: input.negara,
			provinsi: input.provinsi,
			kab_kota: input.kab_kota,
			disabilitas: input.disabilitas,
			tipe_disabilitas: input.tipe_disabilitas,
			keperluan: input.keperluan,
			keperluan_lainnya: input.keperluan_lainnya,
			visit_date: jakarta.visit_date,
			created_at: jakarta.created_at
		};
		visits = [...visits, newVisit];
		persist(visits);
		return newVisit;
	};

	const list = async (): Promise<GuestVisit[]> => {
		if (isTauriEnv() && db) {
			await refresh();
		}
		return visits;
	};

	const clear = async (): Promise<void> => {
		if (isTauriEnv() && db) {
			await db.execute('DELETE FROM visits');
			visits = [];
			return;
		}
		visits = [];
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	};

	const resetToDummy = async (): Promise<void> => {
		if (isTauriEnv() && db) {
			await db.execute('DELETE FROM visits');
			for (const dummy of dummyVisits) {
				await db.execute(INSERT_SQL, insertParams(dummy));
			}
			await refresh();
			return;
		}
		visits = [...dummyVisits];
		persist(visits);
	};

	const mappedFromInput = (input: GuestInput): GuestVisit => {
		const jakarta = getNowJakartaParts();
		return {
			id: nextId,
			nama: input.nama,
			gender: input.gender,
			instansi: input.instansi,
			hp: input.hp,
			email: input.email,
			pekerjaan: input.pekerjaan,
			pekerjaan_lainnya: input.pekerjaan_lainnya,
			tahun_lahir: input.tahun_lahir,
			pendidikan: input.pendidikan,
			negara: input.negara,
			provinsi: input.provinsi,
			kab_kota: input.kab_kota,
			disabilitas: input.disabilitas,
			tipe_disabilitas: input.tipe_disabilitas,
			keperluan: input.keperluan,
			keperluan_lainnya: input.keperluan_lainnya,
			visit_date: jakarta.visit_date,
			created_at: jakarta.created_at
		};
	};

	return {
		get visits(): GuestVisit[] {
			return visits;
		},
		get nextId(): number {
			return nextId;
		},
		get loading(): boolean {
			return loading;
		},
		get error(): string | null {
			return error;
		},
		get isTauri(): boolean {
			return isTauriEnv();
		},
		add,
		list,
		init,
		refresh,
		clear,
		resetToDummy
	};
};

export const guestStore = createGuestStore();
