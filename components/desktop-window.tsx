"use client"

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react"
import { AnimatePresence, motion, useAnimationControls, useDragControls, useIsPresent, useMotionValue, useReducedMotion } from "motion/react"
import { Maximize2, Minus, Minimize2, X } from "lucide-react"

export const WINDOW_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 1 } as const
export interface WindowPosition { x: number; y: number }
export interface WindowState {
  visibility: "visible" | "minimized" | "closed"
  mode: "normal" | "maximized"
  position: WindowPosition | null
  height: number
  revision: number
  action: "move" | "layout" | "visibility"
}
interface DesktopWindowProps {
  id: string
  label: string
  title: string
  icon: ReactNode
  headerActions?: ReactNode
  children: ReactNode
  width: number
  state: WindowState
  desktop: boolean
  active: boolean
  layer: number
  bounds: { width: number; height: number }
  windowRef: (element: HTMLElement | null) => void
  getDockTarget: () => HTMLElement | null
  onFocus: () => void
  onMove: (position: WindowPosition) => void
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
}

export function DesktopWindow(props: DesktopWindowProps) {
  return <AnimatePresence initial={false}>{props.state.visibility !== "closed" && <WindowSurface key={props.id} {...props} />}</AnimatePresence>
}

function WindowSurface({
  id, label, title, icon, headerActions, children, width, state, desktop,
  active, layer, bounds, windowRef, getDockTarget, onFocus, onMove,
  onMinimize, onToggleMaximize, onClose,
}: DesktopWindowProps) {
  const section = useRef<HTMLElement>(null)
  const dragLayer = useRef<HTMLDivElement>(null)
  const animationRun = useRef(0)
  const previousVisibility = useRef(state.visibility)
  const [concealedRevision, setConcealedRevision] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const dragControls = useDragControls()
  const animation = useAnimationControls()
  const reduced = useReducedMotion()
  const present = useIsPresent()
  const maximized = state.mode === "maximized"
  const interactive = present && state.visibility === "visible"
  const movable = interactive && desktop && !maximized && state.position !== null
  const baseX = state.position?.x ?? 0
  const baseY = state.position?.y ?? 0
  const registerSection = useCallback((element: HTMLElement | null) => {
    section.current = element
    windowRef(element)
  }, [windowRef])

  // Layout owns the committed position; Motion drag values are offsets only.
  useLayoutEffect(() => {
    x.stop()
    y.stop()
    x.set(0)
    y.set(0)
  }, [baseX, baseY, x, y])

  useLayoutEffect(() => {
    dragControls.cancel()
    x.set(0)
    y.set(0)
    const reset = requestAnimationFrame(() => setDragging(false))
    return () => cancelAnimationFrame(reset)
  }, [desktop, maximized, state.visibility, present, dragControls, x, y])

  useLayoutEffect(() => {
    const run = ++animationRun.current
    if (!present) return
    animation.stop()
    const previous = previousVisibility.current
    previousVisibility.current = state.visibility
    const dock = getDockTarget()?.getBoundingClientRect()
    const frame = dragLayer.current?.getBoundingClientRect()
    const targetX = dock && frame ? dock.x + dock.width / 2 - frame.x - frame.width / 2 : 0
    const targetY = dock && frame ? dock.y + dock.height / 2 - frame.y - frame.height / 2 : 0
    if (state.visibility === "minimized") {
      void animation.start({
        opacity: 0, scale: reduced ? 1 : 0.12,
        x: reduced ? 0 : targetX, y: reduced ? 0 : targetY,
        transition: { duration: reduced ? 0.1 : 0.24, ease: [0.32, 0, 0.67, 0] },
      }).then(() => {
        if (animationRun.current === run) setConcealedRevision(state.revision)
      })
    } else {
      if (previous === "minimized") {
        animation.set({ opacity: 0, scale: reduced ? 1 : 0.12, x: reduced ? 0 : targetX, y: reduced ? 0 : targetY })
      }
      void animation.start({ opacity: 1, scale: 1, x: 0, y: 0,
        transition: reduced ? { duration: 0.1 } : { ...WINDOW_SPRING, opacity: { duration: 0.16 } },
      })
    }
    // Invalidate interrupted completions without stopping AnimatePresence's exit.
    return () => { animationRun.current = run + 1 }
  }, [state.visibility, state.revision, present, reduced, animation, getDockTarget])

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (!movable || !event.isPrimary || event.button !== 0) return
    if ((event.target as Element).closest("button, a, input, select, textarea, [role='button'], [data-no-drag]")) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    dragControls.start(event)
  }
  const concealed = state.visibility === "minimized" && concealedRevision === state.revision
  const layoutTransition = reduced || state.action === "move" ? { duration: 0 } : WINDOW_SPRING
  const constraints = {
    left: 12 - baseX, top: 12 - baseY,
    right: Math.max(12, bounds.width - width - 12) - baseX,
    bottom: Math.max(12, bounds.height - state.height - 12) - baseY,
  }
  return (
    <motion.div className="window-slot" data-window={id} data-mode={state.mode}
      data-positioned={desktop && state.position !== null} hidden={concealed}
      layout={!reduced} layoutRoot={!desktop && maximized}
      transition={{ layout: layoutTransition }}
      style={{ "--window-width": `${width}px`, zIndex: layer,
        ...(desktop && !maximized && state.position ? { left: baseX, top: baseY } : {}),
      } as CSSProperties}
    >
      <motion.div ref={dragLayer} className="window-drag" style={{ x, y, willChange: dragging && movable ? "transform" : undefined }} drag={movable}
        dragControls={dragControls} dragListener={false} dragMomentum={false} dragElastic={0} dragConstraints={constraints}
        onDragStart={() => { setDragging(true); onFocus() }}
        onDragEnd={() => { setDragging(false); onMove({ x: baseX + x.get(), y: baseY + y.get() }) }}
      >
        <motion.section ref={registerSection} id={`window-${id}`} aria-label={`${label} window`} tabIndex={-1}
          aria-hidden={!interactive} inert={!interactive} data-mode={state.mode} data-visibility={state.visibility}
          data-active={active && interactive} data-dragging={dragging && movable} className="desktop-window"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }} animate={animation}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.96, transition: { duration: reduced ? 0.1 : 0.16 } }}
          onAnimationStart={() => { if (section.current) section.current.style.willChange = "transform, opacity" }}
          onAnimationComplete={() => { if (section.current) section.current.style.willChange = "auto" }}
          onPointerDownCapture={onFocus} onFocusCapture={onFocus}
        >
          <motion.div layout={reduced ? false : "position"} transition={{ layout: layoutTransition }} className="window-titlebar group" role="group"
            aria-label={`${label} title bar`} aria-describedby={movable ? "window-move-help" : undefined}
            tabIndex={movable ? 0 : -1} data-movable={movable} data-dragging={dragging && movable} onPointerDown={startDrag}
            onKeyDown={(event) => {
              if (!movable || event.target !== event.currentTarget) return
              const step = event.shiftKey ? 40 : 10
              let dx = 0, dy = 0
              if (event.key === "ArrowLeft") dx = -step
              else if (event.key === "ArrowRight") dx = step
              else if (event.key === "ArrowUp") dy = -step
              else if (event.key === "ArrowDown") dy = step
              else return
              event.preventDefault()
              onMove({ x: baseX + dx, y: baseY + dy })
            }}
          >
            <div className="window-controls">
              <motion.button type="button" tabIndex={0} className="window-control" aria-label={`Close ${label}`} title={`Close ${label}`} onClick={onClose} whileTap={reduced ? undefined : { scale: 0.9 }}>
                <span className="bg-red-400"><X aria-hidden="true" /></span>
              </motion.button>
              <motion.button type="button" tabIndex={0} className="window-control" aria-label={`Minimize ${label}`} title={`Minimize ${label}`} onClick={onMinimize} whileTap={reduced ? undefined : { scale: 0.9 }}>
                <span className="bg-amber-400"><Minus aria-hidden="true" /></span>
              </motion.button>
              <motion.button type="button" tabIndex={0} className="window-control" aria-label={`${maximized ? "Restore" : "Maximize"} ${label}`} title={`${maximized ? "Restore" : "Maximize"} ${label}`} onClick={onToggleMaximize} whileTap={reduced ? undefined : { scale: 0.9 }}>
                <span className="bg-emerald-400">{maximized ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}</span>
              </motion.button>
            </div>
            <div className="window-title">{icon}<span>{title}</span></div>
            {headerActions && <div className="window-header-actions">{headerActions}</div>}
          </motion.div>
          <motion.div layout={reduced ? false : "position"} transition={{ layout: layoutTransition }} layoutScroll className="window-content">{children}</motion.div>
        </motion.section>
      </motion.div>
    </motion.div>
  )
}
