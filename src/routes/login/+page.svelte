<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { updateMySecretKey } from "$lib/ws.svelte";
	import * as bip39 from "@scure/bip39";
	import { wordlist } from "@scure/bip39/wordlists/english";

	let secretKey = $state("");
	const isValid = $derived(bip39.validateMnemonic(secretKey, wordlist));
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-2 p-4">
	<h1 class="text-3xl">Login</h1>

	<hr class="m-2 w-64" />

	<label class="flex flex-col gap-2">
		Secret key (12 words)
		<input
			placeholder=""
			class="gray-500 border border-gray-500"
			type="text"
			bind:value={secretKey}
		/>
	</label>
	<Button
		disabled={!isValid}
		onclick={() => {
			updateMySecretKey(secretKey);

			goto("/");
		}}>Login</Button
	>

	<hr class="m-2 w-64" />

	<p>Don't have an account?</p>
	<a href="/register">
		<Button>Register instead</Button>
	</a>
</div>
