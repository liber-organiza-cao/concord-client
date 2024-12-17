<script lang="ts">
	import { onMount } from "svelte";

	const { stream }: { stream: MediaStream } = $props();
	let video: HTMLVideoElement;

	onMount(() => {
		video.srcObject = stream;
	});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video bind:this={video} hidden autoplay playsinline controls></video>
