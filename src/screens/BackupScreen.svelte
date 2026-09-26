<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import { repository } from "../lib/repository";

  let { onRestored }: { onRestored: () => Promise<void> } = $props();
  let message = $state("");
  let error = $state("");
  let busy = $state(false);
  let fileInput: HTMLInputElement;

  async function backup() {
    busy = true; error = ""; message = "";
    try {
      const result = await repository.createBackup();
      if (result) message = result;
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "Não foi possível criar o backup.";
    } finally { busy = false; }
  }

  async function restore(file?: File) {
    busy = true; error = ""; message = "";
    try {
      const result = await repository.restoreBackupFromFile(file);
      if (result) {
        message = result;
        await onRestored();
      }
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "Não foi possível restaurar o backup.";
    } finally { busy = false; }
  }

  async function chooseRestore() {
    if ("__TAURI_INTERNALS__" in window) await restore();
    else fileInput.click();
  }
</script>

<div class="backup-screen">
  <header><p class="eyebrow">Proteção e portabilidade</p><h1>Mantenha suas memórias seguras.</h1><p>O backup reúne seus registros em um único arquivo portátil.</p></header>
  <div class="backup-grid">
    <article class="backup-card primary-card">
      <div class="backup-icon"><Icon name="backup" size={34} /></div>
      <div><h2>Backup local</h2><p>Salve uma cópia em uma pasta, pendrive ou serviço sincronizado de sua escolha.</p></div>
      <button class="xp-button primary" disabled={busy} onclick={backup}><Icon name="download" size={17} /> Fazer backup agora</button>
    </article>
    <article class="backup-card">
      <div class="backup-icon"><Icon name="restore" size={34} /></div>
      <div><h2>Restaurar backup</h2><p>Valide e recupere um arquivo <code>.moonbackup</code>.</p></div>
      <button class="xp-button" disabled={busy} onclick={chooseRestore}><Icon name="restore" size={17} /> Escolher arquivo</button>
      <input class="visually-hidden" bind:this={fileInput} type="file" accept=".moonbackup" onchange={(event) => restore(event.currentTarget.files?.[0])} />
    </article>
  </div>
  {#if message}<p class="notice success" role="status"><Icon name="check" size={17} /> {message}</p>{/if}
  {#if error}<p class="notice error" role="alert"><Icon name="alert" size={17} /> {error}</p>{/if}
  <section class="privacy-explainer"><h2>O que acontece com seus dados?</h2><ul><li>Nenhum texto é enviado automaticamente para a internet.</li><li>Você escolhe onde guardar o arquivo de backup.</li><li>Backups desta versão não são criptografados; guarde-os em um local protegido.</li></ul></section>
</div>
