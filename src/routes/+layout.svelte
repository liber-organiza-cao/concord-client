<script>
	import { activeVoice, voiceChannelPeers } from "$lib/voice.svelte";
	import WebRtcConnect from "$lib/components/webRtcConnect.svelte";
	import "../app.css";
	import { connection } from "$lib/ws.svelte";
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

{#each activeVoice.connectedUsers ?? [] as id}
	{#if id != connection.id}
		<WebRtcConnect {id} />
	{/if}
{/each}

{@render children?.()}
