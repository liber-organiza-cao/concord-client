<script lang="ts">
	import { activeVoice } from '$lib/activeVoice.svelte';
	import { onMessage, sendWsMessage, WS } from '$lib/ws';
	import { tick } from 'svelte';

	const AFK_TIMEOUT = 10 * 60 * 1000;

	const serverToClientMsgHandlers: Record<string, (e: any) => any> = {
		Connected(e: { id: number }) {
			myId = e.id;

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

				if (e.author != myId) {
					// Temporary measure to send status to the new user that connected without storing statuses on the server
					updateStatus();
				}
			}
		}
	};

	const guild = 'Server name here';

	const channelsByCategory = [
		{
			category: 'category here',
			channels: [
				{
					type: 'text',
					id: 'general id',
					name: 'general'
				},
				{
					type: 'voice',
					id: 'voice chat id',
					name: 'voice chat',
					connectedUsers: ['user 1 test', 'user 2 longer name test']
				},
				{
					type: 'text',
					id: 'test od',
					name: 'test'
				}
			]
		}
	];

	let selectedTextChannel = $state(channelsByCategory[0].channels[0]);

	let messages: {
		author: string;
		content: string;
	}[] = $state([]);

	let myId = $state<number>();

	let myUsername = $state('meu username aqui');
	let newMessage = $state('');

	let isUserInPage = $state(true);

	let changeStatusTimeout: number | null;

	function updateStatus() {
		if (!WS || WS.readyState != WS.OPEN) return;

		sendWsMessage('ChangeStatus', {
			author: myId!,
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

	onMessage(async (type, data) => {
		if (serverToClientMsgHandlers[type]) await serverToClientMsgHandlers[type](data);
	});

	async function sendMessage() {
		if (newMessage.trim() == '') return;

		sendWsMessage('SendMessage', {
			channel: selectedTextChannel.id,
			content: newMessage.trim()
		});

		newMessage = '';

		scrollToBottom();
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
</script>

<svelte:window onfocus={() => (isUserInPage = true)} onblur={() => (isUserInPage = false)} />

<div class="flex w-screen border-gray-500 bg-gray-900">
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
							w-full p-1 pl-4 text-left {activeVoice.channel == channel.id ? 'text-white' : ''}"
							onclick={() => {
								if (channel.type == 'voice') {
									activeVoice.connect(guild, channel.id);
								} else if (channel.type == 'text') {
									selectedTextChannel = channel;
								}
							}}
						>
							{channel.type == 'text' ? '#️⃣' : '🔊'}
							{channel.name}
						</button>

						<div
							class="pl-8 {channel.connectedUsers && channel.connectedUsers.length > 0
								? 'mb-2'
								: ''}"
						>
							{#each channel.connectedUsers ?? [] as user}
								<button class="flex w-full items-center gap-2 p-[2px] text-left hover:bg-gray-800">
									<img src="/pexe.png" alt="" class="h-6 w-6" />
									<span class="line-clamp-1 text-sm">{user}</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{/each}
		</div>

		<div class="flex flex-col gap-2">
			<hr />
			{#if activeVoice.channel}
				<div class="flex justify-between">
					<div>
						<p class="text-sm font-medium text-green-400">Voice Connected</p>
						<p class="line-clamp-1 text-xs text-gray-400">
							{getChannelById(activeVoice.channel)?.name} / {activeVoice.guild}
						</p>
					</div>
					<button onclick={activeVoice.disconnect}>❌</button>
				</div>
			{/if}
			<p class="text-center">your id is {myId}</p>
			<input bind:value={myUsername} class="w-full border" type="text" />
		</div>
	</aside>

	<main class="flex h-screen grow flex-col gap-2 p-4">
		<h1 class="font-medium"># {selectedTextChannel.name}</h1>

		<hr />

		<ul bind:this={messagesEl} class="flex h-full flex-col overflow-auto">
			{#each messages as message, i}
				{@const sameAuthor = isLastMessageSameAuthor(i, message.author)}
				<li
					class="{sameAuthor ? '' : 'mt-2'} flex items-center gap-2 break-all hover:bg-gray-800"
					oncontextmenu={(e) => {
						if (confirm('Do you want to delete this message?')) {
							e.preventDefault();
							console.log("You've been trolled");
						}
					}}
				>
					{#if sameAuthor}
						<span class="w-10"></span>
					{:else}
						<img src="/pexe.png" alt="" class="h-10 w-10" />
					{/if}

					<span class="flex flex-col items-start justify-start">
						<div class="flex items-center gap-2">
							{#if !sameAuthor}
								<p class="font-semibold">{message.author}</p>
								<p class="text-center text-sm text-gray-400">
									{new Date().toLocaleString('pt-br')}
								</p>
							{/if}
						</div>
						<p>{message.content}</p>
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
					if (e.key == 'Enter' && !e.shiftKey) {
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
