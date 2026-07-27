import api from './axios'

export const userService = {
  // ==================== GET METHODS ====================

  // Get all active users
  getAll: async () => {
    const response = await api.get('/api/admin/users')
    return response.data
  },

  // Get deleted users only
  getDeleted: async () => {
    const response = await api.get('/api/admin/users/deleted')
    return response.data
  },

  // Get all users (including deleted)
  getAllIncludingDeleted: async () => {
    const response = await api.get('/api/admin/users/all')
    return response.data
  },

  // Get user by ID
  getById: async (id) => {
    const response = await api.get(`/api/admin/users/${id}`)
    return response.data
  },

  // ==================== CREATE/UPDATE METHODS ====================

  // Create new user
  create: async (userData) => {
    const data = {
      fullName: userData.fullName,
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'USER',
      address: userData.address || '',
      password: userData.password || 'default123'
    }
    const response = await api.post('/api/admin/users', data)
    return response.data
  },

  // Update user
  update: async (id, userData) => {
    const response = await api.put(`/api/admin/users/${id}`, userData)
    return response.data
  },

  // ==================== DELETE/RESTORE METHODS ====================

  // Soft delete (change status to deleted)
  delete: async (id) => {
    const response = await api.delete(`/api/admin/users/${id}`)
    return response.data
  },

  // Restore user (re-activate)
  restore: async (id) => {
    const response = await api.patch(`/api/admin/users/${id}/restore`)
    return response.data
  },

  // Hard delete (permanently remove from database)
  hardDelete: async (id) => {
    const response = await api.delete(`/api/admin/users/${id}/permanent`)
    return response.data
  },

  // ==================== STATUS/ROLE METHODS ====================

  // Change user status (active/inactive)
  changeStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/users/${id}/status`, { status })
    return response.data
  },

  // Change user role (ADMIN/USER)
  changeRole: async (id, role) => {
    const response = await api.patch(`/api/admin/users/${id}/role`, { role })
    return response.data
  },

  // ==================== PASSWORD METHODS ====================

  // Reset user password
  resetPassword: async (id, newPassword) => {
    const response = await api.post(`/api/admin/users/${id}/reset-password`, { password: newPassword })
    return response.data
  },

  // ==================== ACTIVITY METHODS ====================

  // Get user activity log
  getActivity: async (id) => {
    const response = await api.get(`/api/admin/users/${id}/activity`)
    return response.data
  }
}