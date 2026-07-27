import api from './axios'

export const fileService = {
  uploadBrandImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/files/upload/brand-admin-panel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  uploadProductImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/files/upload/product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  deleteFile: async (type, fileName) => {
    await api.delete(`/api/files/delete/${type}/${fileName}`)
  },

  getFileUrl: (fileName, type = 'product') => {
    return `http://localhost:8080/api/files/download/${type === 'brand' ? 'brand-admin-panel' : 'product'}/${fileName}`
  },

  checkFile: async (fileName) => {
    const response = await api.get(`/api/files/check/${fileName}`)
    return response.data
  }
}