"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SiteMenubar } from "@/components/site-menubar"
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react"
import { BookOpen, ExternalLink, FileText, Github, Terminal } from "lucide-react"
import { DesktopWindow, WINDOW_SPRING, type WindowPosition, type WindowState } from "@/components/desktop-window"

const BASE_WINDOW_IDS = ["profile", "repos", "blog"] as const
const WINDOW_IDS = [...BASE_WINDOW_IDS, "detail"] as const
type WindowId = (typeof WINDOW_IDS)[number]
const WIDTHS = { profile: 420, repos: 400, blog: 440, detail: 820 }
type DesktopProps = { profile: ReactNode; repos: ReactNode; blog: ReactNode; children: ReactNode }
function routeWindow(pathname: string): WindowId {
  if (pathname === '/') return 'profile'
  if (pathname === '/blog') return 'blog'
  return 'detail'
}
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
function ReaderContent({ children }: { children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const scrollArea = content.current?.closest<HTMLElement>('.window-content')
    scrollArea?.scrollTo({ top: 0 })
    scrollArea?.focus({ preventScroll: true })
  }, [])
  return <div ref={content} className="reader-content">{children}</div>
}
export function Desktop(props: DesktopProps) {
  return <MotionConfig reducedMotion="user"><DesktopWorkspace {...props} /></MotionConfig>
}
function DesktopWorkspace({ profile, repos, blog, children }: DesktopProps) {
  const pathname = usePathname()
  const router = useRouter()
  const initialWindow = routeWindow(pathname)
  const workspace = useRef<HTMLDivElement>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const windowElements = useRef<Partial<Record<WindowId, HTMLElement | null>>>({})
  const dockElements = useRef<Partial<Record<WindowId, HTMLButtonElement | null>>>({})
  const geometry = useRef({ width: 0, height: 0, heights: { profile: 0, repos: 360, blog: 440, detail: 560 } })
  const reduced = useReducedMotion()
  const [state, setState] = useState<DesktopState>({
    initialized: false, desktop: false, bounds: { width: 0, height: 0 },
    windows: {
      profile: { visibility: "visible", mode: "normal", position: null, height: 0, revision: 0, action: "move" },
      repos: { visibility: "closed", mode: "normal", position: null, height: 360, revision: 0, action: "move" },
      blog: { visibility: initialWindow === 'blog' ? "visible" : "closed", mode: "normal", position: null, height: 440, revision: 0, action: "move" },
      detail: { visibility: initialWindow === 'detail' ? "visible" : "closed", mode: "maximized", position: null, height: 560, revision: 0, action: "move" },
    },
    order: bringForward(["blog", "repos", "profile", "detail"], initialWindow),
  })
  const defaultPosition = useCallback((id: WindowId): WindowPosition => {
    const { width, height, heights } = geometry.current
    if (id === "detail") return { x: Math.max(EDGE, (width - WIDTHS.detail) / 2), y: EDGE }
    if (id === "blog") {
      return { x: Math.max(EDGE, (width - WIDTHS.blog) / 2), y: Math.max(EDGE, (height - heights.blog) / 2) }
    }
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
  const blogRef = useCallback((element: HTMLElement | null) => registerWindow("blog", element), [registerWindow])
  const detailRef = useCallback((element: HTMLElement | null) => registerWindow("detail", element), [registerWindow])
  const profileDock = useCallback(() => dockElements.current.profile ?? null, [])
  const reposDock = useCallback(() => dockElements.current.repos ?? null, [])
  const blogDock = useCallback(() => dockElements.current.blog ?? null, [])
  const detailDock = useCallback(() => dockElements.current.detail ?? null, [])
  const windowRefs = { profile: profileRef, repos: reposRef, blog: blogRef, detail: detailRef }
  const dockTargets = { profile: profileDock, repos: reposDock, blog: blogDock, detail: detailDock }
  useEffect(() => {
    const id = routeWindow(pathname)
    let focusFrame = 0
    const frame = requestAnimationFrame(() => {
      setState((previous) => ({
        ...previous,
        order: bringForward(previous.order, id),
        windows: {
          ...previous.windows,
          detail: { ...previous.windows.detail, visibility: id === 'detail' ? 'visible' : 'closed', mode: 'maximized', revision: previous.windows.detail.revision + 1, action: 'visibility' },
          ...(id !== 'detail' ? { [id]: { ...previous.windows[id], visibility: 'visible', revision: previous.windows[id].revision + 1, action: 'visibility' } } : {}),
        },
      }))
      focusFrame = requestAnimationFrame(() => {
        const element = windowElements.current[id]
        const target = id === 'detail' ? element?.querySelector<HTMLElement>('.window-content') : element
        target?.focus({ preventScroll: true })
      })
    })
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(focusFrame) }
  }, [pathname])
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
    if (id === 'detail' && visibility === 'closed') {
      router.push(pathname.startsWith('/blog/') ? '/blog' : '/', { scroll: false })
      return
    }
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
      const target = id === 'detail' ? element.querySelector<HTMLElement>('.window-content') : element
      target?.focus({ preventScroll: true })
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
  const dockIds = state.windows.detail.visibility !== 'closed' ? WINDOW_IDS : BASE_WINDOW_IDS
  const definitions = {
    profile: { label: "Profile", title: "niko@niko.my.id", icon: <Terminal aria-hidden="true" />, content: profile },
    repos: { label: "Repos", title: "repos", icon: <Github aria-hidden="true" />, content: repos },
    blog: { label: "Blog", title: "blog", icon: <FileText aria-hidden="true" />, content: blog },
    detail: { label: "Reader", title: `~${pathname}`, icon: <BookOpen aria-hidden="true" />, content: children },
  }
  return (
    <main className="desktop" data-initialized={state.initialized} onKeyDown={(event) => {
      if (event.key === 'Escape' && !event.defaultPrevented && activeId === 'detail') {
        event.preventDefault()
        hideWindow('detail', 'closed')
      }
    }} onClickCapture={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element).closest('a')
      if (routeWindow(pathname) === 'detail' && anchor?.getAttribute('href') === pathname) {
        setState((previous) => ({ ...previous, order: bringForward(previous.order, 'detail'), windows: { ...previous.windows, detail: { ...previous.windows.detail, visibility: 'visible', revision: previous.windows.detail.revision + 1, action: 'visibility' } } }))
      }
    }}>
      <SiteMenubar />
      <p id="window-move-help" className="sr-only">Drag the title bar or use arrow keys to move this window. Hold Shift for larger steps.</p>
      <LayoutGroup id="portfolio-desktop">
        <div ref={workspace} className="desktop-workspace">
          {WINDOW_IDS.map((id) => (
            <DesktopWindow key={id} id={id} label={definitions[id].label} title={definitions[id].title}
              icon={definitions[id].icon} width={WIDTHS[id]} state={state.windows[id]}
              desktop={state.desktop} bounds={state.bounds} active={activeId === id} layer={10 + state.order.indexOf(id)}
              blocked={id !== 'detail' && activeId === 'detail' && state.windows.detail.visibility === 'visible'}
              windowRef={windowRefs[id]} getDockTarget={dockTargets[id]}
              onFocus={() => focusWindow(id)} onMove={(position) => moveWindow(id, position)}
              onMinimize={() => hideWindow(id, "minimized")} onClose={() => hideWindow(id, "closed")}
              onToggleMaximize={() => toggleMaximize(id)}
              headerActions={id === "repos" ? (
                <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer" aria-label="View all on GitHub" title="View all on GitHub"><ExternalLink aria-hidden="true" /></a>
              ) : undefined}
            >{id === 'detail' ? <ReaderContent key={pathname}>{definitions[id].content}</ReaderContent> : definitions[id].content}</DesktopWindow>
          ))}
        </div>
      </LayoutGroup>
      <nav className="window-dock" aria-label="Window dock" data-reader={state.windows.detail.visibility !== 'closed'}>
        {dockIds.map((id) => {
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
