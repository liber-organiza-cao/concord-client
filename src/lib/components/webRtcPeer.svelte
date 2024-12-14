<script lang="ts">
	import { voiceData } from "$lib/voice.svelte";
	import { onWsMessage, sendWsMessage, type Tid } from "$lib/ws.svelte";
	import { onMount } from "svelte";

	const { peerId }: { peerId: number } = $props();
	const { localStream, offerQueue, servers } = voiceData;

	let video: HTMLVideoElement;

	const remoteStream = new MediaStream();
	const peerConnection = new RTCPeerConnection(servers);

	const messageHandler: Record<string, (e: any) => any> = {
		async Offer({ id: otherPeerId, data }: Tid<RTCSessionDescriptionInit>) {
			if (otherPeerId != peerId) return;

			console.log(`[receive Offer]: peerId: ${peerId}, data: ${JSON.stringify(data)}`);
			await peerConnection.setRemoteDescription(data);
			await createAnswer();
		},
		async Answer({ id: otherPeerId, data }: Tid<RTCSessionDescriptionInit>) {
			if (otherPeerId != peerId) return;

			console.log(`[receive Answer]: peerId: ${peerId}, data: ${JSON.stringify(data)}`);
			await peerConnection.setRemoteDescription(data);
		},
		async Candidate({ id: otherPeerId, data }: Tid<RTCIceCandidateInit>) {
			if (otherPeerId != peerId) return;

			console.log(`[receive Candidate]: peerId: ${peerId}, data: ${JSON.stringify(data)}`);
			await peerConnection.addIceCandidate(new RTCIceCandidate(data));
		}
	};

	async function createOffer() {
		const data = await peerConnection.createOffer();
		console.log(`[create Offer]: peerId: ${peerId}, data: ${JSON.stringify(data)}`);
		peerConnection.setLocalDescription(data);
		sendWsMessage("Offer", { id: peerId, data });
	}

	async function createAnswer() {
		const data = await peerConnection.createAnswer();
		console.log(`[create Answer]: peerId: ${peerId}, data: ${JSON.stringify(data)}`);
		peerConnection.setLocalDescription(data);
		sendWsMessage("Answer", { id: peerId, data });
	}

	onMount(async () => {
		peerConnection.ontrack = (event) => {
			event.streams.forEach((stream) => {
				stream.getTracks().forEach((track) => {
					remoteStream.addTrack(track);
				});
			});
			video.srcObject = remoteStream;
		};

		peerConnection.onicecandidate = (event) => {
			const data = event.candidate?.toJSON();
			if (data) {
				console.log(`[create Candidate]: peerId: ${peerId}, data: ${JSON.stringify(data)}`);
				sendWsMessage("Candidate", { id: peerId, data });
			}
		};

		peerConnection.onconnectionstatechange = () => {
			console.log(
				`[onconnectionstatechange]: peerId: ${peerId}, ${peerConnection.connectionState}`
			);
		};

		localStream.getTracks().forEach((track) => {
			peerConnection.addTrack(track, localStream!);
		});
		if (offerQueue.includes(peerId)) {
			await createOffer();
			const index = offerQueue.indexOf(peerId);
			offerQueue.splice(index);
		}
	});

	onWsMessage((type, data) => {
		if (messageHandler[type]) messageHandler[type](data);
	});
</script>

<div>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video bind:this={video} hidden autoplay playsinline controls></video>
</div>
