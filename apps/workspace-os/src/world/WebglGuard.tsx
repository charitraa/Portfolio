import { Component, type ReactNode } from 'react'
import { owner } from '@/data/portfolio'
import { useSystem } from '@/store/system'

/**
 * Can this browser give us a WebGL context at all?
 *
 * Checked once, before the room's chunk is even requested — a device that
 * cannot render the room should not pay to download Three.js first. The probe
 * context is released immediately; browsers cap how many can exist at once.
 */
export function hasWebgl(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return false
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/**
 * Catches anything the 3D scene throws — a lost context, a driver that claims
 * WebGL and then fails, an out-of-memory on a weak GPU — and offers the 2D
 * session instead of a blank page. The portfolio is entirely usable without
 * the room; the room is the nice way in, not the only one.
 */
export class WebglGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // Worth seeing in the console; not worth a reporting dependency.
    console.error('3D workspace failed to start:', error)
  }

  render() {
    if (this.state.failed) return <WorkspaceUnavailable />
    return this.props.children
  }
}

export function WorkspaceUnavailable({ reason }: { reason?: string }) {
  const update = useSystem((s) => s.update)
  const skipIntro = useSystem((s) => s.skipIntro)

  return (
    <div className="absolute inset-0 grid place-items-center px-6 text-center" style={{ background: '#05070a' }}>
      <div className="max-w-md">
        <div className="text-[11px] font-semibold tracking-[0.28em] uppercase" style={{ color: '#4c5a6e' }}>
          3D workspace unavailable
        </div>
        <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: '#9fb0c6' }}>
          {reason ??
            'This browser or device cannot run the 3D room. Everything in the workspace — projects, the security lab, the terminal, the filesystem — works without it.'}
        </p>
        <button
          type="button"
          onClick={() => {
            skipIntro()
            update('display', 'fullscreen')
          }}
          className="mt-6 rounded-xl px-5 py-2.5 text-[13px] font-medium transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Enter {owner.workspaceName} →
        </button>
      </div>
    </div>
  )
}
