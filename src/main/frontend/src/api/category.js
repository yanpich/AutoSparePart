import api from './axios'

export const categoryService = {
  // ==================== GET METHODS ====================

  /**
   * Get all active categories (not deleted)
   * @returns {Promise<Object>} Response with content array and total
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/admin/categories')
      return response.data
    } catch (error) {
      console.error('Get all categories error:', error)
      throw error
    }
  },

  /**
   * Get deleted categories only
   * @returns {Promise<Object>} Response with content array and total
   */
  getDeleted: async () => {
    try {
      const response = await api.get('/api/admin/categories/deleted')
      return response.data
    } catch (error) {
      console.error('Get deleted categories error:', error)
      throw error
    }
  },

  /**
   * Get all categories including deleted (admin only)
   * @returns {Promise<Object>} Response with content array and total
   */
  getAllIncludingDeleted: async () => {
    try {
      const response = await api.get('/api/admin/categories/all')
      return response.data
    } catch (error) {
      console.error('Get all categories including deleted error:', error)
      throw error
    }
  },

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Category object
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/admin/categories/${id}`)
      return response.data
    } catch (error) {
      console.error(`Get category by ID ${id} error:`, error)
      throw error
    }
  },

  // ==================== CREATE/UPDATE METHODS ====================

  /**
   * Create a new category
   * @param {Object} data - Category data { name, slug, description, iconClass }
   * @returns {Promise<Object>} Created category
   */
  create: async (data) => {
    try {
      const categoryData = {
        name: data.name,
        slug: data.slug || '',
        description: data.description || '',
        iconClass: data.iconClass || 'bi-tag'
      }
      const response = await api.post('/api/admin/categories', categoryData)
      return response.data
    } catch (error) {
      console.error('Create category error:', error)
      throw error
    }
  },

  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} data - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  update: async (id, data) => {
    try {
      const categoryData = {
        name: data.name,
        slug: data.slug || '',
        description: data.description || '',
        iconClass: data.iconClass || 'bi-tag'
      }
      const response = await api.put(`/api/admin/categories/${id}`, categoryData)
      return response.data
    } catch (error) {
      console.error(`Update category ${id} error:`, error)
      throw error
    }
  },

  // ==================== DELETE/RESTORE METHODS ====================

  /**
   * Soft delete a category (mark as deleted)
   * @param {number} id - Category ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/admin/categories/${id}`)
      return response.data
    } catch (error) {
      console.error(`Soft delete category ${id} error:`, error)
      throw error
    }
  },

  /**
   * Restore a soft-deleted category
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Restored category data
   */
  restore: async (id) => {
    try {
      const response = await api.patch(`/api/admin/categories/${id}/restore`)
      return response.data
    } catch (error) {
      console.error(`Restore category ${id} error:`, error)
      throw error
    }
  },

  /**
   * Permanently delete a category (hard delete)
   * @param {number} id - Category ID
   * @returns {Promise<void>}
   */
  hardDelete: async (id) => {
    try {
      const response = await api.delete(`/api/admin/categories/${id}/permanent`)
      return response.data
    } catch (error) {
      console.error(`Hard delete category ${id} error:`, error)
      throw error
    }
  },

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk delete multiple categories (soft delete)
   * @param {Array<number>} ids - Array of category IDs
   * @returns {Promise<Object>} Result with deleted count
   */
  bulkDelete: async (ids) => {
    try {
      const response = await api.post('/api/admin/categories/bulk-delete', { ids })
      return response.data
    } catch (error) {
      console.error('Bulk delete categories error:', error)
      throw error
    }
  },

  /**
   * Bulk restore multiple categories
   * @param {Array<number>} ids - Array of category IDs
   * @returns {Promise<Object>} Result with restored count
   */
  bulkRestore: async (ids) => {
    try {
      const response = await api.post('/api/admin/categories/bulk-restore', { ids })
      return response.data
    } catch (error) {
      console.error('Bulk restore categories error:', error)
      throw error
    }
  },

  // ==================== UTILITY METHODS ====================

  /**
   * Generate slug from category name
   * @param {string} name - Category name
   * @returns {string} Generated slug
   */
  generateSlug: (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  },

  /**
   * Check if slug is available
   * @param {string} slug - Slug to check
   * @returns {Promise<boolean>} True if available
   */
  isSlugAvailable: async (slug) => {
    try {
      const response = await api.get(`/api/admin/categories/check-slug/${slug}`)
      return response.data.available
    } catch (error) {
      console.error('Check slug availability error:', error)
      return false
    }
  },

  /**
   * Get category statistics
   * @returns {Promise<Object>} Statistics object
   */
  getStats: async () => {
    try {
      const response = await api.get('/api/admin/categories/stats')
      return response.data
    } catch (error) {
      console.error('Get category stats error:', error)
      throw error
    }
  },

  /**
   * Search categories by name
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array>} Matching categories
   */
  search: async (keyword) => {
    try {
      const response = await api.get(`/api/admin/categories/search?q=${encodeURIComponent(keyword)}`)
      return response.data
    } catch (error) {
      console.error('Search categories error:', error)
      throw error
    }
  },

  /**
   * Get categories by product count
   * @param {number} minProducts - Minimum number of products
   * @returns {Promise<Array>} Categories with product count
   */
  getByProductCount: async (minProducts = 0) => {
    try {
      const response = await api.get(`/api/admin/categories/by-product-count?min=${minProducts}`)
      return response.data
    } catch (error) {
      console.error('Get categories by product count error:', error)
      throw error
    }
  }
}

export default categoryService