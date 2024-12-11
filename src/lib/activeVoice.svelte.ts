export const activeVoice = (() => {
	let data = $state<{
		guild: string;
		channel: string;
	} | null>(null);

	return {
		get channel() {
			return data?.channel;
		},
		get guild() {
			return data?.guild;
		},
		connect(guild: string, channel: string) {
			data = {
				channel,
				guild
			};
		},
		disconnect() {
			data = null;
		},
		isConnected() {
			return data != null;
		}
	};
})();
