<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { guestStore } from '$lib/stores/guests.svelte';
	import { setupCloseHandler } from '$lib/utils/window';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { isTauri } from '@tauri-apps/api/core';

	let { children } = $props();

	let didInit = $state(false);

	let pathname = $derived(page.url.pathname);

	const setupNativeGuards = (): (() => void) => {
		if (typeof document === 'undefined') return () => {};
		const onContextMenu = (e: MouseEvent): void => {
			e.preventDefault();
		};
		const onDragStart = (e: DragEvent): void => {
			e.preventDefault();
		};
		const onDragOver = (e: DragEvent): void => {
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
		};
		const onDrop = (e: DragEvent): void => {
			e.preventDefault();
		};
		const onKeyDown = (e: KeyboardEvent): void => {
			const k = e.key.toLowerCase();
			if (
				e.key === 'F5' ||
				e.key === 'F12' ||
				(e.ctrlKey && k === 'r') ||
				(e.ctrlKey && e.shiftKey && k === 'i') ||
				(e.ctrlKey && k === 'u') ||
				(e.ctrlKey && k === 's') ||
				(e.ctrlKey && k === 'p')
			) {
				e.preventDefault();
			}
		};
		const allowSelect = (target: EventTarget | null): boolean => {
			if (!(target instanceof HTMLElement)) return false;
			return !!target.closest('input, textarea, [contenteditable="true"]');
		};
		const onSelectStart = (e: Event): void => {
			if (!allowSelect(e.target)) e.preventDefault();
		};
		document.addEventListener('contextmenu', onContextMenu);
		document.addEventListener('dragstart', onDragStart);
		document.addEventListener('selectstart', onSelectStart);
		window.addEventListener('dragover', onDragOver);
		window.addEventListener('drop', onDrop);
		document.addEventListener('keydown', onKeyDown);
		document.documentElement.setAttribute('data-tauri-native', 'true');
		return () => {
			document.removeEventListener('contextmenu', onContextMenu);
			document.removeEventListener('dragstart', onDragStart);
			document.removeEventListener('selectstart', onSelectStart);
			window.removeEventListener('dragover', onDragOver);
			window.removeEventListener('drop', onDrop);
			document.removeEventListener('keydown', onKeyDown);
		};
	};

	onMount(() => {
		try {
			isTauri();
		} catch {
			// ignore
		}
		if (!didInit) {
			didInit = true;
			guestStore.init();
			setupCloseHandler();
		}
		const cleanup = setupNativeGuards();
		return cleanup;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster />

<div class="flex h-dvh h-screen min-h-0 flex-col bg-paper">
	<TitleBar />

	<div
		id="app-scroll"
		class="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-paper [scrollbar-gutter:stable]"
	>
		<header
			class="sticky top-0 z-10 border-b bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
		>
			<div class="flex w-full items-center justify-between px-4 py-3">
				<nav class="flex items-center gap-1" aria-label="Navigasi utama">
					<Button
						href="/"
						variant={pathname === '/' ? 'secondary' : 'ghost'}
						size="sm"
						aria-current={pathname === '/' ? 'page' : undefined}>Form</Button
					>
					<Button
						href="/daftar"
						variant={pathname === '/daftar' ? 'secondary' : 'ghost'}
						size="sm"
						aria-current={pathname === '/daftar' ? 'page' : undefined}>Daftar</Button
					>
					<Button
						href="/statistik"
						variant={pathname === '/statistik' ? 'secondary' : 'ghost'}
						size="sm"
						aria-current={pathname === '/statistik' ? 'page' : undefined}>Statistik</Button
					>
					<Button
						href="/rekap"
						variant={pathname === '/rekap' ? 'secondary' : 'ghost'}
						size="sm"
						aria-current={pathname === '/rekap' ? 'page' : undefined}>Rekap</Button
					>
					<Button
						href="/pengaturan"
						variant={pathname === '/pengaturan' ? 'secondary' : 'ghost'}
						size="sm"
						aria-current={pathname === '/pengaturan' ? 'page' : undefined}
						>Pengaturan</Button
					>
				</nav>
			</div>
		</header>

		<main class="w-full flex-1 p-4 pb-2">
			{#if guestStore.loading}
				<div
					class="fixed inset-0 z-50 flex items-center justify-center bg-paper/90 backdrop-blur-sm transition-opacity duration-200"
				>
					<div class="flex flex-col items-center gap-3">
						<div class="size-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink"></div>
						<p class="text-sm text-muted-foreground">Memuat data...</p>
					</div>
				</div>
			{/if}
			{#key pathname}
				<div in:fade={{ duration: 150 }} out:fade={{ duration: 100 }}>
					{@render children()}
				</div>
			{/key}
		</main>
	</div>
</div>
