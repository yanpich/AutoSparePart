import api from './axios'

export const vehicleService = {
  // Get all active vehicles
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.vehicleId) params.append('vehicleId', filters.vehicleId)
    if (filters.model) params.append('model', filters.model)
    if (filters.yearFrom) params.append('yearFrom', filters.yearFrom)
    if (filters.yearTo) params.append('yearTo', filters.yearTo)
    const response = await api.get(`/api/admin/vehicles?${params.toString()}`)
    return response.data
  },

  // ✅ Get deleted vehicles only
  getDeleted: async () => {
    const response = await api.get('/api/admin/vehicles/deleted')
    return response.data
  },

  // ✅ Get vehicle by ID
  getById: async (id) => {
    const response = await api.get(`/api/admin/vehicles/${id}`)
    return response.data
  },

  // ✅ Create new vehicle
  create: async (data) => {
    const response = await api.post('/api/admin/vehicles', data)
    return response.data
  },

  // ✅ Update vehicle
  update: async (id, data) => {
    const response = await api.put(`/api/admin/vehicles/${id}`, data)
    return response.data
  },

  // ✅ Soft delete (mark as deleted)
  delete: async (id) => {
    const response = await api.delete(`/api/admin/vehicles/${id}`)
    return response.data
  },

  // ✅ Restore vehicle (re-activate)
  restore: async (id) => {
    const response = await api.patch(`/api/admin/vehicles/${id}/restore`)
    return response.data
  },

  // ✅ Hard delete (permanently remove)
  hardDelete: async (id) => {
    const response = await api.delete(`/api/admin/vehicles/${id}/permanent`)
    return response.data
  },

  // ✅ Get vehicle statistics
  getStats: async () => {
    const response = await api.get('/api/admin/vehicles/stats')
    return response.data
  },

  // ✅ Search vehicles
  search: async (keyword) => {
    const response = await api.get(`/api/admin/vehicles/search?q=${encodeURIComponent(keyword)}`)
    return response.data
  },

  // ✅ Get vehicles by year range
  getByYearRange: async (yearFrom, yearTo) => {
    const response = await api.get(`/api/admin/vehicles/year-range?from=${yearFrom}&to=${yearTo}`)
    return response.data
  }
}