<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import { formatLongDate, isoDate } from "../lib/moon";
  import { repository } from "../lib/repository";
  import type { JournalEntry, Note, SearchResult } from "../lib/types";

  let {
    journalEntries,
    notes,
    onOpenJournal,
    onOpenNotes,
  }: {
    journalEntries: JournalEntry[];
    notes: Note[];
    onOpenJournal: (id: string) => void;
    onOpenNotes: (id: string) => void;
  } = $props();

  let query = $state("");
  let filter = $state<"all" | "journal" | "note" | "favorites">("all");
  let results = $state<SearchResult[]>([]);
  let searching = $state(false);

  const today = new Date(`${isoDate()}T12:00:00`);
  const memories = $derived(
    journalEntries.filter((entry) => {
      const date = new Date(`${entry.entryDate}T12:00:00`);
      return date.getMonth() === today.getMonth() && date.getDate() === today.getDate() && date.getFullYear() < today.getFullYear();
    }),
  );
  const visibleResults = $derived(
    results.filter((result) => filter === "all" || (filter === "favorites" ? result.isFavorite : result.kind === filter)),
  );

  async function search() {
    if (!query.trim()) {
      results = [];
      return;
    }
    searching = true;
    results = await repository.search(query);
    searching = false;
  }

  function open(result: SearchResult) {
    if (result.kind === "journal") onOpenJournal(result.id);
    else onOpenNotes(result.id);
  }
</script>

<div class="memories-screen">
  <section class="search-panel">
    <div><p class="eyebrow">Busca local</p><h1>Reencontre o que você guardou.</h1><p>Nada desta busca sai do seu computador.</p></div>
    <form onsubmit={(event) => { event.preventDefault(); search(); }}>
      <input type="search" aria-label="Buscar no diário e nas notas" placeholder="Buscar palavras, títulos e lembranças..." bind:value={query} />
      <button class="xp-button primary" type="submit"><Icon name="search" size={17} /> {searching ? "Buscando..." : "Buscar"}</button>
    </form>
    <div class="filter-tabs" aria-label="Filtrar resultados">
      {#each [["all", "Todos"], ["journal", "Diário"], ["note", "Notas"], ["favorites", "Favoritos"]] as item}
        <button class:active={filter === item[0]} onclick={() => filter = item[0] as typeof filter}>{item[1]}</button>
      {/each}
    </div>
  </section>

  {#if query.trim()}
    <section class="results-section">
      <h2>Resultados <span>{visibleResults.length}</span></h2>
      {#if visibleResults.length === 0}<div class="empty-state"><span class="empty-icon"><Icon name="search" size={30} /></span><p>Nenhum registro encontrado.</p></div>{/if}
      <div class="result-list">
        {#each visibleResults as result}
          <button onclick={() => open(result)}>
            <span class="result-kind">{result.kind === "journal" ? "Diário" : "Nota"}</span>
            <strong class="title-with-icon">{#if result.isFavorite}<Icon name="star" size={14} filled />{/if}{result.title}</strong>
            <p>{result.excerpt}</p><small>{formatLongDate(result.date)}</small>
          </button>
        {/each}
      </div>
    </section>
  {:else}
    <section class="results-section">
      <h2>Neste dia, em outros anos</h2>
      {#if memories.length === 0}
        <div class="large-empty-state compact"><span class="sparkle"><Icon name="sparkle" size={34} /></span><h2>As memórias chegam com o tempo.</h2><p>Quando houver um registro desta mesma data em outro ano, ele aparecerá aqui.</p></div>
      {:else}
        <div class="result-list">
          {#each memories as memory}
            <button onclick={() => onOpenJournal(memory.id)}><span class="result-kind">{new Date(`${memory.entryDate}T12:00:00`).getFullYear()}</span><strong>{memory.title || "Registro sem título"}</strong><p>{memory.content.slice(0, 160)}</p></button>
          {/each}
        </div>
      {/if}
      {#if notes.some((note) => note.isFavorite)}
        <h2 class="subsection-title">Notas favoritas</h2>
        <div class="result-list grid-results">{#each notes.filter((note) => note.isFavorite).slice(0, 4) as note}<button onclick={() => onOpenNotes(note.id)}><span class="result-kind"><Icon name="star" size={13} filled /> Favorita</span><strong>{note.title || "Nota sem título"}</strong><p>{note.content.slice(0, 100)}</p></button>{/each}</div>
      {/if}
    </section>
  {/if}
</div>
