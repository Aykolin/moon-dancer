<script lang="ts">
  import Icon from "./Icon.svelte";
  import { isDesktopRuntime } from "../lib/desktop";
  import { language, pick } from "../lib/i18n";

  let { title, children }: { title: string; children: import("svelte").Snippet } = $props();

  async function controlWindow(action: "minimize" | "maximize" | "close") {
    if (!isDesktopRuntime()) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const window = getCurrentWindow();
    if (action === "minimize") await window.minimize();
    else if (action === "maximize") await window.toggleMaximize();
    else await window.close();
  }
</script>

<section class="window-frame">
  <header class="titlebar" data-tauri-drag-region>
    <span class="title-icon"><Icon name="sparkle" size={17} /></span>
    <strong>{title} - Moon Dancer</strong>
    <div class="window-controls">
      <button type="button" aria-label={pick($language, "Minimizar", "Minimize")} onclick={() => controlWindow("minimize")}><Icon name="minus" size={13} /></button>
      <button type="button" aria-label={pick($language, "Maximizar ou restaurar", "Maximize or restore")} onclick={() => controlWindow("maximize")}><Icon name="maximize" size={11} /></button>
      <button type="button" class="close" aria-label={pick($language, "Fechar", "Close")} onclick={() => controlWindow("close")}><Icon name="close" size={12} /></button>
    </div>
  </header>
  <div class="window-content">{@render children()}</div>
</section>
