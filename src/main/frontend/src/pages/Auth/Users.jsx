// src/pages/Auth/Users.jsx
import React, { useState, useEffect } from 'react'
import { userService } from '../../api/user'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [activityLog, setActivityLog] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [showDeleted, setShowDeleted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    role: 'USER',
    status: 'active',
    address: '',
    password: ''
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchUsers()
  }, [showDeleted])

  const showToastMessage = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let data
      if (showDeleted) {
        data = await userService.getDeleted()
      } else {
        data = await userService.getAll()
      }
      setUsers(data.content || data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      showToastMessage('Failed to fetch users', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      showToastMessage('Full name is required', 'danger')
      return
    }
    if (!formData.email.trim()) {
      showToastMessage('Email is required', 'danger')
      return
    }

    try {
      if (editingUser) {
        await userService.update(editingUser.userId, formData)
        showToastMessage('User updated successfully!', 'success')
      } else {
        await userService.create(formData)
        showToastMessage('User created successfully!', 'success')
      }
      setShowModal(false)
      resetForm()
      fetchUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
      showToastMessage(error.response?.data?.message || 'Failed to save user', 'danger')
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"? This action can be undone later.`)) {
      try {
        await userService.delete(id)
        showToastMessage(`User "${name}" deleted successfully!`, 'success')
        fetchUsers()
        setSelectedRows(selectedRows.filter(rowId => rowId !== id))
      } catch (error) {
        console.error('Failed to delete user:', error)
        showToastMessage('Failed to delete user', 'danger')
      }
    }
  }

  const handleRestore = async (id, name) => {
    if (window.confirm(`Are you sure you want to restore user "${name}"?`)) {
      try {
        await userService.restore(id)
        showToastMessage(`User "${name}" restored successfully!`, 'success')
        fetchUsers()
        setSelectedRows(selectedRows.filter(rowId => rowId !== id))
      } catch (error) {
        console.error('Failed to restore user:', error)
        showToastMessage('Failed to restore user', 'danger')
      }
    }
  }

  const handleHardDelete = async (id, name) => {
    if (window.confirm(`⚠️ WARNING: This will PERMANENTLY delete user "${name}". This action CANNOT be undone. Are you sure?`)) {
      try {
        await userService.hardDelete(id)
        showToastMessage(`User "${name}" permanently deleted!`, 'success')
        fetchUsers()
        setSelectedRows(selectedRows.filter(rowId => rowId !== id))
      } catch (error) {
        console.error('Failed to permanently delete user:', error)
        showToastMessage('Failed to permanently delete user', 'danger')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      showToastMessage('Please select users to delete', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} user(s)? This action can be undone later.`)) {
      try {
        for (const id of selectedRows) {
          await userService.delete(id)
        }
        showToastMessage(`${selectedRows.length} user(s) deleted successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        fetchUsers()
      } catch (error) {
        console.error('Failed to delete users:', error)
        showToastMessage('Failed to delete some users', 'danger')
      }
    }
  }

  const handleBulkRestore = async () => {
    if (selectedRows.length === 0) {
      showToastMessage('Please select users to restore', 'danger')
      return
    }

    if (window.confirm(`Are you sure you want to restore ${selectedRows.length} user(s)?`)) {
      try {
        for (const id of selectedRows) {
          await userService.restore(id)
        }
        showToastMessage(`${selectedRows.length} user(s) restored successfully!`, 'success')
        setSelectedRows([])
        setSelectAll(false)
        fetchUsers()
      } catch (error) {
        console.error('Failed to restore users:', error)
        showToastMessage('Failed to restore some users', 'danger')
      }
    }
  }

  const handleResetPassword = async () => {
    if (!passwordData.newPassword) {
      showToastMessage('Please enter a new password', 'danger')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToastMessage('Passwords do not match!', 'danger')
      return
    }
    if (passwordData.newPassword.length < 6) {
      showToastMessage('Password must be at least 6 characters!', 'danger')
      return
    }

    try {
      await userService.resetPassword(selectedUser.userId, passwordData.newPassword)
      setShowPasswordModal(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
      showToastMessage('Password reset successfully!', 'success')
    } catch (error) {
      console.error('Failed to reset password:', error)
      showToastMessage('Failed to reset password', 'danger')
    }
  }

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      await userService.changeStatus(id, newStatus)
      showToastMessage(`User status changed to ${newStatus}`, 'success')
      fetchUsers()
    } catch (error) {
      console.error('Failed to change status:', error)
      showToastMessage('Failed to change status', 'danger')
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      await userService.changeRole(id, newRole)
      showToastMessage(`User role changed to ${newRole}`, 'success')
      fetchUsers()
    } catch (error) {
      console.error('Failed to change role:', error)
      showToastMessage('Failed to change role', 'danger')
    }
  }

  const viewActivity = async (user) => {
    setSelectedUser(user)
    try {
      const activities = await userService.getActivity(user.userId)
      setActivityLog(activities || [])
      setShowActivityModal(true)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
      setActivityLog([])
      setShowActivityModal(true)
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      fullName: '',
      email: '',
      username: '',
      phone: '',
      role: 'USER',
      status: 'active',
      address: '',
      password: ''
    })
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      role: user.role || 'USER',
      status: user.status || 'active',
      address: user.address || '',
      password: ''
    })
    setShowModal(true)
  }

  const openPasswordModal = (user) => {
    setSelectedUser(user)
    setPasswordData({ newPassword: '', confirmPassword: '' })
    setShowPasswordModal(true)
  }

  const handleSelectRow = (userId) => {
    if (selectedRows.includes(userId)) {
      setSelectedRows(selectedRows.filter(id => id !== userId))
    } else {
      setSelectedRows([...selectedRows, userId])
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedUsers.map(user => user.userId))
    }
    setSelectAll(!selectAll)
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    deleted: users.filter(u => u.status === 'deleted').length
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-modern">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="users-management-modern">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-modern toast-${toast.type}`}>
          <i className={`bi bi-${toast.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>×</button>
        </div>
      )}

      {/* Header Section */}
      <div className="page-header-modern">
        <div className="header-left-modern">
          <div className="header-icon-modern">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="header-text-modern">
            <h1>User Management</h1>
            <p>Manage system users, roles, and permissions</p>
          </div>
        </div>
        <div className="header-actions-modern">
          {selectedRows.length > 0 && (
            <>
              {!showDeleted ? (
                <button className="btn-bulk-delete-modern" onClick={handleBulkDelete}>
                  <i className="bi bi-trash3"></i>
                  Delete Selected ({selectedRows.length})
                </button>
              ) : (
                <button className="btn-bulk-restore-modern" onClick={handleBulkRestore}>
                  <i className="bi bi-arrow-repeat"></i>
                  Restore Selected ({selectedRows.length})
                </button>
              )}
            </>
          )}
          {!showDeleted && (
            <button className="btn-primary-modern" onClick={() => { resetForm(); setShowModal(true); }}>
              <i className="bi bi-plus-lg"></i>
              Add New User
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-modern">
        <div className="stat-card-modern">
          <div className="stat-icon primary">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info-modern">
            <h3>{showDeleted ? stats.deleted : stats.total}</h3>
            <p>{showDeleted ? 'Deleted Users' : 'Total Users'}</p>
          </div>
          <div className="stat-trend-modern">
            <i className="bi bi-graph-up"></i>
            <span>+12%</span>
          </div>
        </div>
        {!showDeleted && (
          <>
            <div className="stat-card-modern">
              <div className="stat-icon success">
                <i className="bi bi-person-check-fill"></i>
              </div>
              <div className="stat-info-modern">
                <h3>{stats.active}</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-trend-modern positive">
                <i className="bi bi-graph-up"></i>
                <span>+8%</span>
              </div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-icon warning">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div className="stat-info-modern">
                <h3>{stats.admin}</h3>
                <p>Administrators</p>
              </div>
              <div className="stat-trend-modern neutral">
                <i className="bi bi-dash-circle"></i>
                <span>0%</span>
              </div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-icon danger">
                <i className="bi bi-person-x-fill"></i>
              </div>
              <div className="stat-info-modern">
                <h3>{stats.inactive}</h3>
                <p>Inactive Users</p>
              </div>
              <div className="stat-trend-modern negative">
                <i className="bi bi-graph-down"></i>
                <span>-5%</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="filters-card-modern">
        <div className="filters-row-modern">
          <div className="search-box-modern">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear-modern" onClick={() => setSearchTerm('')}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          <div className="filter-group-modern">
            <button
              className={`btn-toggle-deleted-modern ${showDeleted ? 'active' : ''}`}
              onClick={() => {
                setShowDeleted(!showDeleted)
                setSelectedRows([])
                setSelectAll(false)
                setSearchTerm('')
                setRoleFilter('')
                setStatusFilter('')
                setCurrentPage(1)
              }}
            >
              <i className={`bi ${showDeleted ? 'bi-eye' : 'bi-trash'}`}></i>
              {showDeleted ? 'Show Active Users' : 'Show Deleted Users'}
            </button>
            {!showDeleted && (
              <>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="ADMIN">👑 Administrator</option>
                  <option value="USER">👤 User</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="active">✅ Active</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
              </>
            )}
            <button className="btn-clear-modern" onClick={() => { setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); setCurrentPage(1); }}>
              <i className="bi bi-eraser"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card-modern">
        <div className="table-responsive-modern">
          <table className="users-table-modern">
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
                <th>User</th>
                <th>Contact Information</th>
                <th>Role</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state-modern">
                    <div className="empty-icon-modern">
                      <i className="bi bi-inbox"></i>
                    </div>
                    <h3>{showDeleted ? 'No deleted users found' : 'No users found'}</h3>
                    <p>{showDeleted ? 'There are no deleted users to display.' : 'Get started by adding your first user'}</p>
                    {!showDeleted && (
                      <button className="btn-primary-modern" onClick={() => { resetForm(); setShowModal(true); }}>
                        <i className="bi bi-plus-lg"></i>
                        Add Your First User
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.userId} className={selectedRows.includes(user.userId) ? 'selected' : ''}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(user.userId)}
                        onChange={() => handleSelectRow(user.userId)}
                      />
                    </td>
                    <td className="user-id-modern">#{user.userId}</td>
                    <td>
                      <div className="user-cell-modern">
                        <div className="user-avatar-modern">
                          {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details-modern">
                          <div className="user-name-modern">{user.fullName || 'Unknown'}</div>
                          <div className="user-joined-modern">
                            <i className="bi bi-calendar3"></i>
                            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell-modern">
                        <div className="contact-email-modern">
                          <i className="bi bi-envelope"></i>
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                        </div>
                        {user.phone && (
                          <div className="contact-phone-modern">
                            <i className="bi bi-telephone"></i>
                            <a href={`tel:${user.phone}`}>{user.phone}</a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        className={`role-badge-modern ${user.role === 'ADMIN' ? 'role-admin-modern' : 'role-user-modern'}`}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                        disabled={showDeleted || user.status === 'deleted'}
                      >
                        <option value="USER">👤 User</option>
                        <option value="ADMIN">👑 Admin</option>
                      </select>
                    </td>
                    <td>
                      {!showDeleted ? (
                        <button
                          className={`status-badge-modern ${user.status === 'active' ? 'status-active-modern' : 'status-inactive-modern'}`}
                          onClick={() => handleStatusChange(user.userId, user.status)}
                        >
                          <span className="status-dot-modern"></span>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      ) : (
                        <span className="status-badge-modern status-deleted-modern">
                          <span className="status-dot-modern"></span>
                          Deleted
                        </span>
                      )}
                    </td>
                    <td className="actions-col">
                      <div className="action-buttons-modern">
                        {!showDeleted ? (
                          <>
                            <button className="action-btn-modern view" onClick={() => viewActivity(user)} title="View Activity">
                              <i className="bi bi-activity"></i>
                            </button>
                            <button className="action-btn-modern edit" onClick={() => openEditModal(user)} title="Edit User">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="action-btn-modern key" onClick={() => openPasswordModal(user)} title="Reset Password">
                              <i className="bi bi-key"></i>
                            </button>
                            <button className="action-btn-modern delete" onClick={() => handleDelete(user.userId, user.fullName)} title="Soft Delete">
                              <i className="bi bi-trash3"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn-modern restore" onClick={() => handleRestore(user.userId, user.fullName)} title="Restore User">
                              <i className="bi bi-arrow-repeat"></i>
                            </button>
                            <button className="action-btn-modern hard-delete" onClick={() => handleHardDelete(user.userId, user.fullName)} title="Permanently Delete">
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

          {/* Pagination */}
          {filteredUsers.length > 0 && totalPages > 1 && (
            <div className="pagination-modern">
              <button
                className="page-btn-modern"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`page-btn-modern ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="page-btn-modern"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}

          <div className="table-footer-modern">
            <div className="pagination-info-modern">
              Showing {filteredUsers.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} {showDeleted ? 'deleted users' : 'users'}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay-modern" onClick={() => setShowModal(false)}>
          <div className="modal-container-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3>
                <i className="bi bi-person"></i>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button className="modal-close-modern" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-modern">
                <div className="form-group-modern">
                  <label>Full Name <span className="required-modern">*</span></label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter full name"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group-modern">
                  <label>Email Address <span className="required-modern">*</span></label>
                  <input
                    type="email"
                    className="form-control-modern"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="form-row-modern">
                  <div className="form-group-modern">
                    <label>Username</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="username"
                    />
                    <small className="form-hint-modern">Leave empty to auto-generate</small>
                  </div>
                  <div className="form-group-modern">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-control-modern"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                {!editingUser && (
                  <div className="form-group-modern">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control-modern"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>
                )}
                <div className="form-row-modern">
                  <div className="form-group-modern">
                    <label>Role</label>
                    <select
                      className="form-control-modern"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="USER">👤 User</option>
                      <option value="ADMIN">👑 Administrator</option>
                    </select>
                  </div>
                  <div className="form-group-modern">
                    <label>Status</label>
                    <select
                      className="form-control-modern"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">✅ Active</option>
                      <option value="inactive">❌ Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-group-modern">
                  <label>Address</label>
                  <textarea
                    className="form-control-modern"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="modal-footer-modern">
                <button type="button" className="btn-secondary-modern" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-modern">
                  <i className="bi bi-check-lg"></i>
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay-modern" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-container-modern modal-sm-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern warning">
              <h3><i className="bi bi-key"></i> Reset Password</h3>
              <button className="modal-close-modern" onClick={() => setShowPasswordModal(false)}>&times;</button>
            </div>
            <div className="modal-body-modern">
              <p>Reset password for: <strong>{selectedUser?.fullName}</strong></p>
              <div className="form-group-modern">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control-modern"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Minimum 6 characters"
                  autoFocus
                />
              </div>
              <div className="form-group-modern">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control-modern"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
            <div className="modal-footer-modern">
              <button type="button" className="btn-secondary-modern" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button type="button" className="btn-warning-modern" onClick={handleResetPassword}>
                <i className="bi bi-shield-check"></i>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="modal-overlay-modern" onClick={() => setShowActivityModal(false)}>
          <div className="modal-container-modern modal-lg-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern info">
              <h3><i className="bi bi-clock-history"></i> Activity Log - {selectedUser?.fullName}</h3>
              <button className="modal-close-modern" onClick={() => setShowActivityModal(false)}>&times;</button>
            </div>
            <div className="modal-body-modern">
              {activityLog.length === 0 ? (
                <div className="empty-activity-modern">
                  <i className="bi bi-inbox"></i>
                  <p>No activity recorded for this user</p>
                </div>
              ) : (
                <div className="activity-timeline-modern">
                  {activityLog.map((activity, index) => (
                    <div key={index} className="timeline-item-modern">
                      <div className="timeline-icon-modern">
                        <div className="timeline-dot-modern"></div>
                      </div>
                      <div className="timeline-content-modern">
                        <div className="timeline-title-modern">{activity.action}</div>
                        <div className="timeline-meta-modern">
                          <span><i className="bi bi-globe2"></i> {activity.ipAddress || 'Unknown IP'}</span>
                          <span><i className="bi bi-clock"></i> {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A'}</span>
                        </div>
                        {activity.userAgent && (
                          <div className="timeline-detail-modern">{activity.userAgent.substring(0, 100)}...</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer-modern">
              <button type="button" className="btn-secondary-modern" onClick={() => setShowActivityModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .users-management-modern {
          padding: 24px;
          max-width: 1600px;
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

        .loading-spinner-modern {
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

        /* Toast Notification */
        .toast-modern {
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
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Page Header */
        .page-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left-modern {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon-modern {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon-modern i {
          font-size: 28px;
          color: white;
        }

        .header-text-modern h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1e293b;
        }

        .header-text-modern p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .header-actions-modern {
          display: flex;
          gap: 12px;
        }

        .btn-primary-modern {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-primary-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-bulk-delete-modern {
          padding: 10px 20px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-bulk-delete-modern:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .btn-bulk-restore-modern {
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-bulk-restore-modern:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .btn-toggle-deleted-modern {
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

        .btn-toggle-deleted-modern.active {
          background: #ef4444;
          color: white;
        }

        /* Stats Grid */
        .stats-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card-modern {
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

        .stat-card-modern:hover {
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
        .stat-icon.danger { background: linear-gradient(135deg, #ef4444, #dc2626); }

        .stat-info-modern h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .stat-info-modern p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .stat-trend-modern {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-trend-modern.positive { color: #10b981; }
        .stat-trend-modern.neutral { color: #94a3b8; }
        .stat-trend-modern.negative { color: #ef4444; }

        /* Filters Card */
        .filters-card-modern {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .filters-row-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box-modern {
          position: relative;
          flex: 1;
          max-width: 350px;
        }

        .search-box-modern i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box-modern input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-box-modern input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-clear-modern {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .filter-group-modern {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group-modern select {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-clear-modern {
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

        .btn-clear-modern:hover {
          background: #e2e8f0;
        }

        /* Table Card */
        .table-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .table-responsive-modern {
          overflow-x: auto;
        }

        .users-table-modern {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table-modern th {
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

        .users-table-modern td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .users-table-modern tr:hover {
          background: #f8fafc;
        }

        .users-table-modern tr.selected {
          background: #eef2ff;
        }

        /* User Row Styles */
        .user-id-modern {
          font-weight: 600;
          color: #667eea;
          font-size: 13px;
        }

        .user-cell-modern {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar-modern {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }

        .user-details-modern .user-name-modern {
          font-weight: 600;
          margin-bottom: 4px;
          color: #1e293b;
        }

        .user-joined-modern {
          font-size: 11px;
          color: #94a3b8;
        }

        .user-joined-modern i {
          font-size: 10px;
          margin-right: 4px;
        }

        /* Contact Cell */
        .contact-cell-modern {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-email-modern,
        .contact-phone-modern {
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .contact-email-modern a,
        .contact-phone-modern a {
          color: #1e293b;
          text-decoration: none;
        }

        .contact-email-modern a:hover,
        .contact-phone-modern a:hover {
          color: #667eea;
        }

        /* Role Badge */
        .role-badge-modern {
          padding: 6px 12px;
          border-radius: 20px;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .role-admin-modern {
          background: #fef3c7;
          color: #d97706;
        }

        .role-user-modern {
          background: #dbeafe;
          color: #2563eb;
        }

        /* Status Badge */
        .status-badge-modern {
          padding: 6px 14px;
          border-radius: 20px;
          border: none;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .status-active-modern {
          background: #d1fae5;
          color: #059669;
        }

        .status-inactive-modern {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-deleted-modern {
          background: #e2e8f0;
          color: #64748b;
        }

        .status-dot-modern {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Action Buttons */
        .action-buttons-modern {
          display: flex;
          gap: 8px;
        }

        .action-btn-modern {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
          font-size: 14px;
        }

        .action-btn-modern:hover {
          background: #f1f5f9;
          transform: scale(1.05);
        }

        .action-btn-modern.view:hover { color: #3b82f6; background: #eff6ff; }
        .action-btn-modern.edit:hover { color: #667eea; background: #eef2ff; }
        .action-btn-modern.key:hover { color: #f59e0b; background: #fffbeb; }
        .action-btn-modern.delete:hover { color: #ef4444; background: #fef2f2; }
        .action-btn-modern.restore:hover { color: #10b981; background: #d1fae5; }
        .action-btn-modern.hard-delete:hover { color: #dc2626; background: #fee2e2; }

        /* Pagination */
        .pagination-modern {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
        }

        .page-btn-modern {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .page-btn-modern:hover:not(:disabled) {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .page-btn-modern.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .page-btn-modern:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .table-footer-modern {
          padding: 12px 20px;
          border-top: 1px solid #e2e8f0;
          text-align: right;
        }

        .pagination-info-modern {
          font-size: 13px;
          color: #64748b;
        }

        /* Empty State */
        .empty-state-modern {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon-modern {
          font-size: 48px;
          color: #cbd5e1;
          margin-bottom: 16px;
        }

        .empty-state-modern h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: #1e293b;
        }

        .empty-state-modern p {
          color: #64748b;
          margin-bottom: 20px;
        }

        /* Modal Styles */
        .modal-overlay-modern {
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

        .modal-container-modern {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease;
        }

        .modal-sm-modern { max-width: 400px; }
        .modal-lg-modern { max-width: 700px; }

        @keyframes modalSlideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header-modern {
          padding: 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 24px 24px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header-modern.warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .modal-header-modern.info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .modal-header-modern h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-close-modern {
          background: transparent;
          border: none;
          font-size: 28px;
          color: white;
          cursor: pointer;
          line-height: 1;
          opacity: 0.7;
          transition: opacity 0.3s;
        }

        .modal-close-modern:hover {
          opacity: 1;
        }

        .modal-body-modern {
          padding: 24px;
        }

        .modal-footer-modern {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-secondary-modern {
          padding: 10px 20px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary-modern:hover {
          background: #e2e8f0;
        }

        .btn-warning-modern {
          padding: 10px 20px;
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-warning-modern:hover {
          background: #d97706;
        }

        /* Form Styles */
        .form-group-modern {
          margin-bottom: 20px;
        }

        .form-group-modern label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
          color: #1e293b;
        }

        .required-modern {
          color: #ef4444;
        }

        .form-control-modern {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-control-modern:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea.form-control-modern {
          resize: vertical;
        }

        .form-hint-modern {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
          display: block;
        }

        .form-row-modern {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Activity Timeline */
        .activity-timeline-modern {
          max-height: 500px;
          overflow-y: auto;
        }

        .timeline-item-modern {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .timeline-item-modern:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .timeline-icon-modern {
          flex-shrink: 0;
        }

        .timeline-dot-modern {
          width: 10px;
          height: 10px;
          background: #667eea;
          border-radius: 50%;
          margin-top: 6px;
        }

        .timeline-content-modern {
          flex: 1;
        }

        .timeline-title-modern {
          font-weight: 600;
          margin-bottom: 6px;
          color: #1e293b;
        }

        .timeline-meta-modern {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #94a3b8;
        }

        .timeline-detail-modern {
          font-size: 11px;
          color: #64748b;
          margin-top: 8px;
        }

        .empty-activity-modern {
          text-align: center;
          padding: 40px;
        }

        .empty-activity-modern i {
          font-size: 48px;
          color: #cbd5e1;
          margin-bottom: 16px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid-modern {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .users-management-modern {
            padding: 16px;
          }

          .stats-grid-modern {
            grid-template-columns: 1fr;
          }

          .filters-row-modern {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box-modern {
            max-width: none;
          }

          .filter-group-modern {
            flex-wrap: wrap;
          }

          .header-left-modern {
            flex-direction: column;
            text-align: center;
          }

          .header-actions-modern {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .form-row-modern {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .actions-col {
            width: auto;
          }

          .action-buttons-modern {
            flex-wrap: wrap;
            justify-content: center;
          }

          .pagination-modern {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}

export default Users