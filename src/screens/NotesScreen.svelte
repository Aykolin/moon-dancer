<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import type { Note } from "../lib/types";

  let {
    notes,
    initialId = "",
    onSave,
    onDelete,
  }: {
    notes: Note[];
    initialId?: string;
    onSave: (note: Note) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  } = $props();

  const categories = ["Ideias", "Livros", "Frases", "Sonhos", "Pessoal"];
  let filter = $state("Todas");
  let selectedId = $state("");
  let title = $state("");
  let content = $state("");
  let category = $state("");
  let isFavorite = $state(false);
  let createdAt = $state("");
  let status = $state("Selecione uma nota ou crie uma nova");
  let timer: ReturnType<typeof setTimeout> | undefined;
  let openedInitial = $state("");

  const visibleNotes = $derived(
    notes.filter((note) => filter === "Todas" || (filter === "Favoritas" ? note.isFavorite : note.category === filter)),
  );

  $effect(() => {
    if (initialId && initialId !== openedInitial) {
      const found = notes.find((note) => note.id === initialId);
      if (found) {
        select(found);
        openedInitial = initialId;
      }
    }
  });

  function newNote() {
    if (timer) clearTimeout(timer);
    selectedId = crypto.randomUUID();
    title = "";
    content = "";
    category = "";
    isFavorite = false;
    createdAt = new Date().toISOString();
    status = "Nova nota";
  }

  function select(note: Note) {
    if (timer) clearTimeout(timer);
    selectedId = note.id;
    title = note.title;
    content = note.content;
    category = note.category;
    isFavorite = note.isFavorite;
    createdAt = note.createdAt;
    status = "Nota aberta";
  }

  function current(): Note {
    return {
      id: selectedId,
      title: title.trim(),
      content,
      category,
      isFavorite,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function scheduleSave() {
    if (!selectedId) newNote();
    status = "Salvando rascunho...";
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      await onSave(current());
      status = "Rascunho salvo";
    }, 650);
  }

  async function saveNow() {
    if (!selectedId) newNote();
    if (timer) clearTimeout(timer);
    await onSave(current());
    status = "Salvo agora";
  }

  async function toggleFavorite() {
    isFavorite = !isFavorite;
    await saveNow();
  }

  async function remove() {
    if (!selectedId || !confirm("Excluir esta nota?")) return;
    if (timer) clearTimeout(timer);
    await onDelete(selectedId);
    selectedId = "";
    title = "";
    content = "";
    category = "";
    isFavorite = false;
    status = "Nota excluída";
  }
</script>

<div class="notes-layout">
  <aside class="category-list">
    <h2>Minhas notas</h2>
    {#each ["Todas", "Favoritas", ...categories] as item}
      <button class:active={filter === item} onclick={() => filter = item}><Icon name={item === "Favoritas" ? "star" : item === "Todas" ? "layers" : "tag"} size={16} filled={item === "Favoritas" && filter === item} />{item}</button>
    {/each}
    <button class="new-note" onclick={newNote}><Icon name="plus" size={17} /> Nova nota</button>
  </aside>

  <aside class="note-list">
    <div class="list-heading"><h2>{filter}</h2><span>{visibleNotes.length}</span></div>
    {#if visibleNotes.length === 0}
      <div class="empty-state"><span class="empty-icon"><Icon name="sparkle" size={30} /></span><p>Nenhuma nota por aqui ainda.</p></div>
    {:else}
      {#each visibleNotes as note}
        <button class:active={selectedId === note.id} class="list-item" onclick={() => select(note)}>
          <strong class="title-with-icon">{#if note.isFavorite}<Icon name="star" size={14} filled />{/if}{note.title || "Nota sem título"}</strong>
          <small>{note.content.slice(0, 78) || "Rascunho vazio"}</small>
          <span>{note.category || "Sem categoria"}</span>
        </button>
      {/each}
    {/if}
  </aside>

  <section class="editor-pane note-editor">
    {#if selectedId}
      <div class="editor-toolbar">
        <select aria-label="Categoria" bind:value={category} onchange={scheduleSave}>
          <option value="">Sem categoria</option>
          {#each categories as item}<option value={item}>{item}</option>{/each}
        </select>
        <button class="favorite-button" class:active={isFavorite} aria-pressed={isFavorite} onclick={toggleFavorite}><Icon name="star" size={17} filled={isFavorite} /> Favorita</button>
        <span class="save-status" aria-live="polite">{status}</span>
      </div>
      <input class="title-input" aria-label="Título da nota" placeholder="Título opcional" bind:value={title} oninput={scheduleSave} />
      <textarea class="long-editor" aria-label="Conteúdo da nota" placeholder="Guarde uma ideia, uma frase, um sonho..." bind:value={content} oninput={scheduleSave}></textarea>
      <div class="editor-actions"><button class="xp-button danger" onclick={remove}><Icon name="trash" size={16} /> Excluir</button><button class="xp-button primary" onclick={saveNow}><Icon name="save" size={16} /> Salvar agora</button></div>
    {:else}
      <div class="large-empty-state"><img src="/brand/moon-dancer-icon-transparent.png" alt="" /><h2>Uma ideia pode morar aqui.</h2><p>Crie uma nota para começar.</p><button class="xp-button primary" onclick={newNote}><Icon name="plus" size={17} /> Nova nota</button></div>
    {/if}
  </section>
</div>
