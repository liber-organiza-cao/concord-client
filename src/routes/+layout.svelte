<script>
	import WebRtcPeer from "$lib/components/webRtcPeer.svelte";
	import { voiceData } from "$lib/voice.svelte";
	import { connection } from "$lib/ws.svelte";
	import { onMount, tick } from "svelte";
	import "../app.css";
	import Toast, { push } from "$lib/components/toast.svelte";
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $props();

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
</script>

<div>
	{#key voiceData.currentChannel}
		{#each voiceData.voicePeers ?? [] as peerId}
			{#if peerId != connection.id}
				<WebRtcPeer {peerId} />
			{/if}
		{/each}
	{/key}
</div>
<Toast />
{@render children?.()}
