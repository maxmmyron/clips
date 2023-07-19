<script lang="ts">
  export let src: string;

  // TODO: add alt tag that works with screen readers

  export let fill: string = "";
</script>

<div class="w-4 h-4 {fill ? fill : 'bg-neutral-200'}" style="--src: url('{src}')" />

<style>
  div {
    mask-image: var(--src);
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
  }
</style>
