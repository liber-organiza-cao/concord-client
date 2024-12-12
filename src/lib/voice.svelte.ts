
import { connection, onWsMessage, sendWsMessage } from "$lib/ws.svelte";

export const voiceData = (() => {
    const servers = {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
        iceCandidatePoolSize: 10,
    };
    let channels = $state<Record<string, number[]>>({});
    let offerQueue = $state<number[]>([]);
    let currentChannel = $state("");
    let voicePeers = $derived(channels[currentChannel]);
    let localStream = new MediaStream();

    const messageHandler: Record<string, (e: any) => any> = {
        async JoinedVoiceChannel(msgData: { channel: string; id: number }) {
            const { id, channel: channelName } = msgData;
            console.log("[JoinedVoiceChannel], ", channelName, id);
            const peers = channels[channelName];
            if (peers) {
                peers.push(id);
            } else {
                channels[channelName] = [id];
            }
            if (id != connection.id && channelName == currentChannel) {
                console.log("push to offerQueue id: ", id);
                offerQueue.push(id);
            }
        },
        async LeftVoiceChannel(msgData: { channel: string; id: number }) {
            const { id, channel: channelName } = msgData;
            console.log("[LeftVoiceChannel], ", channelName, id);
            const peers = channels[channelName];
            if (peers) {
                const index = peers.indexOf(id);
                if (index > -1) peers.splice(index, 1);
            }
            if (id != connection.id && channelName == currentChannel) {
                const index = offerQueue.indexOf(id);
                if (index > -1) offerQueue.splice(index, 1);
            }
        },
    };

    onWsMessage((type, data) => {
        if (messageHandler[type]) messageHandler[type](data);
    });

    return {
        async LeaveVoiceChannel() {
            sendWsMessage("LeaveVoiceChannel", { channel: currentChannel });
            currentChannel = "";
        },
        async joinChannel(channel: string) {
            currentChannel = channel;
            sendWsMessage("JoinVoiceChannel", { channel });
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

        set localStream(v: typeof localStream) {
            localStream = v;
        },
        set currentChannel(v: typeof currentChannel) {
            currentChannel = v;
        },
        set offerQueue(v: typeof offerQueue) {
            offerQueue = v;
        }
    }
})();