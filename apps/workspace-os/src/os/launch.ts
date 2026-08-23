import { appById } from '@/apps/registry'
import type { AppId, LaunchProps } from '@/os/types'
import { useWindows } from '@/store/windows'
import { dirname, type FsNode } from '@/store/fs'

/** Open an application window using its registered defaults. */
export function launchApp(appId: AppId, props?: LaunchProps, titleOverride?: string) {
  const meta = appById(appId)
  if (!meta) return null
  return useWindows.getState().open(appId, {
    title: titleOverride ?? meta.title ?? meta.name,
    props: { ...meta.defaultProps, ...props },
    size: meta.defaultSize,
    singleInstance: meta.singleInstance,
  })
}

/**
 * Double-click behaviour for a filesystem node — the single place that decides
 * which application handles which kind of file.
 */
export function openNode(node: FsNode, path: string) {
  switch (node.kind) {
    case 'dir':
      return launchApp('files', { path })

    case 'app':
      return launchApp(node.appId!, node.args ?? {})

    case 'link':
      return launchApp('browser', { url: node.url })

    case 'file': {
      if (node.mime === 'application/pdf') return launchApp('resume', { path })
      if (node.mime === 'application/x-project')
        return launchApp('projects', { projectId: node.args?.projectId })
      if (node.mime?.startsWith('image/'))
        return launchApp('editor', { path, readOnly: true, preview: 'image' })
      return launchApp('editor', { path }, node.name)
    }
  }
}

/** Reveal a path in the Files app. */
export function revealInFiles(path: string) {
  return launchApp('files', { path: dirname(path), select: path })
}
