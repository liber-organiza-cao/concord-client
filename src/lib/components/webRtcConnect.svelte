<script lang="ts">
	import { connection, onWsMessage, sendWsMessage, type Tid } from "$lib/ws.svelte";
	import { onMount } from "svelte";
	import { push } from "./toast.svelte";

	const servers = {
		iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
	};

	const peerConnection = new RTCPeerConnection(servers);
	const { id } = $props<{ id: number }>();

	let video: HTMLVideoElement;
	let localStream = new MediaStream();
	let remoteStream = new MediaStream();

	const onMsgHandlers: Record<string, (e: any) => any> = {
		async Offer({ id: otherPeerId, data }: Tid<RTCSessionDescriptionInit>) {
			if (otherPeerId != id) return;

			console.log("recebeu offer", data);
			await peerConnection.setRemoteDescription(data);
			const offerDescription = await peerConnection.createAnswer();
			peerConnection.setLocalDescription(offerDescription);
			console.log("criou Answer");
			sendWsMessage("Answer", { id, data: offerDescription });
		},
		async Answer({ id: otherPeerId, data }: Tid<RTCSessionDescriptionInit>) {
			if (otherPeerId != id) return;

			console.log("recebeu Answer", data);
			await peerConnection.setRemoteDescription(data);
		},
		async Candidate({ id: otherPeerId, data }: Tid<RTCIceCandidateInit>) {
			if (otherPeerId != id) return;

			console.log("recebeu candidate", data);
			await peerConnection.addIceCandidate(new RTCIceCandidate(data));
		}
	};

	async function getUserMedia() {
		try {
			localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
			localStream.getTracks().forEach((track) => {
				peerConnection.addTrack(track, localStream!);
			});
		} catch (e) {
			push("por favor de permissão");
			console.log(e);
			await getUserMedia();
		}
	}

	async function createOffer() {
		const offerDescription = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offerDescription);
		console.log("[createOffer]: ", offerDescription);
		sendWsMessage("Offer", { id, data: offerDescription });
	}

	onWsMessage(async (type, data) => {
		if (onMsgHandlers[type]) await onMsgHandlers[type](data);
	});

	onMount(() => {
		console.log("criou webRtcConnection", id);
		getUserMedia();
		peerConnection.ontrack = (event) => {
			event.streams.forEach((stream) => {
				stream.getTracks().forEach((track) => {
					remoteStream.addTrack(track);
				});
			});
			video.srcObject = remoteStream;
		};

		peerConnection.onicecandidate = async (event) => {
			const candidate = event.candidate?.toJSON();
			if (candidate) {
				await sendWsMessage("Candidate", { id, data: candidate });
			}
		};
		if (id > connection.id) createOffer();
	});
</script>

<div>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video bind:this={video} autoplay playsinline></video>
</div>
