<script lang="ts">
	import { Minus, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { isTauri } from '@tauri-apps/api/core';
	import { onMount } from 'svelte';
	import { closeWindowWithConfirm, minimizeWindow } from '$lib/utils/window';

	let isTauriEnv = $state(false);

	onMount(() => {
		try {
			isTauriEnv = isTauri();
		} catch {
			isTauriEnv = false;
		}
	});
</script>

{#if isTauriEnv}
	<div
		data-tauri-drag-region
		class="flex h-8 w-full shrink-0 items-center justify-end border-b bg-paper select-none"
		aria-label="Title bar"
	>
		<div class="flex h-full">
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-10 rounded-none hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
				aria-label="Minimize"
				title="Minimize"
				onclick={minimizeWindow}
				data-tauri-drag-region="false"
			>
				<Minus class="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-10 rounded-none hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
				aria-label="Close"
				title="Close"
				onclick={closeWindowWithConfirm}
				data-tauri-drag-region="false"
			>
				<X class="size-4" />
			</Button>
		</div>
	</div>
{/if}
