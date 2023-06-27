<script lang="ts">
  export let src: string;

  // TODO: add alt tag that works with screen readers

  export let fill: string = "";
</script>

<div class="w-4 h-4 {fill ? fill : 'bg-neutral-200'}" style="mask: url({src}) no-repeat center / contain" />
