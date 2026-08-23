/**
 * Resolve a root-relative asset path against the deploy base.
 *
 * Vite rewrites asset URLs it can see in HTML and imports, but not strings
 * that live in data files. Everything that ends up in an `href`, `src` or
 * `fetch()` goes through here so the app also works when it is served from a
 * subpath (`/circuitos/`) instead of the domain root.
 */
export function withBase(path: string): string {
  if (/^(https?:|data:|mailto:|tel:|#)/.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\/+/, "")
}
