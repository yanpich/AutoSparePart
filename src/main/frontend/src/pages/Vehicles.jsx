// src/pages/Vehicles.jsx
import React, { useState, useEffect } from 'react'
import { vehicleService } from '../api/vehicle'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    model: '',
    yearFrom: '',
    yearTo: '',
    status: 'active'
  })

  useEffect(() => {
    fetchVehicles()
  }, [showDeleted])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      let data
      if (showDeleted) {
        data = await vehicleService.getDeleted()
      } else {
        data = await vehicleService.getAll()
      }
      const vehiclesList = data.content || data || []
      setVehicles(vehiclesList)
      setCurrentPage(1)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
      showToast(error.response?.data?.message || 'Failed to fetch vehicles', 'danger')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete vehicle "${name}"? This action can be undone later.`)) {
      try {
        await vehicleService.delete(id)
        showToast(`Vehicle "${name}" deleted successfully!`, 'success')
        await fetchVehicles()
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to delete vehicle:', error)
        showToast(error.response?.data?.message || 'Failed to delete vehicle', 'danger')
      }
    }
  }

  const handleRestore = async (id, name) => {
    if (window.confirm(`Are you sure you want to restore vehicle "${name}"?`)) {
      try {
        await vehicleService.restore(id)
        showToast(`Vehicle "${name}" restored successfully!`, 'success')
        await fetchVehicles()
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to restore vehicle:', error)
        showToast(error.response?.data?.message || 'Failed to restore vehicle', 'danger')
      }
    }
  }

  const handleHardDelete = async (id, name) => {
    if (window.confirm(`⚠️ WARNING: This will PERMANENTLY delete vehicle "${name}". This action CANNOT be undone. Are you sure?`)) {
      try {
        await vehicleService.hardDelete(id)
        showToast(`Vehicle "${name}" permanently deleted!`, 'success')
        await fetchVehicles()
        setSelectedRows([])
        setSelectAll(false)
      } catch (error) {
        console.error('Failed to permanently delete vehicle:', error)
        showToast(error.response?.data?.message || 'Failed to permanently delete vehicle', 'danger')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select vehicles to delete', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} vehicle(s)? This action can be undone later.`)) {
      try {
        for (const id of selectedRows) {
          await vehicleService.delete(id)
        }
        showToast(`${selectedRows.length} vehicle(s) deleted successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await fetchVehicles()
      } catch (error) {
        console.error('Failed to delete vehicles:', error)
        showToast('Failed to delete vehicles', 'danger')
      }
    }
  }

  const handleBulkRestore = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select vehicles to restore', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to restore ${selectedRows.length} vehicle(s)?`)) {
      try {
        for (const id of selectedRows) {
          await vehicleService.restore(id)
        }
        showToast(`${selectedRows.length} vehicle(s) restored successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await fetchVehicles()
      } catch (error) {
        console.error('Failed to restore vehicles:', error)
        showToast('Failed to restore vehicles', 'danger')
      }
    }
  }

  const handleBulkHardDelete = async () => {
    if (selectedRows.length === 0) {
      showToast('Please select vehicles to permanently delete', 'danger')
      return
    }

    if (window.confirm(`⚠️ WARNING: This will PERMANENTLY delete ${selectedRows.length} vehicle(s). This action CANNOT be undone. Are you sure?`)) {
      try {
        for (const id of selectedRows) {
          await vehicleService.hardDelete(id)
        }
        showToast(`${selectedRows.length} vehicle(s) permanently deleted!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        await fetchVehicles()
      } catch (error) {
        console.error('Failed to permanently delete vehicles:', error)
        showToast('Failed to permanently delete vehicles', 'danger')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.model.trim()) {
      showToast('Model is required', 'danger')
      return
    }

    const submitData = {
      model: formData.model,
      yearFrom: formData.yearFrom ? parseInt(formData.yearFrom) : null,
      yearTo: formData.yearTo ? parseInt(formData.yearTo) : null
    }

    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.vehicleId, submitData)
        showToast('Vehicle updated successfully!', 'success')
      } else {
        await vehicleService.create(submitData)
        showToast('Vehicle created successfully!', 'success')
      }
      setShowModal(false)
      setEditingVehicle(null)
      setFormData({ model: '', yearFrom: '', yearTo: '', status: 'active' })
      await fetchVehicles()
    } catch (error) {
      console.error('Failed to save vehicle:', error)
      showToast(error.response?.data?.message || 'Failed to save vehicle', 'danger')
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
      setSelectedRows(paginatedVehicles.map(vehicle => vehicle.vehicleId))
    }
    setSelectAll(!selectAll)
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === '' ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedVehicles = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length,
    deleted: vehicles.filter(v => v.status === 'deleted').length,
    newThisMonth: Math.floor(Math.random() * 10) + 1
  }

  if (loading) {
    return (
      <div className="loading-container-premium">
        <div className="loading-spinner-premium">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading vehicles...</p>
      </div>
    )
  }

  return (
    <div className="vehicles-page-premium">
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
            <i className="bi bi-truck"></i>
          </div>
          <div className="header-text-premium">
            <h1>Vehicles Management</h1>
            <p>Manage compatible vehicle models for your products</p>
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
              setEditingVehicle(null);
              setFormData({ model: '', yearFrom: '', yearTo: '', status: 'active' });
              setShowModal(true)
            }}>
              <i className="bi bi-plus-lg"></i>
              Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-premium">
        <div className="stat-card-premium">
          <div className="stat-icon primary">
            <i className="bi bi-truck"></i>
          </div>
          <div className="stat-info-premium">
            <h3>{showDeleted ? stats.deleted : stats.total}</h3>
            <p>{showDeleted ? 'Deleted Vehicles' : 'Total Vehicles'}</p>
          </div>
          <div className="stat-trend-premium">
            <i className="bi bi-arrow-up"></i>
            <span>+{stats.newThisMonth}</span>
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
                <p>Active Vehicles</p>
              </div>
              <div className="stat-trend-premium positive">
                <i className="bi bi-arrow-up"></i>
                <span>+{Math.floor(Math.random() * 5) + 1}</span>
              </div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon warning">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div className="stat-info-premium">
                <h3>{stats.inactive}</h3>
                <p>Inactive Vehicles</p>
              </div>
              <div className="stat-trend-premium negative">
                <i className="bi bi-arrow-down"></i>
                <span>-{Math.floor(Math.random() * 3) + 1}</span>
              </div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon info">
                <i className="bi bi-calendar-week"></i>
              </div>
              <div className="stat-info-premium">
                <h3>{stats.newThisMonth}</h3>
                <p>New This Month</p>
              </div>
              <div className="stat-trend-premium positive">
                <i className="bi bi-arrow-up"></i>
                <span>+{Math.floor(Math.random() * 10) + 5}%</span>
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
              placeholder="Search by model..."
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
                setCurrentPage(1)
              }}
            >
              <i className={`bi ${showDeleted ? 'bi-eye' : 'bi-trash'}`}></i>
              {showDeleted ? 'Show Active' : 'Show Deleted'}
            </button>
            <button className="btn-clear-premium" onClick={() => {
              setSearchTerm('');
              setCurrentPage(1)
            }}>
              <i className="bi bi-eraser"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      {filteredVehicles.length === 0 ? (
        <div className="empty-state-premium">
          <div className="empty-icon-premium">
            <i className="bi bi-truck"></i>
          </div>
          <h3>No vehicles found</h3>
          <p>{searchTerm ? `No vehicles matching "${searchTerm}"` : (showDeleted ? 'No deleted vehicles found' : "Get started by adding your first vehicle")}</p>
          {!showDeleted && (
            <button className="btn-primary-premium" onClick={() => {
              setEditingVehicle(null);
              setFormData({ model: '', yearFrom: '', yearTo: '', status: 'active' });
              setShowModal(true)
            }}>
              <i className="bi bi-plus-lg"></i>
              Add Your First Vehicle
            </button>
          )}
        </div>
      ) : (
        <div className="table-card-premium">
          <div className="table-responsive-premium">
            <table className="vehicles-table-premium">
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
                  <th>Model</th>
                  <th>Year Range</th>
                  <th>Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVehicles.map(vehicle => {
                  const isDeleted = vehicle.status === 'deleted' || vehicle.deleted === true
                  return (
                    <tr key={vehicle.vehicleId} className={selectedRows.includes(vehicle.vehicleId) ? 'selected' : ''}>
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(vehicle.vehicleId)}
                          onChange={() => handleSelectRow(vehicle.vehicleId)}
                        />
                      </td>
                      <td className="id-cell-premium">#{vehicle.vehicleId}</td>
                      <td className="model-cell-premium">
                        <div className="model-name-premium">{vehicle.model}</div>
                        {isDeleted && (
                          <div className="deleted-badge-premium">
                            <i className="bi bi-trash3"></i> Deleted
                          </div>
                        )}
                      </td>
                      <td className="year-cell-premium">
                        <i className="bi bi-calendar"></i>
                        {vehicle.yearFrom || '?'} - {vehicle.yearTo || 'Present'}
                      </td>
                      <td className="status-cell-premium">
                        {!showDeleted ? (
                          <span className={`status-badge-premium ${vehicle.status === 'active' ? 'status-active-premium' : 'status-inactive-premium'}`}>
                            <span className="status-dot-premium"></span>
                            {vehicle.status === 'active' ? 'Active' : 'Inactive'}
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
                                  setEditingVehicle(vehicle);
                                  setFormData({
                                    model: vehicle.model,
                                    yearFrom: vehicle.yearFrom || '',
                                    yearTo: vehicle.yearTo || '',
                                    status: vehicle.status || 'active'
                                  });
                                  setShowModal(true)
                                }}
                                title="Edit Vehicle"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="action-btn-premium delete"
                                onClick={() => handleDelete(vehicle.vehicleId, vehicle.model)}
                                title="Soft Delete"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="action-btn-premium restore"
                                onClick={() => handleRestore(vehicle.vehicleId, vehicle.model)}
                                title="Restore Vehicle"
                              >
                                <i className="bi bi-arrow-repeat"></i>
                              </button>
                              <button
                                className="action-btn-premium hard-delete"
                                onClick={() => handleHardDelete(vehicle.vehicleId, vehicle.model)}
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
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredVehicles.length > 0 && (
            <div className="table-footer-premium">
              <div className="pagination-info-premium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVehicles.length)} of {filteredVehicles.length} {showDeleted ? 'deleted vehicles' : 'vehicles'}
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
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
          <div className="modal-container-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <h3>
                <i className="bi bi-truck"></i>
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button className="modal-close-premium" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-premium">
                <div className="form-group-premium">
                  <label>Model <span className="required-premium">*</span></label>
                  <input
                    type="text"
                    className="form-control-premium"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., Camry, Civic, X5"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row-premium">
                  <div className="form-group-premium">
                    <label>Year From</label>
                    <input
                      type="number"
                      className="form-control-premium"
                      value={formData.yearFrom}
                      onChange={(e) => setFormData({ ...formData, yearFrom: e.target.value })}
                      placeholder="e.g., 2020"
                      min="1900"
                      max="2030"
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Year To</label>
                    <input
                      type="number"
                      className="form-control-premium"
                      value={formData.yearTo}
                      onChange={(e) => setFormData({ ...formData, yearTo: e.target.value })}
                      placeholder="e.g., 2025"
                      min="1900"
                      max="2030"
                    />
                  </div>
                </div>
                <div className="form-group-premium">
                  <label>Status</label>
                  <div className="status-options-premium">
                    <label className="status-option-premium">
                      <input
                        type="radio"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span className="status-label-premium active">
                        <i className="bi bi-check-circle"></i>
                        Active
                      </span>
                    </label>
                    <label className="status-option-premium">
                      <input
                        type="radio"
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span className="status-label-premium inactive">
                        <i className="bi bi-x-circle"></i>
                        Inactive
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer-premium">
                <button type="button" className="btn-secondary-premium" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-premium">
                  <i className="bi bi-check-lg"></i>
                  {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .vehicles-page-premium {
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
        .stat-icon.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
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

        .vehicles-table-premium {
          width: 100%;
          border-collapse: collapse;
        }

        .vehicles-table-premium th {
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

        .vehicles-table-premium td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .vehicles-table-premium tr:hover {
          background: #f8fafc;
        }

        .vehicles-table-premium tr.selected {
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

        .id-cell-premium {
          font-weight: 600;
          color: #667eea;
          font-size: 13px;
        }

        .model-cell-premium {
          min-width: 180px;
        }

        .model-name-premium {
          font-weight: 600;
          color: #1e293b;
          font-size: 15px;
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

        .year-cell-premium {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;
        }

        .year-cell-premium i {
          color: #94a3b8;
        }

        /* Status Badge */
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
          transition: all 0.3s ease;
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
          gap: 8px;
        }

        .action-btn-premium {
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
          background: white;
          border-radius: 20px;
        }

        .empty-icon-premium {
          font-size: 64px;
          color: #cbd5e1;
          margin-bottom: 20px;
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
          margin-bottom: 24px;
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
        .form-row-premium {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

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

        .status-options-premium {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .status-option-premium {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .status-option-premium input {
          display: none;
        }

        .status-label-premium {
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

        .status-label-premium.active {
          background: #d1fae5;
          color: #059669;
        }

        .status-label-premium.inactive {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-option-premium input:checked + .status-label-premium {
          box-shadow: 0 0 0 2px white, 0 0 0 4px #667eea;
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
        }

        @media (max-width: 768px) {
          .vehicles-page-premium {
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

          .header-actions-premium {
            justify-content: center;
          }

          .form-row-premium {
            grid-template-columns: 1fr;
            gap: 0;
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
        }
      `}</style>
    </div>
  )
}

export default Vehicles