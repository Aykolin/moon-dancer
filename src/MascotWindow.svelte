<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";
  import Icon from "./components/Icon.svelte";
  import { hideMascot, isDesktopRuntime, openMainWindow, quitMoonDancer, setMascotExpanded } from "./lib/desktop";
  import { loadSettings } from "./lib/settings";
  import type { ScreenId, ThemeId } from "./lib/types";

  type Panel = "closed" | "shortcuts" | "context";

  let panel = $state<Panel>("closed");
  let theme = $state<ThemeId>(loadSettings().theme);
  let closingTimer: ReturnType<typeof setTimeout> | undefined;
  let dragResetTimer: ReturnType<typeof setTimeout> | undefined;
  let pointerId: number | undefined;
  let pointerOrigin: { x: number; y: number } | undefined;
  let nativeDragStarted = false;
  let suppressActivation = false;

  const shortcuts: { id: ScreenId; label: string; icon: string; direction: string }[] = [
    { id: "journal", label: "Diário", icon: "journal", direction: "left" },
    { id: "notes", label: "Notas", icon: "note", direction: "top" },
    { id: "calendar", label: "Calendário", icon: "calendar", direction: "right" },
  ];

  async function showPanel(next: Exclude<Panel, "closed">) {
    if (closingTimer) clearTimeout(closingTimer);
    if (panel === next) {
      closePanel();
      return;
    }
    await setMascotExpanded(true);
    panel = next;
  }

  function closePanel() {
    panel = "closed";
    closingTimer = setTimeout(() => void setMascotExpanded(false), 170);
  }

  async function openShortcut(screen: ScreenId) {
    await openMainWindow(screen);
    closePanel();
  }

  function openContext(event: MouseEvent) {
    event.preventDefault();
    void showPanel("context");
  }

  function prepareMascotDrag(event: PointerEvent) {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    pointerOrigin = { x: event.screenX, y: event.screenY };
    nativeDragStarted = false;
    (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
  }

  async function moveMascot(event: PointerEvent) {
    if (event.pointerId !== pointerId || !pointerOrigin || nativeDragStarted) return;
    const distance = Math.hypot(event.screenX - pointerOrigin.x, event.screenY - pointerOrigin.y);
    if (distance < 5 || !isDesktopRuntime()) return;
    nativeDragStarted = true;
    suppressActivation = true;
    event.preventDefault();
    const target = event.currentTarget as HTMLButtonElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    await invoke("start_window_drag");
    if (dragResetTimer) clearTimeout(dragResetTimer);
    dragResetTimer = setTimeout(() => {
      suppressActivation = false;
    }, 250);
  }

  function finishMascotPointer(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    pointerId = undefined;
    pointerOrigin = undefined;
    nativeDragStarted = false;
  }

  function activateMascot() {
    if (suppressActivation) {
      suppressActivation = false;
      if (dragResetTimer) clearTimeout(dragResetTimer);
      return;
    }
    void showPanel("shortcuts");
  }

  onMount(() => {
    function refreshTheme() {
      theme = loadSettings().theme;
    }

    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }

    window.addEventListener("storage", refreshTheme);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("storage", refreshTheme);
      window.removeEventListener("keydown", escape);
      if (closingTimer) clearTimeout(closingTimer);
      if (dragResetTimer) clearTimeout(dragResetTimer);
    };
  });
</script>

<svelte:window oncontextmenu={(event) => event.preventDefault()} />

<div class={`mascot-stage theme-${theme}`} class:expanded={panel !== "closed"}>
  <div class:visible={panel === "shortcuts"} class="shortcut-wheel" aria-label="Atalhos do mascote">
    {#each shortcuts as shortcut}
      <button
        class={`shortcut ${shortcut.direction}`}
        disabled={panel !== "shortcuts"}
        aria-label={`Abrir ${shortcut.label}`}
        onclick={() => openShortcut(shortcut.id)}
      >
        <Icon name={shortcut.icon} size={23} />
        <span>{shortcut.label}</span>
      </button>
    {/each}
  </div>

  <div class:visible={panel === "context"} class="context-card" role="menu">
    <button role="menuitem" onclick={() => hideMascot()}>
      <Icon name="eye-off" size={18} />
      <span><strong>Ocultar mascote</strong><small>Fecha apenas o mascote</small></span>
    </button>
    <button class="danger" role="menuitem" onclick={() => quitMoonDancer()}>
      <Icon name="close" size={18} />
      <span><strong>Fechar Moon Dancer</strong><small>Encerra o aplicativo</small></span>
    </button>
  </div>

  <button
    class="mascot"
    aria-label={panel === "shortcuts" ? "Fechar atalhos" : "Abrir atalhos do mascote"}
    aria-expanded={panel === "shortcuts"}
    onclick={activateMascot}
    onpointerdown={prepareMascotDrag}
    onpointermove={moveMascot}
    onpointerup={finishMascotPointer}
    onpointercancel={finishMascotPointer}
    oncontextmenu={openContext}
  >
    <img src="/mascot/moon-dancer-mascot.png" alt="" draggable="false" />
    <span>{panel === "context" ? "Menu" : panel === "shortcuts" ? "Fechar" : "Atalhos"}</span>
  </button>
</div>

<style>
  :global(html.mascot-root), :global(body.mascot-body), :global(body.mascot-body #app) {
    width: 100%;
    min-width: 0 !important;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: transparent !important;
  }
  :global(body.mascot-body) { user-select: none; }

  .mascot-stage {
    --ink: #cdd6f4;
    --muted: #a6adc8;
    --border: #585b70;
    --surface-strong: rgba(24, 24, 37, .98);
    --selected: #313244;
    --accent: #cba6f7;
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: transparent !important;
    color: var(--ink);
    font-family: "Pixelify Sans", sans-serif;
  }

  .mascot-stage.theme-pastel { --accent: #b4befe; }
  .mascot-stage.theme-white { --accent: #89b4fa; }
  .mascot-stage.theme-rose { --accent: #f5c2e7; }
  .mascot-stage.theme-latte {
    --ink: #4c4f69;
    --muted: #6c6f85;
    --border: #acb0be;
    --surface-strong: rgba(230, 233, 239, .98);
    --selected: #ccd0da;
    --accent: #8839ef;
  }

  button { font: inherit; }
  .mascot {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 5;
    width: 108px;
    height: 108px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    cursor: grab;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 8px 12px rgba(20, 14, 35, .34));
    transition: transform .18s ease, filter .18s ease;
  }
  .mascot:active { cursor: grabbing; }

  .expanded .mascot { top: auto; bottom: 8px; transform: translateX(-50%); }
  .mascot:hover { transform: translate(-50%, -53%) scale(1.04); }
  .expanded .mascot:hover { transform: translateX(-50%) scale(1.04); }
  .mascot:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .mascot img { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; animation: float 3.2s ease-in-out infinite; }
  .mascot > span { position: absolute; left: 50%; bottom: 0; padding: 3px 8px; border: 1px solid var(--border); border-radius: 999px; color: var(--ink); background: var(--surface-strong); font-size: .68rem; white-space: nowrap; transform: translateX(-50%); opacity: 0; transition: opacity .15s ease; }
  .mascot:hover > span, .mascot:focus-visible > span, .expanded .mascot > span { opacity: 1; }

  .shortcut { position: absolute; z-index: 3; display: grid; place-items: center; width: 62px; height: 62px; padding: 0; border: 1px solid var(--border); border-radius: 50%; color: var(--ink); background: var(--surface-strong); box-shadow: 0 9px 22px rgba(20,14,35,.25); cursor: pointer; opacity: 0; transform: scale(.35); transition: opacity .14s ease, transform .2s cubic-bezier(.2,.8,.2,1.15), background-color .15s ease; }
  .shortcut.left { left: calc(50% - 134px); bottom: 31px; }
  .shortcut.top { left: calc(50% - 31px); bottom: 137px; }
  .shortcut.right { left: calc(50% + 72px); bottom: 31px; }
  .shortcut-wheel.visible .shortcut { opacity: 1; transform: scale(1); }
  .shortcut:hover, .shortcut:focus-visible { color: #11111b; border-color: var(--accent); background: var(--accent); }
  .theme-latte .shortcut:hover, .theme-latte .shortcut:focus-visible { color: #eff1f5; }
  .shortcut > span { position: absolute; left: 50%; bottom: -23px; padding: 3px 7px; border: 1px solid var(--border); border-radius: 999px; color: var(--ink); background: var(--surface-strong); font-size: .63rem; white-space: nowrap; transform: translateX(-50%); }

  .context-card { position: absolute; left: 50%; bottom: 118px; z-index: 4; width: 236px; padding: 7px; border: 1px solid var(--border); border-radius: 13px; background: var(--surface-strong); box-shadow: 0 16px 38px rgba(18, 12, 30, .32); opacity: 0; pointer-events: none; transform: translate(-50%, 8px) scale(.96); transform-origin: bottom center; transition: opacity .15s ease, transform .18s ease; }
  .context-card.visible { opacity: 1; pointer-events: auto; transform: translate(-50%, 0) scale(1); }
  .context-card button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border: 0; border-radius: 8px; color: var(--ink); background: transparent; text-align: left; cursor: pointer; }
  .context-card button:hover, .context-card button:focus-visible { background: var(--selected); outline: none; }
  .context-card button.danger { color: #f38ba8; }
  .theme-latte .context-card button.danger { color: #d20f39; }
  .context-card span { display: grid; gap: 2px; }
  .context-card small { color: var(--muted); font-size: .67rem; }

  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
</style>
