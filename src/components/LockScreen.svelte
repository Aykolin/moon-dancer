<script lang="ts">
  import Icon from "./Icon.svelte";
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
    else error = "O PIN não confere. Tente novamente.";
    checking = false;
  }
</script>

<main class="lock-screen">
  <section class="lock-window" aria-labelledby="lock-title">
    <div class="titlebar"><strong><Icon name="lock" size={16} /> Segurança - Moon Dancer</strong></div>
    <img src="/brand/moon-dancer-icon-transparent.png" alt="Gato branco dormindo sobre a lua" />
    <h1 id="lock-title">Proteja suas memórias</h1>
    <p>Digite seu PIN para abrir o diário.</p>
    <form onsubmit={(event) => { event.preventDefault(); unlock(); }}>
      <label for="unlock-pin">PIN</label>
      <input id="unlock-pin" type="password" inputmode="numeric" autocomplete="current-password" bind:value={pin} />
      {#if error}<p class="form-error" role="alert">{error}</p>{/if}
      <button class="xp-button primary" type="submit" disabled={!pin || checking}>{checking ? "Verificando..." : "Desbloquear"}</button>
    </form>
    <small>Este bloqueio protege o acesso casual. Ele não criptografa o banco de dados.</small>
  </section>
</main>
