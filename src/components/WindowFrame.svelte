<script lang="ts">
  import Icon from "./Icon.svelte";
  let { title, children }: { title: string; children: import("svelte").Snippet } = $props();
</script>

<section class="window-frame">
  <header class="titlebar">
    <span class="title-icon"><Icon name="sparkle" size={17} /></span>
    <strong>{title} - Moon Dancer</strong>
    <div class="window-controls" aria-hidden="true">
      <span><Icon name="minus" size={13} /></span><span><Icon name="maximize" size={11} /></span><span class="close"><Icon name="close" size={12} /></span>
    </div>
  </header>
  <div class="window-content">{@render children()}</div>
</section>
