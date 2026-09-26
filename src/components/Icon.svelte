<script lang="ts">
  let {
    name,
    size = 20,
    label = "",
    strokeWidth = 1.8,
    filled = false,
  }: {
    name: string;
    size?: number;
    label?: string;
    strokeWidth?: number;
    filled?: boolean;
  } = $props();
</script>

<svg
  class="ui-icon"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? "img" : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : "true"}
>
  {#if name === "home"}
    <path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9.5v10h13v-10"/><path d="M9.4 19.5v-6h5.2v6"/>
  {:else if name === "journal"}
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>
  {:else if name === "note"}
    <path d="M6 3.5h9.5L20 8v12.5H6z"/><path d="M15.5 3.5V8H20M9 12h8M9 16h6"/>
  {:else if name === "calendar"}
    <rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/>
  {:else if name === "memories"}
    <path d="M4.5 9.5A8 8 0 1 0 7 5.8"/><path d="M3.5 4.5v5h5M12 8v4.5l3 2"/>
  {:else if name === "backup"}
    <path d="M7 18.5H5.8a3.8 3.8 0 0 1-.4-7.6A6.5 6.5 0 0 1 18 9.5a4.5 4.5 0 0 1 .7 8.9H17"/><path d="M12 12v9M8.8 17.8 12 21l3.2-3.2"/>
  {:else if name === "settings"}
    <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>
  {:else if name === "sparkle"}
    <path d="m12 2 1.6 5.3L19 9l-5.4 1.7L12 16l-1.6-5.3L5 9l5.4-1.7zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>
  {:else if name === "star"}
    <path fill={filled ? "currentColor" : "none"} d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>
  {:else if name === "clock"}
    <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>
  {:else if name === "plus"}
    <path d="M12 5v14M5 12h14"/>
  {:else if name === "chevron-left"}
    <path d="m15 5-7 7 7 7"/>
  {:else if name === "chevron-right"}
    <path d="m9 5 7 7-7 7"/>
  {:else if name === "download"}
    <path d="M12 3v11M8 10l4 4 4-4M4 19.5h16"/>
  {:else if name === "restore"}
    <path d="M4.5 8.5V4.5h4"/><path d="M5 5a8.5 8.5 0 1 1-1.2 10"/><path d="M12 7.5V12l3 2"/>
  {:else if name === "search"}
    <circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>
  {:else if name === "lock"}
    <rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>
  {:else if name === "eye-off"}
    <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.3A10.8 10.8 0 0 1 12 5c5.4 0 9 7 9 7a17 17 0 0 1-2.1 3M6.6 6.6C4.3 8.1 3 12 3 12s3.6 7 9 7a9.8 9.8 0 0 0 4-.9"/>
  {:else if name === "trash"}
    <path d="M4.5 7h15M9 3.5h6L16 7H8zM7 7l1 14h8l1-14M10 11v6M14 11v6"/>
  {:else if name === "save"}
    <path d="M4 3.5h13l3 3v14H4z"/><path d="M8 3.5v6h8v-6M8 20.5v-7h8v7"/>
  {:else if name === "tag"}
    <path d="M3.5 12.5V4h8.5l8.5 8.5-8 8z"/><circle cx="8" cy="8.5" r="1"/>
  {:else if name === "layers"}
    <path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>
  {:else if name === "minus"}
    <path d="M6 12h12"/>
  {:else if name === "maximize"}
    <rect x="5" y="5" width="14" height="14" rx="1"/>
  {:else if name === "close"}
    <path d="m6 6 12 12M18 6 6 18"/>
  {:else if name === "check"}
    <path d="m5 12.5 4.5 4.5L19 7.5"/>
  {:else if name === "alert"}
    <path d="M12 3 2.8 20h18.4zM12 9v5M12 17.5h.01"/>
  {:else if name === "external-link"}
    <path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6.5H4.5v-13H11"/>
  {:else}
    <circle cx="12" cy="12" r="3"/>
  {/if}
</svg>

<style>
  .ui-icon { display: block; flex: 0 0 auto; }
</style>
