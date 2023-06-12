<script lang="ts">
  import { studio } from "$lib/stores";

  export let icon: string;
  export let label: string;

  /**
   * The key bind that would trigger the click() function on the button.
   */
  export let keyBind: string = "";

  export let useCtrl: boolean = false;
  export let useAlt: boolean = false;
  export let useShift: boolean = false;

  /**
   * Specifies whether or not to render a fake button, which is semantically a div.
   * This is useful in instances where the button's default event would otherwise not propagate to the parent.
   */
  export let isFake: boolean = false;
  export let onClick: () => void = () => {};

  let button: HTMLButtonElement | HTMLDivElement;

  const handleKeyBind = (e: KeyboardEvent & { currentTarget: EventTarget & Window }) => {
    if (e.repeat) return;
    if (useCtrl && !e.ctrlKey) return;
    if (useAlt && !e.altKey) return;
    if (useShift && !e.shiftKey) return;

    if (keyBind.toLowerCase() !== e.key.toLowerCase()) return;

    e.preventDefault();
    button.click();
  };
</script>

<svelte:window on:keydown={handleKeyBind} />

<svelte:element
  this={isFake ? "div" : "button"}
  class="p-[0.1rem] rounded-[0.6rem] min-w-[1.5rem] min-h-[1.5rem] bg-gradient-to-b from-neutral-800 to-black cursor-pointer"
  on:click={onClick}
  bind:this={button}
>
  <div class="p-[0.1rem] rounded-[0.5rem] bg-gradient-to-b from-zinc-600 to-zinc-800">
    <div class="p-[0.1rem] rounded-[0.4rem] flex items-center gap-3 px-2 py-1 bg-zinc-800">
      {#if icon}
        <img src={icon} class="w-4 h-4 bg-yellow brightness-200" alt="" />
      {/if}

      {#if label}
        <p class="m-0 text-white font-mono uppercase">{label}</p>
      {/if}

      {#if keyBind}
        {#if useCtrl}
          <div class="min-w-[1.5rem] h-6 px-[0.375rem] rounded-md bg-zinc-900 border-[1px] border-neutral-700 flex justify-center items-center">
            <span class="m-0 text-neutral-300 text-sm font-mono">Ctrl</span>
          </div>
        {/if}
        {#if useAlt}
          <div class="min-w-[1.5rem] h-6 px-[0.375rem] rounded-md bg-zinc-900 border-[1px] border-neutral-700 flex justify-center items-center">
            <span class="m-0 text-neutral-300 text-sm font-mono">Alt</span>
          </div>
        {/if}
        {#if useShift}
          <div class="min-w-[1.5rem] h-6 px-[0.375rem] rounded-md bg-zinc-900 border-[1px] border-neutral-700 flex justify-center items-center">
            <span class="m-0 text-neutral-300 text-sm font-mono">Shift</span>
          </div>
        {/if}
        <div class="min-w-[1.5rem] h-6 px-[0.375rem] rounded-md bg-zinc-900 border-[1px] border-neutral-700 flex justify-center items-center">
          <span class="m-0 text-neutral-300 text-sm font-mono">{keyBind.toUpperCase()}</span>
        </div>
      {/if}
    </div>
  </div>
</svelte:element>
