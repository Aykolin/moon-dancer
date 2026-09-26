<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import MoonSprite from "../components/MoonSprite.svelte";
  import { buildCalendarMonth } from "../lib/calendar";
  import { isoDate, moonPhaseFor } from "../lib/moon";
  import { language, pick } from "../lib/i18n";
  import type { JournalEntry } from "../lib/types";

  let {
    entries,
    onOpenDate,
  }: { entries: JournalEntry[]; onOpenDate: (date: string) => void } = $props();

  const today = isoDate();
  let cursor = $state(new Date(`${today}T12:00:00`));
  let selectedDate = $state(today);

  const monthLabel = $derived(new Intl.DateTimeFormat($language === "en" ? "en-US" : "pt-BR", { month: "long", year: "numeric" }).format(cursor));
  const calendarDays = $derived(buildCalendarMonth(cursor));

  const selectedEntries = $derived(entries.filter((entry) => entry.entryDate === selectedDate));
  const selectedPhase = $derived(moonPhaseFor(selectedDate, $language));

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
      <button class="square-button" aria-label={pick($language, "Mês anterior", "Previous month")} onclick={() => moveMonth(-1)}><Icon name="chevron-left" size={19} /></button>
      <h2>{monthLabel}</h2>
      <button class="square-button" aria-label={pick($language, "Próximo mês", "Next month")} onclick={() => moveMonth(1)}><Icon name="chevron-right" size={19} /></button>
      <button class="xp-button" onclick={goToday}>{pick($language, "Hoje", "Today")}</button>
    </div>
    <div class="weekdays" aria-hidden="true">{#each ($language === "en" ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]) as day}<span>{day}</span>{/each}</div>
    <div class="calendar-grid">
      {#each calendarDays as item}
        <button
          class:muted={!item.current}
          class:today={item.date === today}
          class:selected={item.date === selectedDate}
          aria-label={`${item.date}, ${moonPhaseFor(item.date, $language).name}`}
          onclick={() => selectedDate = item.date}
        >
          <span class="day-number">{item.day}</span>
          <span class="day-moon"><MoonSprite phase={moonPhaseFor(item.date, $language).key} size="32px" decorative /></span>
          {#if entries.some((entry) => entry.entryDate === item.date)}<span class="entry-dot" title={pick($language, "Possui registro", "Has an entry")}></span>{/if}
        </button>
      {/each}
    </div>
  </section>

  <aside class="lunar-detail">
    <div class="large-moon"><MoonSprite phase={selectedPhase.key} size="132px" label={selectedPhase.name} /></div>
    <h2>{selectedPhase.name}</h2>
    <p>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString($language === "en" ? "en-US" : "pt-BR")}</p>
    <p class="lunar-copy">{selectedPhase.description}</p>
    {#if selectedEntries.length > 0}
      <h3>{pick($language, "Registros deste dia", "Entries from this day")}</h3>
      {#each selectedEntries as entry}<button class="memory-mini" onclick={() => onOpenDate(entry.entryDate)}><strong>{entry.title || pick($language, "Registro sem título", "Untitled entry")}</strong><span>{entry.content.slice(0, 58)}</span></button>{/each}
    {:else}
      <p class="quiet-copy">{pick($language, "Nenhum registro nesta data.", "No entries on this date.")}</p>
      <button class="xp-button" onclick={() => onOpenDate(selectedDate)}>{pick($language, "Escrever neste dia", "Write on this day")}</button>
    {/if}
  </aside>
</div>
