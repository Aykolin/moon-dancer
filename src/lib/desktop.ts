import type { ScreenId } from "./types";

export function isDesktopRuntime(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export async function setMascotEnabled(enabled: boolean): Promise<void> {
  if (!isDesktopRuntime()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("set_mascot_enabled", { enabled });
}

export async function openMainWindow(screen: ScreenId): Promise<void> {
  if (!isDesktopRuntime()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("open_main_window", { screen });
}

export async function setMascotExpanded(expanded: boolean): Promise<void> {
  if (!isDesktopRuntime()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("set_mascot_expanded", { expanded });
}

export async function hideMascot(): Promise<void> {
  if (!isDesktopRuntime()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("hide_mascot");
}

export async function quitMoonDancer(): Promise<void> {
  if (!isDesktopRuntime()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("quit_moon_dancer");
}
