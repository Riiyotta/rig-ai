import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import {
  CodexIcon,
  ClaudeCodeIcon,
  OpenCodeIcon,
  VsCodeIcon,
  TerminalIcon,
  PythonIcon,
  JavaScriptIcon,
  RustIcon,
  GitHubIcon,
  GitLabIcon,
} from './get-started/StackIcons.jsx'
import '../styles/get-started.css'

// CLONE_SPEC §7 Get started (HTML L3023-3328).
// useInView toggles `.is-visible` (threshold 0, rootMargin 200px 0px) like the original
// global observer. This section has no animations of its own.
const STEPS = [
  {
    number: '01 / INSTALL',
    title: 'Install the CLI.',
    body: 'Rig runs on the developer’s computer, alongside the application being tested.',
  },
  {
    number: '02 / CONNECT',
    title: 'Connect the coding agent.',
    body: 'Connect Rig to the agent’s completion hook so a finished task triggers a security check.',
  },
  {
    number: '03 / CHECK',
    title: 'Run the first check.',
    body: 'Check the application and review the result, Rig checks subsequent work through the agent workflow.',
  },
]

const STACK = [
  {
    label: 'Agents',
    items: [
      ['Codex', CodexIcon],
      ['Claude Code', ClaudeCodeIcon],
      ['OpenCode', OpenCodeIcon],
    ],
  },
  {
    label: 'Editors & terminal',
    items: [
      ['VS Code', VsCodeIcon],
      ['Terminal', TerminalIcon],
    ],
  },
  {
    label: 'Languages',
    items: [
      ['Python', PythonIcon],
      ['JavaScript', JavaScriptIcon],
      ['Rust', RustIcon],
    ],
  },
  {
    label: 'CI / CD',
    items: [
      ['GitHub', GitHubIcon],
      ['GitLab', GitLabIcon],
    ],
  },
]

export default function GetStarted() {
  const ref = useRef(null)
  useInView(ref)
  return (
    <section ref={ref} className="setup-section" id="setup-rig" aria-labelledby="setup-title">
      <div className="container">
        <header className="setup-heading">
          <div className="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M 16 12 L 18 12 L 18 14 L 20 14 L 20 16 L 18 16 L 18 18 L 16 18 L 16 16 L 4 16 L 4 4 L 6 4 L 6 14 L 16 14 Z M 14 10 L 16 10 L 16 12 L 14 12 Z M 14 18 L 16 18 L 16 20 L 14 20 Z"
                fill="var(--primary)"
              ></path>
            </svg>
            Get started
          </div>
          <h2 id="setup-title">
            Set up Rig where
            <br />
            the code gets written.
          </h2>
        </header>
        <ol className="setup-steps">
          {STEPS.map((step) => (
            <li key={step.number}>
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="cli-note">
          <span aria-hidden="true">›_</span>
          <span>Need feedback outside an agent session? Developers can also run a check directly from the CLI.</span>
        </p>
        <div className="stack-strip">
          <h3>Works with your stack.</h3>
          <div className="stack-grid">
            {STACK.map((group) => (
              <div className="stack-group" key={group.label}>
                <h4>{group.label}</h4>
                <div className="stack-items">
                  {group.items.map(([name, Icon]) => (
                    <span className="stack-item" key={name}>
                      <Icon />
                      <span>{name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
