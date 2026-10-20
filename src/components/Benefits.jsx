import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import RigFunnel from './benefits/RigFunnel.jsx'
import '../styles/benefits.css'

// CLONE_SPEC §6 Benefits (recon/source/index.pretty.html L2779-3020).
// `data-section="benefits"` stands in for the Astro cid so the section-local
// `.offline-section:before { display:none }` rule doesn't hit #intro-rig.
export default function Benefits() {
  const ref = useRef(null)
  // Global observer parity (§11). The original funnel has no .is-visible pause rule.
  useInView(ref)
  return (
    <section ref={ref} className="offline-section" style={{ padding: 0 }} data-section="benefits">
      <div className="container offline-main-container" style={{ position: 'relative' }}>
        <div className="offline-layout">
          <div className="offline-visual">
            <RigFunnel />
          </div>
          <div className="offline-content">
            <div className="badge offline-badge" style={{ marginBottom: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 10 4 L 14 4 L 14 6 L 10 6 Z M 11 13 L 13 13 L 13 17 L 11 17 Z M 6 10 L 8 10 L 8 6 L 10 6 L 10 10 L 14 10 L 14 6 L 16 6 L 16 10 L 18 10 L 18 12 L 6 12 Z M 6 18 L 18 18 L 18 20 L 6 20 Z M 18 12 L 20 12 L 20 18 L 18 18 Z M 4 12 L 6 12 L 6 18 L 4 18 Z"
                  fill="var(--primary)"
                ></path>
              </svg>
              Benefits
            </div>
            <h2>Fewer Vulnerabilities Reach Review</h2>
            <p>Find and fix vulnerabilities while agents work in minutes, not weeks or months.</p>
          </div>
        </div>
      </div>
      <div className="section-divider"></div>
      <div className="container three-col-container">
        <div className="three-col-grid">
          <div className="three-col-cell">
            <div className="three-col-inner">
              <h3 className="three-col-heading">Catch More</h3>
              <p className="three-col-text">
                Catch more vulnerabilities before they make it to review or production.
              </p>
            </div>
          </div>
          <div className="three-col-divider"></div>
          <div className="three-col-cell">
            <div className="three-col-inner">
              <h3 className="three-col-heading">Chase Less</h3>
              <p className="three-col-text">
                Stop distracting developers with false positives so they can stay on task.
              </p>
            </div>
          </div>
          <div className="three-col-divider"></div>
          <div className="three-col-cell">
            <div className="three-col-inner">
              <h3 className="three-col-heading">Ship More</h3>
              <p className="three-col-text three-col-text--dim">
                Your developers spend more time shipping and less time managing vulnerability findings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
