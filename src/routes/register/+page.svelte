<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { updateMySecretKey } from "$lib/ws.svelte";
	import * as bip39 from "@scure/bip39";
	import { wordlist } from "@scure/bip39/wordlists/english";

	const generatedKey = bip39.generateMnemonic(wordlist);

	let isKeyShown = $state(false);
	let savedKey = $state(false);
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-2 p-4">
	<div class="flex flex-col items-center gap-2">
		<h1 class="text-3xl">Register</h1>

		<hr class="m-2 w-64" />

		{#if !isKeyShown}
			<p>⚠️ A secret key will be generated. Save it somewhere secure and private.</p>
			<p>⚠️ Any person with access to this key can access your account.</p>
			<p>⚠️ If you lose it, you will not be able to access your account.</p>
			<Button onclick={() => (isKeyShown = true)}>Generate key</Button>
		{/if}
		<pre class="{isKeyShown ? '' : 'blur-lg'} bg-slate-700 p-2">{generatedKey}</pre>
		{#if isKeyShown}
			<label>
				<input class="accent-orange-500" type="checkbox" bind:checked={savedKey} />
				I have saved the key in a private and secure place.
			</label>
		{/if}
		<Button
			disabled={!savedKey}
			onclick={() => {
				updateMySecretKey(generatedKey);

				goto("/");
			}}>Register</Button
		>
	</div>

	<hr class="m-2 w-64" />

	<p>Already have an account?</p>
	<a href="/login">
		<Button>Login instead</Button>
	</a>
</div>
