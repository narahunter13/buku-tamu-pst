<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	let pathname = $derived(page.url.pathname);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster />

<header
	class="sticky top-0 z-10 border-b bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
>
	<div class="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
		<a href="/" class="flex items-center gap-2 text-xs font-semibold tracking-tight text-graphite"
			>Buku Tamu PST</a
		>
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
		</nav>
	</div>
</header>

<main class="mx-auto max-w-[1200px] px-4 py-6 md:py-8">
	{#key pathname}
		<div in:fade={{ duration: 150 }} out:fade={{ duration: 100 }}>
			{@render children()}
		</div>
	{/key}
</main>
