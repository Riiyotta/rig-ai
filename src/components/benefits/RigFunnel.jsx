import '../problem/review-funnel.css'

// Verbatim port of recon/svg/review-funnel-with-rig.html (HTML L2791-2928).
const PRS = [
  ['0s', '140px'],
  ['-4s', '265px'],
  ['-8s', '390px'],
]

export default function RigFunnel() {
  return (
    <figure className="review-funnel with-rig">
      <svg viewBox="0 0 480 500" fill="none" role="img" aria-labelledby="rig-review-title rig-review-desc">
        <title id="rig-review-title">Security checked earlier. Less rework in review.</title>
        <desc id="rig-review-desc">
          Illustrative workflow: PRs arrive with security checks passed during development. They pause briefly for
          review and move steadily toward shipping. Passed checks do not guarantee an entire PR is
          vulnerability-free.
        </desc>
        <g className="guides">
          <path d="M40 70V40H70 M410 40H440V70 M440 430V460H410 M70 460H40V430"></path>
          <path d="M130 112V240L210 290V425 M350 112V240L270 290V425"></path>
          <path d="M240 105V260 M240 330V425" strokeDasharray="3 7"></path>
        </g>
        <text className="label" x="240" y="64" textAnchor="middle">PRs</text>
        {PRS.map(([delay, staticY]) => (
          <g key={delay} className="flow-pr" style={{ '--delay': delay, '--static-y': staticY }}>
            <rect x="-22" y="-15" width="44" height="30" rx="2"></rect>
            <path className="code" d="M-10 -5L-15 0L-10 5 M3 -5L8 0L3 5"></path>
            <path className="passed-mark" d="M10 -9L14 -5L21 -13"></path>
          </g>
        ))}
        <path className="gate" d="M120 288H210V316H120 M360 288H270V316H360"></path>
        <path
          className="gate-detail"
          d="M146 296L134 308 M166 296L154 308 M186 296L174 308 M294 296L306 308 M314 296L326 308 M334 296L346 308"
        ></path>
        <text className="label review-label" x="120" y="339">REVIEW</text>
        <path className="ship-arrow" d="M234 435L240 441L246 435"></path>
        <text className="label" x="240" y="465" textAnchor="middle">SHIP</text>
      </svg>
    </figure>
  )
}
