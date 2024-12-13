import { PUBLIC_API_URL } from '$env/static/public';
export const url = PUBLIC_API_URL ? PUBLIC_API_URL : window.location.hash.length == 0 ? "ws://127.0.0.1:6464" : window.location.hash.slice(1);

console.log(`api url: ${url}`);

export type ClientToServerMsg = {
	SendMessage: {
		channel: string;
		content: string;
	};
	ChangeStatus: {
		author: number;
		afk: boolean;
	};
	Offer: Tid<RTCSessionDescriptionInit>;
	Answer: Tid<RTCSessionDescriptionInit>;
	Candidate: Tid<RTCIceCandidateInit>;
	JoinVoiceChannel: { channel: string }
	LeaveVoiceChannel: { channel: string }
};

export type Tid<T> = {
	id: number,
	data: T
};

export const WS = new WebSocket(url);

export const connection = $state({
	id: 0
});

export function sendWsMessage<Key extends keyof ClientToServerMsg>(
	key: Key,
	content: ClientToServerMsg[Key]
) {
	return WS.send(JSON.stringify({ [key]: content }));
}

export function onWsMessage(callback: (type: string, data: unknown) => void) {
	WS.addEventListener("message", (e) => {
		const json = JSON.parse(e.data);

		const type = Object.keys(json)[0];
		const data = json[type];

		callback(type, data);
	});
}

onWsMessage((type, data) => {
	if (type == "Connected") {
		const { id } = data as { id: number };
		connection.id = id;
	}
});