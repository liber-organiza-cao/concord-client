<script lang="ts">
	import type { Snippet } from "svelte";

	const {
		children,
		disabled,
		onclick
	}: { children: Snippet; disabled?: boolean; onclick?: () => any } = $props();
</script>

<button
	{disabled}
	{onclick}
	class="{disabled
		? 'disabled:bg-gray-500'
		: 'bg-orange-400 hover:bg-orange-300'} rounded-md p-2 font-bold text-black"
>
	{@render children?.()}
</button>
