<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';

	// Messages that the client receives
	// interface MsgRegistered {
	// 	id: number;
	// }
	interface MsgReceiveMessage {
		author: string;
		channel: string;
		content: string;
	}

	// Messages that the client sends
	interface MsgSendMessage {
		SendMessage: {
			channel: string;
			content: string;
		};
	}
	// interface ChangeUsername {
	// 	ChangeUsername: {
	// 		username: string;
	// 	};
	// }

	let WS_URL = $page.url.hash == '' ? 'ws://127.0.0.1:6464' : $page.url.hash.slice(1);

	let messages: {
		author: string;
		content: string;
	}[] = $state([]);

	// let myId = -1;
	let channel = '# Aqui seria o nome do canal';

	let myUsername = $state('meu username aqui');
	let newMessage = $state('');

	let messagesEl = $state<HTMLElement>();
	let ws: WebSocket;

	const wsHandlers: any = {
		// Registered(e: MsgRegistered) {
		// 	myId = e.id;

		// 	myUsername = 'usuário ' + myId;
		// },
		ReceiveMessage(e: MsgReceiveMessage) {
			messages.push({
				author: 'usuário ' + e.author,
				// channel: msg['channel'],
				content: e.content
			});

			scrollToBottom();
		}
	};

	onMount(() => {
		ws = new WebSocket(WS_URL);

		ws.addEventListener('message', (e) => {
			console.log('ws message: ', e.data);
			const json = JSON.parse(e.data);

			const type = Object.keys(json)[0];
			const messageData = json[type];

			if (wsHandlers[type]) wsHandlers[type](messageData);
		});

		return () => {
			ws.close();
		};
	});

	// function SendWSMessage<T, C>(type: T, content: C) {}

	async function sendMessage() {
		if (newMessage.trim() == '') return;

		messages.push({
			author: myUsername,
			content: newMessage
		});

		ws.send(
			JSON.stringify({
				SendMessage: {
					channel: channel,
					content: newMessage.trim()
				}
			} satisfies MsgSendMessage)
		);

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
		<!-- <p>your id is {myId}</p> -->
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
</div>
