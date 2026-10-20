import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import useWalkthrough from './intro-rig/useWalkthrough.js'
import '../styles/intro-rig.css'

// CLONE_SPEC §3 Introducing Rig. Markup ported from recon/source/index.html (minified source,
// whitespace preserved where it renders: `.code-line` is `white-space: pre`).
// Everything below is rendered with static props; useWalkthrough mutates hidden / data-* /
// aria-* / the play button label directly, exactly like the original inline script.

const PLAY_LABEL = { __html: 'Play <span aria-hidden="true">▶</span>' }

const STEPS = [
  {
    kicker: 'THE LOOP / 01',
    title: 'The agent finishes a change. Rig starts a check.',
    body: 'Rig connects to the agent’s completion hook. The check starts automatically, without a developer remembering to run a scan.',
  },
  {
    kicker: 'THE LOOP / 02',
    title: 'Rig tests the running application.',
    body: 'Rig runs the application locally and tracks how input moves through its code. It confirms a vulnerable execution path before reporting a finding.',
  },
  {
    kicker: 'THE LOOP / 03',
    title: 'The agent gets evidence and fix instructions.',
    body: 'Each finding identifies the code location, explains the vulnerability, and gives the agent guidance for fixing it. The same agent working on the feature can act on that feedback.',
  },
  {
    kicker: 'THE LOOP / 04',
    title: 'Rig checks the updated code.',
    body: 'After the agent makes a fix, Rig retests the reported vulnerability. The result shows whether the check passed, the issue remains, or testing could not complete.',
  },
]

const MARKERS = ['Hook', 'Test', 'Fix', 'Retest']

function ToolHeading({ action, state, stateClass }) {
  return (
    <div className="tool-heading">
      <span className="tool-chevron">⌄</span>
      <span>Rig</span>
      <span className="tool-action">{action}</span>
      <span className={`tool-state ${stateClass}`}>{state}</span>
    </div>
  )
}

function Thinking({ title, detail }) {
  return (
    <div className="conversation-progress" aria-hidden="true">
      <span className="thinking-dots">
        <i></i>
        <i></i>
        <i></i>
      </span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}

function AgentMessage({ children, edit }) {
  return (
    <div className="assistant-message">
      <span className="message-author">Agent</span>
      <p>{children}</p>
      {edit ? <span className="chat-edit">{edit}</span> : null}
    </div>
  )
}

export default function IntroRig() {
  const ref = useRef(null)
  const walkthroughRef = useRef(null)
  const demoRef = useRef(null)
  useInView(ref)
  // Original: IntersectionObserver({ threshold: .35 }) on .product-demo gates playback.
  const demoVisible = useInView(demoRef, { threshold: 0.35, rootMargin: '0px', className: null })
  useWalkthrough(walkthroughRef, demoVisible)

  return (
    <section ref={ref} className="offline-section" id="intro-rig">
      <div className="container">
        <div className="intro-headline-wrap">
          <div className="badge">Introducing Rig</div>
          <h2 className="display intro-title">
            Automated Security
            <br />
            Inside the Loop
          </h2>
          <p className="intro-desc">
            Rig checks the application when the coding agent finishes its work. Findings go straight
            back to the agent, while the code and context are still fresh.
          </p>
        </div>
        <div
          ref={walkthroughRef}
          className="walkthrough"
          data-step="0"
          data-phase="3"
          data-playing="false"
        >
          <figure
            ref={demoRef}
            className="product-demo"
            aria-label="Illustrative example: an agent adds a search endpoint, Rig confirms SQL injection, the agent parameterizes the query, and Rig retests it."
          >
            <figcaption>
              <span className="demo-dot"></span> workspace / search-api
            </figcaption>
            <div className="editor-bar">
              <span className="file-tab">{'⌘   routes/search.ts'}</span>
              <span className="file-status">modified</span>
            </div>
            <div className="code-editor" aria-hidden="true">
              <div className="code-line">
                <span>12</span>
                <code>
                  <b>app</b>.get(<em>'/search'</em>, <b>async</b>
                  {' (req, res) => {'}
                </code>
              </div>
              <div className="code-line input-line">
                <span>13</span>
                <code>
                  {' '}
                  <b>const</b>
                  {' name = req.query.name;'}
                </code>
              </div>
              <div className="query-lines vulnerable-query">
                <div className="code-line query-line">
                  <span>14</span>
                  <code>
                    {' '}
                    <b>const</b>
                    {' users = '}
                    <b>await</b>
                    {' db.query('}
                  </code>
                </div>
                <div className="code-line query-line">
                  <span>15</span>
                  <code>
                    {' '}
                    <em>{'`SELECT * FROM users'}</em>
                  </code>
                </div>
                <div className="code-line query-line">
                  <span>16</span>
                  <code>
                    {' '}
                    <em>{"WHERE name = '${name}'`"}</em>
                  </code>
                </div>
                <div className="code-line">
                  <span>17</span>
                  <code>{' );'}</code>
                </div>
              </div>
              <div className="query-lines fixed-query">
                <div className="code-line fixed-line">
                  <span>14</span>
                  <code>
                    {' '}
                    <b>const</b>
                    {' users = '}
                    <b>await</b>
                    {' db.query('}
                  </code>
                </div>
                <div className="code-line fixed-line">
                  <span>15</span>
                  <code>
                    {' '}
                    <em>{"'SELECT * FROM users"}</em>
                  </code>
                </div>
                <div className="code-line fixed-line">
                  <span>16</span>
                  <code>
                    {' '}
                    <em>{"WHERE name = $1'"}</em>
                    {', [name]'}
                  </code>
                </div>
                <div className="code-line">
                  <span>17</span>
                  <code>{' );'}</code>
                </div>
              </div>
              <div className="code-line">
                <span>18</span>
                <code>{' res.json(users.rows);'}</code>
              </div>
              <div className="code-line">
                <span>19</span>
                <code>{'});'}</code>
              </div>
              <div className="code-note">
                <span className="note-before">+ Search endpoint added</span>
                <span className="note-after">✓ Query parameterized</span>
              </div>
            </div>
            <div className="demo-conversation" aria-label="Coding agent chat">
              <div className="chat-header">
                <span className="agent-avatar">›_</span>
                <span>Agent chat</span>
                <span className="chat-session">search-api</span>
              </div>
              <div
                className="chat-thread"
                tabIndex={0}
                role="region"
                aria-label="Agent conversation history"
              >
                <div className="user-message">
                  <span>You</span>
                  <p>Add a search endpoint for users.</p>
                </div>
                <div className="chat-scenes">
                  <div className="demo-scene" data-scene="0">
                    <AgentMessage>Done. I added the search endpoint.</AgentMessage>
                    <div className="tool-message">
                      <ToolHeading action="completion hook" state="Running" stateClass="running" />
                      <div className="tool-body">
                        <p>Starting the application locally and checking the change…</p>
                        <div className="chat-progress">
                          <i></i>
                        </div>
                      </div>
                    </div>
                    <Thinking title="Agent thinking…" detail="Finishing the search endpoint" />
                  </div>
                  <div className="demo-scene" data-scene="1" hidden>
                    <AgentMessage>The endpoint is ready. The security check is running.</AgentMessage>
                    <div className="tool-message">
                      <ToolHeading action="check result" state="1 finding" stateClass="finding" />
                      <div className="tool-body">
                        <strong>SQL injection confirmed</strong>
                        <p>
                          <code>routes/search.ts:16</code>
                        </p>
                        <p>Test input reached the SQL query and changed its execution.</p>
                      </div>
                    </div>
                    <Thinking
                      title="Rig running…"
                      detail="Testing input through the running application"
                    />
                  </div>
                  <div className="demo-scene" data-scene="2" hidden>
                    <div className="tool-message">
                      <ToolHeading
                        action="fix instructions"
                        state="SQL injection"
                        stateClass="finding"
                      />
                      <div className="tool-body">
                        <p>
                          <code>routes/search.ts:16</code>
                        </p>
                        <p>
                          Use a parameterized query. Replace the interpolated input with{' '}
                          <code>$1</code> and pass <code>[name]</code> separately.
                        </p>
                      </div>
                    </div>
                    <AgentMessage edit="✓ Edited routes/search.ts">
                      I’ve bound the input as a query parameter. The fix is ready for Rig to
                      recheck.
                    </AgentMessage>
                    <Thinking
                      title="Agent thinking…"
                      detail="Reviewing the finding and updating the query"
                    />
                  </div>
                  <div className="demo-scene" data-scene="3" hidden>
                    <div className="tool-message">
                      <ToolHeading action="recheck result" state="Passed" stateClass="passed" />
                      <div className="tool-body">
                        <strong>Retest passed</strong>
                        <p>
                          <code>routes/search.ts:16</code>
                        </p>
                        <p>
                          The reported SQL injection no longer reproduces with the updated query.
                        </p>
                      </div>
                    </div>
                    <AgentMessage>
                      The fix passed Rig’s recheck. The search endpoint now uses a parameterized
                      query.
                    </AgentMessage>
                    <Thinking
                      title="Rig rechecking…"
                      detail="Running the same test against the updated code"
                    />
                  </div>
                </div>
              </div>
              <div className="chat-composer" aria-hidden="true">
                <span>Message your agent…</span>
                <span>↑</span>
              </div>
            </div>
            <div className="demo-footer">
              <span className="local-dot"></span> LOCAL WORKSPACE <span>AGENT + RIG</span>
            </div>
          </figure>
          <div className="walkthrough-copy">
            <div className="step-copy-stack" id="rig-step-description" aria-live="off">
              {STEPS.map((s, i) => (
                <div
                  key={s.kicker}
                  className="step-copy"
                  data-copy={i}
                  aria-hidden={i === 0 ? 'false' : 'true'}
                >
                  <div className="step-heading">
                    <span className="step-kicker">{s.kicker}</span> <h3>{s.title}</h3>
                  </div>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
            <div className="walkthrough-controls" aria-label="Walkthrough controls">
              <div className="step-markers">
                {MARKERS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    data-go={i}
                    aria-label={`Step ${i + 1}: ${label}`}
                    aria-current={i === 0 ? 'step' : undefined}
                    aria-controls="rig-step-description"
                  >
                    <span>{`0${i + 1}`}</span>
                    <span className="marker-label">{label}</span>
                  </button>
                ))}
              </div>
              <div className="transport">
                <button type="button" data-prev="" aria-label="Previous step">
                  ←
                </button>
                <button type="button" data-next="" aria-label="Next step">
                  →
                </button>
                <button
                  type="button"
                  data-play=""
                  aria-label="Play walkthrough"
                  dangerouslySetInnerHTML={PLAY_LABEL}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
