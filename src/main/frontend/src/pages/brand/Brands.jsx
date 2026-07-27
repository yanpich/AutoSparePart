import React, { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'

const Brands = () => {
  // State Management
  const [brands, setBrands] = useState([])
  const [deletedBrands, setDeletedBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [brandToDelete, setBrandToDelete] = useState(null)
  const [formData, setFormData] = useState({ brandName: '', file: null })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [viewMode, setViewMode] = useState('active')
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, deleted: 0 })
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage] = useState(10)

  // Toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000)
  }, [])

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/admin/brands')
      setBrands(response.data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      showToast('Failed to fetch brands', 'danger')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const fetchDeletedBrands = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/brands/deleted')
      setDeletedBrands(response.data || [])
    } catch (error) {
      console.error('Failed to fetch deleted brands:', error)
      showToast('Failed to fetch deleted brands', 'danger')
    }
  }, [showToast])

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/brands/stats')
      setStats(response.data || { total: 0, active: 0, inactive: 0, deleted: 0 })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchBrands()
    fetchStats()
  }, [fetchBrands, fetchStats])

  useEffect(() => {
    if (viewMode === 'deleted') {
      fetchDeletedBrands()
    }
  }, [viewMode, fetchDeletedBrands])

  // CRUD Operations
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.brandName?.trim()) {
      showToast('Brand name is required', 'danger')
      return
    }

    const formDataObj = new FormData()
    formDataObj.append('brandName', formData.brandName.trim())
    if (formData.file) formDataObj.append('file', formData.file)

    setActionLoading(true)
    try {
      if (editingBrand) {
        await api.put(`/api/admin/brands/${editingBrand.brandId}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('Brand updated successfully!', 'success')
      } else {
        await api.post('/api/admin/brands', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('Brand created successfully!', 'success')
      }
      setShowModal(false)
      setFormData({ brandName: '', file: null })
      setPreviewUrl(null)
      await Promise.all([fetchBrands(), fetchStats()])
    } catch (error) {
      console.error('Failed to save brand:', error)
      showToast(error.response?.data?.message || 'Failed to save brand', 'danger')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSoftDelete = async (id, name) => {
    setBrandToDelete({ id, name })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const { id, name } = brandToDelete
    setActionLoading(true)
    try {
      await api.delete(`/api/admin/brands/${id}`)
      showToast(`Brand "${name}" deleted successfully!`, 'success')
      await Promise.all([fetchBrands(), fetchStats()])
      setSelectedRows([])
      setSelectAll(false)
    } catch (error) {
      console.error('Failed to delete brand:', error)
      showToast(error.response?.data?.message || 'Failed to delete brand', 'danger')
    } finally {
      setActionLoading(false)
      setShowDeleteModal(false)
      setBrandToDelete(null)
    }
  }

  const handleRestore = async (id, name) => {
    if (window.confirm(`Are you sure you want to restore brand "${name}"?`)) {
      setActionLoading(true)
      try {
        await api.patch(`/api/admin/brands/${id}/restore`)
        showToast(`Brand "${name}" restored successfully!`, 'success')
        await Promise.all([fetchBrands(), fetchDeletedBrands(), fetchStats()])
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to restore brand:', error)
        showToast(error.response?.data?.message || 'Failed to restore brand', 'danger')
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handlePermanentDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete brand "${name}"? This cannot be undone.`)) {
      setActionLoading(true)
      try {
        await api.delete(`/api/admin/brands/${id}/permanent`)
        showToast(`Brand "${name}" permanently deleted!`, 'success')
        await Promise.all([fetchDeletedBrands(), fetchStats()])
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to permanently delete brand:', error)
        showToast(error.response?.data?.message || 'Failed to permanently delete brand', 'danger')
      } finally {
        setActionLoading(false)
      }
    }
  }

  // Bulk operations
  const handleBulkSoftDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select brands to delete', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} brand(s)?`)) {
      setActionLoading(true)
      try {
        await api.delete('/api/admin/brands/bulk', { data: selectedRows })
        showToast(`${selectedRows.length} brand(s) deleted successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await Promise.all([fetchBrands(), fetchStats()])
      } catch (error) {
        console.error('Failed to delete brands:', error)
        showToast('Failed to delete brands', 'danger')
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleBulkRestore = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select brands to restore', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to restore ${selectedRows.length} brand(s)?`)) {
      setActionLoading(true)
      try {
        await api.patch('/api/admin/brands/bulk/restore', selectedRows)
        showToast(`${selectedRows.length} brand(s) restored successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await Promise.all([fetchBrands(), fetchDeletedBrands(), fetchStats()])
      } catch (error) {
        console.error('Failed to restore brands:', error)
        showToast('Failed to restore brands', 'danger')
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleBulkPermanentDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select brands to permanently delete', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to permanently delete ${selectedRows.length} brand(s)?`)) {
      setActionLoading(true)
      try {
        await api.delete('/api/admin/brands/bulk/permanent', { data: selectedRows })
        showToast(`${selectedRows.length} brand(s) permanently deleted!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await Promise.all([fetchDeletedBrands(), fetchStats()])
      } catch (error) {
        console.error('Failed to permanently delete brands:', error)
        showToast('Failed to permanently delete brands', 'danger')
      } finally {
        setActionLoading(false)
      }
    }
  }

  // Selection handlers
  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const currentItems = viewMode === 'active' ? filteredBrands : filteredDeletedBrands
    if (selectAll) {
      setSelectedRows([])
    } else {
      setSelectedRows(currentItems.map(item => item.brandId))
    }
    setSelectAll(!selectAll)
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    setSelectedRows([])
    setSelectAll(false)
    setSearchTerm('')
    setStatusFilter('')
  }

  // Filter brands
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = searchTerm === '' ||
      brand.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || brand.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredDeletedBrands = deletedBrands.filter(brand => {
    return searchTerm === '' ||
      brand.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const currentItems = viewMode === 'active' ? filteredBrands : filteredDeletedBrands

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `http://localhost:8080/api/files/download/${image}`
  }

  // Pagination
  const indexOfLastItem = (currentPage + 1) * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItemsPaginated = currentItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPagesCalc = Math.ceil(currentItems.length / itemsPerPage)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading brands...</p>
      </div>
    )
  }

  return (
    <div className="brands-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <i className={`bi bi-${toast.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Action Loading Overlay */}
      {actionLoading && (
        <div className="action-overlay">
          <div className="action-spinner"></div>
          <p className="action-text">Processing...</p>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <i className="bi bi-bookmark-star-fill"></i>
          </div>
          <div>
            <h1 className="page-title">Brands Management</h1>
            <p className="page-subtitle">Manage your product brands and logos</p>
          </div>
        </div>
        <div className="header-actions">
          {selectedRows.length > 0 && (
            <div className="bulk-actions">
              {viewMode === 'active' ? (
                <button className="btn-bulk-delete" onClick={handleBulkSoftDelete} disabled={actionLoading}>
                  <i className="bi bi-trash"></i>
                  Delete ({selectedRows.length})
                </button>
              ) : (
                <>
                  <button className="btn-bulk-restore" onClick={handleBulkRestore} disabled={actionLoading}>
                    <i className="bi bi-arrow-counterclockwise"></i>
                    Restore ({selectedRows.length})
                  </button>
                  <button className="btn-bulk-permanent-delete" onClick={handleBulkPermanentDelete} disabled={actionLoading}>
                    <i className="bi bi-trash3"></i>
                    Permanent ({selectedRows.length})
                  </button>
                </>
              )}
            </div>
          )}
          <button className="btn-primary" onClick={() => {
            setEditingBrand(null)
            setFormData({ brandName: '', file: null })
            setPreviewUrl(null)
            setShowModal(true)
          }}>
            <i className="bi bi-plus-lg"></i>
            Add Brand
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <i className="bi bi-bookmark-star-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Brands</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => handleViewModeChange('active')}>
          <div className="stat-icon success">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
          <div className="stat-badge">Active</div>
        </div>
        <div className="stat-card clickable" onClick={() => handleViewModeChange('active')}>
          <div className="stat-icon warning">
            <i className="bi bi-exclamation-circle-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.inactive}</h3>
            <p>Inactive</p>
          </div>
          <div className="stat-badge">Inactive</div>
        </div>
        <div className="stat-card clickable deleted" onClick={() => handleViewModeChange('deleted')}>
          <div className="stat-icon danger">
            <i className="bi bi-archive-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.deleted}</h3>
            <p>Deleted</p>
          </div>
          <div className="stat-badge">View</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`tab-btn ${viewMode === 'active' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('active')}
        >
          <i className="bi bi-list-ul"></i>
          Active Brands
          <span className="tab-count">{brands.length}</span>
        </button>
        <button
          className={`tab-btn ${viewMode === 'deleted' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('deleted')}
        >
          <i className="bi bi-archive"></i>
          Deleted Brands
          <span className="tab-count">{deletedBrands.length}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-row">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          <div className="filter-group">
            {viewMode === 'active' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
            <button className="btn-clear" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
              <i className="bi bi-eraser"></i>
              Clear
            </button>
            <button className="btn-refresh" onClick={() => fetchBrands()} disabled={loading}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        <div className="filters-info">
          Showing {currentItems.length} of {viewMode === 'active' ? brands.length : deletedBrands.length} brands
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="brands-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    disabled={currentItems.length === 0}
                  />
                </th>
                <th>Logo</th>
                <th>Brand Name</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItemsPaginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>{viewMode === 'active' ? 'No active brands found' : 'No deleted brands found'}</p>
                    {viewMode === 'active' && (
                      <button className="btn-primary-sm" onClick={() => {
                        setEditingBrand(null)
                        setFormData({ brandName: '', file: null })
                        setPreviewUrl(null)
                        setShowModal(true)
                      }}>
                        <i className="bi bi-plus-lg"></i>
                        Add your first brand
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentItemsPaginated.map(brand => (
                  <tr key={brand.brandId} className={selectedRows.includes(brand.brandId) ? 'selected' : ''}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(brand.brandId)}
                        onChange={() => handleSelectRow(brand.brandId)}
                      />
                    </td>
                    <td className="logo-cell">
                      {brand.image ? (
                        <img
                          src={getImageUrl(brand.image)}
                          alt={brand.brandName}
                          className="brand-logo"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = '<div class="logo-placeholder"><i class="bi bi-building"></i></div>'
                          }}
                        />
                      ) : (
                        <div className="logo-placeholder">
                          <i className="bi bi-building"></i>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="brand-cell">
                        <span className="brand-name">{brand.brandName}</span>
                        <span className="brand-id">#{brand.brandId}</span>
                      </div>
                    </td>
                    <td>
                      {viewMode === 'active' ? (
                        <span className={`status-badge ${brand.status === 'inactive' ? 'status-inactive' : 'status-active'}`}>
                          <span className="status-dot"></span>
                          {brand.status === 'inactive' ? 'Inactive' : 'Active'}
                        </span>
                      ) : (
                        <div className="deleted-info">
                          <span className="status-badge status-deleted">
                            <span className="status-dot"></span>
                            Deleted
                          </span>
                          {brand.deletedAt && (
                            <span className="deleted-date">
                              {new Date(brand.deletedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="actions-col">
                      <div className="action-buttons">
                        {viewMode === 'active' ? (
                          <>
                            <button
                              className="action-btn edit"
                              onClick={() => {
                                setEditingBrand(brand)
                                setFormData({ brandName: brand.brandName, file: null })
                                setPreviewUrl(getImageUrl(brand.image))
                                setShowModal(true)
                              }}
                              title="Edit"
                              disabled={actionLoading}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleSoftDelete(brand.brandId, brand.brandName)}
                              title="Delete"
                              disabled={actionLoading}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="action-btn restore"
                              onClick={() => handleRestore(brand.brandId, brand.brandName)}
                              title="Restore"
                              disabled={actionLoading}
                            >
                              <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                            <button
                              className="action-btn permanent-delete"
                              onClick={() => handlePermanentDelete(brand.brandId, brand.brandName)}
                              title="Permanently Delete"
                              disabled={actionLoading}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentItems.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, currentItems.length)} of {currentItems.length} entries
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: Math.min(totalPagesCalc, 5) }, (_, i) => {
                let pageNum
                if (totalPagesCalc <= 5) {
                  pageNum = i
                } else if (currentPage < 3) {
                  pageNum = i
                } else if (currentPage > totalPagesCalc - 3) {
                  pageNum = totalPagesCalc - 4 + i
                } else {
                  pageNum = currentPage - 1 + i
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPagesCalc - 1, prev + 1))}
                disabled={currentPage === totalPagesCalc - 1}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && brandToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <h3>
                <i className="bi bi-exclamation-triangle-fill"></i>
                Confirm Delete
              </h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="delete-confirm-text">
                Are you sure you want to delete <strong>"{brandToDelete.name}"</strong>?
                <br />
                <span className="delete-hint">This brand can be restored later from the deleted items.</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <span className="spinner-small"></span>
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-bookmark-star"></i>
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="brandName">Brand Name <span className="required">*</span></label>
                  <input
                    id="brandName"
                    type="text"
                    className="form-control"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Enter brand name"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Brand Logo</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            showToast('File size must be less than 2MB', 'danger')
                            return
                          }
                          setFormData({ ...formData, file })
                          setPreviewUrl(URL.createObjectURL(file))
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="logo-upload" className="file-upload-label">
                      <i className="bi bi-cloud-upload"></i>
                      <span>Click to upload logo</span>
                      <small>PNG, JPG, WEBP up to 2MB</small>
                    </label>
                    {previewUrl && (
                      <div className="image-preview">
                        <img src={previewUrl} alt="Logo preview" />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => {
                            setPreviewUrl(null)
                            setFormData({ ...formData, file: null })
                          }}
                          title="Remove image"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {editingBrand && (
                  <div className="form-hint">
                    <i className="bi bi-info-circle"></i>
                    Leave logo empty to keep current image
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Brand'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ===== CONTAINER ===== */
        .brands-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* ===== LOADING ===== */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          margin-top: 16px;
          color: #64748b;
        }

        /* ===== ACTION OVERLAY ===== */
        .action-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.85);
          z-index: 1200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .action-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .action-text {
          margin-top: 12px;
          color: #64748b;
          font-weight: 500;
        }

        /* ===== TOAST ===== */
        .toast-notification {
          position: fixed;
          top: 80px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          z-index: 1100;
          animation: slideIn 0.3s ease;
          font-weight: 500;
          max-width: 450px;
          min-width: 300px;
        }

        .toast-success {
          background: #10b981;
          color: white;
        }

        .toast-danger {
          background: #ef4444;
          color: white;
        }

        .toast-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          padding: 4px;
          margin-left: auto;
          transition: color 0.2s;
        }

        .toast-close:hover {
          color: white;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* ===== PAGE HEADER ===== */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          background: white;
          padding: 20px 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon i {
          font-size: 26px;
          color: white;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .page-subtitle {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        /* ===== BUTTONS ===== */
        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary-sm {
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-danger {
          padding: 10px 20px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-bulk-delete,
        .btn-bulk-restore,
        .btn-bulk-permanent-delete {
          padding: 8px 16px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 13px;
        }

        .btn-bulk-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-bulk-delete:hover:not(:disabled) {
          background: #fecaca;
        }

        .btn-bulk-restore {
          background: #d1fae5;
          color: #059669;
        }

        .btn-bulk-restore:hover:not(:disabled) {
          background: #a7f3d0;
        }

        .btn-bulk-permanent-delete {
          background: #fef3c7;
          color: #d97706;
        }

        .btn-bulk-permanent-delete:hover:not(:disabled) {
          background: #fde68a;
        }

        .btn-bulk-delete:disabled,
        .btn-bulk-restore:disabled,
        .btn-bulk-permanent-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-clear {
          padding: 8px 14px;
          background: #f1f5f9;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 13px;
          color: #475569;
        }

        .btn-clear:hover {
          background: #e2e8f0;
        }

        .btn-refresh {
          padding: 8px 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          color: #475569;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #e2e8f0;
          transform: rotate(180deg);
        }

        .btn-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ===== STATS ===== */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          position: relative;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        .stat-card.clickable {
          cursor: pointer;
        }

        .stat-card.clickable:hover {
          border: 2px solid #667eea;
        }

        .stat-card.deleted {
          border: 2px solid #f59e0b;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          flex-shrink: 0;
        }

        .stat-icon.primary { background: linear-gradient(135deg, #667eea, #764ba2); }
        .stat-icon.success { background: linear-gradient(135deg, #10b981, #059669); }
        .stat-icon.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .stat-icon.danger { background: linear-gradient(135deg, #ef4444, #dc2626); }

        .stat-info {
          flex: 1;
        }

        .stat-info h3 {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .stat-info p {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .stat-badge {
          padding: 2px 10px;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        /* ===== VIEW TABS ===== */
        .view-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
          background: white;
          padding: 4px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          flex: 1;
          justify-content: center;
        }

        .tab-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .tab-count {
          background: rgba(255,255,255,0.2);
          padding: 1px 8px;
          border-radius: 12px;
          font-size: 11px;
        }

        .tab-btn.active .tab-count {
          background: rgba(255,255,255,0.2);
        }

        /* ===== FILTERS ===== */
        .filters-card {
          background: white;
          border-radius: 14px;
          padding: 14px 20px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .filters-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 320px;
        }

        .search-box i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box input {
          width: 100%;
          padding: 8px 36px 8px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f8fafc;
        }

        .search-box input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
        }

        .search-clear:hover {
          color: #64748b;
        }

        .filter-group {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          min-width: 130px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .filters-info {
          margin-top: 8px;
          font-size: 13px;
          color: #94a3b8;
        }

        /* ===== TABLE ===== */
        .table-card {
          background: white;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .table-responsive {
          overflow-x: auto;
        }

        .brands-table {
          width: 100%;
          border-collapse: collapse;
        }

        .brands-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .brands-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .brands-table tr:hover {
          background: #f8fafc;
        }

        .brands-table tr.selected {
          background: #eef2ff;
        }

        .checkbox-col {
          width: 36px;
          text-align: center;
        }

        .checkbox-col input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .checkbox-col input:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .actions-col {
          width: 120px;
        }

        /* ===== LOGO ===== */
        .logo-cell {
          width: 56px;
        }

        .brand-logo {
          width: 38px;
          height: 38px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .logo-placeholder {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-placeholder i {
          font-size: 18px;
          color: #94a3b8;
        }

        /* ===== BRAND CELL ===== */
        .brand-cell {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }

        .brand-id {
          font-size: 11px;
          color: #94a3b8;
        }

        /* ===== STATUS ===== */
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .status-active {
          background: #d1fae5;
          color: #059669;
        }

        .status-inactive {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-deleted {
          background: #fef3c7;
          color: #d97706;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .deleted-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .deleted-date {
          font-size: 11px;
          color: #94a3b8;
        }

        /* ===== ACTION BUTTONS ===== */
        .action-buttons {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .action-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-btn.edit:hover:not(:disabled) {
          background: #eef2ff;
          color: #667eea;
        }

        .action-btn.delete:hover:not(:disabled) {
          background: #fef2f2;
          color: #ef4444;
        }

        .action-btn.restore:hover:not(:disabled) {
          background: #d1fae5;
          color: #10b981;
        }

        .action-btn.permanent-delete:hover:not(:disabled) {
          background: #fef3c7;
          color: #d97706;
        }

        /* ===== EMPTY STATE ===== */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state i {
          font-size: 48px;
          color: #cbd5e1;
          margin-bottom: 16px;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 20px;
          font-size: 16px;
        }

        /* ===== PAGINATION ===== */
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-top: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pagination-info {
          font-size: 13px;
          color: #64748b;
        }

        .pagination-buttons {
          display: flex;
          gap: 4px;
        }

        .pagination-btn {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #475569;
          font-size: 13px;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #667eea;
        }

        .pagination-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ===== MODAL ===== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        .modal-container.small {
          max-width: 420px;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 20px 20px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .modal-header.danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 24px;
          color: white;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }

        .modal-close:hover {
          opacity: 0.8;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        /* ===== DELETE CONFIRM ===== */
        .delete-confirm-text {
          font-size: 15px;
          color: #1e293b;
          line-height: 1.6;
        }

        .delete-confirm-text strong {
          color: #dc2626;
        }

        .delete-hint {
          display: block;
          font-size: 13px;
          color: #64748b;
          margin-top: 8px;
        }

        /* ===== FORM ===== */
        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 14px;
          color: #1e293b;
        }

        .required {
          color: #ef4444;
        }

        .form-control {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f8fafc;
        }

        .form-control:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .form-hint i {
          color: #667eea;
        }

        /* ===== FILE UPLOAD ===== */
        .file-upload-area {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          background: #fafbfc;
        }

        .file-upload-area:hover {
          border-color: #667eea;
          background: #f8fafc;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .file-upload-label i {
          font-size: 32px;
          color: #667eea;
        }

        .file-upload-label span {
          font-weight: 500;
          color: #1e293b;
        }

        .file-upload-label small {
          font-size: 11px;
          color: #94a3b8;
        }

        .image-preview {
          position: relative;
          margin-top: 16px;
          display: inline-block;
        }

        .image-preview img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .remove-image {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .remove-image:hover {
          transform: scale(1.1);
        }

        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .brands-container {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 14px 16px;
          }

          .stat-info h3 {
            font-size: 18px;
          }

          .page-header {
            padding: 16px;
            flex-direction: column;
            text-align: center;
          }

          .header-left {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            justify-content: center;
          }

          .bulk-actions {
            flex-wrap: wrap;
            justify-content: center;
          }

          .filters-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .filter-group {
            justify-content: center;
          }

          .view-tabs {
            flex-direction: column;
          }

          .tab-btn {
            justify-content: center;
          }

          .toast-notification {
            top: 16px;
            right: 16px;
            left: 16px;
            max-width: none;
          }

          .modal-container {
            width: 95%;
            margin: 16px;
          }

          .pagination-container {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Brands