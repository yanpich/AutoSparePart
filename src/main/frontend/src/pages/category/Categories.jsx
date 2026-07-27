// src/pages/category/Categories.jsx
import React, { useState, useEffect } from 'react'
import { categoryService } from '../../api/category'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    iconClass: 'bi-tag'
  })

  useEffect(() => {
    fetchCategories()
  }, [showDeleted])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const fetchCategories = async () => {
    setLoading(true)
    try {
      let data
      if (showDeleted) {
        data = await categoryService.getDeleted()
      } else {
        data = await categoryService.getAll()
      }
      const categoriesList = data.content || data || []
      setCategories(categoriesList)
      setCurrentPage(1)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      showToast(error.response?.data?.message || 'Failed to fetch categories', 'danger')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"? This action can be undone later.`)) {
      try {
        await categoryService.delete(id)
        showToast(`Category "${name}" deleted successfully!`, 'success')
        await fetchCategories()
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to delete category:', error)
        showToast(error.response?.data?.message || 'Failed to delete category', 'danger')
      }
    }
  }

  const handleRestore = async (id, name) => {
    if (window.confirm(`Are you sure you want to restore category "${name}"?`)) {
      try {
        await categoryService.restore(id)
        showToast(`Category "${name}" restored successfully!`, 'success')
        await fetchCategories()
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to restore category:', error)
        showToast(error.response?.data?.message || 'Failed to restore category', 'danger')
      }
    }
  }

  const handleHardDelete = async (id, name) => {
    if (window.confirm(`⚠️ WARNING: This will PERMANENTLY delete category "${name}". This action CANNOT be undone. Are you sure?`)) {
      try {
        await categoryService.hardDelete(id)
        showToast(`Category "${name}" permanently deleted!`, 'success')
        await fetchCategories()
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to permanently delete category:', error)
        showToast(error.response?.data?.message || 'Failed to permanently delete category', 'danger')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select categories to delete', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} category(s)? This action can be undone later.`)) {
      try {
        for (const id of selectedRows) {
          await categoryService.delete(id)
        }
        showToast(`${selectedRows.length} category(s) deleted successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await fetchCategories()
      } catch (error) {
        console.error('Failed to delete categories:', error)
        showToast('Failed to delete categories', 'danger')
      }
    }
  }

  const handleBulkRestore = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select categories to restore', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to restore ${selectedRows.length} category(s)?`)) {
      try {
        for (const id of selectedRows) {
          await categoryService.restore(id)
        }
        showToast(`${selectedRows.length} category(s) restored successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await fetchCategories()
      } catch (error) {
        console.error('Failed to restore categories:', error)
        showToast('Failed to restore categories', 'danger')
      }
    }
  }

  const handleBulkHardDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select categories to permanently delete', 'danger')
      return
    }

    if (window.confirm(`⚠️ WARNING: This will PERMANENTLY delete ${selectedRows.length} category(s). This action CANNOT be undone. Are you sure?`)) {
      try {
        for (const id of selectedRows) {
          await categoryService.hardDelete(id)
        }
        showToast(`${selectedRows.length} category(s) permanently deleted!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await fetchCategories()
      } catch (error) {
        console.error('Failed to permanently delete categories:', error)
        showToast('Failed to permanently delete categories', 'danger')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showToast('Category name is required', 'danger')
      return
    }

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.categoryId || editingCategory.id, formData)
        showToast('Category updated successfully!', 'success')
      } else {
        await categoryService.create(formData)
        showToast('Category created successfully!', 'success')
      }
      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', slug: '', description: '', iconClass: 'bi-tag' })
      await fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      showToast(error.response?.data?.message || 'Failed to save category', 'danger')
    }
  }

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedCategories.map(cat => cat.categoryId || cat.id))
    }
    setSelectAll(!selectAll)
  }

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData({ ...formData, slug })
    }
  }

  const iconOptions = [
    'bi-tag', 'bi-folder', 'bi-folder2', 'bi-archive', 'bi-box',
    'bi-grid', 'bi-collection', 'bi-bookmark', 'bi-star', 'bi-heart',
    'bi-gear', 'bi-tools', 'bi-wrench', 'bi-car-front', 'bi-truck',
    'bi-bicycle', 'bi-motorcycle', 'bi-cpu', 'bi-phone', 'bi-laptop',
    'bi-camera', 'bi-house', 'bi-shop', 'bi-bag', 'bi-gift',
    'bi-gem', 'bi-globe', 'bi-chat', 'bi-chat-dots'
  ]

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = searchTerm === '' ||
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || cat.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.status === 'active').length,
    inactive: categories.filter(c => c.status === 'inactive').length,
    deleted: categories.filter(c => c.status === 'deleted').length,
    withIcons: categories.filter(c => c.iconClass && c.iconClass !== 'bi-tag').length
  }

  if (loading) {
    return (
      <div className="loading-container-premium">
        <div className="loading-spinner-premium">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="categories-page-premium">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-premium toast-${toast.type}`}>
          <i className={`bi bi-${toast.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="page-header-premium">
        <div className="header-left-premium">
          <div className="header-icon-premium">
            <i className="bi bi-tags-fill"></i>
          </div>
          <div className="header-text-premium">
            <h1>Categories Management</h1>
            <p>Organize your products with categories</p>
          </div>
        </div>
        <div className="header-actions-premium">
          {selectedRows.length > 0 && (
            <>
              {!showDeleted ? (
                <button className="btn-bulk-delete-premium" onClick={handleBulkDelete}>
                  <i className="bi bi-trash3"></i>
                  Delete ({selectedRows.length})
                </button>
              ) : (
                <>
                  <button className="btn-bulk-restore-premium" onClick={handleBulkRestore}>
                    <i className="bi bi-arrow-repeat"></i>
                    Restore ({selectedRows.length})
                  </button>
                  <button className="btn-bulk-hard-delete-premium" onClick={handleBulkHardDelete}>
                    <i className="bi bi-trash3"></i>
                    Permanent ({selectedRows.length})
                  </button>
                </>
              )}
            </>
          )}
          {!showDeleted && (
            <button className="btn-primary-premium" onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', slug: '', description: '', iconClass: 'bi-tag' });
              setShowModal(true)
            }}>
              <i className="bi bi-plus-lg"></i>
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-premium">
        <div className="stat-card-premium">
          <div className="stat-icon primary">
            <i className="bi bi-tags-fill"></i>
          </div>
          <div className="stat-info-premium">
            <h3>{showDeleted ? stats.deleted : stats.total}</h3>
            <p>{showDeleted ? 'Deleted Categories' : 'Total Categories'}</p>
          </div>
          <div className="stat-trend-premium">
            <i className="bi bi-arrow-up"></i>
            <span>+12%</span>
          </div>
        </div>
        {!showDeleted && (
          <>
            <div className="stat-card-premium">
              <div className="stat-icon success">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div className="stat-info-premium">
                <h3>{stats.active}</h3>
                <p>Active Categories</p>
              </div>
              <div className="stat-trend-premium positive">
                <i className="bi bi-arrow-up"></i>
                <span>+8%</span>
              </div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon danger">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <div className="stat-info-premium">
                <h3>{stats.inactive}</h3>
                <p>Inactive Categories</p>
              </div>
              <div className="stat-trend-premium negative">
                <i className="bi bi-arrow-down"></i>
                <span>-3%</span>
              </div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon info">
                <i className="bi bi-grid-3x3-gap-fill"></i>
              </div>
              <div className="stat-info-premium">
                <h3>{stats.withIcons}</h3>
                <p>With Custom Icons</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="filters-card-premium">
        <div className="filters-row-premium">
          <div className="search-box-premium">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear-premium" onClick={() => setSearchTerm('')}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          <div className="filter-group-premium">
            <button
              className={`btn-toggle-deleted-premium ${showDeleted ? 'active' : ''}`}
              onClick={() => {
                setShowDeleted(!showDeleted)
                setSelectedRows([])
                setSelectAll(false)
                setSearchTerm('')
                setStatusFilter('')
                setCurrentPage(1)
              }}
            >
              <i className={`bi ${showDeleted ? 'bi-eye' : 'bi-trash'}`}></i>
              {showDeleted ? 'Show Active' : 'Show Deleted'}
            </button>
            {!showDeleted && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">❌ Inactive</option>
              </select>
            )}
            <button className="btn-clear-premium" onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCurrentPage(1)
            }}>
              <i className="bi bi-eraser"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="table-card-premium">
        <div className="table-responsive-premium">
          <table className="categories-table-premium">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state-premium">
                    <div className="empty-icon-premium">
                      <i className="bi bi-inbox"></i>
                    </div>
                    <h3>{showDeleted ? 'No deleted categories found' : 'No categories found'}</h3>
                    <p>{showDeleted ? 'There are no deleted categories to display.' : 'Get started by adding your first category'}</p>
                    {!showDeleted && (
                      <button className="btn-primary-premium" onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', slug: '', description: '', iconClass: 'bi-tag' });
                        setShowModal(true)
                      }}>
                        <i className="bi bi-plus-lg"></i>
                        Add Your First Category
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedCategories.map(category => {
                  const catId = category.categoryId || category.id
                  const isDeleted = category.status === 'deleted' || category.deleted === true
                  return (
                    <tr key={catId} className={selectedRows.includes(catId) ? 'selected' : ''}>
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(catId)}
                          onChange={() => handleSelectRow(catId)}
                        />
                      </td>
                      <td className="icon-cell-premium">
                        <i className={`bi ${category.iconClass || 'bi-tag'}`}></i>
                      </td>
                      <td className="category-cell-premium">
                        <div className="category-name-premium">{category.name}</div>
                        <div className="category-id-premium">ID: #{catId}</div>
                        {isDeleted && (
                          <div className="deleted-badge-premium">
                            <i className="bi bi-trash3"></i> Deleted
                          </div>
                        )}
                      </td>
                      <td className="slug-cell-premium">
                        <code>{category.slug || '—'}</code>
                      </td>
                      <td className="description-cell-premium">
                        {category.description || '—'}
                      </td>
                      <td className="products-count-premium">
                        <i className="bi bi-box-seam"></i>
                        {category.productCount || 0}
                      </td>
                      <td className="status-cell-premium">
                        {!showDeleted ? (
                          <span className={`status-badge-premium ${category.status === 'active' ? 'status-active-premium' : 'status-inactive-premium'}`}>
                            <span className="status-dot-premium"></span>
                            {category.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        ) : (
                          <span className="status-badge-premium status-deleted-premium">
                            <span className="status-dot-premium"></span>
                            Deleted
                          </span>
                        )}
                      </td>
                      <td className="actions-col">
                        <div className="action-buttons-premium">
                          {!showDeleted ? (
                            <>
                              <button
                                className="action-btn-premium edit"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setFormData({
                                    name: category.name,
                                    slug: category.slug || '',
                                    description: category.description || '',
                                    iconClass: category.iconClass || 'bi-tag'
                                  });
                                  setShowModal(true)
                                }}
                                title="Edit Category"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="action-btn-premium delete"
                                onClick={() => handleDelete(catId, category.name)}
                                title="Soft Delete"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="action-btn-premium restore"
                                onClick={() => handleRestore(catId, category.name)}
                                title="Restore Category"
                              >
                                <i className="bi bi-arrow-repeat"></i>
                              </button>
                              <button
                                className="action-btn-premium hard-delete"
                                onClick={() => handleHardDelete(catId, category.name)}
                                title="Permanently Delete"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredCategories.length > 0 && (
            <div className="table-footer-premium">
              <div className="pagination-info-premium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} {showDeleted ? 'deleted categories' : 'categories'}
              </div>
              {totalPages > 1 && (
                <div className="pagination-premium">
                  <button
                    className="pagination-btn-premium"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      className={`pagination-btn-premium ${currentPage === number + 1 ? 'active' : ''}`}
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  ))}
                  <button
                    className="pagination-btn-premium"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
          <div className="modal-container-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <h3>
                <i className="bi bi-tag"></i>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button className="modal-close-premium" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-premium">
                <div className="form-group-premium">
                  <label>Category Name <span className="required-premium">*</span></label>
                  <input
                    type="text"
                    className="form-control-premium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={generateSlug}
                    placeholder="Enter category name"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group-premium">
                  <label>Slug (URL)</label>
                  <div className="slug-input-group-premium">
                    <span className="slug-prefix-premium">/category/</span>
                    <input
                      type="text"
                      className="form-control-premium"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="auto-generated"
                    />
                  </div>
                  <small className="form-hint-premium">URL-friendly version of the name. Leave empty to auto-generate.</small>
                </div>
                <div className="form-group-premium">
                  <label>Icon</label>
                  <div className="icon-selector-premium">
                    <div className="selected-icon-premium">
                      <i className={`bi ${formData.iconClass}`}></i>
                      <span>{formData.iconClass}</span>
                    </div>
                    <div className="icon-grid-premium">
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className={`icon-option-premium ${formData.iconClass === icon ? 'active' : ''}`}
                          onClick={() => setFormData({ ...formData, iconClass: icon })}
                        >
                          <i className={`bi ${icon}`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <small className="form-hint-premium">Click on an icon to select</small>
                </div>
                <div className="form-group-premium">
                  <label>Description</label>
                  <textarea
                    className="form-control-premium"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description (optional)"
                  />
                </div>
              </div>
              <div className="modal-footer-premium">
                <button type="button" className="btn-secondary-premium" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-premium">
                  <i className="bi bi-check-lg"></i>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .categories-page-premium {
          padding: 24px;
          max-width: 1600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
        }

        /* Loading State */
        .loading-container-premium {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner-premium {
          position: relative;
          width: 60px;
          height: 60px;
          margin-bottom: 20px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(1) { border-top-color: #e63946; animation-delay: -0.45s; }
        .spinner-ring:nth-child(2) { border-right-color: #667eea; animation-delay: -0.3s; }
        .spinner-ring:nth-child(3) { border-bottom-color: #764ba2; animation-delay: -0.15s; }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container-premium p {
          margin-top: 16px;
          color: #64748b;
          font-weight: 500;
        }

        /* Toast Notification */
        .toast-premium {
          position: fixed;
          top: 80px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1100;
          animation: slideIn 0.3s ease;
          font-weight: 500;
          min-width: 200px;
        }

        .toast-success { background: #10b981; color: white; }
        .toast-danger { background: #ef4444; color: white; }

        .toast-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          margin-left: auto;
          opacity: 0.7;
          transition: opacity 0.3s;
        }

        .toast-close:hover { opacity: 1; }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Page Header */
        .page-header-premium {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
          background: white;
          padding: 20px 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .header-left-premium {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon-premium {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon-premium i {
          font-size: 28px;
          color: white;
        }

        .header-text-premium h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1e293b;
        }

        .header-text-premium p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .header-actions-premium {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary-premium {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-primary-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-bulk-delete-premium {
          padding: 10px 20px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-bulk-delete-premium:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .btn-bulk-restore-premium {
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-bulk-restore-premium:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .btn-bulk-hard-delete-premium {
          padding: 10px 20px;
          background: #7f1d1d;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-bulk-hard-delete-premium:hover {
          background: #991b1b;
          transform: translateY(-2px);
        }

        .btn-toggle-deleted-premium {
          padding: 10px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-toggle-deleted-premium.active {
          background: #ef4444;
          color: white;
        }

        /* Stats Grid */
        .stats-grid-premium {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card-premium {
          background: white;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          position: relative;
        }

        .stat-card-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .stat-icon.primary { background: linear-gradient(135deg, #667eea, #764ba2); }
        .stat-icon.success { background: linear-gradient(135deg, #10b981, #059669); }
        .stat-icon.danger { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .stat-icon.info { background: linear-gradient(135deg, #3b82f6, #2563eb); }

        .stat-info-premium h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .stat-info-premium p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .stat-trend-premium {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 3px;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .stat-trend-premium.positive { color: #10b981; }
        .stat-trend-premium.negative { color: #ef4444; }

        /* Filters */
        .filters-card-premium {
          background: white;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .filters-row-premium {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box-premium {
          position: relative;
          flex: 1;
          max-width: 350px;
        }

        .search-box-premium i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box-premium input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-box-premium input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-clear-premium {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .filter-group-premium {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group-premium select {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-clear-premium {
          padding: 10px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .btn-clear-premium:hover {
          background: #e2e8f0;
        }

        /* Table Card */
        .table-card-premium {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .table-responsive-premium {
          overflow-x: auto;
          padding: 0 4px;
        }

        .categories-table-premium {
          width: 100%;
          border-collapse: collapse;
        }

        .categories-table-premium th {
          padding: 16px 20px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .categories-table-premium td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .categories-table-premium tr:hover {
          background: #f8fafc;
        }

        .categories-table-premium tr.selected {
          background: #eef2ff;
        }

        .checkbox-col {
          width: 40px;
          text-align: center;
        }

        .checkbox-col input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #667eea;
        }

        .actions-col {
          width: 140px;
        }

        /* Icon Cell */
        .icon-cell-premium {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-cell-premium i {
          font-size: 20px;
          color: white;
        }

        /* Category Cell */
        .category-cell-premium {
          display: flex;
          flex-direction: column;
        }

        .category-name-premium {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
          font-size: 15px;
        }

        .category-id-premium {
          font-size: 11px;
          color: #94a3b8;
        }

        .deleted-badge-premium {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          padding: 2px 8px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 20px;
          margin-top: 4px;
          width: fit-content;
        }

        /* Slug Cell */
        .slug-cell-premium code {
          background: #f1f5f9;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          color: #667eea;
        }

        /* Description Cell */
        .description-cell-premium {
          max-width: 200px;
          font-size: 13px;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Products Count */
        .products-count-premium {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        /* Status Cell */
        .status-cell-premium {
          width: 100px;
        }

        .status-badge-premium {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .status-active-premium {
          background: #d1fae5;
          color: #059669;
        }

        .status-inactive-premium {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-deleted-premium {
          background: #e2e8f0;
          color: #64748b;
        }

        .status-dot-premium {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Action Buttons */
        .action-buttons-premium {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .action-btn-premium {
          width: 34px;
          height: 34px;
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

        .action-btn-premium:hover {
          transform: scale(1.05);
        }

        .action-btn-premium.edit:hover {
          background: #eef2ff;
          color: #667eea;
        }

        .action-btn-premium.delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .action-btn-premium.restore:hover {
          background: #d1fae5;
          color: #10b981;
        }

        .action-btn-premium.hard-delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Table Footer */
        .table-footer-premium {
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          background: #f8fafc;
        }

        .pagination-info-premium {
          font-size: 13px;
          color: #64748b;
        }

        .pagination-premium {
          display: flex;
          gap: 6px;
        }

        .pagination-btn-premium {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: #64748b;
        }

        .pagination-btn-premium:hover:not(:disabled) {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .pagination-btn-premium.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .pagination-btn-premium:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Empty State */
        .empty-state-premium {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon-premium {
          font-size: 48px;
          color: #cbd5e1;
          margin-bottom: 16px;
          display: block;
        }

        .empty-state-premium h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .empty-state-premium p {
          color: #64748b;
          margin-bottom: 20px;
        }

        /* Modal Styles */
        .modal-overlay-premium {
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
        }

        .modal-container-premium {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header-premium {
          padding: 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 24px 24px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header-premium h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-close-premium {
          background: transparent;
          border: none;
          font-size: 28px;
          color: white;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .modal-close-premium:hover {
          transform: rotate(90deg);
        }

        .modal-body-premium {
          padding: 24px;
        }

        .modal-footer-premium {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Form Styles */
        .form-group-premium {
          margin-bottom: 20px;
        }

        .form-group-premium label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
          color: #1e293b;
        }

        .required-premium {
          color: #ef4444;
        }

        .form-control-premium {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }

        .form-control-premium:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea.form-control-premium {
          resize: vertical;
        }

        .slug-input-group-premium {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .slug-prefix-premium {
          background: #f1f5f9;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          color: #64748b;
          font-family: monospace;
        }

        .slug-input-group-premium .form-control-premium {
          flex: 1;
        }

        .form-hint-premium {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 6px;
          display: block;
        }

        /* Icon Selector */
        .icon-selector-premium {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .selected-icon-premium {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .selected-icon-premium i {
          font-size: 20px;
          color: #667eea;
        }

        .selected-icon-premium span {
          font-family: monospace;
          font-size: 13px;
          color: #1e293b;
        }

        .icon-grid-premium {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          padding: 16px;
          max-height: 200px;
          overflow-y: auto;
        }

        .icon-option-premium {
          aspect-ratio: 1;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .icon-option-premium i {
          font-size: 18px;
          color: #64748b;
        }

        .icon-option-premium:hover {
          border-color: #667eea;
          background: #eef2ff;
          transform: scale(1.05);
        }

        .icon-option-premium.active {
          border-color: #667eea;
          background: #667eea;
        }

        .icon-option-premium.active i {
          color: white;
        }

        .btn-secondary-premium {
          padding: 10px 20px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary-premium:hover {
          background: #e2e8f0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid-premium {
            grid-template-columns: repeat(2, 1fr);
          }

          .icon-grid-premium {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 768px) {
          .categories-page-premium {
            padding: 16px;
          }

          .stats-grid-premium {
            grid-template-columns: 1fr;
          }

          .filters-row-premium {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box-premium {
            max-width: none;
          }

          .filter-group-premium {
            justify-content: space-between;
          }

          .header-left-premium {
            flex-direction: column;
            text-align: center;
          }

          .slug-input-group-premium {
            flex-direction: column;
            align-items: stretch;
          }

          .slug-prefix-premium {
            text-align: center;
          }

          .icon-grid-premium {
            grid-template-columns: repeat(3, 1fr);
          }

          .table-footer-premium {
            flex-direction: column;
            align-items: center;
          }

          .actions-col {
            width: auto;
          }

          .action-buttons-premium {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .stat-card-premium {
            padding: 16px;
          }

          .stat-info-premium h3 {
            font-size: 22px;
          }

          .header-icon-premium {
            width: 44px;
            height: 44px;
          }

          .header-icon-premium i {
            font-size: 20px;
          }

          .header-text-premium h1 {
            font-size: 22px;
          }

          .icon-grid-premium {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

export default Categories