<script lang="ts">
	import { streamManager } from "$lib/streamManager.svelte";
	import { onMount, tick, type Snippet } from "svelte";
	import "../app.css";
	import Toast, { push } from "$lib/components/toast.svelte";
	import { goto } from "$app/navigation";
	import AudioPeer from "$lib/components/AudioPeer.svelte";

	streamManager.init();

	let { children }: { children: Snippet } = $props();

	async function getUserMedia() {
		try {
			streamManager.getUserMedia({
				video: false,
				audio: true
			});
		} catch (e) {
			console.error(e);
			push("Please, accept permission");
			await tick();
			await getUserMedia();
		}
	}

	onMount(() => {
		getUserMedia();
	});

	if (!sessionStorage.getItem("seed")) {
		goto("/login");
	}
</script>

<div>
	{#key streamManager.currentChannel.id}
		{#each Object.entries(streamManager.voicePeerConnections) as [_, conn]}
			<AudioPeer stream={conn.stream} />
		{/each}
	{/key}
</div>
<Toast />
{@render children?.()}
