<script lang="ts">
  let isOpen = $state(false);

  function toggleMenu() {
    isOpen = !isOpen;
  }

  let { links = [] } = $props();
</script>

<div class="relative">
  <button 
    onclick={toggleMenu} 
    class="block md:hidden text-2xl hover:scale-105 rounded-md"
    aria-label="Open menu"
  >
    <i class="fa-solid fa-bars"></i>
  </button>

  {#if isOpen}
    <div class="block md:hidden absolute top-full right-0 mt-6 bg-slate-800 p-4 rounded-md shadow-lg">
      
      {#each links as link}
        <a 
          href={link.href} 
          class="block text-lg hover:scale-105 rounded-md p-2"
        >
          {link.label}
        </a>
      {/each}

      <a href="https://github.com/liber-organiza-cao" target="_blank" class="block text-lg hover:scale-105 rounded-md p-2"> GitHub </a>

    </div>
  {/if}
</div>