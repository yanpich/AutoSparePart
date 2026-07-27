// src/client/components/HeroSlider.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    id: 1,
    title: 'Premium Auto Parts',
    subtitle: 'OEM Quality at Competitive Prices',
    description: 'Get the best quality auto parts for your vehicle with warranty and expert support',
    image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1920&h=600&fit=crop',
    cta: 'Shop Now',
    link: '/shop',
    badge: 'Best Quality',
    icon: 'fas fa-crown',
    bgColor: '#e63946',
    featured: true
  },
  {
    id: 2,
    title: 'Summer Sale!',
    subtitle: 'Up to 40% OFF on Selected Items',
    description: 'Limited time offer. Don\'t miss out on amazing deals on premium auto parts',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&h=600&fit=crop',
    cta: 'View Deals',
    link: '/shop?filter=sale',
    badge: 'Limited Time',
    icon: 'fas fa-tag',
    bgColor: '#f59e0b',
    featured: false
  },
  {
    id: 3,
    title: 'Free Shipping',
    subtitle: 'On orders over $100',
    description: 'Fast and reliable delivery to your doorstep with real-time tracking',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&h=600&fit=crop',
    cta: 'Learn More',
    link: '/shipping',
    badge: 'Special Offer',
    icon: 'fas fa-truck-fast',
    bgColor: '#10b981',
    featured: false
  }
]

const HeroSlider = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [imageLoaded, setImageLoaded] = useState({})
  const [hoveredButton, setHoveredButton] = useState(null)
  const sliderRef = useRef(null)
  const autoplayRef = useRef(null)
  const slideInterval = 6000

  // Preload images
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new Image()
      img.src = slide.image
      img.onload = () => {
        setImageLoaded(prev => ({ ...prev, [index]: true }))
      }
    })
  }, [])

  // Auto-slide functionality
  const nextSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const prevSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(() => {
      if (autoplay) {
        nextSlide()
      }
    }, slideInterval)
  }, [autoplay, nextSlide])

  useEffect(() => {
    startAutoplay()
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [startAutoplay])

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplay(false)
  const handleMouseLeave = () => setAutoplay(true)

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50
  const onTouchStart = (e) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  const currentSlideData = slides[currentSlide]

  return (
    <div
      className="hero-slider"
      ref={sliderRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Hero slider"
    >
      {/* Background Particles Effect */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--delay': `${i * 0.5}s`,
            '--duration': `${5 + Math.random() * 5}s`,
            '--size': `${2 + Math.random() * 4}px`,
            '--left': `${Math.random() * 100}%`
          }} />
        ))}
      </div>

      {/* Slides Container */}
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              transform: `translateX(${(index - currentSlide) * 100}%)`,
              visibility: Math.abs(index - currentSlide) <= 1 ? 'visible' : 'hidden'
            }}
            aria-hidden={index !== currentSlide}
          >
            {/* Background Image with Loading State */}
            {!imageLoaded[index] && (
              <div className="image-loader">
                <div className="loader-spinner"></div>
              </div>
            )}
            <div
              className="slide-background"
              style={{
                backgroundImage: `url(${slide.image})`,
                opacity: imageLoaded[index] ? 1 : 0
              }}
            />

            {/* Gradient Overlay with Pattern */}
            <div className="slide-overlay">
              <div className="overlay-gradient"></div>
              <div className="overlay-pattern"></div>
            </div>

            {/* Content */}
            <div className="slide-content">
              {/* Badge */}
              {slide.badge && (
                <div
                  className="slide-badge"
                  style={{ backgroundColor: `${slide.bgColor}dd` }}
                >
                  <i className={slide.icon}></i>
                  <span>{slide.badge}</span>
                </div>
              )}

              {/* Title with Animation */}
              <h2 className="slide-title">
                {slide.title.split(' ').map((word, i) => (
                  <span
                    key={i}
                    className="title-word"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {word}
                  </span>
                ))}
              </h2>

              {/* Subtitle */}
              <p className="slide-subtitle">{slide.subtitle}</p>

              {/* Description */}
              <p className="slide-description">{slide.description}</p>

              {/* CTA Button with hover effect */}
              <button
                className={`slide-cta ${hoveredButton === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredButton(index)}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={() => navigate(slide.link)}
              >
                <span>{slide.cta}</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            {/* Slide Number Indicator */}
            <div className="slide-number">
              <span className="current">{String(index + 1).padStart(2, '0')}</span>
              <span className="separator">/</span>
              <span className="total">{String(slides.length).padStart(2, '0')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="slider-nav prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button
        className="slider-nav next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      {/* Dots Indicator */}
      <div className="slider-dots" role="tablist">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentSlide}
            role="tab"
          >
            <span className="dot-progress"></span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="slider-progress">
        <div
          className="progress-bar"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      <style jsx>{`
        .hero-slider {
          position: relative;
          height: 700px;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
        }

        /* Particles Effect */
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          left: var(--left);
          bottom: -10px;
          animation: float var(--duration) ease-in infinite;
          animation-delay: var(--delay);
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          80% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        .slider-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        /* Slide Styles */
        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .slide.active {
          z-index: 2;
        }

        .slide-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: opacity 0.5s ease;
          transform: scale(1);
        }

        .slide.active .slide-background {
          animation: scaleIn 8s ease-out forwards;
        }

        @keyframes scaleIn {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }

        /* Image Loader */
        .image-loader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
          z-index: 1;
        }

        .loader-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #e63946;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Overlay */
        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .overlay-gradient {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.85) 0%,
            rgba(0, 0, 0, 0.5) 40%,
            rgba(0, 0, 0, 0.3) 70%,
            rgba(0, 0, 0, 0.1) 100%
          );
        }

        .overlay-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* Content */
        .slide-content {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          max-width: 650px;
          padding: 0 80px;
          color: white;
          z-index: 3;
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-40%);
          }
          to {
            opacity: 1;
            transform: translateY(-50%);
          }
        }

        /* Badge */
        .slide-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 24px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 28px;
          animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.5px;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .slide-badge i {
          font-size: 1rem;
        }

        /* Title */
        .slide-title {
          font-size: 4.5rem;
          font-weight: 800;
          margin-bottom: 24px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #fff, #e2e8f0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .title-word {
          display: inline-block;
          animation: fadeInWord 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        @keyframes fadeInWord {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Subtitle */
        .slide-subtitle {
          font-size: 1.6rem;
          font-weight: 600;
          margin-bottom: 20px;
          opacity: 0.95;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          animation: fadeInUpText 0.6s ease 0.2s forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        /* Description */
        .slide-description {
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: 36px;
          opacity: 0.9;
          max-width: 550px;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
          animation: fadeInUpText 0.6s ease 0.3s forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        @keyframes fadeInUpText {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* CTA Button */
        .slide-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 40px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 50px;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(230, 57, 70, 0.4);
          animation: fadeInUpText 0.6s ease 0.4s forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .slide-cta::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .slide-cta:hover::before {
          width: 300px;
          height: 300px;
        }

        .slide-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(230, 57, 70, 0.5);
          gap: 16px;
        }

        /* Slide Number */
        .slide-number {
          position: absolute;
          bottom: 30px;
          left: 30px;
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          z-index: 3;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(5px);
          padding: 4px 12px;
          border-radius: 30px;
          font-family: monospace;
        }

        .slide-number .current {
          color: #e63946;
          font-size: 1.2rem;
        }

        /* Navigation Buttons */
        .slider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          cursor: pointer;
          color: white;
          font-size: 1.2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .slider-nav:hover {
          background: #e63946;
          transform: translateY(-50%) scale(1.1);
          border-color: transparent;
          box-shadow: 0 6px 20px rgba(230, 57, 70, 0.4);
        }

        .slider-nav.prev {
          left: 40px;
        }

        .slider-nav.next {
          right: 40px;
        }

        /* Dots */
        .slider-dots {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          z-index: 10;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          position: relative;
          overflow: hidden;
        }

        .dot.active {
          width: 36px;
          border-radius: 6px;
          background: transparent;
        }

        .dot-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0;
          background: #e63946;
          border-radius: 6px;
          transition: width 0.1s linear;
        }

        .dot.active .dot-progress {
          width: 100%;
          animation: progressFill 6s linear forwards;
        }

        @keyframes progressFill {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .dot:hover {
          transform: scale(1.2);
          background: rgba(255, 255, 255, 0.7);
        }

        /* Progress Bar */
        .slider-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 10;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #e63946, #fbbf24, #e63946);
          background-size: 200% 100%;
          transition: width 0.3s linear;
          animation: gradientShift 2s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero-slider {
            height: 650px;
          }

          .slide-title {
            font-size: 3.8rem;
          }
        }

        @media (max-width: 992px) {
          .hero-slider {
            height: 600px;
          }

          .slide-title {
            font-size: 3.2rem;
          }

          .slide-subtitle {
            font-size: 1.4rem;
          }

          .slide-content {
            padding: 0 50px;
          }
        }

        @media (max-width: 768px) {
          .hero-slider {
            height: 550px;
          }

          .slide-content {
            padding: 0 30px;
            text-align: center;
            max-width: 100%;
            left: 0;
            right: 0;
          }

          .slide-title {
            font-size: 2.5rem;
          }

          .slide-subtitle {
            font-size: 1.2rem;
          }

          .slide-description {
            font-size: 0.95rem;
            margin-left: auto;
            margin-right: auto;
          }

          .slider-nav {
            width: 44px;
            height: 44px;
            font-size: 1rem;
          }

          .slider-nav.prev {
            left: 15px;
          }

          .slider-nav.next {
            right: 15px;
          }

          .slide-badge {
            margin-left: auto;
            margin-right: auto;
            font-size: 0.75rem;
            padding: 6px 16px;
          }

          .slide-number {
            display: none;
          }
        }

        @media (max-width: 576px) {
          .hero-slider {
            height: 500px;
          }

          .slide-title {
            font-size: 2rem;
          }

          .slide-subtitle {
            font-size: 1rem;
          }

          .slide-description {
            font-size: 0.85rem;
            display: none;
          }

          .slide-cta {
            padding: 12px 28px;
            font-size: 0.9rem;
          }

          .slider-nav {
            width: 38px;
            height: 38px;
            font-size: 0.9rem;
          }

          .dot {
            width: 8px;
            height: 8px;
          }

          .dot.active {
            width: 28px;
          }
        }
      `}</style>
    </div>
  )
}

export default HeroSlider