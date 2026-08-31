<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	bind:ref
	data-slot="command-list"
	class={cn(
		'data-[state=open]:animate-in data-[state=open]:fade-in-0 max-h-72 scroll-py-1 scrollbar-thin overflow-x-hidden overflow-y-auto duration-200 ease-out outline-none',
		className
	)}
	{...restProps}
/>
