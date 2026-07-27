import React, { useState, useEffect } from 'react'
import api from '../api/axios'

const Profile = () => {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState({ name: '', username: '', email: '', phone: '', address: '', role: '' })
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => { loadUserData() }, [])

  const loadUserData = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setFormData(userData)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.put(`/users/${user.userId}`, formData)
      setUser(response.data)
      localStorage.setItem('user', JSON.stringify(response.data))
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditing(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match!' })
      return
    }
    setLoading(true)
    try {
      await api.post(`/users/${user.userId}/change-password`, { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="fw-bold mb-1"><i className="bi bi-person-circle me-2 text-primary"></i>My Profile</h1>
        <p className="text-muted mb-0">Manage your account information</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3 mb-4`}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body text-center p-4">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '100px', height: '100px', fontSize: '3rem', fontWeight: 'bold' }}>
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <h4 className="fw-bold mb-1">{user.name || 'Admin User'}</h4>
              <p className="text-muted mb-3">{user.role || 'Administrator'}</p>
              <button className="btn btn-outline-primary rounded-pill w-100 mb-2" onClick={() => setEditing(!editing)}>
                <i className="bi bi-pencil me-2"></i>Edit Profile
              </button>
              <button className="btn btn-outline-warning rounded-pill w-100" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                <i className="bi bi-key me-2"></i>Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Profile Information</h5>
            </div>
            <div className="card-body p-4">
              {!editing ? (
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="text-muted small text-uppercase">Full Name</label><p className="fw-semibold mb-0">{user.name || 'Not set'}</p></div>
                  <div className="col-md-6 mb-3"><label className="text-muted small text-uppercase">Username</label><p className="fw-semibold mb-0">{user.username || 'Not set'}</p></div>
                  <div className="col-md-6 mb-3"><label className="text-muted small text-uppercase">Email</label><p className="fw-semibold mb-0">{user.email || 'Not set'}</p></div>
                  <div className="col-md-6 mb-3"><label className="text-muted small text-uppercase">Phone</label><p className="fw-semibold mb-0">{user.phone || 'Not set'}</p></div>
                  <div className="col-md-12 mb-3"><label className="text-muted small text-uppercase">Address</label><p className="fw-semibold mb-0">{user.address || 'Not set'}</p></div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control rounded-3" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Username</label><input type="text" className="form-control rounded-3" value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Email</label><input type="email" className="form-control rounded-3" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Phone</label><input type="tel" className="form-control rounded-3" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                    <div className="col-md-12 mb-3"><label className="form-label">Address</label><textarea className="form-control rounded-3" rows="2" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea></div>
                    <div className="col-12"><button type="submit" className="btn btn-primary rounded-pill px-4 me-2" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button><button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setEditing(false)}>Cancel</button></div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {showPasswordForm && (
            <div className="card border-0 shadow-sm rounded-4 mt-4">
              <div className="card-header bg-transparent border-0 pt-4 px-4"><h5 className="fw-bold mb-0">Change Password</h5></div>
              <div className="card-body p-4">
                <form onSubmit={handleChangePassword}>
                  <div className="mb-3"><label className="form-label">Current Password</label><input type="password" className="form-control rounded-3" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required /></div>
                  <div className="mb-3"><label className="form-label">New Password</label><input type="password" className="form-control rounded-3" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required /><small className="text-muted">Minimum 5 characters</small></div>
                  <div className="mb-3"><label className="form-label">Confirm Password</label><input type="password" className="form-control rounded-3" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required /></div>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 me-2" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowPasswordForm(false)}>Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile