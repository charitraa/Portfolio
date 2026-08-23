import { useNotifications } from '@/store/notifications'
import { DOCK_H } from '@/store/windows'
import { useSystem } from '@/store/system'

export default function NotificationLayer() {
  const items = useNotifications((s) => s.items)
  const dismiss = useNotifications((s) => s.dismiss)
  const animations = useSystem((s) => s.settings.animations)

  return (
    <div
      className="pointer-events-none absolute right-3 z-[1500] flex w-[326px] flex-col-reverse gap-2"
      style={{ bottom: DOCK_H + 10 }}
    >
      {items.map((n) => (
        <div
          key={n.id}
          role="status"
          className="glass pointer-events-auto flex items-start gap-3 rounded-xl p-3"
          style={{
            boxShadow: '0 16px 44px -14px rgba(0,0,0,.7), inset 0 0 0 1px var(--chrome-border)',
            animation: animations ? 'notif-in 220ms cubic-bezier(.2,.9,.3,1.2)' : undefined,
          }}
        >
          <span className="mt-0.5 text-[17px]">{n.glyph ?? '💬'}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold">{n.title}</div>
            {n.body && (
              <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: 'var(--text-dim)' }}>
                {n.body}
              </p>
            )}
            {n.action && (
              <button
                type="button"
                onClick={() => {
                  n.action?.run()
                  dismiss(n.id)
                }}
                className="mt-2 rounded-md px-2.5 py-1 text-[11px] font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {n.action.label}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(n.id)}
            className="grid h-5 w-5 shrink-0 place-items-center rounded text-[11px] hover:bg-white/12"
            style={{ color: 'var(--text-dim)' }}
          >
            ✕
          </button>
        </div>
      ))}

      <style>{`@keyframes notif-in { from { opacity: 0; transform: translateX(24px) scale(.96) } to { opacity: 1; transform: none } }`}</style>
    </div>
  )
}
