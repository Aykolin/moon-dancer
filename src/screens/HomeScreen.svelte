<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import MoonSprite from "../components/MoonSprite.svelte";
  import { formatLongDate, isoDate, moonPhaseFor } from "../lib/moon";
  import { language, pick } from "../lib/i18n";
  import type { JournalEntry, Note, ScreenId } from "../lib/types";

  let {
    journalEntries,
    notes,
    onNavigate,
  }: {
    journalEntries: JournalEntry[];
    notes: Note[];
    onNavigate: (screen: ScreenId) => void;
  } = $props();

  const today = isoDate();
  const phase = $derived(moonPhaseFor(today, $language));
  const hasToday = $derived(journalEntries.some((entry) => entry.entryDate === today));
  const latestNote = $derived(notes[0]);
</script>

<div class="home-screen">
  <section class="hero-panel">
    <div class="hero-copy">
      <p class="eyebrow">{formatLongDate(today, $language)}</p>
      <h1>{pick($language, "Bem-vinda ao seu cantinho lunar.", "Welcome to your lunar corner.")}</h1>
      <p>{pick($language, "Um lugar quieto para escrever, guardar e lembrar.", "A quiet place to write, keep, and remember.")}</p>
      <div class="hero-actions">
        <button class="xp-button primary" onclick={() => onNavigate("journal")}><Icon name="journal" size={17} /> {pick($language, "Novo diário", "New journal entry")}</button>
        <button class="xp-button" onclick={() => onNavigate("notes")}><Icon name="note" size={17} /> {pick($language, "Nova nota", "New note")}</button>
      </div>
    </div>
    <div class="moon-scene" aria-label={`${phase.name}. ${phase.description}`}>
      <span class="star one">✦</span><span class="star two">✧</span><span class="star three">✦</span>
      <div class="hero-moon"><MoonSprite phase={phase.key} size="146px" label={phase.name} /></div>
      <p>{phase.name}</p>
    </div>
  </section>

  <section class="home-grid">
    <article class="status-card">
      <span class="card-icon"><MoonSprite phase={phase.key} size="36px" decorative /></span>
      <div><small>{pick($language, "Hoje", "Today")}</small><h2>{hasToday ? pick($language, "Seu dia já tem um registro", "Your day already has an entry") : pick($language, "Como foi seu dia?", "How was your day?")}</h2></div>
      <button class="link-button" onclick={() => onNavigate("journal")}>{hasToday ? pick($language, "Abrir diário", "Open journal") : pick($language, "Começar a escrever", "Start writing")} →</button>
    </article>
    <article class="status-card">
      <span class="card-icon"><Icon name="star" size={27} /></span>
      <div><small>{pick($language, "Notas", "Notes")}</small><h2>{latestNote ? latestNote.title || pick($language, "Sua nota mais recente", "Your latest note") : pick($language, "Uma ideia pode morar aqui", "An idea can live here")}</h2></div>
      <button class="link-button" onclick={() => onNavigate("notes")}>{latestNote ? pick($language, "Ver notas", "View notes") : pick($language, "Criar primeira nota", "Create first note")} →</button>
    </article>
    <article class="status-card">
      <span class="card-icon"><Icon name="clock" size={27} /></span>
      <div><small>{pick($language, "Memórias", "Memories")}</small><h2>{journalEntries.length} {journalEntries.length === 1 ? pick($language, "registro guardado", "saved entry") : pick($language, "registros guardados", "saved entries")}</h2></div>
      <button class="link-button" onclick={() => onNavigate("memories")}>{pick($language, "Reencontrar histórias", "Rediscover stories")} →</button>
    </article>
  </section>
</div>
