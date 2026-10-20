import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import ProblemFunnel from './problem/ProblemFunnel.jsx'
import '../styles/problem.css'

// CLONE_SPEC §2 The problem (recon/source/index.pretty.html L683-1041).
// Copy is verbatim, including "bottle neck" in card 001.
const CARDS = [
  {
    label: 'Bottleneck',
    number: '001',
    title: 'More to Review',
    body: "The new bottle neck is your team's ability to review all the code agents create.",
  },
  {
    label: 'Exposure',
    number: '002',
    title: 'Hackers Are More Dangerous',
    body: 'With AI, bad actors can exploit vulnerabilities faster and more easily than ever before.',
  },
  {
    label: 'Volume',
    number: '003',
    title: 'Your Backlog is Growing',
    body: 'Dev teams are forced to slow down to deal with vulnerability backlogs growing from dozens of static scanning tools.',
  },
  {
    label: 'Noise',
    number: '004',
    title: 'False Positives Obscure the Reality',
    body: "Tools of the past can't keep up with the speed of modern teams. False positives sap valuable dev time or cause alert blindness.",
  },
]

export default function ProblemSection() {
  const ref = useRef(null)
  // Global observer parity (§11). The original funnel has no .is-visible pause rule.
  useInView(ref)
  return (
    <section ref={ref} className="signal-section problem-section">
      <div className="container problem-container">
        <div className="problem-outer">
          <div className="problem-top">
            <div className="badge problem-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 11 11 L 13 11 L 13 13 L 11 13 Z M 15 7 L 17 7 L 17 9 L 15 9 Z M 7 7 L 9 7 L 9 9 L 7 9 Z M 7 15 L 9 15 L 9 17 L 7 17 Z M 15 15 L 17 15 L 17 17 L 15 17 Z M 5 17 L 7 17 L 7 19 L 5 19 Z M 5 5 L 7 5 L 7 7 L 5 7 Z M 9 13 L 11 13 L 11 15 L 9 15 Z M 13 13 L 15 13 L 15 15 L 13 15 Z M 13 9 L 15 9 L 15 11 L 13 11 Z M 9 9 L 11 9 L 11 11 L 9 11 Z M 17 5 L 19 5 L 19 7 L 17 7 Z M 17 17 L 19 17 L 19 19 L 17 19 Z"
                  fill="var(--primary)"
                ></path>
              </svg>
              The problem
            </div>
            <h2 className="display problem-headline">AI is an Asset and a Risk</h2>
          </div>
          <div className="problem-divider"></div>
          <div className="problem-grid">
            <div className="problem-checkpoint-col">
              <ProblemFunnel />
            </div>
            {CARDS.map((card) => (
              <div className="problem-card" key={card.number}>
                <div className="problem-card-header">
                  <span className="mono problem-card-label">{card.label}</span>
                  <span className="mono problem-card-number">{card.number}</span>
                </div>
                <h3 className="display-heavy">{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
