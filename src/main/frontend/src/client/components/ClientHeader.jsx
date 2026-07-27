// src/client/components/ClientHeader.jsx - FIXED VERSION
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  IoSearchOutline, IoCloseSharp, IoArrowForwardOutline,
  IoLogOutOutline, IoSettingsOutline,
  IoHomeOutline, IoStorefrontOutline, IoInformationCircleOutline,
  IoChatbubbleOutline, IoNotificationsOutline,
  IoCheckmarkCircleOutline, IoMailOutline, IoFlashOutline,
  IoGiftOutline, IoStarOutline, IoShieldCheckmarkOutline,
  IoTimeOutline, IoLocationOutline, IoCallOutline,
  IoAppsOutline
} from 'react-icons/io5'

import {
  AiFillHeart, AiOutlineHeart, AiFillCar,
  AiTwotoneFire
} from 'react-icons/ai'

import {
  FaUserAlt, FaSignInAlt, FaUserPlus,
  FaHeadset, FaTruck, FaShieldAlt, FaShoppingCart,
  FaFacebookF, FaTwitter, FaInstagram, FaYoutube
} from 'react-icons/fa'

import {
  MdLocalShipping, MdVerified, MdSecurity,
  MdDashboard, MdOutlineShoppingBag, MdOutlineFavorite,
  MdLocationOn, MdPhone, MdEmail, MdAccessTime,
  MdCalendarToday
} from 'react-icons/md'

// ============================================
// CUSTOM HOOK - FIXED
// ============================================

const useClickOutside = (refs, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = refs.every(ref =>
        ref.current && !ref.current.contains(event.target)
      )
      if (isOutside) callback()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs, callback])
}

const useScrollDetection = (threshold = 1) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const shouldScroll = window.scrollY > threshold
      if (shouldScroll !== scrolled) {
        setScrolled(shouldScroll)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold, scrolled])

  return scrolled
}

// ============================================
// COMPONENT
// ============================================

const ClientHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const scrolled = useScrollDetection(1)

  // State management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [searchSuggestions, setSearchSuggestions] = useState([])

  // ===== FIXED: Direct state from localStorage =====
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [user, setUser] = useState({})

  // Refs
  const searchInputRef = useRef(null)
  const dropdownRefs = {
    user: useRef(null),
    notifications: useRef(null),
    categories: useRef(null)
  }

  // ============================================
  // MEMOIZED VALUES
  // ============================================

  const isLoggedIn = useMemo(() => !!localStorage.getItem('token'), [])

  const navLinks = useMemo(() => [
    { path: '/', label: 'Home', badge: null },
    { path: '/shop', label: 'Shop', badge: 'New' },
    { path: '/about', label: 'About', badge: null },
    { path: '/contact', label: 'Contact', badge: null }
  ], [])

  const quickActions = useMemo(() => [
    { icon: <IoFlashOutline />, label: 'Deals', color: '#e63946', path: '/shop?deals=true' },
    { icon: <IoGiftOutline />, label: 'Gifts', color: '#f59e0b', path: '/shop?gifts=true' },
    { icon: <IoStarOutline />, label: 'Top Rated', color: '#10b981', path: '/shop?top-rated=true' },
    { icon: <IoShieldCheckmarkOutline />, label: 'Guaranteed', color: '#3b82f6', path: '/shop?guaranteed=true' }
  ], [])

  const notificationItems = useMemo(() => [
    {
      id: 1,
      title: '🔥 Flash Sale Alert!',
      message: 'Up to 50% off on brake pads - Limited time!',
      time: '5 min ago',
      read: false,
      icon: <AiTwotoneFire size={16} color="#e63946" />,
      type: 'promotion'
    },
    {
      id: 2,
      title: '📦 Order Shipped',
      message: 'Your order #AUTO-1234 has been shipped with tracking',
      time: '2 hours ago',
      read: false,
      icon: <MdLocalShipping size={16} color="#10b981" />,
      type: 'order'
    },
    {
      id: 3,
      title: '✨ New Arrivals',
      message: 'Check out our latest collection of performance parts',
      time: '1 day ago',
      read: true,
      icon: <AiFillCar size={16} color="#3b82f6" />,
      type: 'update'
    }
  ], [])

  const popularProducts = useMemo(() => [
    { name: 'Brake Pads', category: 'Brake System', popular: true },
    { name: 'Oil Filter', category: 'Engine', popular: true },
    { name: 'Spark Plugs', category: 'Engine', popular: false },
    { name: 'Car Battery', category: 'Electrical', popular: true },
    { name: 'Air Filter', category: 'Engine', popular: false },
    { name: 'Brake Rotors', category: 'Brake System', popular: true }
  ], [])

  const categories = useMemo(() => [
    { name: 'Engine Parts', icon: '⚡', count: 156, path: 'engine', color: '#e63946' },
    { name: 'Brake System', icon: '🛞', count: 89, path: 'brake', color: '#f59e0b' },
    { name: 'Electrical', icon: '🔌', count: 234, path: 'electrical', color: '#3b82f6' },
    { name: 'Suspension', icon: '🚗', count: 67, path: 'suspension', color: '#10b981' },
    { name: 'Cooling System', icon: '❄️', count: 45, path: 'cooling', color: '#06b6d4' },
    { name: 'Exhaust', icon: '💨', count: 78, path: 'exhaust', color: '#8b5cf6' },
    { name: 'Transmission', icon: '⚙️', count: 92, path: 'transmission', color: '#ec4899' },
    { name: 'Lighting', icon: '💡', count: 123, path: 'lighting', color: '#f43f5e' }
  ], [])

  // ============================================
  // UPDATE COUNTS - FIXED
  // ============================================

  const updateCounts = useCallback(() => {
    try {
      // Get cart count
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      setCartCount(total)

      // Get wishlist count
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setWishlistCount(wishlist.length)

      // Get user info
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (e) {
        setUser({})
      }
    } catch (error) {
      console.error('Error updating counts:', error)
      setCartCount(0)
      setWishlistCount(0)
    }
  }, [])

  // ============================================
  // CALLBACK FUNCTIONS
  // ============================================

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`)
      setSearchQuery('')
      setSearchOpen(false)
      setShowSuggestions(false)
    }
  }, [searchQuery, navigate])

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion)
    navigate(`/shop?search=${encodeURIComponent(suggestion)}`)
    setSearchOpen(false)
    setShowSuggestions(false)
  }, [navigate])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    setUser({})
    navigate('/login')
    setUserDropdownOpen(false)
    updateCounts()
  }, [navigate, updateCounts])

  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }, [])

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
    if (!mobileMenuOpen) {
      setSearchOpen(false)
      setUserDropdownOpen(false)
      setShowNotifications(false)
    }
  }, [mobileMenuOpen])

  const toggleSearch = useCallback(() => {
    setSearchOpen(prev => !prev)
    if (!searchOpen) {
      setMobileMenuOpen(false)
    }
  }, [searchOpen])

  const navigateTo = useCallback((path) => {
    navigate(path)
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
    setShowNotifications(false)
    setCategoriesOpen(false)
  }, [navigate])

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ===== FIXED: Initial load and event listeners =====
  useEffect(() => {
    // Initial load
    updateCounts()

    // Load user info
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (e) {
      setUser({})
    }

    // ===== FIXED: Custom event listeners =====
    const handleCartUpdate = () => {
      updateCounts()
    }

    const handleWishlistUpdate = () => {
      updateCounts()
    }

    // Listen to storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'cart' || e.key === 'wishlist' || e.key === 'user') {
        updateCounts()
      }
    }

    // Listen to custom events
    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    window.addEventListener('storage', handleStorageChange)

    // Listen to a custom event for cart changes from within the same tab
    window.addEventListener('localStorageChange', (e) => {
      if (e.detail?.key === 'cart' || e.detail?.key === 'wishlist') {
        updateCounts()
      }
    })

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [updateCounts])

  // ===== FIXED: Periodic check for updates =====
  useEffect(() => {
    // Check every 2 seconds for cart updates (for safety)
    const interval = setInterval(() => {
      updateCounts()
    }, 2000)

    return () => clearInterval(interval)
  }, [updateCounts])

  // Focus search when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  // Search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 1) {
        const filtered = popularProducts.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchSuggestions(filtered.slice(0, 6))
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, popularProducts])

  useClickOutside(
    Object.values(dropdownRefs),
    useCallback(() => {
      setUserDropdownOpen(false)
      setShowNotifications(false)
      setCategoriesOpen(false)
    }, [])
  )

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderNavLink = useCallback((link) => {
    const isActive = location.pathname === link.path
    return (
      <li key={link.path}>
        <Link
          to={link.path}
          className={`nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="nav-icon">{link.icon}</span>
          <span className="nav-label">{link.label}</span>
          {link.badge && <span className="nav-badge">{link.badge}</span>}
          {isActive && <div className="active-indicator" />}
        </Link>
      </li>
    )
  }, [location.pathname])

  const renderCategoryItem = useCallback((category) => (
    <div
      key={category.name}
      className="category-item"
      onClick={() => {
        navigateTo(`/shop?category=${category.path}`)
        setCategoriesOpen(false)
      }}
      role="button"
      tabIndex={0}
    >
      <div className="category-icon" style={{ background: `${category.color}15` }}>
        <span style={{ color: category.color }}>{category.icon}</span>
      </div>
      <div className="category-info">
        <span className="category-name">{category.name}</span>
        <span className="category-count">{category.count} items</span>
      </div>
      <IoArrowForwardOutline className="category-arrow" />
    </div>
  ), [navigateTo])

  const renderNotification = useCallback((notif) => (
    <div
      key={notif.id}
      className={`notification-item ${!notif.read ? 'unread' : ''}`}
      onClick={() => {
        if (notif.type === 'order') navigateTo('/orders')
        else if (notif.type === 'promotion') navigateTo('/shop?promotion=true')
        else navigateTo('/notifications')
      }}
      role="button"
      tabIndex={0}
    >
      <div className="notification-icon-wrapper">
        {notif.icon}
        {!notif.read && <span className="notification-dot" />}
      </div>
      <div className="notification-content">
        <strong>{notif.title}</strong>
        <p>{notif.message}</p>
        <span className="notification-time">{notif.time}</span>
      </div>
    </div>
  ), [navigateTo])

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <div
        className="header-container-wrapper"
        style={{
          position: scrolled ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          zIndex: scrolled ? 10000 : 1000,
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.12)' : 'none',
          willChange: 'transform',
          transform: 'translateY(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* TOP BAR */}
        <div className="topbar-modern">
          <div className="topbar-modern-container">
            <div className="topbar-left">
              <div className="topbar-marquee">
                <span>🚚 Free Shipping Over $100</span>
                <span className="separator-dot">•</span>
                <span>🛡️ 100% Authentic Parts</span>
                <span className="separator-dot">•</span>
                <span>💳 Secure Payments</span>
                <span className="separator-dot">•</span>
                <span>📞 24/7 Expert Support</span>
              </div>
            </div>
            <div className="topbar-right">
              <a href="tel:+85593999452" className="topbar-link">
                <MdPhone size={14} />
                <span>(+855) 93 999 452</span>
              </a>
              <a href="mailto:support@autohive.com" className="topbar-link">
                <IoMailOutline size={14} />
                <span>support@autohive.com</span>
              </a>
              <div className="topbar-social">
                <a href="#" aria-label="Facebook"><FaFacebookF size={12} /></a>
                <a href="#" aria-label="Twitter"><FaTwitter size={12} /></a>
                <a href="#" aria-label="Instagram"><FaInstagram size={12} /></a>
                <a href="#" aria-label="YouTube"><FaYoutube size={12} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* HEADER */}
        <header className="header-modern">
          <div className="header-modern-container">
            {/* Logo */}
            <div
              className="logo-modern"
              onClick={() => navigateTo('/')}
              role="button"
              tabIndex={0}
            >
              <div className="logo-icon-wrapper">
                <div className="logo-icon">
                  <svg viewBox="0 0 100 100" width="44" height="44">
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e63946"/>
                        <stop offset="100%" stopColor="#ff6b7c"/>
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logoGradient)" strokeWidth="2.5"/>
                    <path d="M50 10 L50 50 L20 80" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none"/>
                    <path d="M50 10 L50 50 L80 80" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none"/>
                    <circle cx="50" cy="50" r="6" fill="url(#logoGradient)"/>
                  </svg>
                </div>
                <div className="logo-badge">PRO</div>
              </div>
              <div className="logo-text">
                <span className="logo-main">S&L</span>
                <span className="logo-sub">AUTO CAR</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => navigateTo(action.path)}
                  style={{ '--action-color': action.color }}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Header Info */}
            <div className="header-info-modern">
              <div className="info-chip">
                <MdLocationOn size={16} className="chip-icon" />
                <div className="chip-content">
                  <span>Location</span>
                  <strong>Phnom Penh</strong>
                </div>
              </div>
              <div className="info-chip time-chip">
                <MdAccessTime size={16} className="chip-icon" />
                <div className="chip-content">
                  <span>Working Hours</span>
                  <strong className="time-display">{formatTime(currentTime)}</strong>
                </div>
              </div>
              <div className="info-chip date-chip">
                <MdCalendarToday size={16} className="chip-icon" />
                <div className="chip-content">
                  <span>{formatDate(currentTime)}</span>
                  <strong className="date-display">Open Now</strong>
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              className={`mobile-toggle-modern ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>

        {/* NAVIGATION */}
        <nav
          className={`nav-modern ${mobileMenuOpen ? 'mobile-open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="nav-modern-container">
            {/* Categories */}
            <div className="categories-modern" ref={dropdownRefs.categories}>
              <button
                className="categories-toggle"
                onClick={() => setCategoriesOpen(prev => !prev)}
                aria-expanded={categoriesOpen}
              >
                <IoAppsOutline size={20} />
                <span>Categories</span>
                <span className={`arrow-icon ${categoriesOpen ? 'open' : ''}`}>
                  <IoArrowForwardOutline size={14} />
                </span>
              </button>

              {categoriesOpen && (
                <div className="categories-dropdown-modern" role="menu">
                  <div className="categories-header">
                    <span className="categories-title">All Categories</span>
                    <button className="categories-close" onClick={() => setCategoriesOpen(false)}>
                      <IoCloseSharp size={18} />
                    </button>
                  </div>
                  <div className="categories-grid">
                    {categories.map(renderCategoryItem)}
                  </div>
                  <div className="categories-footer">
                    <button className="view-all-categories" onClick={() => navigateTo('/shop')}>
                      View All Categories
                      <IoArrowForwardOutline size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <ul className="nav-links-modern">
              {navLinks.map(renderNavLink)}
            </ul>

            {/* Search Bar */}
            <div className={`search-modern ${searchOpen ? 'open' : ''}`}>
              <form onSubmit={handleSearch} className="search-form-modern">
                <IoSearchOutline size={18} className="search-icon-modern" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search parts, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  aria-label="Search for auto parts"
                  autoComplete="off"
                  className="search-input-modern"
                />
                {searchQuery && (
                  <button type="button" className="search-clear-modern" onClick={() => setSearchQuery('')}>
                    <IoCloseSharp size={16} />
                  </button>
                )}
                <button type="submit" className="search-submit-modern">
                  <IoArrowForwardOutline size={18} />
                </button>

                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="search-suggestions-modern" role="listbox">
                    <div className="suggestions-header">
                      <IoSearchOutline size={14} />
                      <span>Popular Searches</span>
                    </div>
                    {searchSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item-modern"
                        onClick={() => handleSuggestionClick(suggestion.name)}
                        role="option"
                      >
                        <span className="suggestion-icon">🔍</span>
                        <div className="suggestion-info">
                          <span className="suggestion-name">{suggestion.name}</span>
                          <span className="suggestion-category">{suggestion.category}</span>
                        </div>
                        {suggestion.popular && (
                          <span className="suggestion-badge">Popular</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </form>
              <button
                className="search-toggle-modern"
                onClick={toggleSearch}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                <IoSearchOutline size={22} />
              </button>
            </div>

            {/* Action Icons */}
            <div className="action-icons-modern">
              {/* Notifications */}
              <div className="action-item" ref={dropdownRefs.notifications}>
                <div
                  className="action-button"
                  onClick={() => setShowNotifications(prev => !prev)}
                  aria-label={`Notifications ${notifications > 0 ? `(${notifications} unread)` : ''}`}
                >
                  <IoNotificationsOutline size={22} />
                  {notifications > 0 && (
                    <span className="action-badge">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </div>
                <span className="action-label">Alerts</span>

                {showNotifications && (
                  <div className="notifications-modern" role="dialog">
                    <div className="notifications-header-modern">
                      <span className="notifications-title">Notifications</span>
                      <button className="mark-read-btn" onClick={() => setNotifications(0)}>
                        Mark all read
                      </button>
                    </div>
                    <div className="notifications-list-modern">
                      {notificationItems.map(renderNotification)}
                    </div>
                    <div className="notifications-footer-modern">
                      <button onClick={() => navigateTo('/notifications')}>
                        View All
                        <IoArrowForwardOutline size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

{/*               Wishlist */}
              <div className="action-item" onClick={() => navigateTo('/wishlist')}>
                <div
                  className="action-button"
                  aria-label={`Wishlist ${wishlistCount > 0 ? `(${wishlistCount} items)` : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigateTo('/wishlist')}
                >
                  {wishlistCount > 0 ? (
                    <AiFillHeart size={22} color="#e63946" />
                  ) : (
                    <AiOutlineHeart size={22} />
                  )}
                  {wishlistCount > 0 && (
                    <span className="action-badge">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="action-label">Wishlist</span>
              </div>

{/*               Cart */}
              <div className="action-item" onClick={() => navigateTo('/cart')}>
                <div
                  className="action-button cart-button"
                  aria-label={`Cart ${cartCount > 0 ? `(${cartCount} items)` : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigateTo('/cart')}
                >
                  <FaShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="action-badge cart-badge">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="action-label">Cart</span>
              </div>

              {/* User */}
              <div className="action-item" ref={dropdownRefs.user}>
                <div
                  className="action-button user-button"
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  aria-label={isLoggedIn ? "Account menu" : "Login"}
                >
                  {isLoggedIn ? (
                    <div className="user-avatar-mini">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  ) : (
                    <FaUserAlt size={20} />
                  )}
                  {isLoggedIn && <div className="user-status-indicator" />}
                </div>
                <span className="action-label">{isLoggedIn ? 'Account' : 'Login'}</span>

                {userDropdownOpen && (
                  <div className="user-dropdown-modern" role="menu">
                    {isLoggedIn ? (
                      <>
                        <div className="user-dropdown-header">
                          <div className="user-avatar-large">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="user-dropdown-info">
                            <strong>{user?.name || 'User'}</strong>
                            <span>{user?.email || ''}</span>
                            <div className="user-verified-badge">
                              <MdVerified size={14} /> Verified Member
                            </div>
                          </div>
                        </div>
                        <div className="user-dropdown-menu">
                          {[
                            { icon: <FaUserAlt size={16} />, label: 'My Profile', path: '/profile' },
                            { icon: <MdOutlineShoppingBag size={16} />, label: 'My Orders', path: '/orders' },
                            { icon: <MdDashboard size={16} />, label: 'Dashboard', path: '/dashboard' },
                            { icon: <MdOutlineFavorite size={16} />, label: 'Wishlist', path: '/wishlist' },
                            { icon: <IoSettingsOutline size={16} />, label: 'Settings', path: '/settings' }
                          ].map((item, idx) => (
                            <button key={idx} onClick={() => navigateTo(item.path)} role="menuitem">
                              {item.icon}
                              {item.label}
                            </button>
                          ))}
                          <div className="dropdown-divider" />
                          <button onClick={handleLogout} className="logout-btn">
                            <IoLogOutOutline size={16} />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="user-dropdown-menu">
                        <button onClick={() => navigateTo('/login')} role="menuitem">
                          <FaSignInAlt size={16} />
                          Login
                        </button>
                        <button onClick={() => navigateTo('/register')} role="menuitem">
                          <FaUserPlus size={16} />
                          Create Account
                        </button>
                        <div className="dropdown-divider" />
                        <div className="login-benefits">
                          <p>✨ Join AutoHive for:</p>
                          <ul>
                            <li><IoCheckmarkCircleOutline size={14} /> Exclusive deals</li>
                            <li><IoCheckmarkCircleOutline size={14} /> Faster checkout</li>
                            <li><IoCheckmarkCircleOutline size={14} /> Order tracking</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ============================================
          STYLES - (compressed for space)
          ============================================ */}
      <style>{`
        .header-container-wrapper {
          width: 100%;
          will-change: transform;
          transform: translateY(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .topbar-modern {
          background: linear-gradient(135deg, #0f172a, #1a1a2e);
          color: rgba(255,255,255,0.8);
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          width: 100%;
          will-change: transform;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .topbar-modern-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          flex-wrap: wrap;
          gap: 8px;
        }

        .topbar-left { flex: 1; overflow: hidden; }
        .topbar-marquee {
          display: flex;
          align-items: center;
          gap: 20px;
          white-space: nowrap;
          font-weight: 500;
        }
        .separator-dot { color: #e63946; font-weight: bold; }
        .topbar-right { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }

        .topbar-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 20px;
        }
        .topbar-link:hover { color: white; background: rgba(230,57,70,0.1); }
        .topbar-link svg { color: #e63946; }

        .topbar-social { display: flex; gap: 12px; align-items: center; }
        .topbar-social a {
          color: rgba(255,255,255,0.5);
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .topbar-social a:hover { color: #e63946; background: rgba(230,57,70,0.1); }

        .header-modern {
          background: linear-gradient(135deg, #0f172a, #1a1a2e);
          color: white;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          width: 100%;
          will-change: transform;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .header-modern-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .logo-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-decoration: none;
          position: relative;
        }

        .logo-icon-wrapper { position: relative; }
        .logo-icon { position: relative; width: 44px; height: 44px; }
        .logo-badge {
          position: absolute;
          top: -6px;
          right: -10px;
          background: linear-gradient(135deg, #e63946, #ff6b7c);
          color: white;
          font-size: 0.5rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(230,57,70,0.3);
        }

        .logo-text { display: flex; flex-direction: column; line-height: 1.2; }
        .logo-main {
          font-size: 26px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-sub {
          font-size: 12px;
          font-weight: 700;
          color: #e63946;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          -webkit-text-fill-color: #e63946;
        }

        .quick-actions { display: flex; gap: 8px; }
        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          padding: 6px 14px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .quick-action-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--action-color, #e63946);
          color: white;
        }
        .action-icon { font-size: 1rem; color: var(--action-color, #e63946); }
        .action-label { white-space: nowrap; }

        .header-info-modern { display: flex; gap: 12px; align-items: center; }
        .info-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(255,255,255,0.04);
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: default;
        }
        .info-chip:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.1); }
        .chip-icon { color: #e63946; flex-shrink: 0; }
        .chip-content { display: flex; flex-direction: column; line-height: 1.3; }
        .chip-content span { font-size: 0.6rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; }
        .chip-content strong { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.9); }
        .time-display { font-family: monospace; font-weight: 700; color: #e63946 !important; }
        .date-display { color: #10b981 !important; }
        .time-chip .chip-content strong { font-size: 0.8rem; }

        .mobile-toggle-modern {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 1002;
        }
        .mobile-toggle-modern span {
          width: 28px;
          height: 2.5px;
          background: white;
          border-radius: 2px;
        }
        .mobile-toggle-modern.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); background: #e63946; }
        .mobile-toggle-modern.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .mobile-toggle-modern.active span:nth-child(3) { transform: rotate(-45deg) translate(7px, -7px); background: #e63946; }

        .nav-modern {
          background: white;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          width: 100%;
          will-change: transform;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .nav-modern-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
          gap: 16px;
        }

        .categories-modern { position: relative; }
        .categories-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(230,57,70,0.3);
        }
        .categories-toggle:hover { box-shadow: 0 4px 20px rgba(230,57,70,0.4); }
        .categories-toggle:active { transform: scale(0.98); }
        .arrow-icon { display: inline-block; }
        .arrow-icon.open { transform: rotate(180deg); }

        .categories-dropdown-modern {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          width: 320px;
          z-index: 1000;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .categories-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f1f5f9;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .categories-title { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
        .categories-close { background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; border-radius: 50%; }
        .categories-close:hover { background: rgba(0,0,0,0.05); color: #0f172a; }

        .categories-grid { padding: 8px 0; max-height: 400px; overflow-y: auto; }
        .categories-grid::-webkit-scrollbar { width: 4px; }
        .categories-grid::-webkit-scrollbar-track { background: #f1f5f9; }
        .categories-grid::-webkit-scrollbar-thumb { background: #e63946; border-radius: 2px; }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          cursor: pointer;
          border-left: 3px solid transparent;
        }
        .category-item:hover { background: #f1f5f9; border-left-color: #e63946; }

        .category-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .category-info { flex: 1; }
        .category-name { display: block; font-weight: 600; color: #0f172a; font-size: 0.85rem; }
        .category-count { font-size: 0.7rem; color: #64748b; }
        .category-arrow { color: #64748b; opacity: 0; }
        .category-item:hover .category-arrow { opacity: 1; color: #e63946; }

        .categories-footer { padding: 12px 20px; border-top: 1px solid rgba(0,0,0,0.05); background: #f1f5f9; }
        .view-all-categories {
          width: 100%;
          padding: 10px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .view-all-categories:hover { background: #e63946; gap: 12px; }

        .nav-links-modern {
          display: flex;
          gap: 28px;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: #1e293b;
          font-weight: 600;
          padding: 6px 0;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
        }
        .nav-icon { opacity: 0.5; }
        .nav-link:hover .nav-icon, .nav-link.active .nav-icon { opacity: 1; color: #e63946; }
        .nav-link:hover .nav-label, .nav-link.active .nav-label { color: #e63946; }
        .nav-badge { background: #e63946; color: white; font-size: 0.55rem; font-weight: 700; padding: 1px 8px; border-radius: 20px; }
        .active-indicator {
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2.5px;
          background: linear-gradient(90deg, #e63946, #ff6b7c);
          border-radius: 2px;
          box-shadow: 0 0 12px rgba(230,57,70,0.3);
        }

        .search-modern { display: flex; align-items: center; flex: 1; max-width: 420px; }
        .search-form-modern {
          position: relative;
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border-radius: 30px;
          overflow: hidden;
          border: 2px solid transparent;
          width: 100%;
        }
        .search-form-modern:focus-within { border-color: #e63946; background: white; box-shadow: 0 0 0 4px rgba(230,57,70,0.08); }
        .search-icon-modern {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
        }
        .search-input-modern {
          padding: 9px 50px 9px 42px;
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.85rem;
          outline: none;
          color: #0f172a;
        }
        .search-input-modern::placeholder { color: #64748b; }
        .search-clear-modern {
          position: absolute;
          right: 52px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
        }
        .search-clear-modern:hover { background: rgba(0,0,0,0.05); color: #0f172a; }
        .search-submit-modern {
          background: linear-gradient(135deg, #e63946, #c92c3a);
          border: none;
          padding: 9px 16px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0 30px 30px 0;
        }
        .search-submit-modern:hover { background: linear-gradient(135deg, #c92c3a, #e63946); }
        .search-toggle-modern {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #1e293b;
          padding: 8px;
          border-radius: 50%;
        }
        .search-toggle-modern:hover { background: #f1f5f9; color: #e63946; }

        .search-suggestions-modern {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          z-index: 1000;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .suggestions-header {
          padding: 10px 16px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .suggestion-item-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          cursor: pointer;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }
        .suggestion-item-modern:last-child { border-bottom: none; }
        .suggestion-item-modern:hover { background: #f1f5f9; }
        .suggestion-icon { font-size: 1rem; }
        .suggestion-info { flex: 1; }
        .suggestion-name { display: block; font-weight: 500; color: #0f172a; font-size: 0.85rem; }
        .suggestion-category { font-size: 0.65rem; color: #64748b; }
        .suggestion-badge { background: #e63946; color: white; font-size: 0.55rem; font-weight: 700; padding: 2px 10px; border-radius: 20px; }

        .action-icons-modern { display: flex; gap: 16px; align-items: center; }
        .action-item { position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .action-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: #1e293b;
        }
        .action-button:hover { background: #f1f5f9; color: #e63946; }
        .action-label { font-size: 0.55rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
        .action-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          font-size: 0.6rem;
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(230,57,70,0.3);
        }
        .cart-button { background: rgba(230,57,70,0.05); }
        .cart-button:hover { background: rgba(230,57,70,0.1); }
        .cart-badge { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 2px 8px rgba(245,158,11,0.3); }
        .user-avatar-mini {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #e63946, #ff6b7c);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .user-status-indicator {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
        }

        .notifications-modern {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 380px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          z-index: 1000;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .notifications-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          background: #f1f5f9;
        }
        .notifications-title { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
        .mark-read-btn { background: none; border: none; font-size: 0.7rem; color: #e63946; font-weight: 600; cursor: pointer; padding: 4px 12px; border-radius: 20px; }
        .mark-read-btn:hover { background: rgba(230,57,70,0.1); }
        .notifications-list-modern { max-height: 380px; overflow-y: auto; }
        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          cursor: pointer;
        }
        .notification-item:hover { background: #f1f5f9; }
        .notification-item.unread { background: rgba(230,57,70,0.03); border-left: 3px solid #e63946; }
        .notification-icon-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #e63946;
          border-radius: 50%;
        }
        .notification-content { flex: 1; }
        .notification-content strong { display: block; font-size: 0.85rem; color: #0f172a; margin-bottom: 2px; }
        .notification-content p { font-size: 0.75rem; color: #64748b; margin: 0 0 4px; line-height: 1.4; }
        .notification-time { font-size: 0.65rem; color: #64748b; }
        .notifications-footer-modern {
          padding: 12px 20px;
          border-top: 1px solid rgba(0,0,0,0.05);
          background: #f1f5f9;
          text-align: center;
        }
        .notifications-footer-modern button {
          background: none;
          border: none;
          color: #e63946;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .notifications-footer-modern button:hover { gap: 10px; color: #c92c3a; }

        .user-dropdown-modern {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          z-index: 1000;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .user-dropdown-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f1f5f9, white);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .user-avatar-large {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #e63946, #ff6b7c);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.4rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(230,57,70,0.3);
        }
        .user-dropdown-info { flex: 1; }
        .user-dropdown-info strong { display: block; font-size: 0.95rem; color: #0f172a; margin-bottom: 2px; }
        .user-dropdown-info span { font-size: 0.7rem; color: #64748b; display: block; }
        .user-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16,185,129,0.1);
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.6rem;
          color: #10b981;
          font-weight: 600;
          margin-top: 4px;
        }
        .user-dropdown-menu { padding: 8px 0; }
        .user-dropdown-menu button {
          width: 100%;
          padding: 10px 24px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #1e293b;
          font-weight: 500;
        }
        .user-dropdown-menu button:hover { background: #f1f5f9; color: #e63946; }
        .user-dropdown-menu button svg { color: #64748b; }
        .user-dropdown-menu button:hover svg { color: #e63946; }
        .logout-btn { color: #ef4444 !important; }
        .logout-btn:hover { background: #fef2f2 !important; color: #dc2626 !important; }
        .dropdown-divider { height: 1px; background: rgba(0,0,0,0.05); margin: 8px 0; }
        .login-benefits { padding: 16px 24px; }
        .login-benefits p { font-size: 0.75rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .login-benefits ul { list-style: none; padding: 0; margin: 0; }
        .login-benefits li { font-size: 0.7rem; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .login-benefits li svg { color: #10b981; }

        @media (max-width: 1200px) {
          .quick-actions { display: none; }
          .header-info-modern { display: none; }
        }

        @media (max-width: 1024px) {
          .topbar-modern-container, .header-modern-container, .nav-modern-container { padding: 0 20px; }
          .search-modern { max-width: 280px; }
          .nav-links-modern { gap: 20px; }
        }

        @media (max-width: 768px) {
          .topbar-right { display: none; }
          .topbar-left { width: 100%; text-align: center; }
          .mobile-toggle-modern { display: flex; }
          .categories-toggle span { display: none; }
          .categories-toggle { padding: 8px 14px; }
          .nav-links-modern {
            position: fixed;
            top: 0;
            left: -100%;
            width: 85%;
            max-width: 340px;
            height: 100vh;
            background: white;
            flex-direction: column;
            padding: 80px 24px 24px;
            gap: 0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            z-index: 999;
            overflow-y: auto;
          }
          .nav-modern.mobile-open .nav-links-modern { left: 0; }
          .nav-link { padding: 16px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 1rem; }
          .nav-icon { opacity: 1; }
          .search-modern { flex: 1; justify-content: flex-end; max-width: none; }
          .search-form-modern {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            margin: 0 16px;
            width: auto;
            z-index: 1000;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 12px;
          }
          .search-toggle-modern { display: block; }
          .action-label { display: none; }
          .action-icons-modern { gap: 8px; }
          .action-button { width: 36px; height: 36px; }
          .user-dropdown-modern, .notifications-modern, .categories-dropdown-modern {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            border-radius: 24px 24px 0 0;
            max-height: 80vh;
            overflow-y: auto;
            margin-top: 0;
          }
          .notifications-modern { width: 100%; }
          .user-dropdown-modern { width: 100%; }
          .search-suggestions-modern { position: fixed; top: 120px; left: 16px; right: 16px; max-height: 50vh; }
        }

        @media (max-width: 576px) {
          .topbar-modern-container { padding: 0 12px; }
          .logo-main { font-size: 20px; }
          .logo-sub { font-size: 10px; }
          .logo-icon { width: 36px; height: 36px; }
          .logo-badge { display: none; }
          .header-modern-container, .nav-modern-container { padding: 0 12px; }
          .action-icons-modern { gap: 6px; }
          .action-button { width: 32px; height: 32px; }
          .action-button svg { width: 18px; height: 18px; }
          .action-badge { min-width: 18px; height: 18px; font-size: 0.55rem; }
          .user-avatar-mini { width: 28px; height: 28px; font-size: 0.7rem; }
          .nav-links-modern { max-width: 280px; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; }
        }

        button:focus-visible, a:focus-visible { outline: 2px solid #e63946; outline-offset: 2px; }
        ::selection { background: #e63946; color: white; }
      `}</style>
    </>
  )
}

export default ClientHeader