<script lang="ts">
	import { onMount } from 'svelte';
	import { onMessage, sendWsMessage } from '$lib/ws';

	const servers = {
		iceServers: [
			{
				urls: ['stun:stun.l.google.com:19302']
			}
		],
		iceCandidatePoolSize: 10
	};

	let audio: HTMLAudioElement;
	let localStream = new MediaStream();
	let remoteStream = new MediaStream();
	const peerConnection = new RTCPeerConnection(servers);

	const serverToClientMsgHandlers: Record<string, (e: any) => any> = {
		Connected(_e: { id: number }) {},
		Disconnected(_e: { id: number }) {},
		async Offer(e: RTCSessionDescriptionInit) {
			console.log('recebeu offer', e);
			await peerConnection.setRemoteDescription(e);
			const offerDescription = await peerConnection.createAnswer();
			peerConnection.setLocalDescription(offerDescription);
			sendWsMessage('Answer', offerDescription);
		},
		async Answer(e: RTCSessionDescriptionInit) {
			console.log('recebeu Answer', e);
			await peerConnection.setRemoteDescription(e);
		},
		async Candidate(e: RTCIceCandidateInit) {
			console.log('recebeu candidate', e);
			await peerConnection.addIceCandidate(new RTCIceCandidate(e));
		}
	};

	async function setup() {
		localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

		localStream.getTracks().forEach((track) => {
			peerConnection.addTrack(track, localStream!);
		});

		peerConnection.ontrack = (event) => {
			console.log('puta');
			event.streams.forEach((stream) => {
				stream.getTracks().forEach((track) => {
					remoteStream.addTrack(track);
				});
			});
			audio.srcObject = remoteStream;
		};

		peerConnection.onicecandidate = async (event) => {
			const candidate = event.candidate?.toJSON();
			if (candidate) {
				console.log('gerou candidate', candidate);
				await sendWsMessage('Candidate', candidate);
			}
		};
	}
	onMessage(async (type, data) => {
		if (serverToClientMsgHandlers[type]) await serverToClientMsgHandlers[type](data);
	});
	onMount(() => {
		setup();
	});

	async function call() {
		const offerDescription = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offerDescription);
		sendWsMessage('Offer', offerDescription);
		console.log(offerDescription);
	}
</script>

<div>
	<button onclick={call}>Call</button>
	<audio bind:this={audio}></audio>
</div>
