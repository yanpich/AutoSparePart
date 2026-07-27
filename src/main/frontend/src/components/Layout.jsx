import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'

const menuItems = [
  {
    path: '/dashboard',
    icon: 'bi-speedometer2',
    label: 'Dashboard',
    roles: ['ADMIN', 'USER'],
    description: 'Overview & analytics',
    category: 'Main'
  },
  {
    path: '/users',
    icon: 'bi-people',
    label: 'User Management',
    roles: ['ADMIN'],
    description: 'Manage user accounts & roles',
    category: 'Management'
  },
  {
    path: '/brands',
    icon: 'bi-bookmark-star',
    label: 'Brands',
    roles: ['ADMIN', 'USER'],
    description: 'Brand management',
    category: 'Catalog'
  },
  {
    path: '/categories',
    icon: 'bi-tags',
    label: 'Categories',
    roles: ['ADMIN', 'USER'],
    description: 'Product categories',
    category: 'Catalog'
  },
  {
    path: '/vehicles',
    icon: 'bi-truck',
    label: 'Vehicles',
    roles: ['ADMIN', 'USER'],
    description: 'Vehicle models',
    category: 'Catalog'
  },
  {
    path: '/products',
    icon: 'bi-box-seam',
    label: 'Products',
    roles: ['ADMIN', 'USER'],
    description: 'Product inventory',
    category: 'Catalog'
  },
]

// Group menu items by category
const groupMenuItems = (items) => {
  const groups = {}
  items.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
  })
  return groups
}

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [expandedCategories, setExpandedCategories] = useState(['Main', 'Management', 'Catalog'])
  const [userRole, setUserRole] = useState('USER')
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Get user from localStorage safely
  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return {}
      const userData = JSON.parse(userStr)
      console.log('User data loaded:', userData)
      return userData
    } catch (e) {
      console.error('Failed to parse user:', e)
      return {}
    }
  }

  const user = getUser()

  // Get user role with multiple fallbacks
  useEffect(() => {
    const role = user.role || user.roleName || user.authorities?.[0] || 'USER'
    setUserRole(role)
    console.log('User role set to:', role)
  }, [user])

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992)
      if (window.innerWidth > 992) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    const hasAccess = item.roles.includes(userRole) || item.roles.includes('USER')
    console.log(`Menu item ${item.label} - Role: ${userRole} - Access: ${hasAccess}`)
    return hasAccess
  })

  const groupedItems = groupMenuItems(filteredMenuItems)

  // Get user initial for avatar
  const userInitial = (user.fullName || user.name || 'A').charAt(0).toUpperCase()
  const userFullName = user.fullName || user.name || 'Admin'
  const userEmail = user.email || 'admin@example.com'
  const displayRole = userRole === 'ADMIN' ? 'Administrator' : 'User'

  // Calculate sidebar width
  const sidebarWidth = sidebarCollapsed ? '80px' : '280px'
  const sidebarTransform = isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)'

  // Format current time
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Main': return 'bi-grid';
      case 'Management': return 'bi-shield-lock';
      case 'Catalog': return 'bi-collection';
      default: return 'bi-folder';
    }
  }

  // Get current page label
  const currentPageLabel = menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'

  return (
    <div className="modern-layout">
      {/* Sidebar */}
      <div
        className={`modern-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: sidebarWidth,
          transform: sidebarTransform,
        }}
      >
        {/* Premium Logo Section - Mercedes Inspired */}
        <div className="sidebar-logo premium-logo">
          <div className="logo-wrapper">
            <div className="logo-icon premium">
              {/* Mercedes-inspired 3-point star logo */}
              <svg viewBox="0 0 100 100" className="mercedes-logo">
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="3"/>
                <line x1="50" y1="5" x2="50" y2="50" stroke="url(#gradient)" strokeWidth="2.5"/>
                <line x1="50" y1="50" x2="15" y2="80" stroke="url(#gradient)" strokeWidth="2.5"/>
                <line x1="50" y1="50" x2="85" y2="80" stroke="url(#gradient)" strokeWidth="2.5"/>
                <circle cx="50" cy="50" r="8" fill="url(#gradient)"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className="logo-text premium">
                <h5 className="mb-0">AUTO<span className="highlight">SPARE</span></h5>
                <small>Premium Auto Parts</small>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="logo-badge premium">
              <span className="badge">LUXURY</span>
            </div>
          )}
        </div>

        {/* User Info Section (when collapsed) */}
        {sidebarCollapsed && (
          <div className="sidebar-user-collapsed text-center py-3">
            <div className="user-avatar-sm premium">
              {userInitial}
            </div>
          </div>
        )}

        {/* Navigation Menu with Categories */}
        <div className="sidebar-nav">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="nav-category">
              {!sidebarCollapsed && (
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="category-icon">
                    <i className={`bi ${getCategoryIcon(category)}`}></i>
                  </div>
                  <span className="category-label">{category}</span>
                  <i className={`bi bi-chevron-${expandedCategories.includes(category) ? 'down' : 'right'} category-arrow`}></i>
                </button>
              )}

              {(expandedCategories.includes(category) || sidebarCollapsed) && (
                <div className="category-items">
                  {items.map(item => (
                    <button
                      key={item.path}
                      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => {
                        navigate(item.path)
                        if (isMobile) setMobileOpen(false)
                      }}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="nav-icon">
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      {!sidebarCollapsed && (
                        <div className="nav-text">
                          <span>{item.label}</span>
                          <small>{item.description}</small>
                        </div>
                      )}
                      {sidebarCollapsed && hoveredItem === item.path && (
                        <div className="nav-tooltip">
                          {item.label}
                        </div>
                      )}
                      {location.pathname === item.path && !sidebarCollapsed && (
                        <div className="nav-indicator"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="sidebar-footer">
          <hr className="sidebar-divider" />
          <button
            className="nav-item logout-btn"
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="nav-icon">
              <i className="bi bi-box-arrow-right"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="nav-text">
                <span>Logout</span>
                <small>Exit application</small>
              </div>
            )}
            {sidebarCollapsed && hoveredItem === 'logout' && (
              <div className="nav-tooltip">Logout</div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content */}
      <div
        className="modern-main"
        style={{
          marginLeft: isMobile ? '0' : sidebarWidth,
        }}
      >
        {/* Top Navbar */}
        <nav className="modern-navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <div className="breadcrumb">
              <Link to="/dashboard" className="breadcrumb-item">
                <i className="bi bi-house-door"></i>
              </Link>
              <i className="bi bi-chevron-right breadcrumb-sep"></i>
              <span className="breadcrumb-item active">
                {currentPageLabel}
              </span>
            </div>
          </div>

          <div className="navbar-right">
            {/* Date & Time */}
            <div className="datetime-display">
              <div className="time">{formattedTime}</div>
              <div className="date">{formattedDate}</div>
            </div>

            {/* Notifications */}
            <div className="notification-dropdown">
              <button className="icon-btn">
                <i className="bi bi-bell"></i>
                <span className="notification-badge">3</span>
              </button>
            </div>

            {/* User Menu */}
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {userInitial}
                </div>
                {!sidebarCollapsed && (
                  <div className="user-info">
                    <div className="user-name">{userFullName}</div>
                    <div className="user-role">{displayRole}</div>
                  </div>
                )}
                <i className="bi bi-chevron-down"></i>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{userInitial}</div>
                    <div className="dropdown-info">
                      <div className="dropdown-name">{userFullName}</div>
                      <div className="dropdown-email">{userEmail}</div>
                      <div className="dropdown-role-badge">
                        <span className={`role-badge ${userRole === 'ADMIN' ? 'admin' : 'user'}`}>
                          {displayRole}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => navigate('/profile')}>
                    <i className="bi bi-person"></i>
                    My Profile
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/settings')}>
                    <i className="bi bi-gear"></i>
                    Settings
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      <style jsx>{`
        .modern-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9e8eb 100%);
        }

        /* Sidebar Styles */
        .modern-sidebar {
          position: fixed;
          height: 100vh;
          background: linear-gradient(180deg, #0a0a1a 0%, #0f0f23 100%);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          top: 0;
          left: 0;
          overflow-y: auto;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.2);
        }

        .modern-sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .modern-sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .modern-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        /* Premium Logo Section */
        .sidebar-logo.premium {
          padding: 24px 20px;
          border-bottom: 2px solid rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .sidebar-logo.premium::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .sidebar-logo.premium:hover::before {
          left: 100%;
        }

        .logo-icon.premium {
          width: 45px;
          height: 45px;
          background: transparent;
          position: relative;
          animation: logoGlow 2s ease-in-out infinite;
        }

        @keyframes logoGlow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(102, 126, 234, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.8));
          }
        }

        .mercedes-logo {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          transition: transform 0.3s ease;
        }

        .logo-icon.premium:hover .mercedes-logo {
          transform: rotate(180deg);
        }

        .logo-text.premium h5 {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #fff, #667eea);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-text.premium .highlight {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-text.premium small {
          font-size: 0.6rem;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.6);
        }

        .logo-badge.premium .badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          font-size: 0.6rem;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 1px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        /* User Avatar Premium */
        .user-avatar-sm.premium {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          position: relative;
        }

        .user-avatar-sm.premium::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #667eea, #764ba2, #667eea);
          border-radius: 50%;
          z-index: -1;
          animation: borderRotate 3s linear infinite;
        }

        @keyframes borderRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .user-avatar-sm.premium:hover {
          transform: scale(1.1);
        }

        /* Logo Wrapper */
        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
        }

        .logo-text h5 {
          color: white;
          font-weight: 600;
        }

        .logo-text small {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.7rem;
        }

        .logo-badge .badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          font-size: 0.6rem;
          padding: 4px 8px;
        }

        /* Sidebar User Collapsed */
        .sidebar-user-collapsed {
          padding: 20px;
        }

        .user-avatar-sm {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          margin: 0 auto;
        }

        /* Navigation Categories */
        .sidebar-nav {
          padding: 20px;
          flex: 1;
        }

        .nav-category {
          margin-bottom: 16px;
        }

        .category-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 8px;
        }

        .category-header:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .category-icon {
          width: 24px;
          font-size: 1rem;
        }

        .category-label {
          flex: 1;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: left;
        }

        .category-arrow {
          font-size: 0.7rem;
          transition: transform 0.3s ease;
        }

        .category-items {
          margin-left: 12px;
          padding-left: 12px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Navigation Items */
        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          margin-bottom: 4px;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          transform: translateX(5px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          color: white;
          border-left: 3px solid #667eea;
        }

        .nav-icon {
          width: 24px;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .nav-text span {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .nav-text small {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .nav-indicator {
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 2px;
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
        }

        .nav-tooltip {
          position: absolute;
          left: 70px;
          background: #1a1a2e;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          white-space: nowrap;
          z-index: 1001;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: fadeIn 0.2s ease;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 20px;
          margin-top: auto;
        }

        .sidebar-divider {
          margin: 0 0 16px 0;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          color: rgba(255, 107, 107, 0.8);
        }

        .logout-btn:hover {
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
        }

        /* Sidebar Collapsed */
        .modern-sidebar.collapsed .category-header {
          justify-content: center;
          padding: 10px;
        }

        .modern-sidebar.collapsed .category-label,
        .modern-sidebar.collapsed .category-arrow {
          display: none;
        }

        .modern-sidebar.collapsed .category-items {
          margin-left: 0;
          padding-left: 0;
          border-left: none;
        }

        .modern-sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 12px;
        }

        .modern-sidebar.collapsed .nav-icon {
          width: auto;
        }

        /* Mobile Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          animation: fadeIn 0.3s ease;
        }

        /* Main Content */
        .modern-main {
          flex: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          min-height: 100vh;
        }

        /* Navbar */
        .modern-navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .menu-toggle {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: #333;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-toggle:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.05);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .breadcrumb-item {
          text-decoration: none;
          color: #6c757d;
          transition: color 0.3s ease;
        }

        .breadcrumb-item:hover {
          color: #667eea;
        }

        .breadcrumb-item.active {
          color: #333;
          font-weight: 500;
        }

        .breadcrumb-sep {
          font-size: 0.7rem;
          color: #dee2e6;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* DateTime Display */
        .datetime-display {
          text-align: right;
          padding: 0 12px;
          border-right: 1px solid #e9ecef;
        }

        .datetime-display .time {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
        }

        .datetime-display .date {
          font-size: 0.7rem;
          color: #6c757d;
        }

        /* Icon Buttons */
        .icon-btn {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          color: #6c757d;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #667eea;
          transform: scale(1.05);
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ff4757;
          color: white;
          font-size: 0.6rem;
          padding: 2px 5px;
          border-radius: 10px;
          font-weight: bold;
        }

        /* User Menu */
        .user-menu {
          position: relative;
        }

        .user-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-trigger:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1rem;
        }

        .user-info {
          text-align: left;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
        }

        .user-role {
          font-size: 0.7rem;
          color: #6c757d;
        }

        .user-trigger i {
          font-size: 0.8rem;
          color: #6c757d;
          transition: transform 0.3s ease;
        }

        .user-trigger:hover i {
          transform: rotate(180deg);
        }

        /* User Dropdown */
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 280px;
          z-index: 1000;
          animation: slideDown 0.3s ease;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }

        .dropdown-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .dropdown-info {
          flex: 1;
        }

        .dropdown-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .dropdown-email {
          font-size: 0.7rem;
          color: #6c757d;
          margin-bottom: 6px;
        }

        .dropdown-role-badge {
          display: inline-block;
        }

        .role-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.6rem;
          font-weight: 600;
        }

        .role-badge.admin {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .role-badge.user {
          background: #e9ecef;
          color: #6c757d;
        }

        .dropdown-divider {
          height: 1px;
          background: #e9ecef;
          margin: 8px 0;
        }

        .dropdown-item {
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #333;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-item i {
          width: 20px;
        }

        .dropdown-item.text-danger {
          color: #ff4757;
        }

        .dropdown-item.text-danger:hover {
          background: rgba(255, 71, 87, 0.1);
        }

        /* Page Content */
        .page-content {
          padding: 24px;
          min-height: calc(100vh - 64px);
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-navbar {
            padding: 10px 16px;
          }

          .breadcrumb {
            display: none;
          }

          .datetime-display {
            display: none;
          }

          .user-info {
            display: none;
          }

          .page-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default Layout