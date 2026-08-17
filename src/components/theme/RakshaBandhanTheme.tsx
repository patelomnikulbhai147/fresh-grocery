/**
 * ── RAKSHA BANDHAN FESTIVE THEME (seasonal, removable) ──
 *
 * A purely decorative background layer rendered BEHIND the entire UI:
 *   · position: fixed · z-index: -1 · pointer-events: none
 * It never moves, resizes, covers or restyles any existing element.
 *
 * TO REMOVE AFTER THE FESTIVAL: set RAKSHA_BANDHAN_THEME = false below
 * (or delete this component + the "Raksha Bandhan theme" block in globals.css).
 */
export const RAKSHA_BANDHAN_THEME = true;

// Deterministic sparkle positions (no randomness — keeps SSR/client identical)
const SPARKLES: { top: string; left: string; size: number; delay: string; dur: string }[] = [
  { top: "12%", left: "6%", size: 5, delay: "0s", dur: "9s" },
  { top: "22%", left: "92%", size: 4, delay: "1.5s", dur: "11s" },
  { top: "34%", left: "16%", size: 3, delay: "3s", dur: "10s" },
  { top: "45%", left: "88%", size: 5, delay: "0.8s", dur: "12s" },
  { top: "58%", left: "8%", size: 4, delay: "2.2s", dur: "9.5s" },
  { top: "66%", left: "94%", size: 3, delay: "4s", dur: "13s" },
  { top: "78%", left: "12%", size: 5, delay: "1s", dur: "10.5s" },
  { top: "86%", left: "85%", size: 4, delay: "2.8s", dur: "11.5s" },
  { top: "8%", left: "55%", size: 3, delay: "3.6s", dur: "12.5s" },
  { top: "92%", left: "48%", size: 4, delay: "0.4s", dur: "9.8s" },
];

export function RakshaBandhanTheme() {
  if (!RAKSHA_BANDHAN_THEME) return null;
  // The rakhi medallions, marigolds, paisleys, golden dots and cream wash are
  // painted on the BODY BACKGROUND (see "body.rb-theme" in globals.css), which
  // by definition renders behind every element. Here we only add the floating
  // sparkles and the thin festive hairline — both fixed and non-interactive.
  return (
    <>
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="rb-sparkle"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
      {/* thin festive hairline along the very top edge */}
      <div className="rb-topline" aria-hidden="true" />
    </>
  );
}
