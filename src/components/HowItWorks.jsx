import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import useHowStepper from './how-it-works/useHowStepper.js'
import stage1 from './how-it-works/schematic-stage-1.svg?raw'
import stage2 from './how-it-works/schematic-stage-2.svg?raw'
import stage3 from './how-it-works/schematic-stage-3.svg?raw'
import '../styles/how-it-works.css'

// CLONE_SPEC §5 How it Works - port of recon/source/index.pretty.html L1956-2775.
// Schematic SVGs are recon/svg/how-schematic-stage-{1,2,3}.svg verbatim, injected as raw markup.

const STEPS = [
  {
    n: 1,
    label: 'Step 1: Runtime Discovery',
    num: 'Step 01',
    title: 'Runtime Discovery',
    body: 'Rig uses advanced algorithms to develop a detailed map of of your application including entry points, code paths, and sinks.',
  },
  {
    n: 2,
    label: 'Step 2: Inline Tainting',
    num: 'Step 02',
    title: 'Inline Tainting',
    body: 'Rig runs your application and automates testing and tainting to track how data flows through your source code.',
  },
  {
    n: 3,
    label: 'Step 3: Static tools predict. Rig proves',
    num: 'Step 03',
    title: 'Proven Exploitability',
    body: "Rig's runtime testing confirms the vulnerable path before reporting it, and reports exactly where vulnerabilities are located, and should be fixed.",
  },
]

const STAGES = [stage1, stage2, stage3]

const hasIO = typeof window !== 'undefined' && 'IntersectionObserver' in window

export default function HowItWorks() {
  const ref = useRef(null)
  const cardRef = useRef(null)
  useInView(ref)
  // Stepper gate: original IntersectionObserver({threshold: .1}) on .how-section.
  const inView = useInView(ref, { threshold: 0.1, rootMargin: '0px', className: null })
  const { step, nonce, playState, setHowStep, onFillAnimationEnd, onMouseEnter, onMouseLeave } = useHowStepper({
    visible: hasIO ? inView : true,
    cardRef,
  })

  return (
    <section ref={ref} className="how-section" id="our-approach">
      <div className="container">
        <div className="how-intro">
          <div className="badge how-intro-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M 5 9 L 11 9 L 11 7 L 13 7 L 13 9 L 19 9 L 19 11 L 5 11 Z M 5 18 L 19 18 L 19 20 L 5 20 Z M 19 11 L 21 11 L 21 18 L 19 18 Z M 3 11 L 5 11 L 5 18 L 3 18 Z M 9 5 L 11 5 L 11 7 L 9 7 Z M 11 3 L 15 3 L 15 5 L 11 5 Z M 16 15 L 18 15 L 18 17 L 16 17 Z M 9 15 L 15 15 L 15 17 L 9 17 Z M 6 12 L 8 12 L 8 14 L 6 14 Z M 6 15 L 8 15 L 8 17 L 6 17 Z M 12 12 L 14 12 L 14 14 L 12 14 Z M 9 12 L 11 12 L 11 14 L 9 14 Z M 15 12 L 18 12 L 18 14 L 15 14 Z"
                fill="var(--primary)"
              ></path>
            </svg>
            How it Works
          </div>
          <h2 className="how-intro-heading section-title">Runtime and Inline</h2>
          <p className="how-intro-body">
            Rig understands your application so it can thoroughly test it for vulnerabilities.
          </p>
        </div>
        <div className="how-stepper" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          {/* Left: Steps */}
          <div className="how-steps-left">
            {STEPS.map((s) => {
              const active = s.n === step
              return (
                <button
                  key={s.n}
                  type="button"
                  className={active ? 'how-step active' : 'how-step'}
                  data-step={s.n}
                  onClick={() => setHowStep(s.n)}
                  aria-label={s.label}
                >
                  <div className="how-step-progress">
                    <div
                      key={active ? nonce : 'idle'}
                      className="how-step-progress-fill"
                      style={active ? { animationPlayState: playState } : { animation: 'none' }}
                      onAnimationEnd={active ? onFillAnimationEnd : undefined}
                    ></div>
                  </div>
                  <div className="how-step-header">
                    <div className="how-step-num">{s.num}</div>
                    <h3>{s.title}</h3>
                  </div>
                  <div className="how-step-body">
                    <div className="how-step-body-inner">
                      <p>{s.body}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {/* Right: Illustration panel */}
          <div className="how-illustration">
            <div className="how-graphic" id="howCard" ref={cardRef}>
              {STAGES.map((svg, i) => (
                <div
                  key={i}
                  className={i + 1 === step ? 'card-content active' : 'card-content'}
                  data-content={i + 1}
                  dangerouslySetInnerHTML={{ __html: svg }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
