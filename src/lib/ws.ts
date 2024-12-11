
export const url = window.location.hash.length == 0 ? 'ws://127.0.0.1:6464' : window.location.hash.slice(1);

export type ClientToServerMsg = {
    SendMessage: {
        channel: string;
        content: string;
    };
    ChangeStatus: {
        author: number;
        afk: boolean;
    };
    Offer: RTCSessionDescriptionInit,
    Answer: RTCSessionDescriptionInit
    Candidate: RTCIceCandidateInit,
};

export const WS = new WebSocket(url);

export function sendWsMessage<Key extends keyof ClientToServerMsg>(key: Key, content: ClientToServerMsg[Key]) {
    return WS.send(JSON.stringify({ [key]: content }));
}

export function onMessage(callback: (type: string, data: any) => void) {
    WS.addEventListener('message', (e) => {
        const json = JSON.parse(e.data);

        const type = Object.keys(json)[0];
        const data = json[type];

        callback(type, data);
    });
}