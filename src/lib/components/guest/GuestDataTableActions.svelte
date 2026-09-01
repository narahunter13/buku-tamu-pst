<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { GuestVisit } from '$lib/types';

	let {
		visit,
		onView
	}: {
		visit: GuestVisit;
		onView: (visit: GuestVisit) => void;
	} = $props();

	const handleClick = (): void => {
		onView(visit);
	};
</script>

<Button variant="outline" size="sm" class="h-7 text-sm" onclick={handleClick}>Detail</Button>
