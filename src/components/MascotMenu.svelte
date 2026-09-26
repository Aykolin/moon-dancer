<script lang="ts">
  import { onMount } from "svelte";
  import type { ScreenId } from "../lib/types";
  import Icon from "./Icon.svelte";
  import { language, pick } from "../lib/i18n";

  let {
    active,
    onNavigate,
  }: { active: ScreenId; onNavigate: (screen: ScreenId) => void } = $props();

  let open = $state(false);
  let root: HTMLDivElement;

  const actions: { id: ScreenId; label: [string, string]; icon: string; direction: string }[] = [
    { id: "journal", label: ["Diário", "Journal"], icon: "journal", direction: "left" },
    { id: "notes", label: ["Notas", "Notes"], icon: "note", direction: "top" },
    { id: "calendar", label: ["Calendário", "Calendar"], icon: "calendar", direction: "right" },
  ];

  function choose(screen: ScreenId) {
    onNavigate(screen);
    open = false;
  }

  onMount(() => {
    function closeOutside(event: PointerEvent) {
      if (open && event.target instanceof Node && !root.contains(event.target)) open = false;
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") open = false;
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  });
</script>

<div class:open class="mascot-menu" bind:this={root}>
  <div class="radial-actions" id="mascot-shortcuts" aria-label={pick($language, "Atalhos do mascote", "Mascot shortcuts")}>
    {#each actions as action}
      <button
        class={`radial-action ${action.direction}`}
        class:active={active === action.id}
        disabled={!open}
        aria-label={`${pick($language, "Abrir", "Open")} ${pick($language, ...action.label)}`}
        aria-current={active === action.id ? "page" : undefined}
        onclick={() => choose(action.id)}
      >
        <Icon name={action.icon} size={24} />
        <span>{pick($language, ...action.label)}</span>
      </button>
    {/each}
  </div>

  <button
    class="mascot-button"
    aria-label={open ? pick($language, "Fechar atalhos do mascote", "Close mascot shortcuts") : pick($language, "Abrir atalhos do mascote", "Open mascot shortcuts")}
    aria-expanded={open}
    aria-controls="mascot-shortcuts"
    onclick={() => open = !open}
  >
    <img src="/mascot/moon-dancer-mascot.png" alt="" />
    <span class="mascot-hint">{open ? pick($language, "Fechar", "Close") : pick($language, "Atalhos", "Shortcuts")}</span>
  </button>
</div>

<style>
  .mascot-menu {
    position: fixed;
    right: 104px;
    bottom: 116px;
    z-index: 80;
    width: 94px;
    height: 94px;
    pointer-events: none;
  }

  .mascot-button {
    position: relative;
    z-index: 3;
    width: 94px;
    height: 94px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    color: var(--ink);
    background: transparent;
    filter: drop-shadow(0 8px 12px rgba(20, 14, 35, .28));
    cursor: pointer;
    pointer-events: auto;
    transition: transform .2s ease, filter .2s ease;
  }

  .mascot-button:hover,
  .mascot-button:focus-visible { transform: translateY(-3px) scale(1.04); }
  .mascot-button:focus-visible { outline: 2px solid var(--pink); outline-offset: 4px; }
  .open .mascot-button { transform: translateY(-2px) scale(.96); filter: drop-shadow(0 6px 16px rgba(25, 15, 45, .38)); }

  .mascot-button img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
    animation: mascot-float 3.2s ease-in-out infinite;
  }

  .mascot-hint {
    position: absolute;
    left: 50%;
    bottom: -5px;
    padding: 3px 8px;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--ink);
    background: var(--surface-strong);
    box-shadow: 0 5px 14px rgba(28, 19, 46, .14);
    font-size: .65rem;
    white-space: nowrap;
    opacity: 0;
    transform: translate(-50%, 4px);
    transition: opacity .16s ease, transform .16s ease;
  }

  .mascot-button:hover .mascot-hint,
  .mascot-button:focus-visible .mascot-hint,
  .open .mascot-hint { opacity: 1; transform: translate(-50%, 0); }

  .radial-action {
    --x: 0px;
    --y: 0px;
    position: absolute;
    left: 16px;
    top: 16px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 62px;
    height: 62px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--blue-800);
    background: var(--surface-strong);
    box-shadow: 0 9px 22px rgba(25, 16, 44, .2);
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transform: translate(0, 0) scale(.35);
    transition: transform .22s cubic-bezier(.2, .8, .2, 1.15), opacity .14s ease, background-color .16s ease;
  }

  .radial-action.left { --x: -104px; --y: 7px; }
  .radial-action.top { --x: 0px; --y: -104px; }
  .radial-action.right { --x: 104px; --y: 7px; }
  .radial-action:nth-child(2) { transition-delay: .035s; }
  .radial-action:nth-child(3) { transition-delay: .07s; }

  .radial-action span {
    position: absolute;
    left: 50%;
    bottom: -24px;
    padding: 3px 7px;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--ink);
    background: var(--surface-strong);
    font-size: .62rem;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  .open .radial-action {
    opacity: 1;
    pointer-events: auto;
    transform: translate(var(--x), var(--y)) scale(1);
  }

  .radial-action:hover,
  .radial-action:focus-visible,
  .radial-action.active {
    color: var(--blue-950);
    border-color: var(--blue-500);
    background: var(--selected);
  }

  .radial-action:focus-visible { outline: 2px solid var(--pink); outline-offset: 3px; }

  @keyframes mascot-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @media (max-width: 760px) {
    .mascot-menu { right: 78px; bottom: 76px; width: 76px; height: 76px; }
    .mascot-button { width: 76px; height: 76px; }
    .radial-action { left: 11px; top: 11px; width: 54px; height: 54px; }
    .radial-action.left { --x: -78px; --y: 4px; }
    .radial-action.top { --x: 0px; --y: -82px; }
    .radial-action.right { --x: 78px; --y: 4px; }
    .radial-action span { display: none; }
  }
</style>
