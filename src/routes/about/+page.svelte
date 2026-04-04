<script lang="ts">
    import Faqs from "$lib/components/Faqs.svelte";
    import Footer from "$lib/components/footer.svelte";
	import HamburgerMenu from "$lib/components/hamburgerMenu.svelte";
</script>

<div class="min-h-screen flex flex-col overflow-hidden">
    <header>
        <div class="flex items-center justify-center gap-4 p-4 bg-slate-900 border-b ">
            <button class="flex items-center gap-2">
                <img src="/pexe.png" alt="pexe" class="h-12 w-12"/>
                <h1 class="text-2xl font-bold mt-2">Concord</h1>
            </button>

            <div class="hidden md:block absolute left-1/2 -translate-x-1/2 flex gap-5">
                <a href="/concord" class="text-lg inline-block hover:scale-105 rounded-md p-2">Main page</a>
                <a href="/dev" class="text-lg inline-block hover:scale-105  rounded-md p-2">Developers</a>
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
                { href: "/dev", label: "Developers" }
            ]} />

        </div>
    </header>
    <main class="flex-1">
        
        <Faqs />

        <div class="flex flex-col items-center justify-center gap-8 p-8">
            <h1 class="text-2xl md:text-4xl font-extrabold text-center">
                Your private voice chat server
            </h1>

            <p class="text-md md:text-lg text-gray-200 max-w-4xl text-center">
                Concord is perfect for those who prioritize privacy and personal freedom. Unlike large companies, we don't rely on centralized servers, as we are self-hosted. Moreover, you don't have to sacrifice your data just to use our services.
            </p>
        </div>

        <div class="flex items-center justify-center p-4 mb-12">
            <a href="https://alvorada.site/" target="_blank" class="bg-orange-500 hover:bg-orange-400 text-xl p-4 rounded-3xl">
                Open Concord in your browser
        </div>
    </main>
    <footer>
        <Footer />
    </footer>
</div>