<script lang="ts">

    let openIndex: number | null = null;

    let faqs = [
        {
            question: "What is Concord?",
            answer: "Concord is a distributed voice/chat application. It allows you to host your own voice/chat server, giving you full control over your data and privacy."
        },
        {
            question: "How does Concord work?",
            answer: "In Concord, every server can be independently hosted, there's no central authority. If you wish to create a server, you can choose to either host it yourself or pay for external hosting."
        },
        {
            question: "Is concord open-source?",
            answer: `Yes, Concord is open-source. You can find the source code on our <a href="https://github.com/liber-organiza-cao/concord-client" class="text-orange-500 hover:underline">GitHub repository</a> and contribute to the project if you wish.`
        },
        {
            question: "Is Concord free to use?",
            answer: `Yes, Concord is free for users. They can freely join public servers or host their own server with their own set of rules and invite others to join. However, hosting a server may involve costs, especially if you choose to use external hosting services.`
        },
        {
            question: "Can I use Concord on my mobile device?",
            answer: "Yes, however Concord currently doesn't have a mobile app, but this is planned for the future. At the moment, it can only be accessed through the browser."
        },
        {
            question: "How do I set up my own Concord server?",
            answer: "You can find more info about this topic in our <a href='https://github.com/liber-organiza-cao/concord-server' class='text-orange-500 hover:underline'>GitHub repository</a>."
        }
    ];

    function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<div class="max-w-2xl mx-auto p-4 mt-8 space-y-4">
    <h1 class="items-center justify-center text-5xl font-extrabold text-center pb-6">
        FAQs about Concord
    </h1>

	{#each faqs as faq, i}
		<div class="border border-white/10 rounded-xl overflow-hidden bg-slate-900">
			
			<button onclick={() => toggle(i)} class="w-full flex justify-between items-center p-4 text-left">
			    <span class="font-medium">{faq.question}</span>
				
			    <span class="transition-transform duration-200 text-1xl ease-in-out {openIndex === i ? 'rotate-180' : ''}">
				    <i class="fa-solid fa-angle-up"></i>
			    </span>
			</button>

			{#if openIndex === i}
				<div class="p-4 pt-4 text-md text-gray-300 border-t border-white/10">
					{@html faq.answer}
				</div>
			{/if}
        </div>
	{/each}
</div>