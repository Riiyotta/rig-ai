// Fixed full-viewport overlays (CLONE_SPEC §0, original HTML L360-381).
// Styles live in src/index.css (.scanlines / .noise / .rgb-fringe).
// The #grainy filter's <animate attributeName="seed"> is what animates the film grain.
export default function Overlays() {
  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ display: 'none' }}>
        <filter id="grainy" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.4"
            numOctaves="4"
            stitchTiles="stitch"
            seed="0"
          >
            <animate
              attributeName="seed"
              from="0"
              to="100"
              dur="10s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0" />
        </filter>
      </svg>
      <div className="scanlines" aria-hidden="true"></div>
      <div className="noise" aria-hidden="true"></div>
      <div className="rgb-fringe" aria-hidden="true"></div>
    </>
  )
}
