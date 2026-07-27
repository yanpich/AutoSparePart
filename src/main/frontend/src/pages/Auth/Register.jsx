import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../api/auth'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return false
    }
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters long!')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address!')
      return false
    }
    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters long!')
      return false
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long!')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const registerData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      }

      const response = await authService.register(registerData)
      console.log('Registration successful:', response)

      setSuccess('Registration successful! Redirecting to login...')

      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.message ||
                          'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-5">
                {/* Logo Section */}
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3 d-inline-block mb-3">
                    <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
                  </div>
                  <h2 className="fw-bold mb-1">Create Account</h2>
                  <p className="text-muted mb-0">Join AutoSparePart today</p>
                </div>

                {/* Success Alert */}
                {success && (
                  <div className="alert alert-success alert-dismissible fade show rounded-3 mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-start-3">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        name="name"
                        className="form-control border-start-0 ps-2 rounded-end-3"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Username</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-start-3">
                        <i className="bi bi-at text-muted"></i>
                      </span>
                      <input
                        type="text"
                        name="username"
                        className="form-control border-start-0 ps-2 rounded-end-3"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-start-3">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control border-start-0 ps-2 rounded-end-3"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-start-3">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-control border-start-0 ps-2"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 rounded-end-3"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ backgroundColor: '#f8f9fa' }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    <small className="text-muted">Minimum 5 characters</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-start-3">
                        <i className="bi bi-lock-fill text-muted"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-control border-start-0 ps-2"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 rounded-end-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ backgroundColor: '#f8f9fa' }}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 rounded-pill fw-semibold mb-3"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Register
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                        Sign In
                      </Link>
                    </small>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-white-50">
                © 2026 AutoSparePart. All rights reserved.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register