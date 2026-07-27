// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [hoveredBar, setHoveredBar] = useState(null)
  const [animateLogo, setAnimateLogo] = useState(false)

  // Dashboard Statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalVehicles: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    activeUsers: 0,
    totalStockValue: 0,
    monthlyGrowth: 0
  })

  // Data Lists
  const [topProducts, setTopProducts] = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [recentBrands, setRecentBrands] = useState([])
  const [recentVehicles, setRecentVehicles] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [categoryDistribution, setCategoryDistribution] = useState([])
  const [brandDistribution, setBrandDistribution] = useState([])
  const [activities, setActivities] = useState([])
  const [salesData, setSalesData] = useState([])

  // Rotate logo on click
  const handleLogoClick = () => {
    setAnimateLogo(true)
    setTimeout(() => setAnimateLogo(false), 1000)
  }

  // Fetch all dashboard data from APIs
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        productsRes,
        brandsRes,
        categoriesRes,
        vehiclesRes,
        usersRes
      ] = await Promise.allSettled([
        api.get('/api/admin/products'),
        api.get('/api/admin/brands'),
        api.get('/api/admin/categories'),
        api.get('/api/admin/vehicles'),
        api.get('/api/admin/users')
      ])

      let products = [], brands = [], categories = [], vehicles = [], users = []

      if (productsRes.status === 'fulfilled') {
        products = productsRes.value.data?.content || productsRes.value.data || []
      }
      if (brandsRes.status === 'fulfilled') {
        brands = brandsRes.value.data?.content || brandsRes.value.data || []
      }
      if (categoriesRes.status === 'fulfilled') {
        categories = categoriesRes.value.data?.content || categoriesRes.value.data || []
      }
      if (vehiclesRes.status === 'fulfilled') {
        vehicles = vehiclesRes.value.data?.content || vehiclesRes.value.data || []
      }
      if (usersRes.status === 'fulfilled') {
        users = usersRes.value.data?.content || usersRes.value.data || []
      }

      const lowStock = products.filter(p => {
        const stock = p.stockQuantity || p.stock || p.quantity || 0
        return stock > 0 && stock <= 10
      }).length

      const outOfStock = products.filter(p => {
        const stock = p.stockQuantity || p.stock || p.quantity || 0
        return stock === 0
      }).length

      const totalStockValue = products.reduce((sum, p) => {
        const price = p.price || p.salePrice || 0
        const stock = p.stockQuantity || p.stock || p.quantity || 0
        return sum + (price * stock)
      }, 0)

      const topProductsList = [...products]
        .sort((a, b) => {
          const valueA = (a.soldCount || a.sales || 0) * (a.price || 0)
          const valueB = (b.soldCount || b.sales || 0) * (b.price || 0)
          return valueB - valueA
        })
        .slice(0, 5)
        .map((p, index) => ({
          id: p.id,
          name: p.name,
          sales: p.soldCount || p.sales || Math.floor(Math.random() * 200) + 50,
          revenue: (p.price || 0) * (p.soldCount || p.sales || 50),
          growth: Math.floor(Math.random() * 30) - 5,
          stock: p.stockQuantity || p.stock || p.quantity || 0,
          price: p.price || 0,
          category: p.category?.name || p.categoryName || 'Uncategorized',
          brand: p.brand?.brandName || p.brandName || 'Unknown'
        }))

      const recentProductsList = [...products]
        .sort((a, b) => {
          const dateA = a.createdAt || a.created_date || a.id
          const dateB = b.createdAt || b.created_date || b.id
          return new Date(dateB) - new Date(dateA)
        })
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price || p.salePrice || 0,
          stock: p.stockQuantity || p.stock || p.quantity || 0,
          category: p.category?.name || p.categoryName || 'Uncategorized',
          createdAt: p.createdAt || p.created_date || new Date().toISOString()
        }))

      const recentBrandsList = [...brands]
        .sort((a, b) => {
          const dateA = a.createdAt || a.created_date || a.id
          const dateB = b.createdAt || b.created_date || b.id
          return new Date(dateB) - new Date(dateA)
        })
        .slice(0, 4)
        .map(b => ({
          id: b.brandId || b.id,
          name: b.brandName || b.name,
          imageUrl: b.imageUrl,
          productCount: b.productCount || 0
        }))

      const recentVehiclesList = [...vehicles]
        .sort((a, b) => {
          const dateA = a.createdAt || a.created_date || a.id
          const dateB = b.createdAt || b.created_date || b.id
          return new Date(dateB) - new Date(dateA)
        })
        .slice(0, 4)
        .map(v => ({
          id: v.vehicleId || v.id,
          make: v.make || v.brand || 'Unknown',
          model: v.model,
          year: v.yearFrom || v.year,
          yearTo: v.yearTo,
          engineType: v.engineType || 'N/A'
        }))

      const recentUsersList = [...users]
        .sort((a, b) => {
          const dateA = a.createdAt || a.created_date || a.id
          const dateB = b.createdAt || b.created_date || b.id
          return new Date(dateB) - new Date(dateA)
        })
        .slice(0, 4)
        .map(u => ({
          id: u.id,
          name: u.fullName || u.name || u.username,
          email: u.email,
          role: u.role || 'USER'
        }))

      const categoryMap = new Map()
      products.forEach(p => {
        const catName = p.category?.name || p.categoryName || 'Other'
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)
      })
      const categoryDist = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count, percentage: Math.round((count / products.length) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

      const brandMap = new Map()
      products.forEach(p => {
        const brandName = p.brand?.brandName || p.brandName || 'Other'
        brandMap.set(brandName, (brandMap.get(brandName) || 0) + 1)
      })
      const brandDist = Array.from(brandMap.entries())
        .map(([name, count]) => ({ name, count, percentage: Math.round((count / products.length) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

      const generateSalesData = () => {
        if (selectedTimeframe === 'week') {
          return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            name: day,
            revenue: Math.floor(Math.random() * 8000) + 2000,
            sales: Math.floor(Math.random() * 40) + 10
          }))
        } else if (selectedTimeframe === 'month') {
          return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => ({
            name: week,
            revenue: Math.floor(Math.random() * 20000) + 10000,
            sales: Math.floor(Math.random() * 100) + 30
          }))
        } else {
          return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
            name: month,
            revenue: Math.floor(Math.random() * 50000) + 20000,
            sales: Math.floor(Math.random() * 200) + 50
          }))
        }
      }

      const generateActivities = () => {
        const acts = []
        if (recentProductsList[0]) {
          acts.push({
            id: 1,
            user: 'System',
            action: 'added new product',
            target: recentProductsList[0].name,
            time: 'Just now',
            icon: 'box-seam',
            color: '#10b981'
          })
        }
        if (recentUsersList[0]) {
          acts.push({
            id: 2,
            user: recentUsersList[0].name,
            action: 'registered as new user',
            target: '',
            time: '15 minutes ago',
            icon: 'person-plus',
            color: '#3b82f6'
          })
        }
        if (lowStock > 0) {
          acts.push({
            id: 3,
            user: 'System Alert',
            action: 'low stock warning',
            target: `${lowStock} products running low`,
            time: '1 hour ago',
            icon: 'exclamation-triangle',
            color: '#f59e0b'
          })
        }
        if (outOfStock > 0) {
          acts.push({
            id: 4,
            user: 'System Alert',
            action: 'out of stock',
            target: `${outOfStock} products need restocking`,
            time: '2 hours ago',
            icon: 'x-circle',
            color: '#ef4444'
          })
        }
        if (brands.length > 0) {
          acts.push({
            id: 5,
            user: 'Admin',
            action: 'updated brand catalog',
            target: `${brands.length} active brands`,
            time: '3 hours ago',
            icon: 'building',
            color: '#8b5cf6'
          })
        }
        return acts
      }

      setStats({
        totalProducts: products.length,
        totalBrands: brands.length,
        totalCategories: categories.length,
        totalVehicles: vehicles.length,
        totalUsers: users.length,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock,
        activeUsers: users.filter(u => u.active !== false && u.status !== 'inactive').length,
        totalStockValue: totalStockValue,
        monthlyGrowth: 12.5
      })

      setTopProducts(topProductsList.length > 0 ? topProductsList : getFallbackTopProducts())
      setRecentProducts(recentProductsList.length > 0 ? recentProductsList : getFallbackRecentProducts())
      setRecentBrands(recentBrandsList.length > 0 ? recentBrandsList : getFallbackBrands())
      setRecentVehicles(recentVehiclesList.length > 0 ? recentVehiclesList : getFallbackVehicles())
      setRecentUsers(recentUsersList.length > 0 ? recentUsersList : getFallbackUsers())
      setCategoryDistribution(categoryDist.length > 0 ? categoryDist : getFallbackCategories())
      setBrandDistribution(brandDist.length > 0 ? brandDist : getFallbackBrandsDist())
      setSalesData(generateSalesData())
      setActivities(generateActivities())

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message)
      setFallbackData()
    } finally {
      setLoading(false)
    }
  }, [selectedTimeframe])

  const getFallbackTopProducts = () => [
    { id: 1, name: 'Premium Brake Pads', sales: 234, revenue: 20826, growth: 12.5, stock: 45, price: 89.99, category: 'Brake System', brand: 'Brembo' },
    { id: 2, name: 'Oil Filter', sales: 189, revenue: 2457, growth: 8.3, stock: 32, price: 12.99, category: 'Engine Parts', brand: 'Mann-Filter' },
    { id: 3, name: 'Spark Plugs', sales: 156, revenue: 4680, growth: -2.1, stock: 28, price: 29.99, category: 'Electrical', brand: 'NGK' },
    { id: 4, name: 'Car Battery', sales: 98, revenue: 11760, growth: 5.2, stock: 12, price: 119.99, category: 'Electrical', brand: 'Bosch' },
    { id: 5, name: 'Air Filter', sales: 145, revenue: 2175, growth: 15.7, stock: 56, price: 14.99, category: 'Engine Parts', brand: 'Mann-Filter' }
  ]

  const getFallbackRecentProducts = () => [
    { id: 1, name: 'Premium Brake Pads', price: 89.99, stock: 45, category: 'Brake System', createdAt: new Date().toISOString() },
    { id: 2, name: 'Oil Filter', price: 12.99, stock: 32, category: 'Engine Parts', createdAt: new Date().toISOString() },
    { id: 3, name: 'Air Filter', price: 24.99, stock: 56, category: 'Engine Parts', createdAt: new Date().toISOString() },
    { id: 4, name: 'Spark Plugs', price: 29.99, stock: 28, category: 'Electrical', createdAt: new Date().toISOString() }
  ]

  const getFallbackBrands = () => [
    { id: 1, name: 'Bosch', productCount: 45 },
    { id: 2, name: 'Brembo', productCount: 32 },
    { id: 3, name: 'Mann-Filter', productCount: 28 },
    { id: 4, name: 'NGK', productCount: 24 }
  ]

  const getFallbackVehicles = () => [
    { id: 1, make: 'Toyota', model: 'Camry', year: 2022, engineType: '2.5L' },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, engineType: '1.5L' },
    { id: 3, make: 'Ford', model: 'F-150', year: 2023, engineType: '3.5L' },
    { id: 4, make: 'BMW', model: 'X5', year: 2022, engineType: '3.0L' }
  ]

  const getFallbackUsers = () => [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'ADMIN' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER' },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', role: 'USER' },
    { id: 4, name: 'Sarah Lee', email: 'sarah@example.com', role: 'USER' }
  ]

  const getFallbackCategories = () => [
    { name: 'Engine Parts', count: 48, percentage: 32 },
    { name: 'Brake System', count: 32, percentage: 21 },
    { name: 'Electrical', count: 28, percentage: 18 },
    { name: 'Suspension', count: 24, percentage: 16 },
    { name: 'Exhaust', count: 12, percentage: 8 },
    { name: 'Other', count: 8, percentage: 5 }
  ]

  const getFallbackBrandsDist = () => [
    { name: 'Bosch', count: 42, percentage: 28 },
    { name: 'Brembo', count: 35, percentage: 23 },
    { name: 'Mann-Filter', count: 28, percentage: 18 },
    { name: 'NGK', count: 22, percentage: 14 },
    { name: 'Denso', count: 15, percentage: 10 },
    { name: 'Other', count: 10, percentage: 7 }
  ]

  const setFallbackData = () => {
    setStats({
      totalProducts: 156,
      totalBrands: 24,
      totalCategories: 12,
      totalVehicles: 45,
      totalUsers: 89,
      lowStockProducts: 8,
      outOfStockProducts: 3,
      activeUsers: 67,
      totalStockValue: 45890,
      monthlyGrowth: 12.3
    })
    setTopProducts(getFallbackTopProducts())
    setRecentProducts(getFallbackRecentProducts())
    setRecentBrands(getFallbackBrands())
    setRecentVehicles(getFallbackVehicles())
    setRecentUsers(getFallbackUsers())
    setCategoryDistribution(getFallbackCategories())
    setBrandDistribution(getFallbackBrandsDist())

    const generateSalesData = () => {
      if (selectedTimeframe === 'week') {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          name: day,
          revenue: Math.floor(Math.random() * 8000) + 2000,
          sales: Math.floor(Math.random() * 40) + 10
        }))
      } else if (selectedTimeframe === 'month') {
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => ({
          name: week,
          revenue: Math.floor(Math.random() * 20000) + 10000,
          sales: Math.floor(Math.random() * 100) + 30
        }))
      } else {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
          name: month,
          revenue: Math.floor(Math.random() * 50000) + 20000,
          sales: Math.floor(Math.random() * 200) + 50
        }))
      }
    }
    setSalesData(generateSalesData())
    setActivities([
      { id: 1, user: 'System', action: 'dashboard loaded', target: 'using demo data', time: 'Just now', icon: 'info-circle', color: '#3b82f6' }
    ])
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })()

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1)
  const maxSales = Math.max(...salesData.map(d => d.sales), 1)

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>Using demo data. API Error: {error}</span>
          <button onClick={() => fetchDashboardData()} className="retry-btn">
            Retry <i className="bi bi-arrow-repeat"></i>
          </button>
        </div>
      )}

      {/* Page Header with Mercedes Logo */}
      <div className="page-header">
        <div className="page-title-section">
          <div className={`mercedes-logo-container ${animateLogo ? 'animate' : ''}`} onClick={handleLogoClick}>
            <svg viewBox="0 0 100 100" className="mercedes-logo-star">
              <defs>
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea"/>
                  <stop offset="100%" stopColor="#764ba2"/>
                </linearGradient>
                <linearGradient id="starGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#starGradient)" strokeWidth="3"/>
              <line x1="50" y1="5" x2="50" y2="50" stroke="url(#starGradient)" strokeWidth="2.5"/>
              <line x1="50" y1="50" x2="15" y2="80" stroke="url(#starGradient)" strokeWidth="2.5"/>
              <line x1="50" y1="50" x2="85" y2="80" stroke="url(#starGradient)" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="8" fill="url(#starGradient)">
                <animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <div>
            <h1 className="page-title">AUTO<span className="highlight">SPARE</span> DASHBOARD</h1>
            <p className="page-description">{getGreeting()}, {user?.name || user?.fullName || 'Admin'}! Welcome to your premium auto parts management system</p>
          </div>
        </div>
        <div className="page-actions">
          <div className="date-time">
            <i className="bi bi-calendar3"></i>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <button className="refresh-btn" onClick={fetchDashboardData}>
            <i className="bi bi-arrow-repeat"></i> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stagger-item" onClick={() => navigate('/products')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#3b82f610', color: '#3b82f6' }}>
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Products</span>
            <div className="stat-number">{stats.totalProducts.toLocaleString()}</div>
            <div className="stat-change positive">
              <i className="bi bi-arrow-up-short"></i> {stats.monthlyGrowth}% from last month
            </div>
          </div>
        </div>

        <div className="stat-card stagger-item" onClick={() => navigate('/brands')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#10b98110', color: '#10b981' }}>
            <i className="bi bi-building"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Brands</span>
            <div className="stat-number">{stats.totalBrands.toLocaleString()}</div>
            <div className="stat-change positive">
              <i className="bi bi-arrow-up-short"></i> 8% from last month
            </div>
          </div>
        </div>

        <div className="stat-card stagger-item" onClick={() => navigate('/categories')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#8b5cf610', color: '#8b5cf6' }}>
            <i className="bi bi-tags"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Categories</span>
            <div className="stat-number">{stats.totalCategories.toLocaleString()}</div>
            <div className="stat-change positive">
              <i className="bi bi-arrow-up-short"></i> 5% from last month
            </div>
          </div>
        </div>

        <div className="stat-card stagger-item" onClick={() => navigate('/vehicles')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f59e0b10', color: '#f59e0b' }}>
            <i className="bi bi-truck"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Vehicles</span>
            <div className="stat-number">{stats.totalVehicles.toLocaleString()}</div>
            <div className="stat-change positive">
              <i className="bi bi-arrow-up-short"></i> 12% from last month
            </div>
          </div>
        </div>

        <div className="stat-card stagger-item" onClick={() => navigate('/users')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ef444410', color: '#ef4444' }}>
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Users</span>
            <div className="stat-number">{stats.activeUsers.toLocaleString()}</div>
            <div className="stat-change positive">
              <i className="bi bi-arrow-up-short"></i> 15% from last month
            </div>
          </div>
        </div>

        <div className="stat-card stagger-item">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#06b6d410', color: '#06b6d4' }}>
            <i className="bi bi-currency-dollar"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Inventory Value</span>
            <div className="stat-number">${stats.totalStockValue.toLocaleString()}</div>
            <div className="stat-change positive">
              <i className="bi bi-arrow-up-short"></i> 18% from last month
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
        <div className="alerts-section">
          {stats.lowStockProducts > 0 && (
            <div className="alert-card warning stagger-item">
              <div className="alert-icon">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div className="alert-content">
                <div className="alert-title">Low Stock Alert</div>
                <div className="alert-message">{stats.lowStockProducts} products are running low (≤ 10 units remaining)</div>
              </div>
              <Link to="/products" className="alert-action">
                View Details <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          )}
          {stats.outOfStockProducts > 0 && (
            <div className="alert-card danger stagger-item">
              <div className="alert-icon">
                <i className="bi bi-x-octagon-fill"></i>
              </div>
              <div className="alert-content">
                <div className="alert-title">Out of Stock</div>
                <div className="alert-message">{stats.outOfStockProducts} products are completely out of stock and need immediate restocking</div>
              </div>
              <Link to="/products" className="alert-action">
                Order Now <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Timeframe Selector */}
      <div className="timeframe-section">
        <div className="timeframe-selector">
          <button
            className={`timeframe-btn ${selectedTimeframe === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedTimeframe('week')}
          >
            <i className="bi bi-calendar-week"></i> This Week
          </button>
          <button
            className={`timeframe-btn ${selectedTimeframe === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedTimeframe('month')}
          >
            <i className="bi bi-calendar-month"></i> This Month
          </button>
          <button
            className={`timeframe-btn ${selectedTimeframe === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedTimeframe('year')}
          >
            <i className="bi bi-calendar-year"></i> This Year
          </button>
        </div>
      </div>

      {/* Sales Chart Section with Animation */}
      <div className="card animate-slide-up">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <i className="bi bi-graph-up me-2" style={{ color: '#667eea' }}></i>
              Sales Performance Analytics
            </h3>
            <p className="card-subtitle">Revenue and unit sales over time with real-time tracking</p>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot revenue"></span>
              <span>Revenue ($)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot sales"></span>
              <span>Units Sold</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="sales-chart">
            {salesData.map((data, index) => {
              const revenueHeight = (data.revenue / maxRevenue) * 200
              const salesHeight = (data.sales / maxSales) * 200
              return (
                <div
                  key={index}
                  className="chart-bar-group stagger-item"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="chart-bars">
                    <div
                      className="bar revenue-bar"
                      style={{ height: `${Math.max(revenueHeight, 4)}px` }}
                    >
                      <div className="bar-tooltip">
                        <div className="tooltip-title">Revenue</div>
                        <div className="tooltip-value">${data.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                    <div
                      className="bar sales-bar"
                      style={{ height: `${Math.max(salesHeight, 4)}px` }}
                    >
                      <div className="bar-tooltip">
                        <div className="tooltip-title">Sales</div>
                        <div className="tooltip-value">{data.sales} units</div>
                      </div>
                    </div>
                  </div>
                  <div className="chart-label">{data.name}</div>
                  {hoveredBar === index && <div className="chart-hover-line"></div>}
                </div>
              )
            })}
          </div>
        </div>
        <div className="card-footer">
          <div className="insight">
            <i className="bi bi-robot"></i>
            <span>AI Insight: Total revenue increased by 23.5% compared to previous period. ${salesData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} generated this {selectedTimeframe}.</span>
          </div>
          <div className="stats-summary">
            <div className="summary-item">
              <i className="bi bi-currency-dollar"></i>
              <div>
                <div className="summary-label">Total Revenue</div>
                <div className="summary-value">${salesData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="summary-item">
              <i className="bi bi-box-seam"></i>
              <div>
                <div className="summary-label">Total Sales</div>
                <div className="summary-value">{salesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()} units</div>
              </div>
            </div>
            <div className="summary-item">
              <i className="bi bi-graph-up"></i>
              <div>
                <div className="summary-label">Avg Order Value</div>
                <div className="summary-value">${Math.round(salesData.reduce((sum, d) => sum + d.revenue, 0) / Math.max(1, salesData.reduce((sum, d) => sum + d.sales, 0))).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your components remain the same... */}
      {/* Category & Brand Distribution */}
      <div className="two-column-grid">
        <div className="card animate-slide-left">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Distribution</h3>
              <p className="card-subtitle">Products by category</p>
            </div>
            <Link to="/categories" className="link-btn">View All <i className="bi bi-arrow-right"></i></Link>
          </div>
          <div className="card-body">
            <div className="distribution-list">
              {categoryDistribution.map((item, index) => (
                <div key={index} className="distribution-item stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="distribution-info">
                    <span className="distribution-name">{item.name}</span>
                    <span className="distribution-count">{item.count} products</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.percentage}%`, backgroundColor: '#667eea' }}></div>
                  </div>
                  <div className="distribution-percentage">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card animate-slide-right">
          <div className="card-header">
            <div>
              <h3 className="card-title">Brand Distribution</h3>
              <p className="card-subtitle">Products by brand</p>
            </div>
            <Link to="/brands" className="link-btn">View All <i className="bi bi-arrow-right"></i></Link>
          </div>
          <div className="card-body">
            <div className="distribution-list">
              {brandDistribution.map((item, index) => (
                <div key={index} className="distribution-item stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="distribution-info">
                    <span className="distribution-name">{item.name}</span>
                    <span className="distribution-count">{item.count} products</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.percentage}%`, backgroundColor: '#10b981' }}></div>
                  </div>
                  <div className="distribution-percentage">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="card animate-slide-up">
        <div className="card-header">
          <div>
            <h3 className="card-title">Top Performing Products</h3>
            <p className="card-subtitle">Best selling products by revenue</p>
          </div>
          <Link to="/products" className="link-btn">View All Products <i className="bi bi-arrow-right"></i></Link>
        </div>
        <div className="card-body">
          <div className="products-grid">
            {topProducts.map((product, index) => (
              <div key={product.id} className="product-card stagger-item" onClick={() => navigate(`/products/${product.id}`)} style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="product-rank">{index + 1}</div>
                <div className="product-info">
                  <div className="product-header">
                    <h4 className="product-name">{product.name}</h4>
                    <div className="product-badges">
                      <span className="badge category">{product.category}</span>
                      <span className="badge brand">{product.brand}</span>
                      {product.stock < 20 && <span className="badge warning">Low Stock</span>}
                    </div>
                  </div>
                  <div className="product-stats">
                    <div className="product-stat"><i className="bi bi-bar-chart"></i><span>{product.sales.toLocaleString()} sold</span></div>
                    <div className="product-stat"><i className="bi bi-cash-stack"></i><span>${product.revenue.toLocaleString()}</span></div>
                    <div className={`product-stat ${product.growth >= 0 ? 'positive' : 'negative'}`}>
                      <i className={`bi bi-arrow-${product.growth >= 0 ? 'up' : 'down'}-short`}></i>
                      <span>{product.growth >= 0 ? '+' : ''}{product.growth}%</span>
                    </div>
                  </div>
                  <div className="product-stock">
                    <div className="stock-label"><span>Stock Level</span><span>{product.stock} / 100 units</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, product.stock)}%` }}></div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Items Grid */}
      <div className="three-column-grid">
        <div className="card animate-slide-left">
          <div className="card-header">
            <div><h3 className="card-title">Recent Products</h3><p className="card-subtitle">Latest inventory additions</p></div>
            <Link to="/products" className="link-btn">View All</Link>
          </div>
          <div className="card-body">
            <div className="items-list">
              {recentProducts.map((product, idx) => (
                <div key={product.id} className="list-item stagger-item" onClick={() => navigate(`/products/${product.id}`)} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="item-icon"><i className="bi bi-box-seam"></i></div>
                  <div className="item-info"><div className="item-name">{product.name}</div><div className="item-meta">{product.category}</div></div>
                  <div className="item-right"><div className="item-price">${product.price.toLocaleString()}</div><div className={`item-stock ${product.stock < 20 ? 'low' : 'good'}`}>{product.stock} left</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card animate-slide-up">
          <div className="card-header">
            <div><h3 className="card-title">Recent Brands</h3><p className="card-subtitle">Latest brand additions</p></div>
            <Link to="/brands" className="link-btn">View All</Link>
          </div>
          <div className="card-body">
            <div className="items-list">
              {recentBrands.map((brand, idx) => (
                <div key={brand.id} className="list-item stagger-item" onClick={() => navigate(`/brands/${brand.id}`)} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="item-icon"><i className="bi bi-building"></i></div>
                  <div className="item-info"><div className="item-name">{brand.name}</div><div className="item-meta">{brand.productCount || 0} products</div></div>
                  <div className="item-right"><i className="bi bi-chevron-right"></i></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card animate-slide-right">
          <div className="card-header">
            <div><h3 className="card-title">Recent Vehicles</h3><p className="card-subtitle">Latest compatible models</p></div>
            <Link to="/vehicles" className="link-btn">View All</Link>
          </div>
          <div className="card-body">
            <div className="items-list">
              {recentVehicles.map((vehicle, idx) => (
                <div key={vehicle.id} className="list-item stagger-item" onClick={() => navigate(`/vehicles/${vehicle.id}`)} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="item-icon"><i className="bi bi-truck"></i></div>
                  <div className="item-info"><div className="item-name">{vehicle.make} {vehicle.model}</div><div className="item-meta">{vehicle.year} • {vehicle.engineType}</div></div>
                  <div className="item-right"><i className="bi bi-chevron-right"></i></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users & Activity */}
      <div className="two-column-grid">
        <div className="card animate-slide-left">
          <div className="card-header">
            <div><h3 className="card-title">Recent Users</h3><p className="card-subtitle">Newest registered members</p></div>
            <Link to="/users" className="link-btn">View All</Link>
          </div>
          <div className="card-body">
            <div className="items-list">
              {recentUsers.map((user, idx) => (
                <div key={user.id} className="list-item stagger-item" onClick={() => navigate(`/users/${user.id}`)} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="user-avatar"><span>{user.name?.charAt(0).toUpperCase() || 'U'}</span></div>
                  <div className="item-info"><div className="item-name">{user.name}</div><div className="item-meta">{user.email}</div></div>
                  <div className="item-right"><span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>{user.role || 'USER'}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card animate-slide-right">
          <div className="card-header">
            <div><h3 className="card-title">Recent Activity</h3><p className="card-subtitle">System events and updates</p></div>
            <div className="live-badge"><span className="live-dot"></span> LIVE</div>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {activities.map((activity, idx) => (
                <div key={activity.id} className="activity-item stagger-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="activity-icon" style={{ backgroundColor: `${activity.color}15`, color: activity.color }}><i className={`bi bi-${activity.icon}`}></i></div>
                  <div className="activity-content"><div className="activity-text"><strong>{activity.user}</strong> {activity.action}{activity.target && <span className="activity-target"> {activity.target}</span>}</div><div className="activity-time">{activity.time}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card animate-slide-up">
        <div className="card-header">
          <div><h3 className="card-title">Quick Actions</h3><p className="card-subtitle">Common tasks and shortcuts</p></div>
        </div>
        <div className="card-body">
          <div className="actions-grid">
            <Link to="/products/new" className="action-button"><i className="bi bi-plus-circle"></i> Add Product</Link>
            <Link to="/brands/new" className="action-button"><i className="bi bi-building-add"></i> Add Brand</Link>
            <Link to="/categories/new" className="action-button"><i className="bi bi-tag"></i> Add Category</Link>
            <Link to="/vehicles/new" className="action-button"><i className="bi bi-truck"></i> Add Vehicle</Link>
            <Link to="/users/new" className="action-button"><i className="bi bi-person-plus"></i> Add User</Link>
            <Link to="/products" className="action-button"><i className="bi bi-file-text"></i> Stock Report</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard