const TOKEN_KEY = 'affordmed_access_token'

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
