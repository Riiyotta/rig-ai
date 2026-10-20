import './review-funnel.css'

// Verbatim port of recon/svg/review-funnel-problem.html (HTML L716-916).
const CODE = 'M-7 -5L-12 0L-7 5 M7 -5L12 0L7 5 M2 -6L-2 6'
const QUEUE = [
  [160, 222, '0s'],
  [320, 222, '0.9s'],
  [160, 174, '1.8s'],
  [320, 174, '2.7s'],
  [160, 126, '3.6s'],
  [320, 126, '4.5s'],
]

export default function ProblemFunnel() {
  return (
    <figure className="review-funnel">
      <svg viewBox="0 0 480 500" fill="none" role="img" aria-labelledby="manual-review-title manual-review-desc">
        <title id="manual-review-title">Security findings in review send work back into the queue.</title>
        <desc id="manual-review-desc">
          Illustrative workflow: PRs queue for review. A vulnerability is found, sending a PR back for rework and
          another review while the queue builds. Shipping slows.
        </desc>
        <g className="guides">
          <path d="M40 70V40H70 M410 40H440V70 M440 430V460H410 M70 460H40V430"></path>
          <path d="M130 112V240L210 290V425 M350 112V240L270 290V425"></path>
          <path d="M240 105V260 M240 330V425" strokeDasharray="3 7"></path>
        </g>
        <text className="label" x="240" y="64" textAnchor="middle">PRs</text>
        <path className="rework-track" d="M270 303H398V119H272"></path>
        <path className="rework-arrow" d="M281 113L272 119L281 125"></path>
        <text className="rework-label" x="410" y="220" transform="rotate(-90 410 220)">REWORK</text>
        {QUEUE.map(([x, y, delay]) => (
          <g key={delay} transform={`translate(${x} ${y})`}>
            <g className="queued" style={{ '--delay': delay }}>
              <rect x="-22" y="-15" width="44" height="30" rx="2"></rect>
              <path className="code" d={CODE}></path>
            </g>
          </g>
        ))}
        <g className="rework-pr">
          <rect x="-22" y="-15" width="44" height="30" rx="2"></rect>
          <path className="code" d={CODE}></path>
          <path className="risk-mark" d="M16 -11V-5 M16 -2V0"></path>
        </g>
        <path className="gate" d="M120 288H210V316H120 M360 288H270V316H360"></path>
        <path
          className="gate-detail"
          d="M146 296L134 308 M166 296L154 308 M186 296L174 308 M294 296L306 308 M314 296L326 308 M334 296L346 308"
        ></path>
        <text className="label review-label" x="120" y="339">REVIEW</text>
        <text className="finding-label" x="240" y="369" textAnchor="middle">VULNERABILITY FOUND</text>
        <path className="ship-arrow" d="M234 435L240 441L246 435"></path>
        <text className="label" x="240" y="465" textAnchor="middle">SHIP</text>
      </svg>
    </figure>
  )
}
