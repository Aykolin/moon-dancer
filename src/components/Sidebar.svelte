<script lang="ts">
  import Icon from "./Icon.svelte";
  import type { ScreenId } from "../lib/types";

  let {
    active,
    onNavigate,
  }: { active: ScreenId; onNavigate: (screen: ScreenId) => void } = $props();

  const items: { id: ScreenId; label: string; icon: string }[] = [
    { id: "home", label: "Início", icon: "home" },
    { id: "journal", label: "Diário", icon: "journal" },
    { id: "notes", label: "Notas", icon: "note" },
    { id: "calendar", label: "Calendário", icon: "calendar" },
    { id: "memories", label: "Memórias", icon: "memories" },
    { id: "backup", label: "Backup", icon: "backup" },
    { id: "settings", label: "Configurações", icon: "settings" },
  ];
</script>

<aside class="sidebar" aria-label="Navegação principal">
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
        <span>{item.label}</span>
      </button>
    {/each}
  </nav>
</aside>
