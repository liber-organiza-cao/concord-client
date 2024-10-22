<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';

	// Messages that the client receives
	interface MsgRegistered {
		id: number;
	}
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
	interface ChangeUsername {
		ChangeUsername: {
			username: string;
		};
	}

	let WS_URL = $page.url.hash == '' ? 'ws://127.0.0.1:6464' : $page.url.hash.slice(1);

	let messages: {
		author: string;
		content: string;
	}[] = [];

	let myId = -1;
	let channel = '# Aqui seria o nome do canal';

	let myUsername = 'username aqui';
	let newMessage = '';

	let messagesElement: HTMLElement;
	let ws: WebSocket;

	const wsHandlers: any = {
		Registered(e: MsgRegistered) {
			myId = e.id;

			myUsername = 'usuário ' + myId;
		},
		ReceiveMessage(e: MsgReceiveMessage) {
			messages = [
				...messages,
				{
					author: 'usuário ' + e.author,
					// channel: msg['channel'],
					content: e.content
				}
			];

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

	function SendWSMessage<T, C>(type: T, content: C) {}

	async function sendMessage() {
		if (newMessage.trim() == '') return;

		// messages = [
		// 	...messages,
		// 	{
		// 		author: myUsername,
		// 		content: newMessage
		// 	}
		// ];

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

		const last = messagesElement.lastElementChild;
		if (last) last.scrollIntoView();
	}

	function isLastMessageSameAuthor(i: number, author: string) {
		if (i <= 1) return false;

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
		<p>your id is {myId}</p>
		<h1 class="text-xl font-bold">{channel}</h1>

		<hr />

		<ul bind:this={messagesElement} class="flex h-full flex-col overflow-auto">
			{#each messages as message, i}
				<li
					class="flex flex-col whitespace-pre-wrap"
					on:contextmenu={(e) => {
						if (confirm('Do you want to delete this message?')) {
							console.log("You've been trolled");
						}
					}}
				>
					{#if !isLastMessageSameAuthor(i, message.author)}
						<strong class="mt-2">{message.author}</strong>
					{/if}
					<p>{message.content}</p>
				</li>
			{/each}
		</ul>

		<form
			class="flex items-center gap-2"
			on:submit={(e) => {
				e.preventDefault();

				sendMessage();
			}}
		>
			<textarea
				on:keydown={(e) => {
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
