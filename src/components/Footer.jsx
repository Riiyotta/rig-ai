import { useRef } from 'react'
import useInView from '../hooks/useInView.js'
import '../styles/footer.css'

// CLONE_SPEC §10, markup from recon/source/index.pretty.html L4111-4172.
export default function Footer() {
  const footerRef = useRef(null)
  useInView(footerRef)

  return (
    <footer ref={footerRef}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/">
              <img className="footer-logo" src="/assets/img/logo-white.svg" alt="Rig" />
            </a>
            <p>
              Realtime Security Verification
              <br />
              for Coding Agents
            </p>
          </div>
          <div className="footer-col">
            <h3 className="mono-label">Connect</h3>
            <ul>
              <li>
                <a href="#">
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h3 className="mono-label">Legal</h3>
            <ul>
              <li>
                <a href="/terms">Terms of Service</a>
              </li>
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="mono-label">&copy; 2026 Rig AI Inc. All rights reserved.</span>
          <div className="status footer-status">
            <span className="footer-status-dot"></span>
            <span>All systems local</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
