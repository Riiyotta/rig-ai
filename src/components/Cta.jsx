import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import FLOW_PATHS from './cta/flowPaths.js'
import LOGO_PATHS from './cta/logoPaths.js'
import '../styles/cta.css'

// CLONE_SPEC §9 CTA (HTML L3662-4109; sits outside <main>).
// useInView toggles `.is-visible` (threshold 0, rootMargin 200px 0px) like the original
// global observer; cta.css pauses the flow dots / svg animations when it's absent.
const FLOW_CLASSES = ['flow-tail', 'flow-dot flow-halo', 'flow-dot', 'flow-dot flow-core']

export default function Cta() {
  const ref = useRef(null)
  useInView(ref)
  return (
    <section ref={ref} className="cta-section">
      <div className="cta-grid-wrap" aria-hidden="true">
        <svg className="cta-grid" viewBox="0 0 2372 814" fill="none">
          <image href="/assets/img/cta-wave-grid.svg" width="2372" height="814" className="grid-lines" />
          {FLOW_PATHS.map((flow) => (
            <g key={flow.delay} style={{ '--flow-delay': flow.delay, '--flow-duration': flow.duration }}>
              {FLOW_CLASSES.map((cls) => (
                <path key={cls} className={cls} d={flow.d} pathLength="100" />
              ))}
            </g>
          ))}
        </svg>
      </div>
      {/* Oversized line-work Rig logo */}
      <svg
        className="cta-oversized-svg"
        viewBox="0 0 163 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {LOGO_PATHS.map((d) => (
          <path key={d} d={d} stroke="rgba(240,237,230,0.08)" strokeWidth="0.3" fill="none" />
        ))}
      </svg>
      <div className="container cta-container">
        {/* SVG Bloom Filter */}
        <svg className="cta-bloom-filter" aria-hidden="true">
          <defs>
            <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="glow-wide" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="glow-tight" />
              <feComposite
                in="SourceGraphic"
                in2="glow-wide"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="0.5"
                k4="0"
                result="with-wide"
              />
              <feComposite in="with-wide" in2="glow-tight" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
            </filter>
          </defs>
        </svg>
        <div className="cta-logo-wrap">
          {/* Bloom glow layer behind */}
          <svg
            className="cta-logo-glow"
            width="163"
            height="160"
            viewBox="0 0 163 160"
            fill="var(--primary)"
            xmlns="http://www.w3.org/2000/svg"
          >
            {LOGO_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
          {/* Main logo on top */}
          <svg
            className="cta-logo"
            width="163"
            height="160"
            viewBox="0 0 163 160"
            fill="var(--primary)"
            xmlns="http://www.w3.org/2000/svg"
          >
            {LOGO_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        </div>
        <div className="cta-heading-wrap">
          <div className="cta-heading-blur"></div>
          <h2 className="glitch-text" data-text="Ship Confidently">
            Ship Confidently
          </h2>
        </div>
        <div className="cta-btn-wrap">
          <a className="btn-chamfer btn-cta cta-btn" href="#">
            Book a Demo
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 4v8a4 4 0 0 1-4 4H5"></path>
              <polyline points="9 12 5 16 9 20"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
