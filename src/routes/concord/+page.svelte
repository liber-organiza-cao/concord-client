<script lang="ts">
	import Footer from "$lib/components/footer.svelte";
	import HamburgerMenu from "$lib/components/hamburgerMenu.svelte";
</script>

<div class="min-h-screen flex flex-col overflow-hidden">
    <header>
	    <div class="relative flex items-center justify-center gap-4 p-4 bg-slate-900 border-b">
            <button class="flex items-center gap-2">
                <img src="/pexe.png" alt="pexe" class="h-12 w-12"/>
                <h1 class="text-2xl font-bold mt-2">Concord</h1>
            </button>

	    	<nav class="md:flex absolute left-1/2 -translate-x-1/2 gap-5">
	    		<a href="/about" class="hidden md:flex text-lg hover:scale-105 rounded-md p-2">About</a>
	    		<a href="/dev" class="hidden md:flex text-lg hover:scale-105 rounded-md p-2">Developers</a>
	    		<a href="https://github.com/liber-organiza-cao" target="_blank" class="hidden md:flex text-lg hover:scale-105 rounded-md p-2">
	    			GitHub
	    		</a>
	    	</nav>

	    	<a
	    		href="https://alvorada.site/"
	    		target="_blank"
	    		class="ml-auto bg-orange-500 hover:bg-orange-400 text-center rounded-2xl p-2"
	    	>
	    		Open Concord
    		</a>

            <HamburgerMenu links={[
                { href: "/about", label: "About" },
             { href: "/dev", label: "Developers" }
             ]} />
    
    	</div>
    </header>

    <main>
	    <section class="flex flex-col items-center justify-center gap-8 p-8 mt-2 text-center">
	    	<h1 class="text-2xl md:text-4xl font-extrabold leading-tight">
	    		Your private voice chat server
	    	</h1>

	    	<p class="text-md md:text-lg tracking-tight text-gray-200 max-w-4xl">
	    		Concord is perfect for those who prioritize privacy and personal freedom.
	    		Unlike large companies, we don't rely on centralized servers, since we are self-hosted.
	    		You don't have to sacrifice your data to use our services.
	    	</p>
    	</section>

	    <div class="flex items-center justify-center p-4 mb-6 md:mb-0">
	    	<a
	    		href="https://alvorada.site/"
	    		target="_blank"
	    		rel="noopener noreferrer"
	    		class="text-xl bg-orange-500 hover:bg-orange-400 p-4 rounded-3xl"
	    	>
	    		Open Concord in your browser
	    	</a>
	    </div>

	    <section class="hidden md:flex flex-col items-center gap-12 p-12 min-h-screen">
		    <div class="w-full max-w-5xl h-96 flex items-center gap-8 p-6 rounded-3xl bg-slate-800/70 backdrop-blur-lg border border-white/10 shadow-2xl hover:scale-[1.02] transition">
		    	<div class="w-1/2 h-full flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500">
		    		<img src="/discord.png" alt="Discord comparison" class="max-h-full object-contain" />
		    	</div>

		    	<div class="w-1/2 text-white text-center">
		    		<h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight">
		    			Discord x Concord
		    		</h2>

		    		<p class="mt-4 text-xl lg:text-2xl text-gray-300 leading-relaxed">
		    			Concord is a distributed voice/chat application that lets you host your own server.
					Discord is a centralized platform controlled by its own policies.
	    			</p>
	    		</div>
    		</div>

    		<div class="w-full max-w-5xl h-96 flex items-center gap-8 p-6 rounded-3xl bg-slate-800/70 backdrop-blur-lg border border-white/10 shadow-2xl hover:scale-[1.02] transition">
		    	<div class="w-1/2 text-white text-center">
			    	<h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight">
					    Concord x Matrix
				    </h2>

				    <p class="mt-4 text-md lg:text-xl text-gray-300 leading-relaxed">
					    Both prioritize decentralization, but with different approaches. Concord focuses on self-hosting and user control, while Matrix emphasizes  interoperability and federation across servers.
				    </p>
			    </div>

			    <div class="w-1/2 h-full flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500">
				    <img src="matrix.png" alt="Matrix comparison" class="max-h-full object-contain" />
			    </div>
		    </div>
	    </section>
    </main>

    <footer>
	    <Footer />
    </footer>
</div>