<script lang="ts">
  import Icon from "./Icon.svelte";
  import { language, pick } from "../lib/i18n";
  import type { ScreenId } from "../lib/types";
  import { APP_VERSION } from "../lib/version";

  let {
    active,
    onNavigate,
  }: { active: ScreenId; onNavigate: (screen: ScreenId) => void } = $props();

  const items: { id: ScreenId; label: [string, string]; icon: string }[] = [
    { id: "home", label: ["Início", "Home"], icon: "home" },
    { id: "journal", label: ["Diário", "Journal"], icon: "journal" },
    { id: "notes", label: ["Notas", "Notes"], icon: "note" },
    { id: "calendar", label: ["Calendário", "Calendar"], icon: "calendar" },
    { id: "memories", label: ["Memórias", "Memories"], icon: "memories" },
    { id: "backup", label: ["Backup", "Backup"], icon: "backup" },
    { id: "settings", label: ["Configurações", "Settings"], icon: "settings" },
  ];
</script>

<aside class="sidebar" aria-label={pick($language, "Navegação principal", "Main navigation")}>
  <div class="sidebar-brand">
    <img src="/brand/moon-dancer-icon-transparent.png" alt="" />
    <span>Moon Dancer</span>
  </div>
  <nav>
    {#each items as item}
      <button
        class:active={active === item.id}
        aria-current={active === item.id ? "page" : undefined}
        onclick={() => onNavigate(item.id)}
      >
        <span class="nav-icon"><Icon name={item.icon} size={20} /></span>
        <span>{pick($language, ...item.label)}</span>
      </button>
    {/each}
  </nav>
  <span class="sidebar-version">MOON DANCER {APP_VERSION}</span>
</aside>
