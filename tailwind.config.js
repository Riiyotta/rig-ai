/** @type {import('tailwindcss').Config} */
// Tokens mirror the original `:root` in recon/source/slug.pretty.css (CLONE_SPEC §0).
// Colors resolve to the CSS custom properties declared in src/index.css so there is a
// single source of truth; Tailwind opacity modifiers (e.g. bg-primary/50) do NOT work
// with these var() values - use the explicit paper-XX / *-dim tokens instead.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: {
    // The original site has no Tailwind preflight - only `* {box-sizing; margin:0; padding:0}`
    // plus UA defaults (img inline, h1-h3 bold, etc.). Preflight is disabled so the ported
    // CSS renders exactly as measured. See src/index.css "Base".
    preflight: false,
    // The original `.container` (1200px / 90% under 1280) lives in src/index.css.
    // Tailwind's own container utility would clash with it.
    container: false,
  },
  theme: {
    // Original is desktop-first (max-width queries). Breakpoints from CLONE_SPEC §0.
    screens: {
      max1280: { max: '1280px' },
      max1024: { max: '1024px' },
      max1000: { max: '1000px' },
      max900: { max: '900px' },
      max768: { max: '768px' },
      max700: { max: '700px' },
      min769: { min: '769px' },
      min901: { min: '901px' },
      tablet: { min: '769px', max: '1024px' },
    },
    extend: {
      colors: {
        blue: 'var(--blue)',
        'blue-dim': 'var(--blue-dim)',
        yellow: 'var(--yellow)',
        'yellow-dim': 'var(--yellow-dim)',
        red: 'var(--red)',
        'red-glow': 'var(--red-glow)',
        green: 'var(--green)',
        'green-dim': 'var(--green-dim)',
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        primary: 'var(--primary)',
        'primary-glow': 'var(--primary-glow)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        'tertiary-dim': 'var(--tertiary-dim)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        text: 'var(--text)',
        'paper-dim': 'var(--paper-dim)',
        'paper-faint': 'var(--paper-faint)',
        border: 'var(--border)',
        'border-dim': 'var(--border-dim)',
        'paper-70': 'var(--paper-70)',
        'paper-60': 'var(--paper-60)',
        'paper-50': 'var(--paper-50)',
        'paper-45': 'var(--paper-45)',
        'paper-40': 'var(--paper-40)',
        'paper-35': 'var(--paper-35)',
        'paper-30': 'var(--paper-30)',
        'paper-25': 'var(--paper-25)',
        'paper-20': 'var(--paper-20)',
        'paper-15': 'var(--paper-15)',
        'paper-12': 'var(--paper-12)',
        'paper-06': 'var(--paper-06)',
        'paper-04': 'var(--paper-04)',
        'paper-02': 'var(--paper-02)',
        'text-muted': 'var(--text-muted)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-faint': 'var(--text-faint)',
        // Literal colors from CLONE_SPEC §0 "Other literal colors"
        'footer-bg': '#0a0a0a',
        'badge-bg': '#0a0a0ae0',
        'ticker-border': 'rgba(10, 10, 10, 0.15)',
        'cta-glow': 'oklch(0.7132 0.1431 253.83)',
        'flow-glow': 'oklch(0.952739 0.066525 92.42)',
        'wave-grid': '#2981E0',
      },
      fontFamily: {
        // Hero h1, CTA h2, .display
        display: ['Chalet', 'Inter', 'sans-serif'],
        // Other Chalet headings
        chalet: ['Chalet', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Chivo Mono"', 'monospace'],
        pixel: ['"Geist Pixel Square"', 'monospace'],
        // .step-number, .stack-group h4, .cli-note first span use the plain generic
        'system-mono': ['monospace'],
      },
      letterSpacing: {
        display: '-0.03em',
        'display-heavy': '-0.02em',
      },
      maxWidth: {
        container: '1200px',
        nav: 'calc(1200px + 6rem)',
      },
      spacing: {
        chamfer: '14px',
      },
      zIndex: {
        lines: '9999',
        stage: '10000',
        noise: '10001',
        scanlines: '10002',
        fringe: '10003',
      },
    },
  },
  plugins: [],
}
