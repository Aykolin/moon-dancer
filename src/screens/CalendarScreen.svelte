<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import MoonSprite from "../components/MoonSprite.svelte";
  import { buildCalendarMonth } from "../lib/calendar";
  import { isoDate, moonPhaseFor } from "../lib/moon";
  import type { JournalEntry } from "../lib/types";

  let {
    entries,
    onOpenDate,
  }: { entries: JournalEntry[]; onOpenDate: (date: string) => void } = $props();

  const today = isoDate();
  let cursor = $state(new Date(`${today}T12:00:00`));
  let selectedDate = $state(today);

  const monthLabel = $derived(new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(cursor));
  const calendarDays = $derived(buildCalendarMonth(cursor));

  const selectedEntries = $derived(entries.filter((entry) => entry.entryDate === selectedDate));
  const selectedPhase = $derived(moonPhaseFor(selectedDate));

  function moveMonth(delta: number) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
  }

  function goToday() {
    cursor = new Date(`${today}T12:00:00`);
    selectedDate = today;
  }
</script>

<div class="calendar-layout">
  <section class="calendar-panel">
    <div class="calendar-toolbar">
      <button class="square-button" aria-label="Mês anterior" onclick={() => moveMonth(-1)}><Icon name="chevron-left" size={19} /></button>
      <h2>{monthLabel}</h2>
      <button class="square-button" aria-label="Próximo mês" onclick={() => moveMonth(1)}><Icon name="chevron-right" size={19} /></button>
      <button class="xp-button" onclick={goToday}>Hoje</button>
    </div>
    <div class="weekdays" aria-hidden="true">{#each ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as day}<span>{day}</span>{/each}</div>
    <div class="calendar-grid">
      {#each calendarDays as item}
        <button
          class:muted={!item.current}
          class:today={item.date === today}
          class:selected={item.date === selectedDate}
          aria-label={`${item.date}, ${moonPhaseFor(item.date).name}`}
          onclick={() => selectedDate = item.date}
        >
          <span class="day-number">{item.day}</span>
          <span class="day-moon"><MoonSprite phase={moonPhaseFor(item.date).key} size="32px" decorative /></span>
          {#if entries.some((entry) => entry.entryDate === item.date)}<span class="entry-dot" title="Possui registro"></span>{/if}
        </button>
      {/each}
    </div>
  </section>

  <aside class="lunar-detail">
    <div class="large-moon"><MoonSprite phase={selectedPhase.key} size="132px" label={selectedPhase.name} /></div>
    <h2>{selectedPhase.name}</h2>
    <p>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR")}</p>
    <p class="lunar-copy">{selectedPhase.description}</p>
    {#if selectedEntries.length > 0}
      <h3>Registros deste dia</h3>
      {#each selectedEntries as entry}<button class="memory-mini" onclick={() => onOpenDate(entry.entryDate)}><strong>{entry.title || "Registro sem título"}</strong><span>{entry.content.slice(0, 58)}</span></button>{/each}
    {:else}
      <p class="quiet-copy">Nenhum registro nesta data.</p>
      <button class="xp-button" onclick={() => onOpenDate(selectedDate)}>Escrever neste dia</button>
    {/if}
  </aside>
</div>
