import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App'
import { projects } from './data/projects'

/**
 * Smoke coverage: every view must mount without throwing. These are lazily
 * loaded, so each assertion waits for its chunk to resolve.
 */

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

let errorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  window.localStorage.clear()
})

afterEach(() => {
  // globals:false means auto-cleanup is not registered, so unmount by hand.
  cleanup()
  expect(errorSpy.mock.calls, 'console.error was called during render').toEqual([])
  errorSpy.mockRestore()
})

test('shell renders with toolbar, navigation and status bar', async () => {
  renderAt('/dashboard')

  expect(screen.getByText('ReconOS')).toBeTruthy()
  expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy()
  expect(screen.getByRole('button', { name: /toggle console/i })).toBeTruthy()

  await waitFor(() => expect(screen.getByText('GET /dashboard')).toBeTruthy())
})

test.each([
  ['/dashboard', 'GET /dashboard'],
  ['/target', 'POST /api/v1/scan'],
  ['/projects', 'GET /api/v1/projects'],
  [`/projects/${projects[0].id}`, `GET /api/v1/projects/${projects[0].id}`],
  ['/skills', 'GET /api/v1/skills'],
  ['/services', 'GET /api/v1/services'],
  ['/stack', 'GET /api/v1/stack'],
  ['/experience', 'GET /api/v1/experience'],
  ['/achievements', 'GET /api/v1/achievements'],
  ['/certifications', 'GET /api/v1/certifications'],
  ['/resume', 'GET /files/resume.pdf'],
  ['/contact', 'POST /api/v1/contact'],
  ['/settings', 'GET /api/v1/settings'],
])('%s mounts', async (path, marker) => {
  renderAt(path)
  await waitFor(() => expect(screen.getByText(marker)).toBeTruthy())
})

test('unknown routes render the 404 view', async () => {
  renderAt('/does-not-exist')
  await waitFor(() => expect(screen.getByText('HTTP/1.1 404 Not Found')).toBeTruthy())
})
