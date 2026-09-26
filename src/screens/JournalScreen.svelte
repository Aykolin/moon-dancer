<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import MoonSprite from "../components/MoonSprite.svelte";
  import { isoDate, moonPhaseFor } from "../lib/moon";
  import type { JournalEntry } from "../lib/types";

  let {
    entries,
    initialDate = isoDate(),
    initialId = "",
    onSave,
    onDelete,
  }: {
    entries: JournalEntry[];
    initialDate?: string;
    initialId?: string;
    onSave: (entry: JournalEntry) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  } = $props();

  const moods = ["Feliz", "Tranquila", "Ansiosa", "Cansada", "Inspirada", "Sensível"];
  let selectedId = $state("");
  let entryDate = $state(isoDate());
  let title = $state("");
  let content = $state("");
  let mood = $state("");
  let status = $state("Pronto para escrever");
  let saving = $state(false);
  let openedInitial = $state("");

  $effect(() => {
    if (initialDate && !selectedId && entryDate !== initialDate) entryDate = initialDate;
    if (initialId && initialId !== openedInitial) {
      const found = entries.find((entry) => entry.id === initialId);
      if (found) {
        select(found);
        openedInitial = initialId;
      }
    }
  });

  function blank(date = isoDate()) {
    selectedId = "";
    entryDate = date;
    title = "";
    content = "";
    mood = "";
    status = "Novo registro";
  }

  function select(entry: JournalEntry) {
    selectedId = entry.id;
    entryDate = entry.entryDate;
    title = entry.title;
    content = entry.content;
    mood = entry.mood;
    status = "Registro aberto";
  }

  async function save() {
    if (!content.trim()) {
      status = "Escreva um pouco antes de salvar";
      return;
    }
    saving = true;
    status = "Salvando...";
    const now = new Date().toISOString();
    const existing = entries.find((entry) => entry.id === selectedId);
    const entry: JournalEntry = {
      id: selectedId || crypto.randomUUID(),
      entryDate,
      title: title.trim(),
      content: content.trim(),
      mood,
      moonPhase: moonPhaseFor(entryDate).key,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await onSave(entry);
    selectedId = entry.id;
    status = "Salvo agora";
    saving = false;
  }

  async function remove() {
    if (!selectedId || !confirm("Excluir este registro do diário?")) return;
    await onDelete(selectedId);
    blank(entryDate);
  }
</script>

<div class="split-screen journal-screen">
  <aside class="item-list">
    <div class="list-heading"><h2>Meu diário</h2><button class="square-button" aria-label="Novo registro" onclick={() => blank()}><Icon name="plus" size={20} /></button></div>
    {#if entries.length === 0}
      <div class="empty-state"><MoonSprite phase={moonPhaseFor(entryDate).key} size="58px" decorative /><p>Seu primeiro registro pode começar hoje.</p></div>
    {:else}
      {#each entries as entry}
        <button class:active={selectedId === entry.id} class="list-item" onclick={() => select(entry)}>
          <strong>{entry.title || "Registro sem título"}</strong>
          <span>{new Date(`${entry.entryDate}T12:00:00`).toLocaleDateString("pt-BR")}{entry.mood ? ` · ${entry.mood}` : ""}</span>
          <small>{entry.content.slice(0, 72)}</small>
        </button>
      {/each}
    {/if}
  </aside>

  <section class="editor-pane">
    <div class="editor-toolbar">
      <label>Data<input type="date" bind:value={entryDate} /></label>
      <span class="phase-chip"><MoonSprite phase={moonPhaseFor(entryDate).key} size="24px" decorative /> {moonPhaseFor(entryDate).name}</span>
      <span class="save-status" aria-live="polite">{status}</span>
    </div>
    <input class="title-input" aria-label="Título do registro" maxlength="120" placeholder="Título opcional" bind:value={title} />
    <fieldset class="mood-picker">
      <legend>Como você está se sentindo?</legend>
      {#each moods as item}
        <button type="button" class:selected={mood === item} aria-pressed={mood === item} onclick={() => mood = mood === item ? "" : item}>{item}</button>
      {/each}
    </fieldset>
    <textarea class="long-editor" aria-label="Texto do diário" placeholder="Escreva sobre o seu dia..." bind:value={content}></textarea>
    <div class="editor-actions">
      {#if selectedId}<button class="xp-button danger" onclick={remove}><Icon name="trash" size={16} /> Excluir</button>{/if}
      <button class="xp-button primary" disabled={saving} onclick={save}><Icon name="save" size={16} /> {saving ? "Salvando..." : "Salvar registro"}</button>
    </div>
  </section>
</div>
