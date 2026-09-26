<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import { creatorMark } from "../lib/provenance";
  import { digestPin } from "../lib/settings";
  import type { AppSettings, ThemeId } from "../lib/types";

  let {
    settings,
    onChange,
  }: { settings: AppSettings; onChange: (settings: AppSettings) => void } = $props();

  let pin = $state("");
  let confirmPin = $state("");
  let securityMessage = $state("");

  const themes: { id: ThemeId; name: string; copy: string }[] = [
    { id: "night", name: "Noturno (Padrão)", copy: "Preto ameixa, roxo profundo e detalhes lavanda." },
    { id: "pastel", name: "Pastel Lunar", copy: "Lavanda intensa, violeta e rosa nebuloso." },
    { id: "white", name: "Branco", copy: "Branco suave, cinza lunar e detalhes lilás." },
    { id: "rose", name: "Rosa Lunar", copy: "Rosa blush, magenta suave e lavanda." },
  ];

  function update(patch: Partial<AppSettings>) {
    onChange({ ...settings, ...patch });
  }

  async function enableLock() {
    if (pin.length < 4) { securityMessage = "Use um PIN com pelo menos 4 caracteres."; return; }
    if (pin !== confirmPin) { securityMessage = "Os PINs não coincidem."; return; }
    update({ lockEnabled: true, pinDigest: await digestPin(pin) });
    pin = ""; confirmPin = ""; securityMessage = "Bloqueio ativado.";
  }

  function disableLock() {
    update({ lockEnabled: false, pinDigest: "" });
    securityMessage = "Bloqueio desativado.";
  }
</script>

<div class="settings-screen">
  <header><p class="eyebrow">Preferências</p><h1>Deixe o Moon Dancer com a sua cara.</h1></header>

  <section class="settings-section">
    <h2>Aparência</h2>
    <div class="theme-grid">
      {#each themes as theme}
        <button class:active={settings.theme === theme.id} aria-pressed={settings.theme === theme.id} onclick={() => update({ theme: theme.id })}>
          <span class={`theme-preview ${theme.id}`}><i></i><i></i><i></i></span>
          <strong>{theme.name}</strong><small>{theme.copy}</small>
        </button>
      {/each}
    </div>
    <div class="preference-row"><div><strong>Reduzir animações</strong><span>Diminui brilhos e movimentos decorativos.</span></div><label class="switch"><input type="checkbox" checked={settings.reduceMotion} onchange={(event) => update({ reduceMotion: event.currentTarget.checked })} /><span></span></label></div>
    <div class="preference-row"><div><strong>Tamanho do texto</strong><span>Ajuste a leitura sem alterar seus registros.</span></div><select value={String(settings.fontScale)} onchange={(event) => update({ fontScale: Number(event.currentTarget.value) })}><option value="0.9">Compacto</option><option value="1">Padrão</option><option value="1.12">Grande</option><option value="1.24">Maior</option></select></div>
  </section>

  <section class="settings-section">
    <h2>Privacidade</h2>
    <div class="preference-row vertical">
      <div><strong>Bloqueio ao abrir</strong><span>Protege o acesso casual à interface. Não criptografa o banco de dados.</span></div>
      {#if settings.lockEnabled}
        <button class="xp-button danger" onclick={disableLock}><Icon name="lock" size={16} /> Desativar bloqueio</button>
      {:else}
        <div class="pin-form"><label>Novo PIN<input type="password" inputmode="numeric" bind:value={pin} /></label><label>Confirmar PIN<input type="password" inputmode="numeric" bind:value={confirmPin} /></label><button class="xp-button" onclick={enableLock}><Icon name="lock" size={16} /> Ativar bloqueio</button></div>
      {/if}
      {#if securityMessage}<p class="inline-message" role="status">{securityMessage}</p>{/if}
    </div>
  </section>

  <section
    class="settings-section about-section"
    data-build-token={creatorMark.token}
    data-build-proof={creatorMark.proof}
  >
    <img src="/brand/moon-dancer-icon-transparent.png" alt="" />
    <div>
      <h2>Moon Dancer</h2>
      <p>Versão 0.1.0</p>
      <p class="creator-credit">Criado por <strong>{creatorMark.creator}</strong></p>
      <a class="creator-link" href={creatorMark.profile} target="_blank" rel="noreferrer">
        <Icon name="external-link" size={15} /> github.com/{creatorMark.handle}
      </a>
    </div>
  </section>
</div>
