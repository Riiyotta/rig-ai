import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import '../styles/difference.css'

// CLONE_SPEC §4 The Difference - port of recon/source/index.pretty.html L1766-1953.
// Static section: no JS behaviour, no animations in the original.
export default function Difference() {
  const ref = useRef(null)
  useInView(ref)
  return (
    <section ref={ref} className="evidence-section" id="runtime-evidence" aria-labelledby="evidence-title">
      <div className="container">
        <header>
          <div className="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M 10 4 L 16 4 L 16 6 L 10 6 Z M 10 16 L 16 16 L 16 18 L 10 18 Z M 10 10 L 12 10 L 12 8 L 14 8 L 14 10 L 16 10 L 16 12 L 14 12 L 14 14 L 12 14 L 12 12 L 10 12 Z M 16 6 L 18 6 L 18 8 L 16 8 Z M 18 8 L 20 8 L 20 14 L 18 14 Z M 6 8 L 8 8 L 8 14 L 6 14 Z M 8 6 L 10 6 L 10 8 L 8 8 Z M 8 14 L 10 14 L 10 16 L 8 16 Z M 6 16 L 8 16 L 8 18 L 6 18 Z M 4 18 L 6 18 L 6 20 L 4 20 Z M 16 14 L 18 14 L 18 16 L 16 16 Z"
                fill="var(--primary)"
              ></path>
            </svg>
            The Difference
          </div>
          <h2 id="evidence-title">
            Static analysis reads the code.
            <br />
            <span>Rig tests what it does.</span>
          </h2>
          <p className="intro">
            Static analysis finds potential vulnerabilities in source code. Rig adds evidence from the running
            application, separating what could happen from what happened during a test.
          </p>
        </header>
        <figure className="comparison">
          <div className="analysis-panel">
            <div className="panel-label">
              <span>01 / STATIC ANALYSIS</span>
              <span className="file-label">Source code</span>
            </div>
            <div
              className="code-sample"
              aria-label="Illustrative source code: request input passed into a database query"
            >
              <div>
                <span className="line-number">12</span>
                <code>input = request.query</code>
              </div>
              <div>
                <span className="line-number">13</span>
                <code>query = buildQuery(input)</code>
              </div>
              <div className="flagged-line">
                <span className="line-number">14</span>
                <code>database.execute(query)</code>
                <span className="code-marker" aria-hidden="true">
                  ◇
                </span>
              </div>
            </div>
            <div className="panel-result">
              <span className="result-icon potential" aria-hidden="true">
                ?
              </span>
              <div>
                <strong>A potential vulnerability</strong>
                <p>Identified by analyzing the code.</p>
              </div>
            </div>
          </div>
          <div className="runtime-panel">
            <div className="panel-label">
              <span>02 / RIG RUNTIME TESTING</span>
              <span className="live-label">
                <i aria-hidden="true"></i>Running app
              </span>
            </div>
            <div
              className="execution-path"
              aria-label="Test input flows through application code to a database operation"
            >
              <div className="path-node">
                <span className="node-symbol" aria-hidden="true">
                  ↳
                </span>
                <span>Test input</span>
              </div>
              <span className="path-link" aria-hidden="true">
                →
              </span>
              <div className="path-node">
                <span className="node-symbol" aria-hidden="true">
                  {'{ }'}
                </span>
                <span>App code</span>
              </div>
              <span className="path-link" aria-hidden="true">
                →
              </span>
              <div className="path-node">
                <span className="node-symbol sink" aria-hidden="true">
                  !
                </span>
                <span>Database</span>
              </div>
            </div>
            <div className="panel-result">
              <span className="result-icon confirmed" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong>A confirmed execution path</strong>
                <p>Observed while testing the application.</p>
              </div>
            </div>
          </div>
        </figure>
        <div className="evidence-points">
          <article>
            <span className="point-number">01</span>
            <h3>Reachability, confirmed.</h3>
            <p>
              Static analysis can identify a potentially vulnerable path. Rig confirms that the path actually
              executes in the running application before reporting a finding.
            </p>
          </article>
          <article>
            <span className="point-number">02</span>
            <h3>Runtime context, included.</h3>
            <p>
              Static analysis models how code may behave. Rig observes how it behaves with the inputs,
              configuration, and dependencies present during the test.
            </p>
          </article>
          <article>
            <span className="point-number">03</span>
            <h3>Evidence, ready to act on.</h3>
            <p>
              A static finding can leave developers checking whether an issue is reachable. Rig includes
              execution evidence and the code location, giving developers and agents concrete fix
              instructions.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
