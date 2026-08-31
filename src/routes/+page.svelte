<script lang="ts">
	import GuestForm from '$lib/components/guest/GuestForm.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="min-h-screen bg-background">
	<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
		<div class="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
			<a href="/" class="text-xs font-semibold">BPS Kota Pagar Alam - PST</a>
			<nav class="flex items-center gap-1">
				<Button href="/" variant="secondary" size="sm">Form</Button>
				<Button href="/daftar" variant="ghost" size="sm">Daftar</Button>
				<Button href="/statistik" variant="ghost" size="sm">Statistik</Button>
			</nav>
		</div>
	</header>
	<main class="mx-auto max-w-[1200px] px-4 py-24">
		<GuestForm />
	</main>
</div>
