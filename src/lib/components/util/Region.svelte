<script lang="ts">
  let clazz = "";
  export { clazz as class };

  export let innerClass = "";
</script>

<div class="w-full h-full bg-gradient-to-b from-neutral-900 to-neutral-950 to-90% p-0.5 rounded-md {clazz}">
  <div class="w-full h-full bg-neutral-900 rounded-[.3125rem] shadow-inner-lg {innerClass}">
    <slot />
  </div>
</div>
