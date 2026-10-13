"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react"
import { ExternalLink, Github, Terminal } from "lucide-react"
import { DesktopWindow, WINDOW_SPRING, type WindowPosition, type WindowState } from "@/components/desktop-window"

const WINDOW_IDS = ["profile", "repos"] as const
type WindowId = (typeof WINDOW_IDS)[number]
const WIDTHS = { profile: 420, repos: 400 }
const EDGE = 12
const GAP = 24
const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim().replace(/^@/, "") || "nikomilala"
interface DesktopState {
  initialized: boolean
  desktop: boolean
  bounds: { width: number; height: number }
  windows: Record<WindowId, WindowState>
  order: WindowId[]
}
function bringForward(order: WindowId[], id: WindowId) {
  return order.at(-1) === id ? order : [...order.filter((item) => item !== id), id]
}
export function Desktop({ profile, repos }: { profile: ReactNode; repos: ReactNode }) {
  return <MotionConfig reducedMotion="user"><DesktopWorkspace profile={profile} repos={repos} /></MotionConfig>
}
function DesktopWorkspace({ profile, repos }: { profile: ReactNode; repos: ReactNode }) {
  const workspace = useRef<HTMLDivElement>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const windowElements = useRef<Partial<Record<WindowId, HTMLElement | null>>>({})
  const dockElements = useRef<Partial<Record<WindowId, HTMLButtonElement | null>>>({})
  const geometry = useRef({ width: 0, height: 0, heights: { profile: 0, repos: 360 } })
  const reduced = useReducedMotion()
  const [state, setState] = useState<DesktopState>({
    initialized: false, desktop: false, bounds: { width: 0, height: 0 },
    windows: {
      profile: { visibility: "visible", mode: "normal", position: null, height: 0, revision: 0, action: "move" },
      repos: { visibility: "closed", mode: "normal", position: null, height: 360, revision: 0, action: "move" },
    },
    order: ["repos", "profile"],
  })
  const defaultPosition = useCallback((id: WindowId): WindowPosition => {
    const { width, height, heights } = geometry.current
    return {
      x: Math.max(EDGE, (width - WIDTHS.profile - WIDTHS.repos - GAP) / 2) + (id === "repos" ? WIDTHS.profile + GAP : 0),
      y: Math.max(EDGE, (height - Math.max(heights.profile, heights.repos)) / 2),
    }
  }, [])
  const clampPosition = useCallback((id: WindowId, position: WindowPosition): WindowPosition => {
    const { width, height, heights } = geometry.current
    return {
      x: Math.min(Math.max(EDGE, position.x), Math.max(EDGE, width - WIDTHS[id] - EDGE)),
      y: Math.min(Math.max(EDGE, position.y), Math.max(EDGE, height - heights[id] - EDGE)),
    }
  }, [])
  useEffect(() => {
    const area = workspace.current
    if (!area) return
    const observer = new ResizeObserver(() => {
      const width = area.clientWidth, height = area.clientHeight
      const desktop = window.matchMedia("(min-width: 1024px)").matches
      geometry.current.width = width
      geometry.current.height = height
      for (const id of WINDOW_IDS) {
        const element = windowElements.current[id]
        // Use layout dimensions, excluding Motion's transform and scale.
        if (element?.dataset.visibility === "visible" && element.dataset.mode === "normal" && element.offsetHeight) {
          geometry.current.heights[id] = element.offsetHeight
        }
      }
      setState((previous) => {
        let changed = !previous.initialized || previous.desktop !== desktop || previous.bounds.width !== width || previous.bounds.height !== height
        const windows = { ...previous.windows }
        // Choose startup defaults once; resizing must preserve the user's windows.
        if (!previous.initialized && desktop) {
          windows.repos = { ...windows.repos, visibility: "visible" }
        }
        for (const id of WINDOW_IDS) {
          const current = windows[id]
          const position = desktop ? clampPosition(id, current.position ?? defaultPosition(id)) : current.position
          const windowHeight = geometry.current.heights[id]
          if (current.position?.x !== position?.x || current.position?.y !== position?.y || current.height !== windowHeight) {
            windows[id] = { ...current, position, height: windowHeight, action: "move" }
            changed = true
          }
        }
        return changed ? { ...previous, initialized: true, desktop, bounds: { width, height }, windows } : previous
      })
    })
    observerRef.current = observer
    observer.observe(area)
    for (const id of WINDOW_IDS) {
      const element = windowElements.current[id]
      if (element) observer.observe(element)
    }
    return () => { observer.disconnect(); observerRef.current = null }
  }, [clampPosition, defaultPosition])
  const registerWindow = useCallback((id: WindowId, element: HTMLElement | null) => {
    const previous = windowElements.current[id]
    if (previous) observerRef.current?.unobserve(previous)
    windowElements.current[id] = element
    if (element) observerRef.current?.observe(element)
  }, [])
  const profileRef = useCallback((element: HTMLElement | null) => registerWindow("profile", element), [registerWindow])
  const reposRef = useCallback((element: HTMLElement | null) => registerWindow("repos", element), [registerWindow])
  const profileDock = useCallback(() => dockElements.current.profile ?? null, [])
  const reposDock = useCallback(() => dockElements.current.repos ?? null, [])
  function focusWindow(id: WindowId) {
    setState((previous) => {
      const order = bringForward(previous.order, id)
      return order === previous.order ? previous : { ...previous, order }
    })
  }
  function moveWindow(id: WindowId, position: WindowPosition) {
    setState((previous) => {
      const current = previous.windows[id]
      if (!previous.desktop || current.mode !== "normal" || current.visibility !== "visible") return previous
      const next = clampPosition(id, position)
      if (current.position?.x === next.x && current.position?.y === next.y) return previous
      return { ...previous, windows: { ...previous.windows, [id]: { ...current, position: next, action: "move" } } }
    })
  }
  function hideWindow(id: WindowId, visibility: "minimized" | "closed") {
    setState((previous) => ({
      ...previous,
      windows: { ...previous.windows, [id]: { ...previous.windows[id], visibility, revision: previous.windows[id].revision + 1, action: "visibility" } },
    }))
    dockElements.current[id]?.focus({ preventScroll: true })
  }
  function openWindow(id: WindowId) {
    setState((previous) => {
      const current = previous.windows[id]
      const active = previous.order.filter((item) => previous.windows[item].visibility === "visible").at(-1)
      if (current.visibility === "visible" && active === id) {
        return {
          ...previous,
          windows: {
            ...previous.windows,
            [id]: { ...current, visibility: "minimized", revision: current.revision + 1, action: "visibility" },
          },
        }
      }
      return {
        ...previous, order: bringForward(previous.order, id),
        windows: {
          ...previous.windows,
          [id]: {
            ...current, visibility: "visible", revision: current.revision + 1, action: "visibility",
            ...(current.visibility === "closed" ? { mode: "normal", position: previous.desktop ? clampPosition(id, defaultPosition(id)) : null } : {}),
          },
        },
      }
    })
    requestAnimationFrame(() => {
      const element = windowElements.current[id]
      if (element?.dataset.visibility !== "visible" || element.dataset.active !== "true") return
      element.focus({ preventScroll: true })
    })
  }
  function toggleMaximize(id: WindowId) {
    setState((previous) => ({
      ...previous, order: bringForward(previous.order, id),
      windows: {
        ...previous.windows,
        [id]: { ...previous.windows[id], mode: previous.windows[id].mode === "normal" ? "maximized" : "normal", action: "layout" },
      },
    }))
  }
  const activeId = state.order.filter((id) => state.windows[id].visibility === "visible").at(-1)
  const definitions = {
    profile: { label: "Profile", title: "niko@niko.my.id", icon: <Terminal aria-hidden="true" />, content: profile },
    repos: { label: "Repos", title: "repos", icon: <Github aria-hidden="true" />, content: repos },
  }
  return (
    <main className="desktop" data-initialized={state.initialized}>
      <header className="desktop-menubar">
        <Link href="/" className="desktop-brand"><Terminal aria-hidden="true" /><span>niko<span className="text-primary">.my.id</span></span></Link>
        <span className="desktop-role">DevOps Engineer <span aria-hidden="true">/</span> Sysadmin</span>
      </header>
      <p id="window-move-help" className="sr-only">Drag the title bar or use arrow keys to move this window. Hold Shift for larger steps.</p>
      <LayoutGroup id="portfolio-desktop">
        <div ref={workspace} className="desktop-workspace">
          {WINDOW_IDS.map((id) => (
            <DesktopWindow key={id} id={id} label={definitions[id].label} title={definitions[id].title}
              icon={definitions[id].icon} width={WIDTHS[id]} state={state.windows[id]}
              desktop={state.desktop} bounds={state.bounds} active={activeId === id} layer={10 + state.order.indexOf(id)}
              windowRef={id === "profile" ? profileRef : reposRef} getDockTarget={id === "profile" ? profileDock : reposDock}
              onFocus={() => focusWindow(id)} onMove={(position) => moveWindow(id, position)}
              onMinimize={() => hideWindow(id, "minimized")} onClose={() => hideWindow(id, "closed")}
              onToggleMaximize={() => toggleMaximize(id)}
              headerActions={id === "repos" ? (
                <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer" aria-label="View all on GitHub" title="View all on GitHub"><ExternalLink aria-hidden="true" /></a>
              ) : undefined}
            >{definitions[id].content}</DesktopWindow>
          ))}
        </div>
      </LayoutGroup>
      <nav className="window-dock" aria-label="Window dock">
        {WINDOW_IDS.map((id) => {
          const current = state.windows[id], active = activeId === id
          const action = current.visibility === "closed" ? "Open" : current.visibility === "minimized" ? "Restore" : active ? "Minimize" : "Focus"
          return (
            <motion.button key={id} ref={(element) => { dockElements.current[id] = element }} type="button" tabIndex={0} className="dock-button"
              data-active={active} data-state={current.visibility} aria-label={`${action} ${definitions[id].label}`}
              aria-controls={current.visibility === "closed" ? undefined : `window-${id}`} aria-current={active ? "true" : undefined} title={`${action} ${definitions[id].label}`}
              onClick={() => openWindow(id)} whileHover={reduced ? undefined : { y: -4, scale: 1.04 }}
              whileTap={reduced ? undefined : { scale: 0.96 }} transition={WINDOW_SPRING}
            >
              <span className="dock-icon">{definitions[id].icon}</span><span>{definitions[id].label}</span>
              <span className="dock-indicator" aria-hidden="true" />
            </motion.button>
          )
        })}
      </nav>
    </main>
  )
}
