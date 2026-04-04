<script lang="ts">
	import DevCards from "$lib/components/devCards.svelte";
	import HamburgerMenu from "$lib/components/hamburgerMenu.svelte";
	import Footer from "$lib/components/footer.svelte";
</script>

<div class="min-h-screen flex flex-col overflow-hidden">
    <header>
        <div class="flex items-center justify-center gap-4 p-4 bg-slate-900 border-b ">
            <button class="flex items-center gap-2"><img src="/pexe.png" alt="Pexe" class="h-12 w-12"/>
				<h1 class="text-2xl font-bold mt-2">Concord</h1>
			</button>

            <div class="hidden sm:block absolute left-1/2 -translate-x-1/2 gap-5">
                <a href="/about" class="text-lg inline-block hover:scale-105 rounded-md p-2">About</a>
				<a href="/concord" class="text-lg inline-block hover:scale-105  rounded-md p-2">Main page</a>
				<a href="https://github.com/liber-organiza-cao" class="text-lg inline-block hover:scale-105  rounded-md p-2">GitHub</a>
            </div>

			<a
				href="https://alvorada.site/"
				target="_blank"
				class="ml-auto bg-orange-500 hover:bg-orange-400 text-center rounded-2xl p-2"
			>
				Open Concord
			</a>

            <HamburgerMenu links={[
                { href: "/concord", label: "Main" },
                { href: "/about", label: "About" }
            ]} />

        </div>
    </header>

	<main class="flex-1 p-8">
		<div class="text-center mb-12">
			<h1 class="text-2xl md:text-4xl font-extrabold mb-4">
				Meet the Developers
			</h1>
			<p class="text-gray-400 max-w-2xl mx-auto">
				The people behind Concord — building a private, decentralized communication experience.
			</p>
		</div>

		<DevCards />
	</main>
    
    <footer>
        <Footer />
</footer>
</div>