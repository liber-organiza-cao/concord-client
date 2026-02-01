<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { updateMySecretKey } from "$lib/ws.svelte";
	import * as bip39 from "@scure/bip39";
	import { wordlist } from "@scure/bip39/wordlists/english";

	let secretKey = $state("");
	const isValid = $derived(bip39.validateMnemonic(secretKey, wordlist));
</script>

<div class="flex min-h-screen max-w-screen flex-col items-center justify-center gap-2">
	<img src="/pexe-concord.png" alt="" class="hidden xl:block xl:mb-10">
	<div class="bg-gray-700 w-full h-screen overflow-y-auto pt-4 pb-4 md:text-xl xl:max-w-xl xl:h-fit xl:rounded-lg">
		<img src="/pexe-concord.png" alt="" class="block w-96 p-4 mx-auto xl:hidden">
		<div class="flex flex-col items-center gap-3">
			<span class="font-bold text-xl md:text-2xl">Welcome back freedom enjoyer!</span>
			<p class="text-gray-300 text-md">proceed with the login below.</p>
		</div>
		<div class="flex flex-col gap-4 mt-10">
			<label class="flex flex-col items-center">
				<input 
					placeholder="Insert your 12 words secret key here!" 
					class="gray-500 border border-gray-500 w-80 md:w-96" 
					type="text" 
					bind:value={secretKey}
				/>
			</label>
			<div class="login-btn-width flex flex-col items-center">
				<Button
					disabled={!isValid}
					onclick={() => {
						updateMySecretKey(secretKey);

						goto("/")
					}}>Log In</Button>
			</div>
		</div>
		<div class="flex flex-col items-center mt-4">
			<p class="text-slate-400">New to concord? <a href="/register" class="text-blue-400 underline hover:no-underline">Register instead</a></p>
		</div>
	</div>
</div>
