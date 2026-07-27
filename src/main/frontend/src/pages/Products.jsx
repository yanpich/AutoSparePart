import React, { useState, useEffect } from 'react'
import api from '../api/axios'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [imagePreview, setImagePreview] = useState([])
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    description: '',
    status: 'active',
    categoryId: '',
    brandId: '',
    vehicleIds: []
  })
  const [imageFiles, setImageFiles] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
    fetchVehicles()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/admin/products')
      setProducts(response.data.content || response.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      showToast('Failed to fetch products', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/admin/categories')
      setCategories(response.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await api.get('/api/admin/brands')
      setBrands(response.data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/admin/vehicles')
      setVehicles(response.data || [])
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/admin/products/${id}`)
        showToast(`Product "${name}" deleted successfully!`, 'success')
        fetchProducts()
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to delete product:', error)
        showToast('Failed to delete product', 'danger')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select products to delete', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} product(s)? This action cannot be undone.`)) {
      try {
        for (const id of selectedRows) {
          await api.delete(`/api/admin/products/${id}`)
        }
        showToast(`${selectedRows.length} product(s) deleted successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        fetchProducts()
      } catch (error) {
        console.error('Failed to delete products:', error)
        showToast('Failed to delete products', 'danger')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.productName.trim()) {
      showToast('Product name is required', 'danger')
      return
    }
    if (!formData.price) {
      showToast('Price is required', 'danger')
      return
    }
    if (!formData.categoryId) {
      showToast('Category is required', 'danger')
      return
    }

    const data = new FormData()
    data.append('productName', formData.productName)
    data.append('price', formData.price)
    data.append('description', formData.description || '')
    data.append('status', formData.status)
    data.append('categoryId', formData.categoryId)
    data.append('brandId', formData.brandId || '')
    data.append('vehicleIds', JSON.stringify(formData.vehicleIds))

    for (let i = 0; i < imageFiles.length; i++) {
      data.append('images', imageFiles[i])
    }

    try {
      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct.productId}`, data)
        showToast('Product updated successfully!', 'success')
      } else {
        await api.post('/api/admin/products', data)
        showToast('Product created successfully!', 'success')
      }
      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        productName: '',
        price: '',
        description: '',
        status: 'active',
        categoryId: '',
        brandId: '',
        vehicleIds: []
      })
      setImageFiles([])
      setImagePreview([])
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      showToast(error.response?.data?.message || 'Failed to save product', 'danger')
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
      setSelectedRows(filteredProducts.map(product => product.productId))
    }
    setSelectAll(!selectAll)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const handleRemoveImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreview(imagePreview.filter((_, i) => i !== index))
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    inactive: products.filter(p => p.status === 'inactive').length,
    draft: products.filter(p => p.status === 'draft').length
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="products-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <i className={`bi bi-${toast.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div className="header-text">
            <h1>Products Management</h1>
            <p>Manage your product inventory and details</p>
          </div>
        </div>
        <div className="header-actions">
          {selectedRows.length > 0 && (
            <button className="btn-bulk-delete" onClick={handleBulkDelete}>
              <i className="bi bi-trash"></i>
              Delete Selected ({selectedRows.length})
            </button>
          )}
          <button className="btn-primary" onClick={() => {
            setEditingProduct(null)
            setFormData({ productName: '', price: '', description: '', status: 'active', categoryId: '', brandId: '', vehicleIds: [] })
            setImageFiles([])
            setImagePreview([])
            setShowModal(true)
          }}>
            <i className="bi bi-plus-lg"></i>
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Products</p>
          </div>
          <div className="stat-trend">
            <i className="bi bi-arrow-up"></i>
            <span>+12%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active Products</p>
          </div>
          <div className="stat-trend success">
            <i className="bi bi-arrow-up"></i>
            <span>+8%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.inactive}</h3>
            <p>Inactive Products</p>
          </div>
          <div className="stat-trend danger">
            <i className="bi bi-arrow-down"></i>
            <span>-3%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <i className="bi bi-pencil-square"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.draft}</h3>
            <p>Draft Products</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-row">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search products by name..."
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <button className="btn-clear" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
              <i className="bi bi-eraser"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-box-seam"></i>
          <h3>No products found</h3>
          <p>{searchTerm ? `No products matching "${searchTerm}"` : "Get started by adding your first product"}</p>
          <button className="btn-primary" onClick={() => {
            setEditingProduct(null)
            setFormData({ productName: '', price: '', description: '', status: 'active', categoryId: '', brandId: '', vehicleIds: [] })
            setImageFiles([])
            setImagePreview([])
            setShowModal(true)
          }}>
            <i className="bi bi-plus-lg"></i>
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.productId} className={selectedRows.includes(product.productId) ? 'selected' : ''}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(product.productId)}
                        onChange={() => handleSelectRow(product.productId)}
                      />
                    </td>
                    <td className="id-cell">#{product.productId}</td>
                    <td className="image-cell">
                      {product.primaryImage ? (
                        <img
                          src={`http://localhost:8080/api/files/download/${product.primaryImage}`}
                          alt={product.productName}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/60x60/e2e8f0/64748b?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">
                          <i className="bi bi-image"></i>
                        </div>
                      )}
                    </td>
                    <td className="product-cell">
                      <div className="product-name">{product.productName}</div>
                      <div className="product-id">SKU: #{product.productId}</div>
                    </td>
                    <td className="category-cell">
                      <span className="category-badge">
                        <i className="bi bi-tag"></i>
                        {product.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="brand-cell">
                      {product.brandName ? (
                        <span className="brand-badge">
                          <i className="bi bi-bookmark-star"></i>
                          {product.brandName}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="price-cell">
                      <span className="price">${parseFloat(product.price).toLocaleString()}</span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge status-${product.status}`}>
                        <span className="status-dot"></span>
                        {product.status === 'active' ? 'Active' : product.status === 'draft' ? 'Draft' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-col">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            setEditingProduct(product)
                            setFormData({
                              productName: product.productName,
                              price: product.price,
                              description: product.description || '',
                              status: product.status,
                              categoryId: product.categoryId,
                              brandId: product.brandId || '',
                              vehicleIds: product.vehicleIds || []
                            })
                            setImageFiles([])
                            setImagePreview([])
                            setShowModal(true)
                          }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(product.productId, product.productName)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <div className="pagination-info">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-box-seam"></i>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Brand</label>
                    <select
                      className="form-control"
                      value={formData.brandId}
                      onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                  />
                </div>
                <div className="form-group">
                  <label>Compatible Vehicles</label>
                  <select
                    multiple
                    className="form-control"
                    value={formData.vehicleIds}
                    onChange={(e) => setFormData({ ...formData, vehicleIds: Array.from(e.target.selectedOptions, o => o.value) })}
                    size="4"
                  >
                    {vehicles.map(vehicle => (
                      <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                        {vehicle.make} {vehicle.model} ({vehicle.yearFrom}-{vehicle.yearTo || 'Present'})
                      </option>
                    ))}
                  </select>
                  <small className="form-hint">Hold Ctrl/Cmd to select multiple vehicles</small>
                </div>
                <div className="form-group">
                  <label>Product Images</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="product-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="product-images" className="file-upload-label">
                      <i className="bi bi-cloud-upload"></i>
                      <span>Click to upload images</span>
                      <small>PNG, JPG up to 2MB (Multiple files allowed)</small>
                    </label>
                    {imagePreview.length > 0 && (
                      <div className="image-preview-grid">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div className="status-options">
                    <label className="status-option">
                      <input
                        type="radio"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span className="status-label active">
                        <i className="bi bi-check-circle"></i>
                        Active
                      </span>
                    </label>
                    <label className="status-option">
                      <input
                        type="radio"
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span className="status-label inactive">
                        <i className="bi bi-x-circle"></i>
                        Inactive
                      </span>
                    </label>
                    <label className="status-option">
                      <input
                        type="radio"
                        value="draft"
                        checked={formData.status === 'draft'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span className="status-label draft">
                        <i className="bi bi-pencil"></i>
                        Draft
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .products-page {
          padding: 24px;
          max-width: 2000px;
          margin: 0 auto;
        }

        /* Loading State */
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

        /* Toast Notification */
        .toast-notification {
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
        }

        .toast-success {
          background: #10b981;
          color: white;
        }

        .toast-danger {
          background: #ef4444;
          color: white;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon i {
          font-size: 28px;
          color: white;
        }

        .header-text h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1e293b;
        }

        .header-text p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
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

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-bulk-delete {
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

        .btn-bulk-delete:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
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

        .stat-card:hover {
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
        .stat-icon.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .stat-icon.info { background: linear-gradient(135deg, #3b82f6, #2563eb); }

        .stat-info h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .stat-info p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .stat-trend {
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

        .stat-trend.success { color: #10b981; }
        .stat-trend.danger { color: #ef4444; }

        /* Filters */
        .filters-card {
          background: white;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .filters-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 350px;
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
          padding: 10px 12px 10px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #667eea;
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
        }

        .filter-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-group select {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-clear {
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

        .btn-clear:hover {
          background: #e2e8f0;
        }

        /* Table Card */
        .table-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .table-responsive {
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th {
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

        .products-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .products-table tr:hover {
          background: #f8fafc;
        }

        .products-table tr.selected {
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
        }

        .actions-col {
          width: 100px;
        }

        .id-cell {
          font-weight: 600;
          color: #667eea;
        }

        /* Image Cell */
        .image-cell {
          width: 70px;
        }

        .product-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 10px;
        }

        .image-placeholder {
          width: 50px;
          height: 50px;
          background: #f1f5f9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        .image-placeholder i {
          font-size: 24px;
        }

        /* Product Cell */
        .product-cell {
          min-width: 200px;
        }

        .product-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .product-id {
          font-size: 11px;
          color: #94a3b8;
        }

        /* Category & Brand Badges */
        .category-badge, .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .category-badge {
          background: #dbeafe;
          color: #2563eb;
        }

        .brand-badge {
          background: #fef3c7;
          color: #d97706;
        }

        /* Price Cell */
        .price-cell {
          font-weight: 600;
        }

        .price {
          color: #059669;
          font-size: 15px;
        }

        /* Status Badge */
        .status-badge {
          padding: 6px 14px;
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

        .status-draft {
          background: #fef3c7;
          color: #d97706;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn.edit:hover {
          background: #eef2ff;
          color: #667eea;
          transform: scale(1.05);
        }

        .action-btn.delete:hover {
          background: #fef2f2;
          color: #ef4444;
          transform: scale(1.05);
        }

        /* Table Footer */
        .table-footer {
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
          text-align: right;
        }

        .pagination-info {
          font-size: 13px;
          color: #64748b;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
        }

        .empty-state i {
          font-size: 64px;
          color: #cbd5e1;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 24px;
        }

        /* Modal Styles */
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
        }

        .modal-container {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease;
        }

        .modal-lg {
          max-width: 800px;
        }

        @keyframes modalSlideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 24px 24px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 28px;
          color: white;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Form Styles */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
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
        }

        .form-control:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea.form-control {
          resize: vertical;
        }

        select.form-control {
          cursor: pointer;
        }

        .form-hint {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 6px;
          display: block;
        }

        /* File Upload */
        .file-upload-area {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
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

        .image-preview-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .image-preview-item {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
        }

        .remove-image {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 22px;
          height: 22px;
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

        /* Status Options */
        .status-options {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .status-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .status-option input {
          display: none;
        }

        .status-label {
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-label.active {
          background: #d1fae5;
          color: #059669;
        }

        .status-label.inactive {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-label.draft {
          background: #fef3c7;
          color: #d97706;
        }

        .status-option input:checked + .status-label {
          box-shadow: 0 0 0 2px white, 0 0 0 4px #667eea;
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
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .products-page {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .filter-group {
            justify-content: space-between;
          }

          .header-left {
            flex-direction: column;
            text-align: center;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .image-preview-grid {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Products