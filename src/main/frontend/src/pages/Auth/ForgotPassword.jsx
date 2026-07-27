import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../api/auth'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [timer, setTimer] = useState(0)

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await authService.sendOtp(email)
      setSuccess('OTP sent to your email! Please check your inbox.')
      setStep(2)
      let countdown = 60
      setTimer(countdown)
      const interval = setInterval(() => {
        countdown--
        setTimer(countdown)
        if (countdown <= 0) clearInterval(interval)
      }, 1000)
    } catch (err) {
      setError(err.response?.data || 'Failed to send OTP. Please check your email address.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setError('Please enter complete 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      await authService.verifyOtp(otpValue, email)
      setSuccess('OTP verified! You can now reset your password.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long!')
      setLoading(false)
      return
    }

    try {
      await authService.changePassword(email, newPassword, confirmPassword)
      setSuccess('Password changed successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (timer > 0) {
      setError(`Please wait ${timer} seconds before resending`)
      return
    }

    setLoading(true)
    setError('')
    try {
      await authService.sendOtp(email)
      setSuccess('New OTP sent to your email!')
      let countdown = 60
      setTimer(countdown)
      const interval = setInterval(() => {
        countdown--
        setTimer(countdown)
        if (countdown <= 0) clearInterval(interval)
      }, 1000)
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength] || 'Very Weak'
  const strengthColor = ['#ef4444', '#f59e0b', '#10b981', '#06ffa5'][passwordStrength] || '#ef4444'

  return (
    <div className="forgot-password-premium">
      {/* Background Image */}
      <div className="background-image"></div>
      <div className="background-overlay"></div>

      {/* Main Container */}
      <div className="main-container">
        <div className="forgot-card">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">
              <i className="bi bi-key-fill"></i>
            </div>
            <h1 className="logo-text">Forgot Password</h1>
            <p className="logo-subtitle">Recover your account access</p>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Email</div>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Verify</div>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Reset</div>
            </div>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="alert-success">
              <i className="bi bi-check-circle-fill"></i>
              <span>{success}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert-error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
              <button className="close-btn" onClick={() => setError('')}>×</button>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="forgot-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-group-custom">
                  <i className="bi bi-envelope"></i>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <p className="input-hint">We'll send a 6-digit verification code to your email</p>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="forgot-form">
              <div className="form-group">
                <label>Verification Code</label>
                <div className="otp-group">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="input-hint">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Verify Code
                  </>
                )}
              </button>

              <div className="resend-section">
                <button type="button" className="btn-resend" onClick={resendOtp} disabled={timer > 0}>
                  <i className="bi bi-arrow-repeat"></i>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password Form */}
          {step === 3 && (
            <form onSubmit={handleChangePassword} className="forgot-form">
              <div className="form-group">
                <label>New Password</label>
                <div className="input-group-custom">
                  <i className="bi bi-lock"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${(passwordStrength + 1) * 20}%`, background: strengthColor }}></div>
                    </div>
                    <span className="strength-text" style={{ color: strengthColor }}>{strengthText}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-group-custom">
                  <i className="bi bi-lock-fill"></i>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    Reset Password
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="back-link">
            <Link to="/login">
              <i className="bi bi-arrow-left"></i>
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .forgot-password-premium {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* Background Image */
        .background-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&h=1080&fit=crop');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: -2;
        }

        .background-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%);
          z-index: -1;
        }

        /* Main Container */
        .main-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          animation: fadeInUp 0.6s ease-out;
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

        /* Forgot Card */
        .forgot-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 32px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Logo Section */
        .logo-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
          }
        }

        .logo-icon i {
          font-size: 2rem;
          color: white;
        }

        .logo-text {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-subtitle {
          color: #6c757d;
          margin: 4px 0 0;
          font-size: 0.85rem;
        }

        /* Progress Steps */
        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          padding: 0 20px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .step-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        .step.active .step-label {
          color: #667eea;
          font-weight: 600;
        }

        .step-line {
          width: 40px;
          height: 2px;
          background: #e2e8f0;
          margin: 0 8px;
          transition: all 0.3s ease;
        }

        .step-line.active {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        /* Alerts */
        .alert-success, .alert-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          animation: slideIn 0.3s ease;
        }

        .alert-success {
          background: #d1fae5;
          color: #059669;
          border-left: 3px solid #10b981;
        }

        .alert-error {
          background: #fee2e2;
          color: #dc2626;
          border-left: 3px solid #ef4444;
        }

        .close-btn {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.6;
        }

        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Form Styles */
        .forgot-form {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 0.85rem;
          color: #1e293b;
        }

        .input-group-custom {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-group-custom i {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          font-size: 1rem;
        }

        .input-group-custom input {
          width: 100%;
          padding: 12px 40px 12px 42px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: white;
        }

        .input-group-custom input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .input-hint {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 6px;
        }

        /* OTP Input */
        .otp-group {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .otp-input {
          width: 48px;
          height: 52px;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 600;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
          background: white;
        }

        .otp-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Password Strength */
        .password-strength {
          margin-top: 8px;
        }

        .strength-bar {
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .strength-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .strength-text {
          font-size: 0.65rem;
        }

        /* Buttons */
        .btn-submit {
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
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .resend-section {
          text-align: center;
          margin-top: 20px;
        }

        .btn-resend {
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .btn-resend:hover:not(:disabled) {
          color: #764ba2;
          transform: translateX(2px);
        }

        .btn-resend:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Back Link */
        .back-link {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .back-link a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .back-link a:hover {
          color: #667eea;
          transform: translateX(-2px);
        }

        /* Responsive */
        @media (max-width: 576px) {
          .forgot-card {
            padding: 24px;
          }

          .logo-icon {
            width: 60px;
            height: 60px;
          }

          .logo-icon i {
            font-size: 1.5rem;
          }

          .logo-text {
            font-size: 1.5rem;
          }

          .otp-input {
            width: 40px;
            height: 46px;
            font-size: 1rem;
          }

          .step-line {
            width: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default ForgotPassword