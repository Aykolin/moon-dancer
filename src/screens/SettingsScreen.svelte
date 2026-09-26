<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import { creatorMark } from "../lib/provenance";
  import { digestPin } from "../lib/settings";
  import { language, pick } from "../lib/i18n";
  import type { AppSettings, ThemeId } from "../lib/types";

  let {
    settings,
    onChange,
  }: { settings: AppSettings; onChange: (settings: AppSettings) => void } = $props();

  let pin = $state("");
  let confirmPin = $state("");
  let securityMessage = $state("");

  const themes: { id: ThemeId; name: [string, string]; copy: [string, string] }[] = [
    { id: "night", name: ["Mocha (Padrão)", "Mocha (Default)"], copy: ["Base profunda com sinais em lavanda e malva.", "Deep base with lavender and mauve signals."] },
    { id: "pastel", name: ["Lavanda Mocha", "Mocha Lavender"], copy: ["O mesmo terminal com lavanda como destaque.", "The same terminal with a lavender accent."] },
    { id: "white", name: ["Azul Lunar", "Lunar Blue"], copy: ["Azul e teal sobre a base escura do Mocha.", "Blue and teal over the dark Mocha base."] },
    { id: "rose", name: ["Rosa Mocha", "Mocha Rose"], copy: ["Rosa e pêssego para uma leitura mais quente.", "Pink and peach for a warmer look."] },
    { id: "latte", name: ["Latte Claro", "Light Latte"], copy: ["Base clara e suave com acentos em malva e lavanda.", "Soft light base with mauve and lavender accents."] },
  ];

  function update(patch: Partial<AppSettings>) {
    onChange({ ...settings, ...patch });
  }

  async function enableLock() {
    if (pin.length < 4) { securityMessage = pick($language, "Use um PIN com pelo menos 4 caracteres.", "Use a PIN with at least 4 characters."); return; }
    if (pin !== confirmPin) { securityMessage = pick($language, "Os PINs não coincidem.", "The PINs do not match."); return; }
    update({ lockEnabled: true, pinDigest: await digestPin(pin) });
    pin = ""; confirmPin = ""; securityMessage = pick($language, "Bloqueio ativado.", "Lock enabled.");
  }

  function disableLock() {
    update({ lockEnabled: false, pinDigest: "" });
    securityMessage = pick($language, "Bloqueio desativado.", "Lock disabled.");
  }
</script>

<div class="settings-screen">
  <header><p class="eyebrow">{pick($language, "Preferências", "Preferences")}</p><h1>{pick($language, "Deixe o Moon Dancer com a sua cara.", "Make Moon Dancer feel like yours.")}</h1></header>

  <section class="settings-section">
    <h2>{pick($language, "Idioma", "Language")}</h2>
    <div class="preference-row">
      <div><strong>{pick($language, "Idioma do aplicativo", "Application language")}</strong><span>{pick($language, "A alteração é aplicada imediatamente.", "Changes are applied immediately.")}</span></div>
      <select aria-label={pick($language, "Idioma do aplicativo", "Application language")} value={settings.language} onchange={(event) => update({ language: event.currentTarget.value as "pt" | "en" })}>
        <option value="pt">Português</option><option value="en">English</option>
      </select>
    </div>
  </section>

  <section class="settings-section">
    <h2>{pick($language, "Aparência", "Appearance")}</h2>
    <div class="theme-grid">
      {#each themes as theme}
        <button class:active={settings.theme === theme.id} aria-pressed={settings.theme === theme.id} onclick={() => update({ theme: theme.id })}>
          <span class={`theme-preview ${theme.id}`}><i></i><i></i><i></i></span>
          <strong>{pick($language, ...theme.name)}</strong><small>{pick($language, ...theme.copy)}</small>
        </button>
      {/each}
    </div>
    <div class="preference-row"><div><strong>{pick($language, "Reduzir animações", "Reduce animations")}</strong><span>{pick($language, "Diminui brilhos e movimentos decorativos.", "Reduces decorative motion and glow.")}</span></div><label class="switch"><input type="checkbox" checked={settings.reduceMotion} onchange={(event) => update({ reduceMotion: event.currentTarget.checked })} /><span></span></label></div>
    <div class="preference-row"><div><strong>{pick($language, "Tamanho do texto", "Text size")}</strong><span>{pick($language, "Ajuste a leitura sem alterar seus registros.", "Adjust readability without changing your entries.")}</span></div><select value={String(settings.fontScale)} onchange={(event) => update({ fontScale: Number(event.currentTarget.value) })}><option value="0.9">{pick($language, "Compacto", "Compact")}</option><option value="1">{pick($language, "Padrão", "Default")}</option><option value="1.12">{pick($language, "Grande", "Large")}</option><option value="1.24">{pick($language, "Maior", "Larger")}</option></select></div>
  </section>

  <section class="settings-section">
    <h2>{pick($language, "Mascote", "Mascot")}</h2>
    <div class="preference-row">
      <div>
        <strong>{pick($language, "Mascote flutuante", "Floating mascot")}</strong>
        <span>{pick($language, "Mantém o mascote no desktop mesmo quando a janela do Moon Dancer estiver fechada.", "Keeps the mascot on your desktop while the Moon Dancer window is closed.")}</span>
      </div>
      <label class="switch">
        <input
          type="checkbox"
          checked={settings.mascotEnabled}
          onchange={(event) => update({ mascotEnabled: event.currentTarget.checked })}
        />
        <span></span>
      </label>
    </div>
    <p class="mascot-help">{pick($language, "Clique com o botão direito no mascote para ocultá-lo ou encerrar completamente o Moon Dancer.", "Right-click the mascot to hide it or quit Moon Dancer completely.")}</p>
  </section>

  <section class="settings-section">
    <h2>{pick($language, "Privacidade", "Privacy")}</h2>
    <div class="preference-row vertical">
      <div><strong>{pick($language, "Bloqueio ao abrir", "Lock on launch")}</strong><span>{pick($language, "Protege o acesso casual à interface. Não criptografa o banco de dados.", "Prevents casual access to the interface. It does not encrypt the database.")}</span></div>
      {#if settings.lockEnabled}
        <button class="xp-button danger" onclick={disableLock}><Icon name="lock" size={16} /> {pick($language, "Desativar bloqueio", "Disable lock")}</button>
      {:else}
        <div class="pin-form"><label>{pick($language, "Novo PIN", "New PIN")}<input type="password" inputmode="numeric" bind:value={pin} /></label><label>{pick($language, "Confirmar PIN", "Confirm PIN")}<input type="password" inputmode="numeric" bind:value={confirmPin} /></label><button class="xp-button" onclick={enableLock}><Icon name="lock" size={16} /> {pick($language, "Ativar bloqueio", "Enable lock")}</button></div>
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
      <p>{pick($language, "Versão", "Version")} 0.2.0</p>
      <p class="creator-credit">{pick($language, "Criado por", "Created by")} <strong>{creatorMark.creator}</strong></p>
      <a class="creator-link" href={creatorMark.profile} target="_blank" rel="noreferrer">
        <Icon name="external-link" size={15} /> github.com/{creatorMark.handle}
      </a>
    </div>
  </section>
</div>

<style>
  .mascot-help { margin: 2px 0 0; color: var(--muted); font-size: .76rem; line-height: 1.45; }
</style>
