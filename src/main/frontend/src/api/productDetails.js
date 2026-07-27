import api from './axios'

export const productDetailsService = {
  getAll: async () => {
    const response = await api.get('/api/admin/product-details')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/admin/product-details/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/admin/product-details', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/api/admin/product-details/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/api/admin/product-details/${id}`)
  }
}