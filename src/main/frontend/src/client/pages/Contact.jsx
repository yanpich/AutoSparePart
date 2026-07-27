// src/client/pages/Contact.jsx
import React, { useState, useEffect, useRef } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email'
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [activeFaq, setActiveFaq] = useState(null)
  const formRef = useRef(null)

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^[\d\s\-+()]{8,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    } else if (formData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    // Simulate API call - Replace with actual API endpoint
    try {
      // Uncomment to use EmailJS
      // await emailjs.sendForm(
      //   'YOUR_SERVICE_ID',
      //   'YOUR_TEMPLATE_ID',
      //   formRef.current,
      //   'YOUR_PUBLIC_KEY'
      // )

      await new Promise(resolve => setTimeout(resolve, 1500))

      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email'
      })

      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Visit Us',
      content: '123 Auto Parts Street, Phnom Penh, Cambodia',
      details: 'Monday - Saturday, 9:00 AM - 6:00 PM',
      link: 'https://maps.google.com',
      color: '#e63946'
    },
    {
      icon: 'fas fa-phone-alt',
      title: 'Call Us',
      content: '(+855) 93 999 452',
      details: '24/7 Customer Support',
      link: 'tel:+85593999452',
      color: '#10b981'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email Us',
      content: 'support@autohive.com',
      details: 'Response within 24 hours',
      link: 'mailto:support@autohive.com',
      color: '#3b82f6'
    },
    {
      icon: 'fab fa-whatsapp',
      title: 'WhatsApp',
      content: '(+855) 93 999 452',
      details: 'Instant messaging support',
      link: 'https://wa.me/85593999452',
      color: '#25D366'
    }
  ]

  const faqs = [
    {
      q: 'How long does shipping take?',
      a: 'Standard shipping takes 3-5 business days within Cambodia. Express shipping is available for 1-2 business days. International shipping times vary by location.',
      icon: 'fas fa-truck'
    },
    {
      q: 'Do you offer international shipping?',
      a: 'Yes, we ship to most countries worldwide. Shipping costs are calculated at checkout based on your location and order weight. We offer tracked shipping for all international orders.',
      icon: 'fas fa-globe'
    },
    {
      q: 'What is your return policy?',
      a: 'We offer a 30-day return policy for unused items in original packaging. Return shipping is free for defective items. Please contact our support team to initiate a return.',
      icon: 'fas fa-undo-alt'
    },
    {
      q: 'Are your parts OEM quality?',
      a: 'Yes, all our parts meet or exceed OEM specifications. We source from certified manufacturers and conduct quality checks on all products before shipping.',
      icon: 'fas fa-certificate'
    },
    {
      q: 'Do you offer warranty on products?',
      a: 'Most products come with a 1-year manufacturer warranty. Premium brands offer extended warranties up to 3 years. Warranty details are provided on each product page.',
      icon: 'fas fa-shield-alt'
    },
    {
      q: 'How can I track my order?',
      a: 'Once your order ships, you will receive a tracking number via email. You can also track your order from your account dashboard under "My Orders".',
      icon: 'fas fa-map-marked-alt'
    }
  ]

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="page-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Contact Us</h1>
            <p>We're here to help and answer any questions you might have</p>
            <div className="hero-badge">
              <i className="fas fa-headset"></i>
              <span>24/7 Support Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <a
              key={index}
              href={info.link}
              target={info.link.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="contact-card"
              style={{ '--hover-color': info.color }}
            >
              <div className="card-icon">
                <i className={info.icon}></i>
              </div>
              <div className="card-content">
                <h3>{info.title}</h3>
                <p className="contact-value">{info.content}</p>
                <span className="contact-detail">{info.details}</span>
              </div>
              <div className="card-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </a>
          ))}
        </div>

        {/* Contact Form & Map Section */}
        <div className="contact-main-wrapper">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-header">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            {submitted && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <div>
                  <strong>Message Sent Successfully!</strong>
                  <p>Thank you for reaching out. We'll get back to you shortly.</p>
                </div>
                <button onClick={() => setSubmitted(false)} className="close-btn">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className={`form-group ${focusedField === 'name' ? 'focused' : ''} ${formErrors.name ? 'error' : ''}`}>
                  <label>
                    <i className="fas fa-user"></i>
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="John Doe"
                    required
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${formErrors.email ? 'error' : ''}`}>
                  <label>
                    <i className="fas fa-envelope"></i>
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="john@example.com"
                    required
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className={`form-group ${focusedField === 'phone' ? 'focused' : ''}`}>
                  <label>
                    <i className="fas fa-phone"></i>
                    <span>Phone Number (Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+855 93 999 452"
                  />
                </div>

                <div className={`form-group ${focusedField === 'subject' ? 'focused' : ''}`}>
                  <label>
                    <i className="fas fa-tag"></i>
                    <span>Subject</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="What is this regarding?"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Preferred Contact Method</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={handleChange}
                    />
                    <span><i className="fas fa-envelope"></i> Email</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formData.preferredContact === 'phone'}
                      onChange={handleChange}
                    />
                    <span><i className="fas fa-phone"></i> Phone</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="whatsapp"
                      checked={formData.preferredContact === 'whatsapp'}
                      onChange={handleChange}
                    />
                    <span><i className="fab fa-whatsapp"></i> WhatsApp</span>
                  </label>
                </div>
              </div>

              <div className={`form-group ${focusedField === 'message' ? 'focused' : ''} ${formErrors.message ? 'error' : ''}`}>
                <label>
                  <i className="fas fa-comment"></i>
                  <span>Message *</span>
                </label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Please describe your inquiry in detail..."
                  required
                ></textarea>
                {formErrors.message && <span className="error-message">{formErrors.message}</span>}
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message <i className="fas fa-paper-plane"></i>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <div className="map-header">
              <h3>
                <i className="fas fa-map-marker-alt"></i>
                Find Us Here
              </h3>
              <p>Visit our showroom in Phnom Penh</p>
            </div>
            <div className="map-container">
              <iframe
                title="Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.0147199999997!2d104.892894!3d11.556374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109516bdeadc6d1%3A0x3f4a5a5a5a5a5a5a!2sPhnom%20Penh!5e0!3m2!1sen!2skh!4v1234567890123!5m2!1sen!2skh"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
              <div className="map-overlay">
                <div className="address-info">
                  <i className="fas fa-location-dot"></i>
                  <span>123 Auto Parts Street, Phnom Penh, Cambodia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Find quick answers to common questions</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <div className="faq-icon">
                    <i className={faq.icon}></i>
                  </div>
                  <h4>{faq.q}</h4>
                  <i className={`fas fa-chevron-${activeFaq === index ? 'up' : 'down'} faq-toggle`}></i>
                </div>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours & Support */}
        <div className="support-banner">
          <div className="support-content">
            <div className="support-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="support-text">
              <h3>Need Immediate Assistance?</h3>
              <p>Our support team is available 24/7 to help you</p>
            </div>
            <div className="support-buttons">
              <button className="btn-chat" onClick={() => window.open('https://wa.me/85593999452')}>
                <i className="fas fa-comment"></i> Live Chat
              </button>
              <button className="btn-callback" onClick={() => window.location.href = 'tel:+85593999452'}>
                <i className="fas fa-phone"></i> Call Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page {
          background: var(--light);
        }

        /* Hero Section */
        .page-hero {
          background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
          color: white;
          padding: 80px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .page-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .page-hero h1 {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .page-hero p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.85rem;
        }

        /* Contact Info Grid */
        .contact-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin: -40px 0 60px;
          position: relative;
          z-index: 2;
        }

        .contact-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .contact-card::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--hover-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .contact-card:hover::before {
          transform: scaleX(1);
        }

        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: rgba(230, 57, 70, 0.1);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-icon i {
          font-size: 1.5rem;
          color: var(--hover-color);
        }

        .card-content h3 {
          font-size: 1rem;
          margin-bottom: 4px;
          color: #1e293b;
        }

        .contact-value {
          font-weight: 600;
          color: #334155;
          margin-bottom: 4px;
        }

        .contact-detail {
          font-size: 0.75rem;
          color: #64748b;
        }

        .card-arrow {
          margin-left: auto;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }

        .contact-card:hover .card-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Contact Main Wrapper */
        .contact-main-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        /* Form Section */
        .contact-form-section {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        .form-header {
          margin-bottom: 30px;
        }

        .form-header h2 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #64748b;
        }

        /* Form Styles */
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          font-size: 0.85rem;
          color: #1e293b;
        }

        .form-group label i {
          color: #e63946;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #e63946;
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
        }

        .form-group.focused label {
          color: #e63946;
        }

        .form-group.error input,
        .form-group.error textarea {
          border-color: #ef4444;
        }

        .error-message {
          font-size: 0.7rem;
          color: #ef4444;
        }

        /* Radio Group */
        .radio-group {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .radio-option input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #e63946;
        }

        .radio-option span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
        }

        /* Submit Button */
        .btn-submit {
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 1rem;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(230, 57, 70, 0.3);
        }

        .btn-submit:disabled {
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

        /* Success Message */
        .success-message {
          background: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .success-message i {
          font-size: 1.5rem;
          color: #10b981;
        }

        .success-message strong {
          display: block;
          color: #059669;
        }

        .success-message p {
          font-size: 0.8rem;
          color: #059669;
          margin: 0;
        }

        .close-btn {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          color: #059669;
        }

        /* Map Section */
        .map-section {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        .map-header {
          padding: 24px 24px 0;
        }

        .map-header h3 {
          font-size: 1.3rem;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .map-header p {
          color: #64748b;
          font-size: 0.85rem;
        }

        .map-container {
          position: relative;
        }

        .map-overlay {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 12px 20px;
          border-radius: 12px;
        }

        .address-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 0.85rem;
        }

        /* FAQ Section */
        .faq-section {
          margin: 60px 0;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .faq-header h2 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .faq-header p {
          color: #64748b;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .faq-item {
          background: white;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .faq-item:hover {
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .faq-question {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .faq-icon {
          width: 40px;
          height: 40px;
          background: rgba(230, 57, 70, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faq-icon i {
          color: #e63946;
        }

        .faq-question h4 {
          flex: 1;
          font-size: 1rem;
        }

        .faq-toggle {
          color: #64748b;
          transition: transform 0.3s ease;
        }

        .faq-item.active .faq-toggle {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .faq-item.active .faq-answer {
          max-height: 200px;
          margin-top: 16px;
        }

        .faq-answer p {
          color: #64748b;
          line-height: 1.6;
          font-size: 0.9rem;
        }

        /* Support Banner */
        .support-banner {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 20px;
          padding: 40px;
          margin: 60px 0;
        }

        .support-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .support-icon {
          width: 60px;
          height: 60px;
          background: rgba(230, 57, 70, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .support-icon i {
          font-size: 1.8rem;
          color: #e63946;
        }

        .support-text h3 {
          color: white;
          margin-bottom: 4px;
        }

        .support-text p {
          color: #94a3b8;
        }

        .support-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-chat,
        .btn-callback {
          padding: 12px 24px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-chat {
          background: #25D366;
          color: white;
          border: none;
        }

        .btn-callback {
          background: transparent;
          border: 2px solid #e63946;
          color: #e63946;
        }

        .btn-chat:hover,
        .btn-callback:hover {
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .contact-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .contact-main-wrapper {
            grid-template-columns: 1fr;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .contact-info-grid {
            grid-template-columns: 1fr;
            margin-top: -60px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .page-hero h1 {
            font-size: 2rem;
          }

          .support-content {
            flex-direction: column;
            text-align: center;
          }

          .contact-form-section {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  )
}

export default Contact