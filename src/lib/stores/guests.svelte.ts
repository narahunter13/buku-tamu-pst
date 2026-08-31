import { SvelteDate } from 'svelte/reactivity';
import type { GuestInput, GuestVisit } from '$lib/types';
import { dummyVisits } from '$lib/data/dummy';

const STORAGE_KEY = 'btpst_mock_visits';

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

export const createGuestStore = () => {
	let visits = $state.raw<GuestVisit[]>([]);

	const nextId = $derived(
		visits.length === 0 ? 1 : Math.max(...visits.map((v: GuestVisit) => v.id)) + 1
	);

	const persist = (data: GuestVisit[]): void => {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch {
			// ignore quota errors
		}
	};

	const init = (): void => {
		if (typeof window === 'undefined') return;
		const stored = loadFromStorage();
		if (stored && stored.length > 0) {
			visits = stored;
		} else {
			visits = [...dummyVisits];
			persist(visits);
		}
	};

	const add = (input: GuestInput): GuestVisit => {
		const now = new SvelteDate();
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
			visit_date: now.toISOString().split('T')[0] ?? '',
			created_at: now.toISOString()
		};
		visits = [...visits, newVisit];
		persist(visits);
		return newVisit;
	};

	const list = (): GuestVisit[] => visits;

	const clear = (): void => {
		visits = [];
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	};

	const resetToDummy = (): void => {
		visits = [...dummyVisits];
		persist(visits);
	};

	return {
		get visits(): GuestVisit[] {
			return visits;
		},
		get nextId(): number {
			return nextId;
		},
		add,
		list,
		init,
		clear,
		resetToDummy
	};
};

export const guestStore = createGuestStore();
