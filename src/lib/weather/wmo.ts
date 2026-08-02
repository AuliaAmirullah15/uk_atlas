/**
 * WMO 4677 present-weather codes, as returned by Open-Meteo's `weather_code`.
 *
 * `label` is written to fit a split-flap board (short, upper-case-friendly)
 * and is also what a screen reader announces, so it has to read as a real
 * phrase on its own, not an abbreviation only a pilot would parse.
 */

export type WmoDescriptor = {
  label: string;
  /** Decorative glyph. Always paired with `label`, never the sole carrier. */
  glyph: string;
};

const CODES: Record<number, WmoDescriptor> = {
  0: { label: "Clear sky", glyph: "○" },
  1: { label: "Mainly clear", glyph: "◔" },
  2: { label: "Part cloudy", glyph: "◑" },
  3: { label: "Overcast", glyph: "●" },
  45: { label: "Fog", glyph: "≡" },
  48: { label: "Freezing fog", glyph: "≋" },
  51: { label: "Light drizzle", glyph: "⁚" },
  53: { label: "Drizzle", glyph: "⁝" },
  55: { label: "Heavy drizzle", glyph: "⁞" },
  56: { label: "Freezing drizzle", glyph: "⁛" },
  57: { label: "Freezing drizzle", glyph: "⁛" },
  61: { label: "Light rain", glyph: "'" },
  63: { label: "Rain", glyph: "\"" },
  65: { label: "Heavy rain", glyph: "‴" },
  66: { label: "Freezing rain", glyph: "❅" },
  67: { label: "Freezing rain", glyph: "❅" },
  71: { label: "Light snow", glyph: "*" },
  73: { label: "Snow", glyph: "✻" },
  75: { label: "Heavy snow", glyph: "❋" },
  77: { label: "Snow grains", glyph: "·" },
  80: { label: "Light showers", glyph: "◌" },
  81: { label: "Showers", glyph: "◍" },
  82: { label: "Violent showers", glyph: "◉" },
  85: { label: "Snow showers", glyph: "❆" },
  86: { label: "Snow showers", glyph: "❆" },
  95: { label: "Thunderstorm", glyph: "⚡" },
  96: { label: "Storm and hail", glyph: "⚡" },
  99: { label: "Storm and hail", glyph: "⚡" },
};

export function describeWmo(code: number): WmoDescriptor {
  return CODES[code] ?? { label: "Unknown", glyph: "?" };
}

/**
 * The joke that writes itself on a British weather board. Purely cosmetic
 * flavour text; the real conditions are always shown alongside.
 */
export function britishVerdict(code: number, tempC: number): string {
  if (code >= 95) return "Dramatic";
  if (code >= 71 && code <= 86) return "Nation grinds to a halt";
  if (code >= 61 && code <= 67) return "Bring a brolly";
  if (code >= 51 && code <= 57) return "Mizzling";
  if (code === 45 || code === 48) return "Atmospheric";
  if (code === 3) return "Classic";
  if (tempC >= 26) return "Too hot, actually";
  if (tempC >= 20) return "Glorious";
  if (tempC <= 2) return "Bitter";
  return "Fine";
}
