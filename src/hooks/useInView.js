/**
 * useInView - React port of the original global visibility observer
 * (recon/source/index.astro_astro_type_script_index_1_lang.CmB44lM6.pretty.js, CLONE_SPEC §11).
 *
 * The original observes every `section`, `.hero` and `footer` with
 *   IntersectionObserver({ threshold: 0, rootMargin: "200px 0px" })
 * and toggles the `is-visible` class. CSS then pauses off-screen loops with rules like
 *   .hero:not(.is-visible) .hero-ticker-inner { animation-play-state: paused; }
 *
 * API
 *   const ref = useRef(null)
 *   const visible = useInView(ref, options?)
 *   <section ref={ref} className="my-section">...</section>
 *
 *   ref      React ref to the element to observe.
 *   options  {
 *     threshold?:   number | number[]   default 0          (original global observer)
 *     rootMargin?:  string              default "200px 0px"
 *     className?:   string | null       default "is-visible" - class toggled directly on
 *                                       the DOM node (no re-render needed for CSS gating).
 *                                       Pass null to only get the boolean.
 *   }
 *   returns  boolean - current isIntersecting state (re-renders on change). false until
 *            the first observer callback. If IntersectionObserver is unavailable the
 *            original does nothing (class never added); here we mirror that, returning false.
 *
 * Caveat: the class is added imperatively. Keep the element's `className` prop static (or
 * derive it from the returned boolean) - if React rewrites className it drops `is-visible`.
 *
 * For component-specific gates (walkthrough threshold .35, how-stepper threshold .1) call
 * it again with those options and className: null so the global `is-visible` class keeps
 * its original 0 / 200px semantics:
 *   const demoVisible = useInView(demoRef, { threshold: 0.35, rootMargin: '0px', className: null })
 */
import { useEffect, useState } from 'react'

export default function useInView(ref, options = {}) {
  const { threshold = 0, rootMargin = '200px 0px', className = 'is-visible' } = options
  const [visible, setVisible] = useState(false)
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : threshold

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (className) entry.target.classList.toggle(className, entry.isIntersecting)
          setVisible(entry.isIntersecting)
        })
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (className) el.classList.remove(className)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, thresholdKey, rootMargin, className])

  return visible
}
