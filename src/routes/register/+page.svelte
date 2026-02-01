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

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<img src="/pexe-concord.png" alt="" class="mb-10">
	<div class="bg-[#393A41] h-[400px] w-[800px] rounded-lg">
		<div class="flex flex-col items-center gap-3 mt-2 text-[20px]">
			{#if !isKeyShown}
				<h1 class="flex flex-col items-center text-[35px] font-bold mt-2">Register here!</h1>
				<p class="text-[40px]">⚠️</p>
				<h1>A secret key will be generated! Save it somewhere <span class="font-bold">secure and private.</span></h1>
				<p>Any person with acess to this key can <span class="font-bold">acess your account!</span></p>
				<p>If you lose it, you <span class="font-bold">won't be able to acess your account.</span></p>
				<div class="login-btn-width mt-3"><Button onclick={() => (isKeyShown = true)}>Generate key</Button></div>
			{/if}

			{#if isKeyShown}
				<h1 class="flex flex-col items-center text-[35px] font-bold mt-2">This is your key ⬇️</h1>
				<p class="bg-slate-700 p-2 text-[19px] rounded-lg m-2">{generatedKey}</p>
				<label class="flex items-center cursor-pointer">
					<input class="w-6 h-6 mr-2 rounded-lg accent-orange-500 " type="checkbox" bind:checked={savedKey}> I have saved the key in a secure and private place.
				</label>
				<div class="login-btn-width">
					<Button
						disabled={!savedKey}
						onclick={() => {
							updateMySecretKey(generatedKey)
					
							goto("/")
						}}>Register account</Button>
				</div>
			{/if}
		</div>

		<div class="flex flex-col items-center mt-4">
			<p class="text-[#ABACB2]" >Already have an account? <a href="/login" class="text-blue-400 underline hover:no-underline">Log in</a></p>
		</div>
	</div>
</div>
