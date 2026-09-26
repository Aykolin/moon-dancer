<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import MoonSprite from "../components/MoonSprite.svelte";
  import { formatLongDate, isoDate, moonPhaseFor } from "../lib/moon";
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
  const phase = moonPhaseFor(today);
  const hasToday = $derived(journalEntries.some((entry) => entry.entryDate === today));
  const latestNote = $derived(notes[0]);
</script>

<div class="home-screen">
  <section class="hero-panel">
    <div class="hero-copy">
      <p class="eyebrow">{formatLongDate(today)}</p>
      <h1>Bem-vinda ao seu cantinho lunar.</h1>
      <p>Um lugar quieto para escrever, guardar e lembrar.</p>
      <div class="hero-actions">
        <button class="xp-button primary" onclick={() => onNavigate("journal")}><Icon name="journal" size={17} /> Novo diário</button>
        <button class="xp-button" onclick={() => onNavigate("notes")}><Icon name="note" size={17} /> Nova nota</button>
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
      <div><small>Hoje</small><h2>{hasToday ? "Seu dia já tem um registro" : "Como foi seu dia?"}</h2></div>
      <button class="link-button" onclick={() => onNavigate("journal")}>{hasToday ? "Abrir diário" : "Começar a escrever"} →</button>
    </article>
    <article class="status-card">
      <span class="card-icon"><Icon name="star" size={27} /></span>
      <div><small>Notas</small><h2>{latestNote ? latestNote.title || "Sua nota mais recente" : "Uma ideia pode morar aqui"}</h2></div>
      <button class="link-button" onclick={() => onNavigate("notes")}>{latestNote ? "Ver notas" : "Criar primeira nota"} →</button>
    </article>
    <article class="status-card">
      <span class="card-icon"><Icon name="clock" size={27} /></span>
      <div><small>Memórias</small><h2>{journalEntries.length} {journalEntries.length === 1 ? "registro guardado" : "registros guardados"}</h2></div>
      <button class="link-button" onclick={() => onNavigate("memories")}>Reencontrar histórias →</button>
    </article>
  </section>
</div>
