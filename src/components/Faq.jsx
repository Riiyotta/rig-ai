import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import '../styles/faq.css'

// CLONE_SPEC §8 FAQ (HTML L3334-3652).
// useInView toggles `.is-visible` (threshold 0, rootMargin 200px 0px) like the original
// global observer. Open/close is native <details>; the answer height tween is pure CSS
// (grid-template-rows 0fr -> 1fr, .3s ease) in faq.css, as on the live site.
//
// Copy is verbatim, including the site's own typos: answer 03 ends "through the CL" with no
// period, and answer 06 has "available.." with a double period.
const FAQS = [
  {
    q: 'Does Rig work with my existing coding agents?',
    a: 'Rig connects to a supported coding agent through its completion hook. During the demo, we’ll review the team’s agent and application to confirm fit.',
  },
  {
    q: 'Who makes the code changes / fixes to reported vulnerabilities?',
    a: 'Your existing coding agent makes the fix. Rig supplies the finding, code location, and fix guidance, then checks the updated code.',
  },
  {
    q: 'Is Rig checking every keystroke?',
    a: 'No. The automatic check starts when the agent signals that it has finished its work. Developers can also run a check manually through the CL',
  },
  {
    q: 'What happens if a fix does not work?',
    a: 'Rig reports that the vulnerability remains. If testing cannot complete, that is reported separately from a passed check.',
  },
  {
    q: 'Does a clean scan mean the entire application is secure?',
    a: 'No. It means Rig completed the checks within that scan’s scope without confirming a vulnerability. Untested paths are not proven safe, and incomplete checks are reported separately.',
  },
  {
    q: 'Will Rig Collect my Data?',
    a: 'No, Rig is committed to being the most secure and private security testing tool available.. Our telemetry is limited. Tests run on device and code and conversations never leave the machine.',
  },
]


export default function Faq() {
  const ref = useRef(null)
  useInView(ref)
  return (
    <section ref={ref} className="faq-section">
      <div className="container">
        <div className="badge faq-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M 10 2 L 14 2 L 14 4 L 10 4 Z M 8 4 L 10 4 L 10 6 L 8 6 Z M 14 4 L 16 4 L 16 6 L 14 6 Z M 6 6 L 8 6 L 8 8 L 6 8 Z M 16 6 L 18 6 L 18 8 L 16 8 Z M 6 8 L 8 8 L 8 14 L 6 14 Z M 16 8 L 18 8 L 18 14 L 16 14 Z M 14 14 L 16 14 L 16 16 L 14 16 Z M 14 16 L 14 18 L 12 18 L 12 16 Z M 12 20 L 14 20 L 14 22 L 12 22 Z"
              fill="var(--primary)"
            ></path>
          </svg>
          FAQ
        </div>
        <h2 className="section-title faq-title">Frequently asked questions.</h2>
        <div className="faq-list">
          {FAQS.map(({ q, a }, i) => (
            <details className="faq-item" key={q}>
              <summary className="faq-question">
                <span className="faq-question-number mono-label">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-question-text">{q}</span>
                <span className="faq-chevron" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </summary>
              <div className="faq-answer-wrap">
                <div className="faq-answer">
                  <p>{a}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
