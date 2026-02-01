import { connection, onWsMessage, sendWsMessage, type Tid } from "$lib/ws.svelte";
import { tick } from "svelte";

export const streamManager = (() => {
	const servers: RTCConfiguration = {
		iceServers: [
			{
				urls: "stun:stun.relay.metered.ca:80"
			},
			{
				urls: "turn:standard.relay.metered.ca:80",
				username: "9df5a10a093ff890b8cb9dac",
				credential: "U7oguQTnz/ciUWtd"
			},
			{
				urls: "turn:standard.relay.metered.ca:443",
				username: "9df5a10a093ff890b8cb9dac",
				credential: "U7oguQTnz/ciUWtd"
			}
		]
	};

	console.log(`[webrtcServers]: ${JSON.stringify(servers)}`);

	interface PeerConnection {
		connection: RTCPeerConnection;
		stream: MediaStream;
	}

	const voiceChannels = $state<Record<string, number[]>>({});
	const currentChannel = $state({ id: "", isMuted: false });

	const currentChannelPeers = $derived(voiceChannels[currentChannel.id]);
	const voicePeerConnections = $state<Record<number, PeerConnection>>({});

	let localStream = new MediaStream();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const messageHandler: Record<string, (e: any) => any> = {
		async JoinedVoiceChannel(msgData: { channel: string; id: number }) {
			const { id, channel: channelName } = msgData;
			console.log("[JoinedVoiceChannel], ", channelName, id);

			const peers = voiceChannels[channelName];
			if (peers) {
				peers.push(id);
			} else {
				voiceChannels[channelName] = [id];
			}
		},
		async LeftVoiceChannel(msgData: { channel: string; id: number }) {
			const { id, channel: channelName } = msgData;
			console.log("[LeftVoiceChannel], ", channelName, id);

			const peers = voiceChannels[channelName];
			if (peers) {
				const index = peers.indexOf(id);
				if (index > -1) peers.splice(index, 1);
			}
		},
		async Offer({ id, data }: Tid<RTCSessionDescriptionInit>) {
			const peer = voicePeerConnections[id];
			if (!peer) return;

			console.log(`[receive Offer]: peerId: ${id}, data: ${JSON.stringify(data)}`);
			await peer.connection.setRemoteDescription(data);
			await createAnswer(id);
		},
		async Answer({ id, data }: Tid<RTCSessionDescriptionInit>) {
			const peer = voicePeerConnections[id];
			if (!peer) return;

			console.log(`[receive Answer]: peerId: ${id}, data: ${JSON.stringify(data)}`);
			await peer.connection.setRemoteDescription(data);
		},
		async Candidate({ id, data }: Tid<RTCIceCandidateInit>) {
			const peer = voicePeerConnections[id];
			if (!peer) return;

			console.log(`[receive Candidate]: peerId: ${id}, data: ${JSON.stringify(data)}`);
			await peer.connection.addIceCandidate(data);
		}
	};

	async function createOffer(id: number) {
		const peer = voicePeerConnections[id];
		if (peer) {
			const data = await peer.connection.createOffer();
			console.log(`[create Offer]: peerId: ${id}, data: ${JSON.stringify(data)}`);
			peer.connection.setLocalDescription(data);
			sendWsMessage("Offer", { id, data });
		} else {
			console.log(`peer: ${id} not exists to create offer`);
		}
	}

	async function createAnswer(id: number) {
		const peer = voicePeerConnections[id];

		if (peer) {
			const data = await peer.connection.createAnswer();
			console.log(`[create Answer]: peerId: ${id}, data: ${JSON.stringify(data)}`);
			peer.connection.setLocalDescription(data);
			sendWsMessage("Answer", { id, data });
		} else {
			console.log(`peer: ${id} not exists to create answer`);
		}
	}

	function addConnectionPeer(id: number) {
		if (voicePeerConnections[id]) return;

		const conn = new RTCPeerConnection(servers);
		const stream = new MediaStream();
		const peer: PeerConnection = {
			connection: conn,
			stream
		};

		peer.connection.ontrack = (event) => {
			event.streams.forEach((stream) => {
				stream.getTracks().forEach((track) => {
					peer.stream.addTrack(track);
				});
			});
		};

		peer.connection.onicecandidate = (event) => {
			const data = event.candidate?.toJSON();
			if (data) {
				console.log(`[create Candidate]: peerId: ${id}, data: ${JSON.stringify(data)}`);
				sendWsMessage("Candidate", { id, data });
			}
		};

		peer.connection.onconnectionstatechange = () => {
			console.log(`[onconnectionstatechange]: peerId: ${id}, ${peer.connection.connectionState}`);
		};

		localStream.getTracks().forEach((track) => {
			peer.connection.addTrack(track, localStream);
		});

		voicePeerConnections[id] = peer;
		if (id < connection.id) {
			createOffer(id);
		}
	}

	function remoteConnectionPeer(id: number) {
		const peer = voicePeerConnections[id];

		if (!peer) return;
		peer.connection.close();
		delete voicePeerConnections[id];
	}

	onWsMessage((type, data) => {
		if (messageHandler[type]) messageHandler[type](data);
	});

	async function leaveVoiceChannel() {
		if (currentChannel.id.length == 0) return;
		sendWsMessage("LeaveVoiceChannel", { channel: currentChannel.id });
		currentChannel.id = "";
		await tick();
	}

	async function joinVoiceChannel(channel: string) {
		if (currentChannel.id == channel) return;

		if (currentChannel.id) {
			await leaveVoiceChannel();
		}
		currentChannel.id = channel;
		sendWsMessage("JoinVoiceChannel", { channel });
		await tick();
	}

	function setMuted(value: boolean) {
		currentChannel.isMuted = value;
		for (const track of localStream.getAudioTracks()) {
			track.enabled = !value;
		}
	}

	async function getUserMedia(constraints: MediaStreamConstraints) {
		localStream = await navigator.mediaDevices.getUserMedia(constraints);
	}

	async function init() {
		$effect(() => {
			if (!currentChannelPeers) {
				for (const id in voicePeerConnections) {
					remoteConnectionPeer(Number(id));
				}
				return;
			}
			for (const id of currentChannelPeers) {
				if (!voicePeerConnections[id] && id != connection.id) {
					addConnectionPeer(id);
				}
			}
			for (const id in voicePeerConnections) {
				if (!currentChannelPeers.includes(Number(id))) {
					remoteConnectionPeer(Number(id));
				}
			}
		});
	}

	return {
		init,
		leaveVoiceChannel,
		joinVoiceChannel,
		setMuted,
		getUserMedia,
		get voiceChannels() {
			return voiceChannels;
		},
		get servers() {
			return servers;
		},
		get localStream() {
			return localStream;
		},
		get currentChannel() {
			return currentChannel;
		},
		get voicePeerConnections() {
			return voicePeerConnections;
		}
	};
})();
