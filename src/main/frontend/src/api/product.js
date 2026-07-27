import api from './axios'

export const productService = {
  getAll: async () => {
    const response = await api.get('/api/admin/products')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/admin/products/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/admin/products', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.patch(`/api/admin/products/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/api/admin/products/${id}`)
  },

  getImages: async (productId) => {
    const response = await api.get(`/api/admin/products/${productId}/images`)
    return response.data
  },

  uploadImages: async (productId, files, isPrimary = false) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('isPrimary', isPrimary)
    const response = await api.post(`/api/admin/products/${productId}/images/upload-multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  deleteImage: async (productId, imageId) => {
    await api.delete(`/api/admin/products/${productId}/images/${imageId}`)
  },

  setPrimaryImage: async (productId, imageId) => {
    const response = await api.patch(`/api/admin/products/${productId}/images/${imageId}/set-primary`)
    return response.data
  }
}