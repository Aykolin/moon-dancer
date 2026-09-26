<script lang="ts">
  import Icon from "./Icon.svelte";
  import { language, pick } from "../lib/i18n";
  let {
    onUnlock,
  }: { onUnlock: (pin: string) => Promise<boolean> } = $props();

  let pin = $state("");
  let error = $state("");
  let checking = $state(false);

  async function unlock() {
    checking = true;
    error = "";
    if (await onUnlock(pin)) pin = "";
    else error = pick($language, "O PIN não confere. Tente novamente.", "The PIN is incorrect. Try again.");
    checking = false;
  }
</script>

<main class="lock-screen">
  <section class="lock-window" aria-labelledby="lock-title">
    <div class="titlebar"><strong><Icon name="lock" size={16} /> {pick($language, "Segurança", "Security")} - Moon Dancer</strong></div>
    <img src="/brand/moon-dancer-icon-transparent.png" alt={pick($language, "Gato branco dormindo sobre a lua", "White cat sleeping on the moon")} />
    <h1 id="lock-title">{pick($language, "Proteja suas memórias", "Protect your memories")}</h1>
    <p>{pick($language, "Digite seu PIN para abrir o diário.", "Enter your PIN to open the journal.")}</p>
    <form onsubmit={(event) => { event.preventDefault(); unlock(); }}>
      <label for="unlock-pin">PIN</label>
      <input id="unlock-pin" type="password" inputmode="numeric" autocomplete="current-password" bind:value={pin} />
      {#if error}<p class="form-error" role="alert">{error}</p>{/if}
      <button class="xp-button primary" type="submit" disabled={!pin || checking}>{checking ? pick($language, "Verificando...", "Checking...") : pick($language, "Desbloquear", "Unlock")}</button>
    </form>
    <small>{pick($language, "Este bloqueio protege o acesso casual. Ele não criptografa o banco de dados.", "This lock prevents casual access. It does not encrypt the database.")}</small>
  </section>
</main>
