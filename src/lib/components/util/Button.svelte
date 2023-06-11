<script lang="ts">
  export let icon: string;
  export let label: string;
  export let commandKey: string;

  export let onClick: () => void = () => {};
</script>

<button class="p-[0.1rem] rounded-[0.5rem] min-w-[1.5rem] min-h-[1.5rem] bg-red-500" on:click={onClick}>
  <div class="p-[0.1rem] rounded-[0.4rem] bg-blue-500">
    <div class="p-[0.1rem] rounded-[0.3rem] flex gap-3 px-3 py-1 bg-green-500">
      {#if icon}
        <img src={icon} class="w-1 h-1 bg-yellow" alt="" />
      {/if}

      {#if label}
        <p class="m-0 text-white font-mono">{label}</p>
      {/if}

      {#if commandKey}
        <div class="p-1 bg-blue-400">
          <span class="m-0 text-neutral-100 font-mono bg-blue-400">{commandKey}</span>
        </div>
      {/if}
    </div>
  </div>
</button>
