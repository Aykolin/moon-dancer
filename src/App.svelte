<script lang="ts">
  import { onMount } from "svelte";
  import LockScreen from "./components/LockScreen.svelte";
  import Icon from "./components/Icon.svelte";
  import MoonSprite from "./components/MoonSprite.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import WindowFrame from "./components/WindowFrame.svelte";
  import { repository } from "./lib/repository";
  import { loadSettings, saveSettings, verifyPin } from "./lib/settings";
  import type { AppSettings, JournalEntry, Note, ScreenId } from "./lib/types";
  import BackupScreen from "./screens/BackupScreen.svelte";
  import CalendarScreen from "./screens/CalendarScreen.svelte";
  import HomeScreen from "./screens/HomeScreen.svelte";
  import JournalScreen from "./screens/JournalScreen.svelte";
  import MemoriesScreen from "./screens/MemoriesScreen.svelte";
  import NotesScreen from "./screens/NotesScreen.svelte";
  import SettingsScreen from "./screens/SettingsScreen.svelte";

  const initialSettings = loadSettings();
  let screen = $state<ScreenId>("home");
  let journalEntries = $state<JournalEntry[]>([]);
  let notes = $state<Note[]>([]);
  let settings = $state<AppSettings>(initialSettings);
  let locked = $state(initialSettings.lockEnabled);
  let loading = $state(true);
  let globalError = $state("");
  let journalDate = $state("");
  let journalId = $state("");
  let noteId = $state("");

  const titles: Record<ScreenId, string> = {
    home: "Início",
    journal: "Diário",
    notes: "Notas",
    calendar: "Calendário Lunar",
    memories: "Memórias",
    backup: "Backup",
    settings: "Configurações",
  };

  onMount(refresh);

  async function refresh() {
    loading = true;
    globalError = "";
    try {
      [journalEntries, notes] = await Promise.all([repository.listJournalEntries(), repository.listNotes()]);
    } catch (reason) {
      globalError = reason instanceof Error ? reason.message : "Não foi possível abrir seus dados.";
    } finally {
      loading = false;
    }
  }

  async function saveJournal(entry: JournalEntry) {
    await repository.saveJournalEntry(entry);
    await refresh();
    journalId = entry.id;
  }

  async function deleteJournal(id: string) {
    await repository.deleteJournalEntry(id);
    await refresh();
  }

  async function saveNote(note: Note) {
    await repository.saveNote(note);
    await refresh();
    noteId = note.id;
  }

  async function deleteNote(id: string) {
    await repository.deleteNote(id);
    await refresh();
  }

  function navigate(target: ScreenId) {
    screen = target;
    if (target !== "journal") { journalDate = ""; journalId = ""; }
    if (target !== "notes") noteId = "";
  }

  function openJournalDate(date: string) {
    journalDate = date;
    journalId = "";
    screen = "journal";
  }

  function openJournalId(id: string) {
    journalId = id;
    journalDate = "";
    screen = "journal";
  }

  function openNoteId(id: string) {
    noteId = id;
    screen = "notes";
  }

  function changeSettings(next: AppSettings) {
    settings = next;
    saveSettings(next);
  }

  async function unlock(pin: string) {
    const valid = await verifyPin(pin, settings.pinDigest);
    if (valid) locked = false;
    return valid;
  }
</script>

{#if locked}
  <div class={`app theme-${settings.theme}`} style={`--font-scale:${settings.fontScale}`}><LockScreen onUnlock={unlock} /></div>
{:else}
  <div class:reduce-motion={settings.reduceMotion} class={`app theme-${settings.theme}`} style={`--font-scale:${settings.fontScale}`}>
    <div class="desktop-stars" aria-hidden="true"></div>
    <main class="desktop-shell">
      <Sidebar active={screen} onNavigate={navigate} />
      <WindowFrame title={titles[screen]}>
        {#if globalError}<div class="global-error" role="alert"><Icon name="alert" size={18} /> {globalError}<button onclick={refresh}>Tentar novamente</button></div>{/if}
        {#if loading}
          <div class="loading-state"><MoonSprite phase="waxing-crescent" size="58px" decorative /><p>Abrindo seu cantinho...</p></div>
        {:else if screen === "home"}
          <HomeScreen {journalEntries} {notes} onNavigate={navigate} />
        {:else if screen === "journal"}
          <JournalScreen entries={journalEntries} initialDate={journalDate || undefined} initialId={journalId} onSave={saveJournal} onDelete={deleteJournal} />
        {:else if screen === "notes"}
          <NotesScreen {notes} initialId={noteId} onSave={saveNote} onDelete={deleteNote} />
        {:else if screen === "calendar"}
          <CalendarScreen entries={journalEntries} onOpenDate={openJournalDate} />
        {:else if screen === "memories"}
          <MemoriesScreen {journalEntries} {notes} onOpenJournal={openJournalId} onOpenNotes={openNoteId} />
        {:else if screen === "backup"}
          <BackupScreen onRestored={refresh} />
        {:else if screen === "settings"}
          <SettingsScreen {settings} onChange={changeSettings} />
        {/if}
      </WindowFrame>
    </main>
  </div>
{/if}
