<script lang="ts">
  import Key from "./Key.svelte";

  export let icon: string = "";

  /**
   * The key bind that would trigger the click() function on the button.
   */
  export let key: string = "";

  export let useCtrl: boolean = false;
  export let useAlt: boolean = false;
  export let useShift: boolean = false;

  /**
   * Specifies whether or not to render a fake button, which is semantically a div.
   * This is useful in instances where the button's default event would otherwise not propagate to the parent.
   */
  export let isFake: boolean = false;
  export let onClick: () => void = () => {};

  export let disabled: boolean = false;

  let button: HTMLButtonElement | HTMLDivElement;

  const handleKeyBind = (e: KeyboardEvent & { currentTarget: EventTarget & Window }) => {
    if (e.repeat) return;
    if (useCtrl && !e.ctrlKey) return;
    if (useAlt && !e.altKey) return;
    if (useShift && !e.shiftKey) return;

    if (key.toLowerCase() !== e.key.toLowerCase()) return;

    e.preventDefault();
    button.click();
  };
</script>

<svelte:window on:keydown={handleKeyBind} />

<svelte:element
  this={isFake ? "div" : "button"}
  class="group p-[0.1rem] rounded-[0.6rem] min-w-[1.5rem] min-h-[1.5rem] transition-all
  bg-gradient-to-b from-neutral-800 via-black to-neutral-800 bg-[size:1px_200%]
  {!disabled ? 'hover:shadow-lg active:shadow-none active:bg-[position:bottom]' : ''}
  {!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}"
  {disabled}
  on:click={onClick}
  bind:this={button}
>
  <div
    class="p-[0.1rem] rounded-[0.5rem] transition-all
    {!disabled ? 'bg-gradient-to-b from-zinc-600 via-zinc-800 to-zinc-700 bg-[size:1px_200%]' : 'bg-zinc-800'}
    {!disabled ? 'group-hover:bg-[size:1px_250%] group-active:bg-[position:bottom]' : ''}"
  >
    <div class="p-[0.1rem] rounded-[0.4rem] flex items-center gap-3 px-2 py-1 transition-all bg-zinc-800" class:opacity-75={disabled}>
      {#if icon}
        <img src={icon} class="w-3 h-3 bg-yellow brightness-200" alt="" />
      {/if}

      <p class="m-0 text-neutral-200 font-mono uppercase" class:text-neutral-400={disabled}><slot /></p>

      {#if key}
        <div class="flex items-center gap-1">
          {#if useCtrl}
            <Key>Ctrl</Key>
            <span class="text-neutral-400 text-xs font-mono">+</span>
          {/if}
          {#if useAlt}
            <Key>⌥</Key>
            <span class="text-neutral-400 text-xs font-mono">+</span>
          {/if}
          {#if useShift}
            <Key>⇑</Key>
            <span class="text-neutral-400 text-xs font-mono">+</span>
          {/if}
          <Key>{key.toUpperCase()}</Key>
        </div>
      {/if}
    </div>
  </div>
</svelte:element>
