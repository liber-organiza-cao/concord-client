<script>
	import WebRtcPeer from "$lib/components/webRtcPeer.svelte";
	import { voiceData } from "$lib/voice.svelte";
	import { connection } from "$lib/ws.svelte";
	import "../app.css";
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $props();
</script>

<div>
	{#each voiceData.voicePeers ?? [] as peerId}
		{#if peerId != connection.id}
			<WebRtcPeer {peerId} />
		{/if}
	{/each}
</div>
{@render children?.()}
