// src/client/components/ClientFooter.jsx - SIMPLIFIED VERSION
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const ClientFooter = () => {
  const navigate = useNavigate()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      console.log('Newsletter subscription:', newsletterEmail)
      setSubscribed(true)
      setNewsletterEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { name: 'New Arrivals', path: '/shop?filter=new' },
      { name: 'Best Sellers', path: '/shop?sort=bestseller' },
      { name: 'Sale Items', path: '/shop?filter=sale' },
      { name: 'All Products', path: '/shop' }
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'Returns Policy', path: '/returns'},
      { name: 'Shipping Info', path: '/shipping'},
      { name: 'FAQ', path: '/faq'}
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Privacy Policy', path: '/privacy'},
      { name: 'Terms & Conditions', path: '/terms'}
    ]
  }

  const socialLinks = [
    { icon: 'fab fa-facebook-f', url: 'https://facebook.com', color: '#1877f2', label: 'Facebook' },
    { icon: 'fab fa-instagram', url: 'https://instagram.com', color: '#e4405f', label: 'Instagram' },
    { icon: 'fab fa-twitter', url: 'https://twitter.com', color: '#1da1f2', label: 'Twitter' },
    { icon: 'fab fa-youtube', url: 'https://youtube.com', color: '#ff0000', label: 'YouTube' },
    { icon: 'fab fa-linkedin-in', url: 'https://linkedin.com', color: '#0077b5', label: 'LinkedIn' },
    { icon: 'fab fa-pinterest', url: 'https://pinterest.com', color: '#bd081c', label: 'Pinterest' },
    { icon: 'fab fa-whatsapp', url: 'https://wa.me/85593999452', color: '#25D366', label: 'WhatsApp' }
  ]

  const paymentIcons = [
    'fab fa-cc-visa', 'fab fa-cc-mastercard', 'fab fa-cc-amex',
    'fab fa-cc-paypal', 'fab fa-cc-discover', 'fab fa-cc-apple-pay',
    'fab fa-google-pay', 'fas fa-lock'
  ]

  const trustBadges = [
    { icon: 'fas fa-check-circle', text: '100% Authentic Products' },
    { icon: 'fas fa-shield-alt', text: 'Secure Checkout' },
    { icon: 'fas fa-truck', text: 'Fast Delivery' },
    { icon: 'fas fa-headset', text: '24/7 Support' }
  ]

  return (
    <footer className="premium-footer">
      <div className="footer-gradient-border"></div>

      <div className="footer-content">
        <div className="footer-container">
          {/* Brand Column */}
          <div className="footer-column brand-column">
            <div className="footer-logo" onClick={() => navigate('/')}>
              <div className="logo-icon">
                <svg viewBox="0 0 100 100" width="45" height="45">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e63946"/>
                      <stop offset="100%" stopColor="#ff6b7c"/>
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#footerLogoGradient)" strokeWidth="3"/>
                  <line x1="50" y1="5" x2="50" y2="50" stroke="url(#footerLogoGradient)" strokeWidth="2.5"/>
                  <line x1="50" y1="50" x2="15" y2="80" stroke="url(#footerLogoGradient)" strokeWidth="2.5"/>
                  <line x1="50" y1="50" x2="85" y2="80" stroke="url(#footerLogoGradient)" strokeWidth="2.5"/>
                  <circle cx="50" cy="50" r="8" fill="url(#footerLogoGradient)"/>
                </svg>
              </div>
              <div className="logo-text">
                S&L<span>AUTO CAR</span>
              </div>
            </div>
            <p className="brand-description">
              Premium auto parts since 1992. OEM quality, performance engineering,
              and unmatched customer support. Trusted by mechanics worldwide.
            </p>

            {/* Trust Badges */}
            <div className="trust-badges">
              {trustBadges.map((badge, idx) => (
                <div key={idx} className="trust-badge">
                  <i className={badge.icon}></i>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{ '--hover-color': social.color }}
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                  <span className="social-tooltip">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="footer-column">
            <h4 className="footer-title">
              Shop
            </h4>
            <ul className="footer-links">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <a onClick={() => navigate(link.path)}>
                    <i className={link.icon}></i>
                    <span>{link.name}</span>
                    <i className="fas fa-arrow-right link-arrow"></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-column">
            <h4 className="footer-title">
              Support
            </h4>
            <ul className="footer-links">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a onClick={() => navigate(link.path)}>
                    <i className={link.icon}></i>
                    <span>{link.name}</span>
                    <i className="fas fa-arrow-right link-arrow"></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-column">
            <h4 className="footer-title">
              Company
            </h4>
            <ul className="footer-links">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a onClick={() => navigate(link.path)}>
                    <i className={link.icon}></i>
                    <span>{link.name}</span>
                    <i className="fas fa-arrow-right link-arrow"></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact Column */}
          <div className="footer-column newsletter-column">
            <h4 className="footer-title">
              Newsletter
            </h4>
            <p className="newsletter-text">
              Subscribe for exclusive deals, new arrivals, and special offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <div className="newsletter-input-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit">
                  <i className="fas fa-paper-plane"></i>
                  <span>Subscribe</span>
                </button>
              </div>
            </form>

            {subscribed && (
              <motion.div
                className="subscribe-success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <i className="fas fa-check-circle"></i>
                <span>Subscribed successfully!</span>
              </motion.div>
            )}

            {/* Contact Info */}
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div>
                  <strong>Hotline</strong>
                  <a href="tel:+85593999452">(+855) 93 999 452</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:support@autohive.com">support@autohive.com</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <strong>Address</strong>
                  <span>123 Auto Parts Street, Phnom Penh, Cambodia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container bottom-container">
          <div className="copyright">
            <i className="fas fa-lock"></i>
            <span>© {currentYear} AutoHive, Inc. All rights reserved.</span>
          </div>

          <div className="payment-methods">
            {paymentIcons.map((icon, index) => (
              <div key={index} className="payment-icon">
                <i className={icon}></i>
              </div>
            ))}
          </div>

          <button className="back-to-top" onClick={scrollToTop}>
            <i className="fas fa-arrow-up"></i>
            <span>Back to Top</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .premium-footer {
          background: linear-gradient(135deg, #0a0a1a 0%, #0f0f23 100%);
          color: #cbd5e0;
          margin-top: 80px;
          position: relative;
          overflow: hidden;
        }

        .footer-gradient-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #e63946, #667eea, #764ba2, #e63946);
          background-size: 300% 100%;
          animation: gradientMove 3s ease infinite;
        }

        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .premium-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .footer-content {
          padding: 60px 0 40px;
        }

        .footer-container {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
          gap: 40px;
        }

        .brand-column {
          max-width: 320px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }

        .footer-logo:hover {
          transform: translateX(5px);
        }

        .logo-icon {
          width: 45px;
          height: 45px;
          color: #e63946;
          animation: logoPulse 2s infinite;
        }

        @keyframes logoPulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(230, 57, 70, 0.5)); }
          50% { filter: drop-shadow(0 0 8px rgba(230, 57, 70, 0.8)); }
        }

        .logo-text {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-text span {
          color: #e63946;
          background: rgba(230, 57, 70, 0.15);
          padding: 2px 6px;
          border-radius: 8px;
          margin-left: 2px;
          -webkit-background-clip: unset;
          background-clip: unset;
        }

        .brand-description {
          color: #98a2b3;
          font-size: 0.9rem;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .trust-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          color: #e2e8f0;
        }

        .trust-badge i {
          color: #10b981;
          font-size: 0.8rem;
        }

        .social-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .social-link {
          position: relative;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e0e6ed;
          transition: all 0.3s ease;
          text-decoration: none;
          font-size: 1.1rem;
        }

        .social-link:hover {
          background: var(--hover-color);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .social-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.6rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          margin-bottom: 8px;
        }

        .social-link:hover .social-tooltip {
          opacity: 1;
        }

        .footer-title {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          padding-bottom: 12px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: #e63946;
          border-radius: 2px;
        }

        .footer-title i {
          color: #e63946;
          font-size: 1rem;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links a {
          color: #a0aec0;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .footer-links a i:first-child {
          font-size: 0.7rem;
          color: #e63946;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.3s ease;
        }

        .link-arrow {
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.3s ease;
          font-size: 0.7rem;
        }

        .footer-links a:hover {
          color: white;
          transform: translateX(5px);
        }

        .footer-links a:hover i:first-child,
        .footer-links a:hover .link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .newsletter-column {
          min-width: 280px;
        }

        .newsletter-text {
          color: #98a2b3;
          font-size: 0.85rem;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .newsletter-form {
          margin-bottom: 24px;
        }

        .newsletter-input-group {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50px;
          padding: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .newsletter-input-group:focus-within {
          border-color: #e63946;
          box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.2);
        }

        .newsletter-input-group i:first-child {
          position: absolute;
          left: 16px;
          color: #e63946;
          font-size: 0.9rem;
        }

        .newsletter-input-group input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 12px 12px 45px;
          color: white;
          font-size: 0.9rem;
          outline: none;
        }

        .newsletter-input-group input::placeholder {
          color: #7f8d9e;
        }

        .newsletter-input-group button {
          background: #e63946;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .newsletter-input-group button:hover {
          background: #c92c3a;
          transform: scale(1.02);
        }

        .subscribe-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          backdrop-filter: blur(4px);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-icon {
          width: 32px;
          height: 32px;
          background: rgba(230, 57, 70, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e63946;
        }

        .contact-icon i {
          font-size: 0.9rem;
        }

        .contact-item strong {
          display: block;
          font-size: 0.7rem;
          color: #98a2b3;
          margin-bottom: 2px;
        }

        .contact-item span,
        .contact-item a {
          font-size: 0.8rem;
          color: #cbd5e0;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .contact-item a:hover {
          color: #e63946;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px 0;
        }

        .bottom-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .copyright {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #8596a3;
        }

        .payment-methods {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .payment-icon {
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 10px;
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .payment-icon i {
          font-size: 1.3rem;
          transition: all 0.3s ease;
        }

        .payment-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .payment-icon:hover i {
          transform: scale(1.05);
        }

        .back-to-top {
          background: rgba(230, 57, 70, 0.15);
          border: none;
          color: #e63946;
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .back-to-top:hover {
          background: #e63946;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 5px 20px rgba(230, 57, 70, 0.3);
        }

        @media (max-width: 1200px) {
          .footer-container {
            grid-template-columns: 1.5fr 1fr 1fr 1fr;
            gap: 30px;
          }
          .newsletter-column {
            grid-column: span 4;
            margin-top: 20px;
          }
        }

        @media (max-width: 992px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
          .brand-column {
            grid-column: span 2;
            max-width: none;
            text-align: center;
          }
          .footer-logo {
            justify-content: center;
          }
          .trust-badges {
            justify-content: center;
          }
          .social-links {
            justify-content: center;
          }
          .brand-description {
            margin-left: auto;
            margin-right: auto;
          }
          .newsletter-column {
            grid-column: span 2;
          }
          .footer-title::after {
            left: 50%;
            transform: translateX(-50%);
          }
          .footer-title {
            justify-content: center;
          }
          .footer-links {
            text-align: center;
          }
          .footer-links a {
            justify-content: center;
          }
          .contact-item {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .footer-content {
            padding: 40px 0 30px;
          }
          .footer-container {
            padding: 0 20px;
            gap: 30px;
          }
          .bottom-container {
            flex-direction: column;
            text-align: center;
          }
          .payment-methods {
            justify-content: center;
          }
          .newsletter-input-group button span {
            display: none;
          }
          .newsletter-input-group button {
            padding: 10px 16px;
          }
        }

        @media (max-width: 576px) {
          .footer-container {
            grid-template-columns: 1fr;
          }
          .brand-column,
          .newsletter-column {
            grid-column: span 1;
          }
          .footer-links a {
            justify-content: center;
          }
          .trust-badges {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </footer>
  )
}

export default ClientFooter