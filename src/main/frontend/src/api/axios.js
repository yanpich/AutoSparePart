import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: false
})

// Track if token is being refreshed
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    // Don't add token for login and register endpoints
    const isAuthEndpoint = config.url.includes('/auth/login') ||
                          config.url.includes('/auth/register') ||
                          config.url.includes('/auth/refresh')

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[API Request] Token added to headers')
    } else if (isAuthEndpoint) {
      console.log('[API Request] Auth endpoint - skipping token')
    } else {
      console.log('[API Request] No token available')
    }

    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') ||
          originalRequest.url.includes('/auth/register')) {
        console.log('[API Response] Auth failed - invalid credentials')
        return Promise.reject(error)
      }

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        console.log('[API Response] No refresh token available - redirecting to login')
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log('[Token Refresh] Attempting to refresh token')
        const response = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken: refreshToken
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        if (accessToken) {
          console.log('[Token Refresh] Success - new token obtained')
          localStorage.setItem('token', accessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          processQueue(null, accessToken)
          return api(originalRequest)
        } else {
          throw new Error('No access token in refresh response')
        }
      } catch (refreshError) {
        console.error('[Token Refresh] Failed:', refreshError)
        processQueue(refreshError, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    return Promise.reject(error)
  }
)

export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return !!token && token !== 'undefined' && token !== 'null'
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch (e) {
    console.error('Failed to parse user:', e)
    return null
  }
}

export const logout = () => {
  localStorage.clear()
  window.location.href = '/login'
}

export default api