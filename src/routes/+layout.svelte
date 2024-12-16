<script lang="ts">
	import WebRtcPeer from "$lib/components/webRtcPeer.svelte";
	import { voiceData } from "$lib/voice.svelte";
	import { connection } from "$lib/ws.svelte";
	import { onMount, tick, type Snippet } from "svelte";
	import "../app.css";
	import Toast, { push } from "$lib/components/toast.svelte";
	import { goto } from "$app/navigation";

	let { children }: { children: Snippet } = $props();

	async function getUserMedia() {
		try {
			voiceData.getUserMedia({
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
	{#key voiceData.currentChannel.id}
		{#each voiceData.voicePeers ?? [] as peerId}
			{#if peerId != connection.id}
				<WebRtcPeer {peerId} />
			{/if}
		{/each}
	{/key}
</div>
<Toast />
{@render children?.()}
