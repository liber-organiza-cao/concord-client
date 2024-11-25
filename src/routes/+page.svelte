<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';

	type ClientToServerMsg = {
		SendMessage: {
			channel: string;
			content: string;
		};
		ChangeStatus: {
			author: number;
			afk: boolean;
		};
	};

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
				// channel: msg['channel'],
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

	let ws: WebSocket;

	let WS_URL = $page.url.hash == '' ? 'ws://127.0.0.1:6464' : $page.url.hash.slice(1);

	let messages: {
		author: string;
		content: string;
	}[] = $state([]);

	let myId = $state<number>();
	let channel = '# Aqui seria o nome do canal';

	let myUsername = $state('meu username aqui');
	let newMessage = $state('');

	let isUserInPage = $state(true);

	let changeStatusTimeout: number | null;

	function updateStatus() {
		if (!ws || ws.readyState != ws.OPEN) return;

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

	let userStatuses = $state<
		Record<
			string,
			{
				afk: boolean;
			}
		>
	>({});

	const orderedUserStatuses = $derived(
		Object.entries(userStatuses)
			.map(([id, userStatus]) => ({
				...userStatus,
				id
			}))
			.sort((a, b) => a.id.localeCompare(b.id))
	);

	let messagesEl = $state<HTMLElement>();

	onMount(() => {
		ws = new WebSocket(WS_URL);

		ws.addEventListener('message', (e) => {
			// console.log('ws message: ', e.data);
			const json = JSON.parse(e.data);

			const type = Object.keys(json)[0];
			const messageData = json[type];

			if (serverToClientMsgHandlers[type]) serverToClientMsgHandlers[type](messageData);
		});

		return () => {
			ws.close();
		};
	});

	function sendWsMessage<Key extends keyof ClientToServerMsg>(
		key: Key,
		content: ClientToServerMsg[Key]
	) {
		// TODO: canonicalize this JSON
		ws.send(
			JSON.stringify({
				[key]: content
			})
		);
	}

	async function sendMessage() {
		if (newMessage.trim() == '') return;

		// messages.push({
		// 	author: myUsername,
		// 	content: newMessage
		// });

		sendWsMessage('SendMessage', {
			channel: channel,
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
</script>

<svelte:window onfocus={() => (isUserInPage = true)} onblur={() => (isUserInPage = false)} />

<div class="flex w-screen">
	<aside class="flex flex-col gap-2 border-r-2 p-2">
		<img src="/pexe.png" alt="" class="w-16" />
		<img src="/pexe.png" alt="" class="w-16" />
		<img src="/pexe.png" alt="" class="w-16" />
		<img src="/pexe.png" alt="" class="w-16" />
		<img src="/pexe.png" alt="" class="w-16" />
	</aside>

	<main class="flex h-screen w-full flex-col gap-2 p-4">
		<input bind:value={myUsername} class="w-full border-2" type="text" />
		<p>your id is {myId}</p>
		<h1 class="text-xl font-bold">{channel}</h1>

		<hr />

		<ul bind:this={messagesEl} class="flex h-full flex-col overflow-auto">
			{#each messages as message, i}
				{@const sameAuthor = isLastMessageSameAuthor(i, message.author)}
				<li
					class="{sameAuthor
						? ''
						: 'mt-2'} 77whitespace-pre-wrap flex items-center gap-2 hover:bg-gray-700"
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
				class="w-full border-2"
			></textarea>
			<button class="text-3xl">▶️</button>
		</form>
	</main>

	<aside class="flex w-72 flex-col gap-2 border-l-2 p-2">
		{#each orderedUserStatuses as user}
			<div class="flex items-center gap-2">
				<img src="/pexe.png" alt="" class="h-8 w-8" />

				<div class="rounded-full {user.afk ? 'bg-yellow-500' : 'bg-green-500'}  p-1"></div>

				<span class="line-clamp-1 break-all {user.afk ? 'text-slate-500' : ''}">{user.id}</span>
			</div>
		{/each}
	</aside>
</div>
