import axios from 'axios'

const TOKEN_KEY = 'uemp_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let onUnauthorized = () => {}

// Lets the auth store react to expired/revoked tokens without a circular import
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) onUnauthorized()
    return Promise.reject(error)
  },
)

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) return 'Unable to reach the server. Check your connection.'
  const { data, status } = error.response
  if (status === 422 && data?.errors) {
    const first = Object.values(data.errors)[0]
    return Array.isArray(first) ? first[0] : data.message
  }
  if (status === 429) return 'Too many attempts. Please wait a minute and try again.'
  // Hide raw server exceptions from users
  if (status >= 500) return fallback
  return data?.message || fallback
}

export function validationErrors(error) {
  const errors = error?.response?.status === 422 ? error.response.data?.errors || {} : {}
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key, messages[0]]))
}

export default client
