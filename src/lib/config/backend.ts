const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '')

export const BACKEND_URL = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_URL || ''
)

export const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || `${BACKEND_URL}/graphql`

export const backendUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`
}
