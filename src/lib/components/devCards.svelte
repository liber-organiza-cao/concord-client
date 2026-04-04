<script lang="ts">

    import Fa from 'svelte-fa'
    import { faGithub } from '@fortawesome/free-brands-svg-icons';

    const devs = [
		{
			name: "Petrol",
            png: "/petrol.png", 
			description: "He made this marvelous page!",
			github: "https://github.com/petrolbras",
            pubkey: "https://pubky.app/profile/m5px3x8q6jkbm4mwb5rojhotybtzm4bunjxtjasfg6shh9uz83ao"
		},
		{
			name: "Alvorada",
            png: "/alvoreida.png",
			description: "He loves dogs and anime.",
			github: "https://github.com/Heraclito-Q-Saldanha",
            pubkey: "https://github.com/Heraclito-Q-Saldanha"
		},
		{
			name: "Anarcus",
            png: "anarcus.png",
			description: "He had the project idea.",
			github: "https://github.com/marcusmmmz",
            pubkey: "https://pubky.app/profile/iwbpqrawndhzf9o85ntsanp9t8rq6nqm9e9mdhdcdze9dhoudqho"
		}
	];
</script>

<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
	{#each devs as dev}
		<div class="bg-slate-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center text-center hover:scale-105 transition">
			<div class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
				<img src={dev.png} alt={dev.name} class="w-full h-full object-cover rounded-full" />
			</div>

			<h2 class="text-xl font-bold">{dev.name}</h2>

			<p class="text-gray-400 text-sm mb-4">
				{dev.description}
			</p>

			<div class="flex mt-auto">
                <a href={dev.github} target="_blank" class="p-1 text-lg font-bold flex justify-center items-center gap-2">
                    <Fa icon={faGithub} class="text-4xl inline-block hover:transform hover:scale-110 transition"/>
                </a>

                <a href={dev.pubkey} target="_blank" class="p-1 text-lg font-bold flex justify-center items-center gap-2">
                    <img src="pubkey.png" alt="pubkey" class="w-8 h-12 inline-block hover:transform hover:scale-110 transition"/>
                </a>
            </div>
		</div>
	{/each}
</div>