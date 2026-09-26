<script lang="ts">
  let {
    phase,
    size = "48px",
    label = "",
    decorative = false,
  }: {
    phase: string;
    size?: string;
    label?: string;
    decorative?: boolean;
  } = $props();

  const positions: Record<string, string> = {
    new: "0% 0%",
    "waxing-crescent": "33.333% 0%",
    "first-quarter": "66.667% 0%",
    "waxing-gibbous": "100% 0%",
    full: "0% 100%",
    "waning-gibbous": "33.333% 100%",
    "last-quarter": "66.667% 100%",
    "waning-crescent": "100% 100%",
  };
</script>

<span
  class="moon-sprite"
  style={`--moon-size: ${size}; --moon-position: ${positions[phase] ?? positions.new}`}
  role={decorative ? undefined : "img"}
  aria-label={decorative ? undefined : label}
  aria-hidden={decorative ? "true" : undefined}
></span>

<style>
  .moon-sprite {
    display: inline-block;
    width: var(--moon-size);
    height: var(--moon-size);
    flex: 0 0 var(--moon-size);
    background-image: url("/moons/moon-phases-pixel.png");
    background-repeat: no-repeat;
    background-position: var(--moon-position);
    background-size: 400% 200%;
    image-rendering: pixelated;
    vertical-align: middle;
  }
</style>
