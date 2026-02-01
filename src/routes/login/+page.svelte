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
	<img src="/pexe-concord.png" alt="" class="mb-10">
	<div class="bg-[#393A41] h-[400px] w-[800px] rounded-lg pt-10">
		<div class="flex flex-col items-center mt-5 gap-2">
			<span class="font-bold text-[25px]">Welcome back freedom enjoyer!</span>
			<p class="text-[#dcdcdf] text-[15px]">proceed with the login below.</p>
		</div>

		<div class="flex flex-col gap-4 mt-10">
			<label class="flex flex-col items-center">
				<input 
					placeholder="Insert your 12 words secret key here!" 
					class="gray-500 border border-gray-500 w-[450px]" 
					type="text" 
					bind:value={secretKey}
				/>
			</label>
			<div class="btn-width flex flex-col items-center">
				<Button
					disabled={!isValid}
					onclick={() => {
						updateMySecretKey(secretKey);

						goto("/")
					}}>Log In</Button>
			</div>
		</div>
		<div class="flex flex-col items-center mt-4">
			<p class="text-[#ABACB2]">New to concord? <a href="/register" class="text-blue-400 underline hover:no-underline">Register instead</a></p>
		</div>
	</div>
</div>
