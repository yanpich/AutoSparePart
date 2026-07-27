import api from './axios'

export const brandService = {
  // Get all active brands
  getAll: async () => {
    const response = await api.get('/api/admin/brands')
    return response.data
  },

  // Get all active brands with pagination
  getAllPaginated: async (page = 0, size = 10) => {
    const response = await api.get('/api/admin/brands/paginated', {
      params: { page, size }
    })
    return response.data
  },

  // Get brand by ID
  getById: async (id) => {
    const response = await api.get(`/api/admin/brands/${id}`)
    return response.data
  },

  // Get brand by name
  getByName: async (name) => {
    const response = await api.get(`/api/admin/brands/name/${encodeURIComponent(name)}`)
    return response.data
  },

  // Get deleted brands
  getDeleted: async () => {
    const response = await api.get('/api/admin/brands/deleted')
    return response.data
  },

  // Get brands by status
  getByStatus: async (status) => {
    const response = await api.get(`/api/admin/brands/status/${status}`)
    return response.data
  },

  // Search brands
  search: async (term) => {
    const response = await api.get('/api/admin/brands/search', {
      params: { term }
    })
    return response.data
  },

  // Get stats
  getStats: async () => {
    const response = await api.get('/api/admin/brands/stats')
    return response.data
  },

  // Create brand
  create: async (brandName, file) => {
    const formData = new FormData()
    formData.append('brandName', brandName)
    if (file) formData.append('file', file)
    const response = await api.post('/api/admin/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Update brand
  update: async (id, brandName, file) => {
    const formData = new FormData()
    if (brandName) formData.append('brandName', brandName)
    if (file) formData.append('file', file)
    const response = await api.put(`/api/admin/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Soft delete brand
  softDelete: async (id) => {
    const response = await api.delete(`/api/admin/brands/${id}`)
    return response.data
  },

  // Soft delete by name
  softDeleteByName: async (name) => {
    const response = await api.delete(`/api/admin/brands/name/${encodeURIComponent(name)}`)
    return response.data
  },

  // Restore brand
  restore: async (id) => {
    const response = await api.patch(`/api/admin/brands/${id}/restore`)
    return response.data
  },

  // Restore by name
  restoreByName: async (name) => {
    const response = await api.patch(`/api/admin/brands/name/${encodeURIComponent(name)}/restore`)
    return response.data
  },

  // Permanently delete brand
  permanentDelete: async (id) => {
    const response = await api.delete(`/api/admin/brands/${id}/permanent`)
    return response.data
  },

  // Permanently delete by name
  permanentDeleteByName: async (name) => {
    const response = await api.delete(`/api/admin/brands/name/${encodeURIComponent(name)}/permanent`)
    return response.data
  },

  // Bulk soft delete
  bulkSoftDelete: async (ids) => {
    const response = await api.delete('/api/admin/brands/bulk', { data: ids })
    return response.data
  },

  // Bulk restore
  bulkRestore: async (ids) => {
    const response = await api.patch('/api/admin/brands/bulk/restore', ids)
    return response.data
  },

  // Bulk permanent delete
  bulkPermanentDelete: async (ids) => {
    const response = await api.delete('/api/admin/brands/bulk/permanent', { data: ids })
    return response.data
  },

  // Cleanup old deleted brands
  cleanupOldDeleted: async (daysOld = 30) => {
    const response = await api.delete('/api/admin/brands/cleanup', {
      params: { daysOld }
    })
    return response.data
  }
}