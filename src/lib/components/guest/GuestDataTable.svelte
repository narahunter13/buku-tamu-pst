<script lang="ts">
	import { createTable, FlexRender } from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import type { GuestVisit } from '$lib/types';
	import { features } from './data-table-features';
	import { createGuestColumns } from './columns';

	let {
		data,
		onView
	}: {
		data: GuestVisit[];
		onView: (visit: GuestVisit) => void;
	} = $props();

	const columns = $derived(createGuestColumns(onView));

	const table = createTable({
		features,
		get data() {
			return data;
		},
		get columns() {
			return columns;
		}
	});

	const pagination = $derived(table.atoms.pagination.get());
	const pageCount = $derived(table.getPageCount());
	const canPrev = $derived(table.getCanPreviousPage());
	const canNext = $derived(table.getCanNextPage());
	const rows = $derived(table.getRowModel().rows);
	const totalRows = $derived(table.getFilteredRowModel().rows.length);

	const getColWidth = (colDef: unknown): number => {
		const meta = (colDef as { meta?: { width?: number } })?.meta;
		return meta?.width ?? 140;
	};

	let pageSizeValue = $state('10');

	const handlePageSizeChange = (value: string): void => {
		pageSizeValue = value;
		const n = Number(value);
		if (!Number.isNaN(n)) table.setPageSize(n);
	};

	const handlePrev = (): void => {
		table.previousPage();
	};

	const handleNext = (): void => {
		table.nextPage();
	};

	$effect(() => {
		void data.length;
		table.setPageIndex(0);
	});
</script>

<div class="overflow-hidden rounded-sm border bg-card">
	<div class="scrollbar-thin overflow-x-auto">
		<table class="w-max min-w-full caption-bottom text-sm">
			<Table.Header class="sticky top-0 z-10 bg-muted/30">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head
								class={header.column.id === 'no'
									? 'px-2 text-center text-xs font-medium whitespace-nowrap text-foreground'
									: 'px-2 text-xs font-medium whitespace-nowrap text-foreground'}
								style="min-width: {getColWidth(header.column.columnDef)}px; width: {getColWidth(
									header.column.columnDef
								)}px"
							>
								{#if !header.isPlaceholder}
									<FlexRender {header} />
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each rows as row (row.id)}
					<Table.Row>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell
								class={cell.column.id === 'no'
									? 'justify-center px-2 py-2 text-center align-middle text-xs whitespace-nowrap'
									: 'px-2 py-2 align-middle text-xs whitespace-nowrap'}
								style="min-width: {getColWidth(cell.column.columnDef)}px; width: {getColWidth(
									cell.column.columnDef
								)}px"
							>
								<FlexRender {cell} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell
							colspan={columns.length}
							class="h-24 text-center text-xs text-muted-foreground"
						>
							No results.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</table>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-2 border-t p-2 px-4">
		<div class="flex items-center gap-2">
			<p class="text-xs text-muted-foreground">
				Halaman {pagination.pageIndex + 1} dari {Math.max(1, pageCount)} - menampilkan {rows.length} dari
				{totalRows} data
			</p>
			<div class="hidden items-center gap-1 sm:flex">
				<span class="text-xs text-muted-foreground">Rows per page</span>
				<Select.Root type="single" value={pageSizeValue} onValueChange={handlePageSizeChange}>
					<Select.Trigger class="h-7 w-20 text-xs">
						<span data-slot="select-value">{pageSizeValue}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="5" label="5">5</Select.Item>
						<Select.Item value="10" label="10">10</Select.Item>
						<Select.Item value="20" label="20">20</Select.Item>
						<Select.Item value="50" label="50">50</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				class="h-8 text-xs"
				disabled={!canPrev}
				onclick={handlePrev}
			>
				Prev
			</Button>
			<span class="text-xs tabular-nums">{pagination.pageIndex + 1} / {Math.max(1, pageCount)}</span
			>
			<Button
				variant="outline"
				size="sm"
				class="h-8 text-xs"
				disabled={!canNext}
				onclick={handleNext}
			>
				Next
			</Button>
		</div>
	</div>
</div>
