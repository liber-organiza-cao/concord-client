<script lang="ts">
	import { voiceData } from "$lib/voice.svelte";
	import { connection, onWsMessage, sendWsMessage, WS } from "$lib/ws.svelte";
	import { onMount, tick } from "svelte";

	const {
		currentChannel,
		joinChannel,
		leaveVoiceChannel: LeaveVoiceChannel,
		channels: voiceChannels
	} = voiceData;

	interface Channel {
		type: "text" | "voice";
		id: string;
		name: string;
	}

	const AFK_TIMEOUT = 10 * 60 * 1000;

	const serverToClientMsgHandlers: Record<string, (e: any) => any> = {
		Connected(e: { id: number }) {
			updateStatus();
		},
		Disconnected(e: { id: number }) {
			delete userStatuses[e.id];
		},
		ReceiveMessage(e: { author: number; channel: string; content: string }) {
			messages.push({
				author: e.author.toString(),
				content: e.content
			});

			scrollToBottom();
		},
		ChangeStatus(e: { author: number; afk: boolean }) {
			if (userStatuses[e.author]) {
				userStatuses[e.author].afk = e.afk;
			} else {
				userStatuses[e.author] = {
					afk: e.afk
				};

				if (e.author != connection.id) {
					// Temporary measure to send status to the new user that connected without storing statuses on the server
					updateStatus();
				}
			}
		}
	};

	const guild = "Server name here";

	const channelsByCategory = $state<{ category: string; channels: Channel[] }[]>([
		{
			category: "category here",
			channels: [
				{
					type: "text",
					name: "geral",
					id: "geral"
				},
				{
					type: "voice",
					name: "voice-chat",
					id: "voice-chat"
				},
				{
					type: "voice",
					name: "off-topic-voz",
					id: "off-topic-voz"
				}
			]
		}
	]);

	let selectedTextChannel = $state(channelsByCategory[0].channels[0]);

	let messages: {
		author: string;
		content: string;
	}[] = $state([]);

	let myUsername = $state("meu username aqui");
	let newMessage = $state("");

	let isUserInPage = $state(true);

	let changeStatusTimeout: number | null;

	function updateStatus() {
		if (!WS || WS.readyState != WS.OPEN) return;

		sendWsMessage("ChangeStatus", {
			author: connection.id!,
			afk: !isUserInPage
		});
	}

	$effect(() => {
		if (changeStatusTimeout) {
			clearTimeout(changeStatusTimeout);
			changeStatusTimeout = null;
		}

		// getting online is an immediate update, but we wait before marking the user as afk
		if (isUserInPage) {
			updateStatus();
		} else {
			changeStatusTimeout = setTimeout(updateStatus, AFK_TIMEOUT);
		}
	});

	let userStatuses = $state<Record<string, { afk: boolean }>>({});

	const orderedUserStatuses = $derived(
		Object.entries(userStatuses)
			.map(([id, userStatus]) => ({
				...userStatus,
				id
			}))
			.sort((a, b) => a.id.localeCompare(b.id))
	);

	let messagesEl = $state<HTMLElement>();

	onWsMessage(async (type, data) => {
		if (serverToClientMsgHandlers[type]) await serverToClientMsgHandlers[type](data);
	});

	async function sendMessage() {
		const content = newMessage.trimStart().trimEnd();
		if (content == "") return;

		sendWsMessage("SendMessage", {
			channel: selectedTextChannel.id,
			content
		});

		newMessage = "";

		scrollToBottom();
	}

	async function getUserMedia() {
		try {
			voiceData.localStream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: true
			});
		} catch (e) {
			console.error(e);
			await getUserMedia();
		}
	}

	async function scrollToBottom() {
		await tick();

		const tolerance = 50;

		if (messagesEl!.clientHeight + messagesEl!.scrollTop + tolerance < messagesEl!.scrollHeight)
			return;

		const last = messagesEl!.lastElementChild;
		if (last) last.scrollIntoView();
	}

	function isLastMessageSameAuthor(i: number, author: string) {
		if (i < 1) return false;

		return messages[i - 1].author == author;
	}

	function getChannelById(channelId: string) {
		for (const { channels } of channelsByCategory) {
			for (const channel of channels) {
				if (channelId == channel.id) {
					return channel;
				}
			}
		}

		return null;
	}
	onMount(() => {
		getUserMedia();
	});
</script>

<svelte:window onfocus={() => (isUserInPage = true)} onblur={() => (isUserInPage = false)} />

<div class="grid w-screen grid-cols-[auto_auto_1fr_auto] border-gray-500 bg-gray-900">
	<aside class="flex w-16 flex-col gap-2 border-r p-2">
		<img src="/pexe.png" alt="" class="h-12 w-12" />
		<img src="/pexe.png" alt="" class="h-12 w-12" />
		<img src="/pexe.png" alt="" class="h-12 w-12" />
		<img src="/pexe.png" alt="" class="h-12 w-12" />
		<img src="/pexe.png" alt="" class="h-12 w-12" />
	</aside>

	<aside class="flex w-60 flex-col border-r p-2">
		<div class="flex w-full p-2">
			<p class="font-medium">{guild}</p>
		</div>

		<hr />

		<div class="mt-2 flex grow flex-col text-gray-400">
			{#each channelsByCategory as { category, channels }}
				<p class="text-sm uppercase">{category}</p>
				{#each channels as channel}
					<div>
						<button
							class="{channel.id == selectedTextChannel.id
								? 'bg-gray-700 text-white'
								: 'hover:bg-gray-800'}
							w-full p-1 pl-4 text-left {currentChannel.id == channel.id ? 'text-white' : ''}"
							onclick={() => {
								if (channel.type == "voice") {
									joinChannel(channel.id);
								} else if (channel.type == "text") {
									selectedTextChannel = channel;
								}
							}}
						>
							{channel.type == "text" ? "#️⃣" : "🔊"}
							{channel.name}
						</button>

						<div
							class="pl-8 {channel.type == 'voice' && voiceChannels[channel.id]?.length > 0
								? 'mb-2'
								: ''}"
						>
							{#if channel.type == "voice"}
								{#each voiceChannels[channel.id] as user}
									<button
										class="flex w-full items-center gap-2 p-[2px] text-left hover:bg-gray-800"
									>
										<img src="/pexe.png" alt="" class="h-6 w-6" />
										<span class="line-clamp-1 text-sm">{user}</span>
									</button>
								{/each}
							{/if}
						</div>
					</div>
				{/each}
			{/each}
		</div>

		<div class="flex flex-col gap-2">
			<hr />
			{#if currentChannel.id}
				<div class="flex justify-between">
					<div>
						<p class="text-sm font-medium text-green-400">Voice Connected</p>
						<p class="line-clamp-1 text-xs text-gray-400"></p>
					</div>
					<button onclick={LeaveVoiceChannel}>❌</button>
				</div>
			{/if}
			<p class="text-center">your id is {connection.id}</p>
			<input bind:value={myUsername} class="w-full border" type="text" />
		</div>
	</aside>

	<main class="flex h-screen flex-col gap-2 p-4">
		<h1 class="font-medium"># {selectedTextChannel.name}</h1>

		<hr />

		<ul bind:this={messagesEl} class="flex h-full flex-col overflow-auto">
			{#each messages as message, i}
				{@const sameAuthor = isLastMessageSameAuthor(i, message.author)}
				<li
					class="{sameAuthor ? '' : 'mt-2'} flex items-center gap-2 break-all hover:bg-gray-800"
					oncontextmenu={(e) => {
						if (confirm("Do you want to delete this message?")) {
							e.preventDefault();
							console.log("You've been trolled");
						}
					}}
				>
					{#if !sameAuthor}
						<img src="/pexe.png" alt="" class="h-10 w-10" />
					{/if}

					<span class="flex flex-col items-start justify-start">
						<div class="flex items-center gap-2">
							{#if !sameAuthor}
								<p class="font-semibold">{message.author}</p>
								<p class="text-center text-sm text-gray-400">
									{new Date().toLocaleString("pt-br")}
								</p>
							{/if}
						</div>
						<span class="whitespace-pre-wrap break-all {sameAuthor ? 'ml-12' : ''}"
							>{message.content}</span
						>
					</span>
				</li>
			{/each}
		</ul>

		<form
			class="flex items-center gap-2"
			onsubmit={(e) => {
				e.preventDefault();

				sendMessage();
			}}
		>
			<textarea
				onkeydown={(e) => {
					if (e.key == "Enter" && !e.shiftKey) {
						e.preventDefault();
						sendMessage();
					}
				}}
				bind:value={newMessage}
				placeholder="Message #️{selectedTextChannel.name}"
				class="w-full border"
				rows={2}
			></textarea>
			<button class="text-3xl">▶️</button>
		</form>
	</main>

	<aside class="flex w-60 flex-col gap-2 border-l p-2">
		{#each orderedUserStatuses as user}
			<div class="flex items-center gap-2">
				<img src="/pexe.png" alt="" class="h-8 w-8" />

				<div class="rounded-full {user.afk ? 'bg-yellow-500' : 'bg-green-500'}  p-1"></div>

				<span class="line-clamp-1 break-all {user.afk ? 'text-gray-400' : ''}">{user.id}</span>
			</div>
		{/each}
	</aside>
</div>
