<script lang="ts">
  export let src: string;

  export let fill: string = "";
</script>

<div class="w-4 h-4 {fill ? fill : 'bg-neutral-200'}" style="mask: url({src}) center / contain" />
