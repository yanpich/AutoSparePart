import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  // Car images slides
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&h=900&fit=crop",
      title: "Premium Auto Parts",
      subtitle: "Genuine parts for luxury vehicles",
      description: "Access our comprehensive catalog of premium automotive spare parts",
      features: ["OEM Quality", "Fast Delivery", "Expert Support"]
    },
    {
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1600&h=900&fit=crop",
      title: "Performance Excellence",
      subtitle: "Upgrade your driving experience",
      description: "High-performance parts for maximum efficiency and power",
      features: ["Racing Grade", "Certified Quality", "Performance Guaranteed"]
    },
    {
      image: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1600&h=900&fit=crop",
      title: "Smart Inventory",
      subtitle: "Real-time stock management",
      description: "Track, manage, and optimize your spare parts inventory",
      features: ["Live Tracking", "Auto Alerts", "Analytics Dashboard"]
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!password) {
      setError('Please enter your password')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password: password
      })

      if (response.data.accessToken || response.data.token) {
        const token = response.data.accessToken || response.data.token
        localStorage.setItem('token', token)

        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }

        const userData = {
          id: response.data.id || response.data.userId || 1,
          name: response.data.name || response.data.fullName || email.split('@')[0],
          fullName: response.data.fullName || response.data.name || email.split('@')[0],
          email: response.data.email || email,
          role: response.data.role || response.data.roleName || 'USER',
          roleName: response.data.roleName || response.data.role || 'USER'
        }

        localStorage.setItem('user', JSON.stringify(userData))
        navigate('/dashboard')
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password')
      } else if (err.response?.status === 403) {
        setError('Access forbidden. Account may be locked.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <div className="luxury-login">
      {/* Left Side - Car Image Slider */}
      <div className="image-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${currentSlide === index ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <div className="car-badge">
                  <i className="bi bi-car-front-fill"></i>
                  <span>AutoSparePart</span>
                </div>
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-subtitle">{slide.subtitle}</p>
                <p className="slide-description">{slide.description}</p>
                <div className="slide-features">
                  {slide.features.map((feature, idx) => (
                    <div key={idx} className="feature-chip">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <div className="slider-controls">
          <button
            className="slider-nav prev"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          <button
            className="slider-nav next"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="form-container">
          {/* Premium Mercedes-Inspired Logo */}
          <div className="premium-logo-container">
            <div className="premium-logo">
              <svg viewBox="0 0 100 100" className="mercedes-star">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="3"/>
                <line x1="50" y1="5" x2="50" y2="50" stroke="url(#logoGradient)" strokeWidth="2.5"/>
                <line x1="50" y1="50" x2="15" y2="80" stroke="url(#logoGradient)" strokeWidth="2.5"/>
                <line x1="50" y1="50" x2="85" y2="80" stroke="url(#logoGradient)" strokeWidth="2.5"/>
                <circle cx="50" cy="50" r="8" fill="url(#logoGradient)">
                  <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div className="premium-logo-text">
              <span className="logo-line">AUTO<span className="highlight">SPARE</span></span>
              <span className="logo-subtitle">PREMIUM AUTO PARTS</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="welcome-text">
            <h3>Welcome Back</h3>
            <p>Sign in to access your premium dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className={`input-group ${emailFocused || email ? 'focused' : ''}`}>
              <div className="input-icon">
                <i className="bi bi-envelope-fill"></i>
              </div>
              <div className="input-field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                />
                <label>Email Address</label>
              </div>
            </div>

            {/* Password Field */}
            <div className={`input-group ${passwordFocused || password ? 'focused' : ''}`}>
              <div className="input-icon">
                <i className="bi bi-lock-fill"></i>
              </div>
              <div className="input-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                />
                <label>Password</label>
                <button
                  type="button"
                  className="password-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            {/* Form Options */}
            <div className="form-options">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>



          {/* Footer */}
          <div className="form-footer">
            <p>© 2026 AutoSparePart. All rights reserved.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .luxury-login {
          display: flex;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        /* Left Side - Image Slider */
        .image-slider {
          flex: 1.2;
          position: relative;
          overflow: hidden;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }

        .slide.active {
          opacity: 1;
        }

        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slide-content {
          max-width: 550px;
          padding: 40px;
          color: white;
          animation: fadeInUp 0.8s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .car-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 40px;
          margin-bottom: 24px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .car-badge i {
          font-size: 1rem;
        }

        .slide-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .slide-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .slide-description {
          font-size: 0.95rem;
          opacity: 0.8;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .slide-features {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .feature-chip {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .feature-chip i {
          font-size: 0.7rem;
          color: #4ade80;
        }

        /* Slider Controls */
        .slider-controls {
          position: absolute;
          bottom: 40px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          z-index: 10;
        }

        .slider-nav {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slider-nav:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }

        .slider-dots {
          display: flex;
          gap: 10px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: white;
        }

        /* Right Side - Login Form */
        .login-form-section {
          flex: 0.8;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow-y: auto;
        }

        .form-container {
          width: 100%;
          max-width: 420px;
        }

        /* Premium Mercedes-Inspired Logo */
        .premium-logo-container {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
        }

        .premium-logo-container::before {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .premium-logo {
          display: inline-block;
          width: 70px;
          height: 70px;
          margin-bottom: 16px;
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .mercedes-star {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
        }

        .premium-logo-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .logo-line {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 3px;
          background: linear-gradient(135deg, #1e293b, #667eea);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-line .highlight {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-subtitle {
          font-size: 0.65rem;
          letter-spacing: 2px;
          color: #64748b;
          text-transform: uppercase;
        }

        /* Welcome Text */
        .welcome-text {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-text h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #1e293b, #334155);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .welcome-text p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }

        /* Error Alert */
        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fef2f2;
          border-left: 3px solid #ef4444;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .error-alert i {
          color: #ef4444;
        }

        .error-alert span {
          flex: 1;
          color: #dc2626;
          font-size: 0.85rem;
        }

        .error-alert button {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #9ca3af;
        }

        /* Login Form */
        .login-form {
          width: 100%;
        }

        /* Input Groups */
        .input-group {
          margin-bottom: 24px;
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1.1rem;
          z-index: 2;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .input-group.focused .input-icon {
          color: #667eea;
          transform: translateY(-50%) scale(1.05);
        }

        .input-field {
          position: relative;
          width: 100%;
        }

        .input-field input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          background: white;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-field input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .input-group.focused .input-field input {
          border-color: #667eea;
        }

        .input-field label {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          padding: 0 6px;
          color: #94a3b8;
          font-size: 1rem;
          transition: all 0.2s ease;
          pointer-events: none;
          border-radius: 4px;
        }

        .input-group.focused .input-field label,
        .input-field input:not(:placeholder-shown) + label {
          top: 0;
          font-size: 0.75rem;
          color: #667eea;
          transform: translateY(-50%);
        }

        .password-eye {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .password-eye:hover {
          color: #667eea;
        }

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #475569;
        }

        .checkbox input {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #cbd5e1;
          border-radius: 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .checkbox input:checked + .checkmark {
          background: #667eea;
          border-color: #667eea;
        }

        .checkbox input:checked + .checkmark::after {
          content: '✓';
          color: white;
          font-size: 11px;
        }

        .forgot-link {
          color: #667eea;
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.3s;
        }

        .forgot-link:hover {
          color: #764ba2;
        }

        /* Login Button */
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .login-btn:hover:not(:disabled)::before {
          width: 300px;
          height: 300px;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Demo Section */
        .demo-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .demo-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .demo-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .demo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .demo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .demo-card.admin .demo-icon {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .demo-card.user .demo-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .demo-info {
          flex: 1;
        }

        .demo-role {
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .demo-email {
          font-size: 0.65rem;
          color: #64748b;
        }

        .demo-badge {
          font-size: 0.6rem;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 600;
        }

        .demo-card.admin .demo-badge {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .demo-card.user .demo-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        /* Footer */
        .form-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .form-footer p {
          font-size: 0.7rem;
          color: #94a3b8;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .luxury-login {
            flex-direction: column;
          }

          .image-slider {
            min-height: 400px;
          }

          .slide-title {
            font-size: 2rem;
          }

          .premium-logo {
            width: 60px;
            height: 60px;
          }

          .logo-line {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .login-form-section {
            padding: 24px;
          }

          .demo-grid {
            grid-template-columns: 1fr;
          }

          .slide-content {
            padding: 24px;
          }

          .slide-title {
            font-size: 1.5rem;
          }

          .premium-logo {
            width: 50px;
            height: 50px;
          }

          .logo-line {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Login