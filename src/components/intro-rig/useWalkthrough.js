/**
 * useWalkthrough - React port of the original inline walkthrough script
 * (recon/source/index.pretty.html L1637-1763, CLONE_SPEC §3 "Walkthrough state machine").
 *
 * The logic is the original imperative DOM script, kept line-for-line (minified names are
 * expanded but each statement maps 1:1). The markup it drives is rendered once by
 * IntroRig.jsx with static props, so React never rewrites the attributes this hook mutates
 * (hidden, data-*, aria-*, the play button's innerHTML).
 *
 * The only structural change: the original created its own
 *   new IntersectionObserver(cb, { threshold: 0.35 }).observe(.product-demo)
 * Here that gate comes from the shared useInView hook (threshold .35, rootMargin 0px,
 * className null) and is fed in as `demoVisible`; on every change it runs the same
 * callback body (`intersecting = isIntersecting; sync()`).
 *
 *   original var  ->  here
 *   r  walkthrough root     e  step           a  playing (autoplay)
 *   p  visible              s  elapsed (ms)   d  last tick timestamp
 *   i  reduced-motion MQL   h  play button    v  .step-copy-stack
 *   f  .chat-thread         w  [data-scene]   g  last rendered scene key
 *   q  renderScenes(phase)  l  render()       u  goTo(step, fromUser)
 *   m  intersecting         y  sync()         b  interval id
 */
import { useEffect, useLayoutEffect, useRef } from 'react'

const STEP_MS = 1e4

export default function useWalkthrough(rootRef, demoVisible) {
  const onIntersectRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const playButton = root.querySelector('[data-play]')
    const copyStack = root.querySelector('.step-copy-stack')
    let step = 0
    let playing = !reducedMotion.matches
    let visible = false
    let elapsed = reducedMotion.matches ? STEP_MS : 0
    let last = performance.now()
    const thread = root.querySelector('.chat-thread')
    const scenes = [...root.querySelectorAll('[data-scene]')]
    let renderedKey = ''

    const renderScenes = (phase) => {
      const key = `${step}:${Math.min(phase, 2)}`
      if (key === renderedKey) return
      renderedKey = key
      scenes.forEach((scene, index) => {
        scene.hidden = index > step
        scene.dataset.complete = String(index < step)
        scene
          .querySelectorAll(':scope > .assistant-message, :scope > .tool-message')
          .forEach((message, messageIndex) => {
            message.hidden = index > step || (index === step && phase < messageIndex + 1)
          })
        scene.querySelector('.conversation-progress').hidden =
          index !== step || phase >= 2 || reducedMotion.matches
        const running = scene.querySelector('.tool-state.running')
        if (running) running.textContent = index < step ? 'Started' : 'Running'
      })
      requestAnimationFrame(() =>
        thread.scrollTo({
          top: thread.scrollHeight,
          behavior: playing && !reducedMotion.matches ? 'smooth' : 'instant',
        }),
      )
    }

    const render = () => {
      const phase = elapsed < 1800 ? 0 : elapsed < 3600 ? 1 : elapsed < 5400 ? 2 : 3
      root.dataset.phase = String(phase)
      renderScenes(phase)
      root.dataset.fixApplied = String(step === 3 || (step === 2 && phase >= 2))
      root.dataset.playing = String(playing && visible)
      playButton.innerHTML = playing
        ? 'Pause <span aria-hidden="true">Ⅱ</span>'
        : step === 3
          ? 'Replay <span aria-hidden="true">↻</span>'
          : 'Play <span aria-hidden="true">▶</span>'
      playButton.setAttribute(
        'aria-label',
        playing ? 'Pause walkthrough' : step === 3 ? 'Replay walkthrough' : 'Play walkthrough',
      )
    }

    const goTo = (target, fromUser = false) => {
      step = (target + 4) % 4
      if (fromUser) playing = false
      elapsed = fromUser || reducedMotion.matches ? STEP_MS : 0
      last = performance.now()
      copyStack.setAttribute('aria-live', fromUser ? 'polite' : 'off')
      root.dataset.step = String(step)
      root
        .querySelectorAll('[data-copy]')
        .forEach((copy, index) => copy.setAttribute('aria-hidden', String(index !== step)))
      root.querySelectorAll('[data-go]').forEach((marker, index) => {
        if (index === step) marker.setAttribute('aria-current', 'step')
        else marker.removeAttribute('aria-current')
      })
      render()
    }

    const cleanups = []
    const listen = (target, type, handler) => {
      target.addEventListener(type, handler)
      cleanups.push(() => target.removeEventListener(type, handler))
    }

    root
      .querySelectorAll('[data-go]')
      .forEach((marker) => listen(marker, 'click', () => goTo(Number(marker.dataset.go), true)))
    listen(root.querySelector('[data-prev]'), 'click', () => goTo(step - 1, true))
    listen(root.querySelector('[data-next]'), 'click', () => goTo(step + 1, true))
    listen(playButton, 'click', () => {
      playing = !playing
      if (playing && step === 3 && elapsed >= STEP_MS) {
        goTo(0)
      } else {
        if (playing && elapsed >= STEP_MS) elapsed = reducedMotion.matches ? 5400 : 0
        last = performance.now()
        render()
      }
    })

    let intersecting = false
    const sync = () => {
      visible = intersecting && !document.hidden
      last = performance.now()
      render()
    }
    // Stands in for the original IntersectionObserver callback on .product-demo.
    onIntersectRef.current = (isIntersecting) => {
      intersecting = isIntersecting
      sync()
    }
    listen(document, 'visibilitychange', sync)
    listen(reducedMotion, 'change', () => {
      if (reducedMotion.matches) {
        playing = false
        elapsed = STEP_MS
        render()
      }
    })

    const interval = setInterval(() => {
      if (!root.isConnected) {
        clearInterval(interval)
        return
      }
      const now = performance.now()
      const delta = now - last
      last = now
      if (!playing || !visible) return
      elapsed += delta
      if (elapsed >= STEP_MS) {
        if (step < 3) goTo(step + 1)
        else {
          playing = false
          render()
        }
      } else {
        render()
      }
    }, 100)

    render()

    return () => {
      clearInterval(interval)
      cleanups.forEach((fn) => fn())
      onIntersectRef.current = null
    }
  }, [rootRef])

  // Original: `new IntersectionObserver(([t]) => { m = t.isIntersecting; y() }, { threshold: .35 })`
  useEffect(() => {
    if (onIntersectRef.current) onIntersectRef.current(demoVisible)
  }, [demoVisible])
}
