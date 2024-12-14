import { connection, onWsMessage, sendWsMessage } from "$lib/ws.svelte";
import { tick } from "svelte";

export const voiceData = (() => {
	const servers: RTCConfiguration = {
		iceServers: [
			{
				urls: "stun:stun.relay.metered.ca:80",
			},
			{
				urls: "turn:standard.relay.metered.ca:80",
				username: "9df5a10a093ff890b8cb9dac",
				credential: "U7oguQTnz/ciUWtd",
			},
			{
				urls: "turn:standard.relay.metered.ca:80?transport=tcp",
				username: "9df5a10a093ff890b8cb9dac",
				credential: "U7oguQTnz/ciUWtd",
			},
			{
				urls: "turn:standard.relay.metered.ca:443",
				username: "9df5a10a093ff890b8cb9dac",
				credential: "U7oguQTnz/ciUWtd",
			},
			{
				urls: "turns:standard.relay.metered.ca:443?transport=tcp",
				username: "9df5a10a093ff890b8cb9dac",
				credential: "U7oguQTnz/ciUWtd",
			},
		],
	};

	console.log(`[webrtcServers]: ${JSON.stringify(servers)}`);

	const voiceChannels = $state<Record<string, number[]>>({});
	const offerQueue = $state<number[]>([]);
	const currentChannel = $state({ id: "" });
	const voicePeers = $derived(voiceChannels[currentChannel.id]);
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
			if (id != connection.id && channelName == currentChannel.id) {
				console.log("push to offerQueue id: ", id);
				offerQueue.push(id);
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
			if (id != connection.id && channelName == currentChannel.id) {
				const index = offerQueue.indexOf(id);
				if (index > -1) offerQueue.splice(index, 1);
			}
		}
	};

	onWsMessage((type, data) => {
		if (messageHandler[type]) messageHandler[type](data);
	});

	async function leaveVoiceChannel() {
		sendWsMessage("LeaveVoiceChannel", { channel: currentChannel.id });
		currentChannel.id = "";
		offerQueue.length = 0;
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

	async function getUserMedia(constraints: MediaStreamConstraints) {
		localStream = await navigator.mediaDevices.getUserMedia(constraints);
	}

	return {
		leaveVoiceChannel,
		joinVoiceChannel,
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
		get voicePeers() {
			return voicePeers;
		},
		get offerQueue() {
			return offerQueue;
		},
	};
})();
