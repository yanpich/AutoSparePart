import api, { logout, isAuthenticated, getCurrentUser } from './axios'

export const authService = {
  login: async (email, password) => {
    try {
      console.log('[Auth] Calling login endpoint: /api/auth/login')
      const response = await api.post('/api/auth/login', { email, password })
      console.log('[Auth] Login response:', response.data)

      const token = response.data.accessToken || response.data.token
      const refreshToken = response.data.refreshToken
      const user = response.data.user || response.data

      if (token) {
        localStorage.setItem('token', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        const userData = {
          id: user.id || user.userId,
          name: user.name || user.fullName,
          fullName: user.fullName || user.name,
          email: user.email || email,
          role: user.role || user.roleName || 'USER',
          roleName: user.roleName || user.role || 'USER'
        }
        localStorage.setItem('user', JSON.stringify(userData))

        console.log('[Auth] Login successful - Role:', userData.role)
        return response.data
      } else {
        throw new Error('No token received from server')
      }
    } catch (error) {
      console.error('[Auth] Login error:', error.response?.data || error.message)
      throw error
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('[Auth] Register error:', error)
      throw error
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/api/auth/refresh', { refreshToken })
      return response.data
    } catch (error) {
      console.error('[Auth] Refresh token error:', error)
      throw error
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post(`/forgotPassword/verifyMail/${email}`)
      return response.data
    } catch (error) {
      console.error('[Auth] Forgot password error:', error)
      throw error
    }
  },

  verifyOtp: async (otp, email) => {
    try {
      const response = await api.post(`/forgotPassword/verifyOtp/${otp}/${email}`)
      return response.data
    } catch (error) {
      console.error('[Auth] Verify OTP error:', error)
      throw error
    }
  },

  resetPassword: async (email, password, confirmPassword) => {
    try {
      const response = await api.post(`/forgotPassword/changePassword/${email}`, {
        password,
        repeatPassword: confirmPassword
      })
      return response.data
    } catch (error) {
      console.error('[Auth] Reset password error:', error)
      throw error
    }
  },

  logout: () => {
    console.log('[Auth] Logging out')
    logout()
  },

  isAuthenticated: () => isAuthenticated(),
  getCurrentUser: () => getCurrentUser(),
  getToken: () => localStorage.getItem('token')
}

export default authService