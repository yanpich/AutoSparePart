// src/client/layouts/ClientLayout.jsx - NO ANIMATION VERSION
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ClientHeader from '../components/ClientHeader'
import ClientFooter from '../components/ClientFooter'

const ClientLayout = () => {
  const location = useLocation()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrolled, setScrolled] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768)
  const scrollTimeout = useRef(null)

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeout.current) return

      scrollTimeout.current = setTimeout(() => {
        const scrollY = window.scrollY
        setShowScrollTop(scrollY > 500)
        setScrolled(scrollY > 10)

        if (scrollY > 10) {
          document.body.classList.add('has-sticky-header')
          document.body.style.paddingTop = '130px'
        } else {
          document.body.classList.remove('has-sticky-header')
          document.body.style.paddingTop = '0'
        }
        scrollTimeout.current = null
      }, 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Custom cursor effect (only on desktop)
  useEffect(() => {
    if (!isDesktop) return

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isDesktop])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="client-layout-2025">
      {/* Custom Cursor - Only on desktop */}
      {isDesktop && (
        <div
          className="custom-cursor-2025"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        >
          <div className="cursor-dot"></div>
          <div className="cursor-ring"></div>
        </div>
      )}

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-gradient-layer"></div>
        <div className="bg-gradient-layer-2"></div>
        <div className="bg-gradient-layer-3"></div>
      </div>

      {/* Header Wrapper - Sticky when scrolled (NO ANIMATION) */}
      <div className={`header-wrapper-premium ${scrolled ? 'sticky' : ''}`}>
        <ClientHeader />
      </div>

      <main className="main-content-2025">
        <Outlet />
      </main>

      <ClientFooter />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className="scroll-top-2025"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <i className="fas fa-arrow-up"></i>
          <span className="tooltip">Back to Top</span>
        </button>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/85593999452?text=Hello!%20I%20need%20help%20with%20auto%20parts"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-2025"
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
        <span className="whatsapp-tooltip">Chat with us</span>
        <div className="pulse-ring"></div>
        <div className="whatsapp-badge">
          <span>1</span>
        </div>
      </a>

      <style>{`
        /* ============================================
           CLIENT LAYOUT - NO ANIMATION
           ============================================ */
        .client-layout-2025 {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        /* ============================================
           STICKY HEADER WRAPPER - NO ANIMATION
           ============================================ */
        .header-wrapper-premium {
          position: relative;
          z-index: 1000;
          width: 100%;
        }

        /* When scrolled - instantly fixed, no animation */
        .header-wrapper-premium.sticky {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }

        /* Body padding when header is sticky */
        body.has-sticky-header {
          padding-top: 130px;
        }

        @media (max-width: 768px) {
          body.has-sticky-header {
            padding-top: 110px;
          }
        }

        @media (max-width: 576px) {
          body.has-sticky-header {
            padding-top: 90px;
          }
        }

        /* ============================================
           ANIMATED BACKGROUND
           ============================================ */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -2;
          overflow: hidden;
        }

        .bg-gradient-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 30%, rgba(230, 57, 70, 0.03) 0%, transparent 50%);
          animation: pulseBg 8s ease-in-out infinite;
        }

        .bg-gradient-layer-2 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 80% 70%, rgba(102, 126, 234, 0.03) 0%, transparent 50%);
          animation: pulseBg2 10s ease-in-out infinite;
        }

        .bg-gradient-layer-3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.02) 0%, transparent 50%);
          animation: pulseBg3 12s ease-in-out infinite;
        }

        @keyframes pulseBg {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes pulseBg2 {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1.1) rotate(5deg); }
        }

        @keyframes pulseBg3 {
          0%, 100% { opacity: 0.2; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.15) rotate(-5deg); }
        }

        /* ============================================
           CUSTOM CURSOR
           ============================================ */
        .custom-cursor-2025 {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.05s ease;
        }

        .cursor-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #e63946;
          border-radius: 50%;
          top: -2px;
          left: -2px;
          box-shadow: 0 0 10px rgba(230, 57, 70, 0.5);
        }

        .cursor-ring {
          position: absolute;
          width: 32px;
          height: 32px;
          border: 2px solid rgba(230, 57, 70, 0.4);
          border-radius: 50%;
          top: -16px;
          left: -16px;
          animation: cursorPulse 2s infinite;
        }

        @keyframes cursorPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }

        @media (max-width: 768px) {
          .custom-cursor-2025 { display: none !important; }
        }

        /* ============================================
           MAIN CONTENT
           ============================================ */
        .main-content-2025 {
          min-height: calc(100vh - 200px);
          position: relative;
          z-index: 1;
        }

        /* ============================================
           SCROLL TOP BUTTON - NO ANIMATION
           ============================================ */
        .scroll-top-2025 {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(230, 57, 70, 0.4);
        }

        .scroll-top-2025:hover {
          background: linear-gradient(135deg, #c92c3a, #e63946);
        }

        .scroll-top-2025 .tooltip {
          position: absolute;
          right: 100%;
          margin-right: 12px;
          background: #1e293b;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
        }

        .scroll-top-2025:hover .tooltip {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .scroll-top-2025 {
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            font-size: 0.9rem;
          }
          .scroll-top-2025 .tooltip { display: none; }
        }

        /* ============================================
           WHATSAPP FLOATING BUTTON
           ============================================ */
        .whatsapp-float-2025 {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.6rem;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          text-decoration: none;
        }

        .whatsapp-float-2025:hover {
          background: linear-gradient(135deg, #128C7E, #25D366);
        }

        .whatsapp-tooltip {
          position: absolute;
          right: 100%;
          margin-right: 12px;
          background: #1e293b;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
        }

        .whatsapp-float-2025:hover .whatsapp-tooltip {
          opacity: 1;
        }

        .whatsapp-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 700;
          color: white;
          animation: badgePulse 2s infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @media (max-width: 768px) {
          .whatsapp-float-2025 {
            bottom: 80px;
            right: 20px;
            width: 45px;
            height: 45px;
            font-size: 1.4rem;
          }
          .whatsapp-tooltip { display: none; }
          .whatsapp-badge {
            width: 16px;
            height: 16px;
            font-size: 0.5rem;
          }
        }

        /* ============================================
           DARK MODE SUPPORT
           ============================================ */
        @media (prefers-color-scheme: dark) {
          .client-layout-2025 {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }
          .bg-gradient-layer {
            background: radial-gradient(circle at 20% 30%, rgba(230, 57, 70, 0.05) 0%, transparent 50%);
          }
          .bg-gradient-layer-2 {
            background: radial-gradient(circle at 80% 70%, rgba(102, 126, 234, 0.05) 0%, transparent 50%);
          }
          .bg-gradient-layer-3 {
            background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
          }
        }

        /* ============================================
           REDUCED MOTION
           ============================================ */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .scroll-top-2025:hover {
            transform: none !important;
          }
          .whatsapp-float-2025:hover {
            transform: none !important;
          }
        }

        button:focus-visible,
        a:focus-visible {
          outline: 2px solid #e63946;
          outline-offset: 2px;
        }

        ::selection {
          background: #e63946;
          color: white;
        }
      `}</style>
    </div>
  )
}

export default ClientLayout