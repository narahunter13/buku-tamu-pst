import { createColumnHelper, renderComponent, renderSnippet } from '@tanstack/svelte-table';
import { createRawSnippet } from 'svelte';
import type { GuestVisit } from '$lib/types';
import type { DataTableFeatures } from './data-table-features';
import GuestDataTableActions from './GuestDataTableActions.svelte';

const columnHelper = createColumnHelper<DataTableFeatures, GuestVisit>();

type ColMeta = { width: number };

export const createGuestColumns = (onView: (visit: GuestVisit) => void) =>
	columnHelper.columns([
		columnHelper.display({
			id: 'no',
			header: 'No',
			enableHiding: false,
			meta: { width: 72 } as ColMeta,
			cell: ({ row }) => {
				const n = row.index + 1;
				const snippet = createRawSnippet<[{ n: number }]>((getN) => {
					const { n } = getN();
					return {
						render: () =>
							`<div class="flex justify-center text-center tabular-nums text-sm whitespace-nowrap">${n}</div>`
					};
				});
				return renderSnippet(snippet, { n });
			}
		}),
		columnHelper.accessor('nama', {
			header: 'Nama',
			meta: { width: 160 } as ColMeta,
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ v: string }]>((getV) => {
					const { v } = getV();
					const safe = v.replace(/</g, '&lt;').replace(/>/g, '&gt;');
					return {
						render: () =>
							`<div class="text-sm whitespace-nowrap font-medium truncate max-w-[160px]">${safe}</div>`
					};
				});
				return renderSnippet(snippet, { v: row.original.nama });
			}
		}),
		columnHelper.accessor('gender', {
			header: 'Gender',
			meta: { width: 140 } as ColMeta,
			cell: ({ row }) => {
				const g = row.original.gender;
				const snippet = createRawSnippet<[{ gender: string }]>((getG) => {
					const { gender } = getG();
					const isPerempuan = gender === 'Perempuan';
					const cls = isPerempuan
						? 'bg-secondary text-secondary-foreground'
						: 'bg-background text-foreground border border-border';
					return {
						render: () =>
							`<span class="inline-flex items-center justify-center rounded-sm px-2 py-0.5 text-sm font-medium whitespace-nowrap ${cls}">${gender}</span>`
					};
				});
				return renderSnippet(snippet, { gender: g });
			}
		}),
		columnHelper.accessor('instansi', {
			header: 'Instansi',
			meta: { width: 160 } as ColMeta,
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ v: string }]>((getV) => {
					const { v } = getV();
					const safe = v.replace(/</g, '&lt;').replace(/>/g, '&gt;');
					return {
						render: () =>
							`<div class="text-sm whitespace-nowrap truncate max-w-[160px]" title="${safe}">${safe}</div>`
					};
				});
				return renderSnippet(snippet, { v: row.original.instansi });
			}
		}),
		columnHelper.accessor(
			(row) =>
				row.pekerjaan === 'Lainnya' && row.pekerjaan_lainnya
					? `Lainnya: ${row.pekerjaan_lainnya}`
					: row.pekerjaan,
			{
				id: 'pekerjaan',
				header: 'Pekerjaan',
				meta: { width: 160 } as ColMeta,
				cell: ({ getValue }) => {
					const v = getValue() as string;
					const snippet = createRawSnippet<[{ v: string }]>((getV) => {
						const { v: val } = getV();
						const safe = val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
						return {
							render: () =>
								`<div class="text-sm whitespace-nowrap truncate max-w-[160px]" title="${safe}">${safe}</div>`
						};
					});
					return renderSnippet(snippet, { v });
				}
			}
		),
		columnHelper.accessor(
			(row) =>
				row.keperluan === 'Lainnya' && row.keperluan_lainnya
					? `Lainnya: ${row.keperluan_lainnya}`
					: row.keperluan,
			{
				id: 'keperluan',
				header: 'Keperluan',
				meta: { width: 180 } as ColMeta,
				cell: ({ getValue }) => {
					const v = getValue() as string;
					const snippet = createRawSnippet<[{ v: string }]>((getV) => {
						const { v: val } = getV();
						const safe = val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
						return {
							render: () =>
								`<span class="inline-flex items-center justify-center rounded-sm bg-secondary text-secondary-foreground px-2 py-0.5 text-sm font-medium whitespace-nowrap truncate max-w-[160px]" title="${safe}">${safe}</span>`
						};
					});
					return renderSnippet(snippet, { v });
				}
			}
		),
		columnHelper.accessor('tahun_lahir', {
			header: 'Tahun Lahir',
			meta: { width: 140 } as ColMeta,
			cell: ({ getValue }) => {
				const v = String(getValue());
				const snippet = createRawSnippet<[{ v: string }]>((getV) => {
					const { v: val } = getV();
					return {
						render: () => `<div class="text-sm whitespace-nowrap tabular-nums">${val}</div>`
					};
				});
				return renderSnippet(snippet, { v });
			}
		}),
		columnHelper.accessor('kab_kota', {
			header: 'Kab/Kota',
			meta: { width: 140 } as ColMeta,
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ v: string }]>((getV) => {
					const { v } = getV();
					const safe = v.replace(/</g, '&lt;').replace(/>/g, '&gt;');
					return {
						render: () =>
							`<div class="text-sm whitespace-nowrap truncate max-w-[140px]" title="${safe}">${safe}</div>`
					};
				});
				return renderSnippet(snippet, { v: row.original.kab_kota });
			}
		}),
		columnHelper.accessor('visit_date', {
			header: 'Tanggal',
			meta: { width: 140 } as ColMeta,
			cell: ({ getValue }) => {
				const v = String(getValue());
				const snippet = createRawSnippet<[{ v: string }]>((getV) => {
					const { v: val } = getV();
					return {
						render: () => `<div class="text-sm whitespace-nowrap tabular-nums">${val}</div>`
					};
				});
				return renderSnippet(snippet, { v });
			}
		}),
		columnHelper.display({
			id: 'aksi',
			header: 'Aksi',
			enableHiding: false,
			meta: { width: 100 } as ColMeta,
			cell: ({ row }) => renderComponent(GuestDataTableActions, { visit: row.original, onView })
		})
	]);
