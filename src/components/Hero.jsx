import { useEffect, useRef } from 'react'
import useInView from '../hooks/useInView.js'
import '../styles/hero.css'

// CLONE_SPEC §1, markup from recon/source/index.pretty.html L383-659.

const NAV_DEMO_URL = '#' // external link removed
const HERO_DEMO_URL = '#' // external link removed

const TICKER_ITEMS = [
  {
    href: '#',
    text: 'OpenAI says its AI technology acted on its own in an ‘unprecedented’ hack of another company',
  },
  {
    href: '#',
    text: 'Anthropic says its AI models hacked 3 organizations during testing',
  },
  {
    href: '#',
    text: 'Vercel Incident Linked to AI Tool',
  },
  {
    href: '#',
    text: 'North Korean Hackers Weaponize AI, Driving 66% of 2026 Crypto Thefts at $643 Million',
  },
  {
    href: '#',
    text: 'Braintrust security incident raises concerns over AI supply chain risks',
  },
  {
    href: '#',
    text: 'Russian hackers turn to AI as old tactics fail, Ukrainian CERT says',
  },
  {
    href: '#',
    text: 'Gemini Hacked Three Companies in First Known Breakout by Google’s AI',
  },
]

function TickerGroup({ duplicate = false, groupRef }) {
  return (
    <div className="hero-ticker-group" aria-hidden={duplicate ? 'true' : undefined} ref={groupRef}>
      {TICKER_ITEMS.map((item) => (
        <TickerItem key={item.text} item={item} duplicate={duplicate} />
      ))}
    </div>
  )
}

function TickerItem({ item, duplicate }) {
  return (
    <>
      <a href={item.href} tabIndex={duplicate ? -1 : undefined}>
        {item.text}
      </a>
      <span className="hero-ticker-separator" aria-hidden="true">
        &bull;
      </span>
    </>
  )
}

export default function Hero() {
  const heroRef = useRef(null)
  const innerRef = useRef(null)
  const groupRef = useRef(null)
  useInView(heroRef)

  // Original inline script: --ticker-duration = groupWidth / 30 (30 px/s), kept in sync
  // by a ResizeObserver on the first group.
  useEffect(() => {
    const inner = innerRef.current
    const group = groupRef.current
    if (!inner || !group) return undefined
    const update = () => {
      inner.style.setProperty('--ticker-duration', `${group.getBoundingClientRect().width / 30}s`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(group)
    return () => ro.disconnect()
  }, [])

  return (
    <section className="hero" ref={heroRef}>
      <header className="site-header" role="banner" data-variant="hero">
        <nav className="site-nav" aria-label="Main navigation">
          <a href="/" className="site-logo" aria-label="Rig — Home">
            <img src="/assets/img/rig-wordmark.svg" alt="" width="60" height="22" />
          </a>
          <a href={NAV_DEMO_URL} className="btn-chamfer btn-dark site-nav-cta" id="nav-join-btn">
            Get a Demo
          </a>
        </nav>
      </header>

      {/* Hero watermark (faded Rig logo) */}
      <svg
        className="hero-watermark"
        viewBox="0 0 163 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M162.809 89.4121H82.6844C74.7832 89.4121 67.2059 92.5528 61.6216 98.1424C56.0441 103.725 52.9111 111.294 52.9111 119.185V159.996H72.1703V126.45C72.1703 116.812 72.3437 108.001 72.3437 108.001H162.809V89.4121Z"
          fill="currentColor"
        />
        <path
          d="M162.808 118.61H111.815C103.914 118.61 96.3368 121.751 90.7524 127.341C85.1749 132.923 82.042 140.492 82.042 148.384V159.997H104.909V144.052C104.909 134.414 104.909 134.082 104.909 134.082H162.808V118.61Z"
          fill="currentColor"
        />
        <path
          d="M162.809 146.002C144.706 146.002 134.567 145.996 116.464 146.004V160H162.809V146.002Z"
          fill="currentColor"
        />
        <path
          d="M162.809 0.00304711H70.8863C52.0802 0.00304711 34.0448 7.47609 20.7501 20.7772C7.46368 34.07 0 52.0946 0 70.8889C0 99.2859 0 140.767 0 159.997H15.7849V67.7138C15.7849 53.2572 15.7849 41.5373 15.7849 41.5373H162.812V0L162.809 0.00304711Z"
          fill="currentColor"
        />
        <path
          d="M162.809 51.8704H56.8042C48.903 51.8704 41.3258 55.0111 35.7414 60.6008C30.1639 66.1835 27.031 73.7522 27.031 81.6437V159.997H41.8159V96.3178C41.8159 86.6801 41.8159 78.8688 41.8159 78.8688H162.809V51.8674V51.8704Z"
          fill="currentColor"
        />
      </svg>

      <div className="hero-content">
        <h1 style={{ marginTop: '2rem' }}>
          Build Security Into
          <br />
          The Agent Loop
        </h1>
        <p className="hero-sub">
          Find vulnerabilities as agents work, guide them through fixes, and verify the results,
          before findings turn into tickets.
        </p>
        <div className="hero-actions">
          <a href={HERO_DEMO_URL} className="btn-chamfer btn-dark" id="hero-join-btn">
            Get a Demo
          </a>
        </div>
      </div>

      {/* News ticker */}
      <div className="hero-ticker" aria-label="Latest news">
        <div className="hero-ticker-inner" ref={innerRef}>
          <TickerGroup groupRef={groupRef} />
          <TickerGroup duplicate />
        </div>
      </div>
    </section>
  )
}
