/**
 * useHowStepper - React port of the how-stepper script bundled at the end of
 * recon/source/index.astro_astro_type_script_index_1_lang.BP02SbqZ.pretty.js (L3478-3558).
 *
 * Original behaviour (CLONE_SPEC §5):
 *  - Active step's `.how-step-progress-fill` runs `howProgressFill 6s linear forwards`;
 *    on `animationend` it advances 1 -> 2 -> 3 -> 1 forever.
 *  - Play state is "running" only while the section is >=10% visible (IO threshold .1)
 *    AND the pointer is not over `.how-stepper`; otherwise "paused".
 *  - First activation (setHowStep(1)) happens on the first intersection.
 *  - On a step change (after the first activation, to a different step) `#howCard`'s height
 *    tweens old -> new with Motion animate({height}, {duration:.4, easing:[.25,.1,.25,1]}).
 *    Ported to WAAPI element.animate with the same duration/easing.
 *
 * The fill animation restart (original: style.animation='none', reflow, style.animation='')
 * is done by re-keying the fill element with `nonce`, which remounts it.
 */
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export default function useHowStepper({ visible, cardRef }) {
  const [state, setState] = useState({ step: 1, nonce: 0 })
  const [hovered, setHovered] = useState(false)
  const startedRef = useRef(false) // original `X === 0` check
  const stepRef = useRef(1)
  const pendingFromRef = useRef(null)
  const animRef = useRef(null)

  const setHowStep = useCallback(
    (t) => {
      const card = cardRef.current
      if (startedRef.current && stepRef.current !== t && card) {
        pendingFromRef.current = card.offsetHeight
      } else {
        pendingFromRef.current = null
      }
      startedRef.current = true
      stepRef.current = t
      setState((s) => ({ step: t, nonce: s.nonce + 1 }))
    },
    [cardRef],
  )

  // First intersection -> setHowStep(1). Later visibility changes only toggle play state.
  useLayoutEffect(() => {
    if (visible && !startedRef.current) setHowStep(1)
  }, [visible, setHowStep])

  // Height tween of #howCard after the new .card-content is shown.
  useLayoutEffect(() => {
    const card = cardRef.current
    const from = pendingFromRef.current
    pendingFromRef.current = null
    if (!card) return
    if (from == null) {
      card.style.height = 'auto'
      return
    }
    if (animRef.current) animRef.current.cancel()
    card.style.height = 'auto'
    const to = card.offsetHeight
    card.style.height = to + 'px'
    card.style.overflow = 'hidden'
    if (typeof card.animate !== 'function') {
      card.style.height = 'auto'
      card.style.overflow = ''
      return
    }
    const anim = card.animate(
      { height: [from + 'px', to + 'px'] },
      { duration: 400, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
    )
    animRef.current = anim
    anim.finished.then(
      () => {
        if (animRef.current !== anim) return
        animRef.current = null
        card.style.height = 'auto'
        card.style.overflow = ''
      },
      () => {},
    )
  }, [state, cardRef])

  const onFillAnimationEnd = useCallback(
    (e) => {
      if (e.animationName === 'howProgressFill') {
        const cur = stepRef.current
        setHowStep(cur < 3 ? cur + 1 : 1)
      }
    },
    [setHowStep],
  )

  return {
    step: state.step,
    nonce: state.nonce,
    playState: visible && !hovered ? 'running' : 'paused',
    setHowStep,
    onFillAnimationEnd,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }
}
