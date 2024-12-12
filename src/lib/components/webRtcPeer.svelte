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

			console.log("[receive Offer]", data);
			await peerConnection.setRemoteDescription(data);
			await createAnswer();
		},
		async Answer({ id: otherPeerId, data }: Tid<RTCSessionDescriptionInit>) {
			if (otherPeerId != peerId) return;

			console.log("[receive Answer]", data);
			await peerConnection.setRemoteDescription(data);
		},
		async Candidate({ id: otherPeerId, data }: Tid<RTCIceCandidateInit>) {
			if (otherPeerId != peerId) return;

			console.log("[receive Candidate]", data);
			await peerConnection.addIceCandidate(new RTCIceCandidate(data));
		}
	};

	async function createOffer() {
		const data = await peerConnection.createOffer();
		console.log("[create Offer]", data);
		peerConnection.setLocalDescription(data);
		sendWsMessage("Offer", { id: peerId, data });
	}

	async function createAnswer() {
		const data = await peerConnection.createAnswer();
		console.log("[create Answer]", data);
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
			const candidate = event.candidate?.toJSON();
			if (candidate) {
				console.log("[create Candidate]: ", candidate);
				sendWsMessage("Candidate", {
					id: peerId,
					data: candidate
				});
			}
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
