<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import Icon from "./Icon.svelte";
  import { isDesktopRuntime } from "../lib/desktop";
  import { language, pick } from "../lib/i18n";

  let { title, children }: { title: string; children: import("svelte").Snippet } = $props();

  async function controlWindow(action: "minimize" | "maximize" | "close") {
    if (!isDesktopRuntime()) return;
    const appWindow = getCurrentWindow();
    if (action === "minimize") await appWindow.minimize();
    else if (action === "maximize") await appWindow.toggleMaximize();
    else await appWindow.close();
  }

  async function startDragging(event: MouseEvent) {
    if (!isDesktopRuntime() || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    event.preventDefault();
    await invoke("start_window_drag");
  }

</script>

<section class="window-frame">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <header class="titlebar" role="banner" onmousedown={startDragging}>
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
