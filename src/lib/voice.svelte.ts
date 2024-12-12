import { onWsMessage, sendWsMessage } from "./ws.svelte";

export type Channel = TextChannel | VoiceChannel;

export interface TextChannel {
	type: 'text';
	id: string;
	name: string;
}
export interface VoiceChannel {
	type: 'voice';
	id: string;
	name: string;
	connectedUsers: number[];
}

export const voiceChannelPeers = (() => {
	let data = $state<{ channels: Record<string, number[]> }>({
		channels: {}
	});

	const onMessage: Record<string, (e: any) => any> = {
		JoinedVoiceChannel({ channel: channelId, id }: { channel: string; id: number }) {
			const channel = data.channels[channelId];
			if (channel) {
				channel.push(id);
			} else {
				data.channels[channelId] = [id];
			}
		},
		LeftVoiceChannel({ channel: channelId, id }: { channel: string; id: number }) {
			const channel = data.channels[channelId];
			if (channel) {
				delete channel[id];
			}
		}
	};

	onWsMessage(async (type, data) => {
		if (onMessage[type]) await onMessage[type](data);
	});

	return {
		get channels() {
			return data.channels;
		}
	};
})();

export const activeVoice = (() => {
	let data = $state<{
		guild: string;
		channel: string;
	} | null>(null);

	const connectedUsers = $derived(voiceChannelPeers.channels[data?.channel!]);

	return {
		get channel() {
			return data?.channel;
		},
		get guild() {
			return data?.guild;
		},
		get connectedUsers() {
			return connectedUsers;
		},
		connect(guild: string, channel: string) {
			if (data != null) {
				if (data.channel == channel) {
					return;
				}
				this.disconnect();
			}
			data = {
				guild,
				channel
			};
			sendWsMessage("JoinVoiceChannel", { channel });
		},
		disconnect() {
			if (data != null)
				sendWsMessage("LeaveVoiceChannel", { channel: data.channel });
			data = null;
		},
		isConnected() {
			return data != null;
		}
	};
})();
