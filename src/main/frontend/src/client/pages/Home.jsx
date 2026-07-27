// src/client/pages/Home.jsx - WITH HERO SLIDER AND BRANDS
import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import '/src/client/styles/Home.css'

// ============================================
// HERO SLIDER COMPONENT
// ============================================
const HeroSlider = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const sliderRef = useRef(null)

  const slides = [
      {
        id: 1,
        title: 'Premium Auto Parts',
        subtitle: 'Quality Parts for Your Vehicle',
        description: 'Discover our extensive collection of premium auto parts from top brands. Quality guaranteed.',
        image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&h=600&fit=crop',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        badge: 'Up to 50% Off'
      },
      {
        id: 2,
        title: 'Performance Parts',
        subtitle: 'Upgrade Your Ride',
        description: 'High-performance parts designed for maximum efficiency and durability.',
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop',
        buttonText: 'Explore Performance',
        buttonLink: '/shop?category=performance',
        badge: 'New Arrivals'
      },
      {
        id: 3,
        title: 'Brake Systems',
        subtitle: 'Safety First',
        description: 'Premium brake systems and components for superior stopping power.',
        image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&h=600&fit=crop',
        buttonText: 'Shop Brakes',
        buttonLink: '/shop?category=brake',
        badge: 'Best Sellers'
      }
    ]

  useEffect(() => {
    let interval
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="hero-slider-container" ref={sliderRef}>
      <div className="hero-slider-wrapper">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            <div className="hero-slide-bg">
              <img src={slide.image} alt={slide.title} />
              <div className="hero-slide-overlay"></div>
            </div>
            <div className="hero-slide-content container">
              <div className="hero-slide-text">
                {slide.badge && (
                  <span className="hero-slide-badge">{slide.badge}</span>
                )}
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
                <p>{slide.description}</p>
                <button
                  className="hero-slide-btn"
                  onClick={() => navigate(slide.buttonLink)}
                >
                  {slide.buttonText} <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="hero-slider-arrow prev" onClick={prevSlide}>
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button className="hero-slider-arrow next" onClick={nextSlide}>
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* Dots */}
      <div className="hero-slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hero-slider-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const {
    id,
    name,
    price,
    oldPrice,
    rating,
    reviewCount,
    image,
    brand,
    inStock,
    discount,
    isNew,
    badge
  } = product

  const discountPercentage = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : discount || 0
  const isOnSale = discountPercentage > 0
  const ratingStars = Math.round(rating || 0)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!inStock) return
    setIsAdding(true)
    onAddToCart(product)
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <motion.div
      className="product-card-premium"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="product-image-wrapper">
        <div className="product-image-container">
          {!imageLoaded && (
            <div className="image-placeholder shimmer">
              <i className="fa-solid fa-image"></i>
            </div>
          )}
          <img
            src={image || 'https://via.placeholder.com/400x400/e2e8f0/94a3b8?text=Auto+Part'}
            alt={name}
            className={`product-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          <div className="product-badges">
            {isOnSale && <span className="badge sale">-{discountPercentage}%</span>}
            {isNew && <span className="badge new">New</span>}
            {badge === 'best' && <span className="badge best">Best Seller</span>}
          </div>

          <div className={`product-actions ${isHovered ? 'visible' : ''}`}>
            <button className="action-btn" onClick={(e) => { e.stopPropagation(); }} title="Wishlist">
              <i className="fa-regular fa-heart"></i>
            </button>
            <button className="action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`) }} title="Quick View">
              <i className="fa-regular fa-eye"></i>
            </button>
          </div>

          {!inStock && (
            <div className="out-of-stock-overlay">
              <span>Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      <div className="product-info">
        <div className="product-meta">
          {brand && <span className="product-brand">{brand}</span>}
        </div>
        <h3 className="product-title">{name}</h3>

        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <i key={i} className={`fa-solid fa-star ${i < ratingStars ? 'filled' : ''}`} />
            ))}
          </div>
          <span className="review-count">({reviewCount || 0})</span>
        </div>

        <div className="product-price">
          {oldPrice && <span className="old-price">${oldPrice.toFixed(2)}</span>}
          <span className={`current-price ${oldPrice ? 'has-discount' : ''}`}>
            ${price.toFixed(2)}
          </span>
        </div>

        <button
          className={`add-to-cart-btn ${!inStock ? 'disabled' : ''} ${isAdding ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
        >
          {isAdding ? (
            <>
              <span className="spinner-small"></span>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-cart-plus"></i>
              <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN HOME COMPONENT
// ============================================
const Home = () => {
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [saleProducts, setSaleProducts] = useState([])
  const [trendingProducts, setTrendingProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [showCartNotification, setShowCartNotification] = useState(false)
  const [lastAddedProduct, setLastAddedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalVehicles: 0
  })
  const [animatedStats, setAnimatedStats] = useState({
    products: 0,
    brands: 0,
    categories: 0,
    vehicles: 0
  })
  const [statsAnimated, setStatsAnimated] = useState(false)

  // Product images
  const productImages = [
    'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556707904-87bb6c297a70?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1629904853716-d0bc5b4e91d7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1577998474511-ee2d9b7f2d0a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5a5ad4a4e74b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579003593414-45d75f5e1b0c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1616422530771-3abf4bd2f247?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f5b1?w=400&h=400&fit=crop'
  ]

  // Brand logos for commerce section
  const partnerBrands = [
    { id: 1, name: 'Brembo', logo: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=100&h=100&fit=crop', description: 'Premium Brake Systems' },
    { id: 2, name: 'Bosch', logo: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop', description: 'Auto Parts & Solutions' },
    { id: 3, name: 'Mann-Filter', logo: 'https://images.unsplash.com/photo-1556707904-87bb6c297a70?w=100&h=100&fit=crop', description: 'Filtration Systems' },
    { id: 4, name: 'NGK', logo: 'https://images.unsplash.com/photo-1629904853716-d0bc5b4e91d7?w=100&h=100&fit=crop', description: 'Spark Plugs & Sensors' },
    { id: 5, name: 'Denso', logo: 'https://images.unsplash.com/photo-1577998474511-ee2d9b7f2d0a?w=100&h=100&fit=crop', description: 'Automotive Components' },
    { id: 6, name: 'ZF', logo: 'https://images.unsplash.com/photo-1568605117036-5a5ad4a4e74b?w=100&h=100&fit=crop', description: 'Chassis & Transmission' },
    { id: 7, name: 'Valeo', logo: 'https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?w=100&h=100&fit=crop', description: 'Electrical Systems' },
    { id: 8, name: 'Mahle', logo: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=100&h=100&fit=crop', description: 'Engine Components' }
  ]

  const vehicleData = {
    Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', 'Sienna', '4Runner'],
    Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Ridgeline', 'Passport'],
    Ford: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Focus', 'Edge', 'Expedition', 'Ranger'],
    BMW: ['X5', '3 Series', '5 Series', 'X3', '7 Series', 'X7', '4 Series', 'X1'],
    Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'GLA'],
    Audi: ['A4', 'Q5', 'A6', 'Q7', 'A3', 'Q3', 'e-tron', 'Q8']
  }

  const categories = [
    { id: 'all', name: 'All Products', icon: 'fa-solid fa-th-large', color: '#667eea' },
    { id: 'engine', name: 'Engine Parts', icon: 'fa-solid fa-oil-can', color: '#e63946' },
    { id: 'brake', name: 'Brake System', icon: 'fa-solid fa-car-side', color: '#10b981' },
    { id: 'electrical', name: 'Electrical', icon: 'fa-solid fa-bolt', color: '#f59e0b' },
    { id: 'suspension', name: 'Suspension', icon: 'fa-solid fa-car', color: '#8b5cf6' },
    { id: 'cooling', name: 'Cooling System', icon: 'fa-solid fa-temperature-low', color: '#06b6d4' },
    { id: 'exhaust', name: 'Exhaust System', icon: 'fa-solid fa-wind', color: '#ef4444' },
    { id: 'interior', name: 'Interior Accessories', icon: 'fa-solid fa-chair', color: '#f97316' }
  ]

  const brands = ['Bosch', 'Brembo', 'Mann-Filter', 'NGK', 'Denso', 'ZF', 'Valeo', 'Mahle', 'Akebono', 'ATE']
  const makes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Lexus', 'Hyundai']
  const years = Array.from({ length: 20 }, (_, i) => (2024 - i).toString())

  useEffect(() => {
    if (stats.totalProducts > 0 && !statsAnimated) {
      animateStats()
      setStatsAnimated(true)
    }
  }, [stats.totalProducts])

  useEffect(() => {
    fetchHomeData()
  }, [])

  const animateStats = () => {
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    const easing = (t) => 1 - Math.pow(1 - t, 3)

    const targets = {
      products: stats.totalProducts,
      brands: stats.totalBrands,
      categories: stats.totalCategories,
      vehicles: stats.totalVehicles
    }

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = easing(currentStep / steps)
      setAnimatedStats({
        products: Math.floor(targets.products * progress),
        brands: Math.floor(targets.brands * progress),
        categories: Math.floor(targets.categories * progress),
        vehicles: Math.floor(targets.vehicles * progress)
      })
      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedStats(targets)
      }
    }, stepDuration)
  }

  const generateMoreProducts = (count) => {
    const productNames = [
      'Premium Brake Pads', 'Performance Oil Filter', 'Iridium Spark Plugs', 'High-Performance Battery',
      'Cold Air Intake Kit', 'Performance Exhaust System', 'Turbocharger Kit', 'Performance Suspension',
      'Racing Brake Rotors', 'Synthetic Motor Oil', 'Performance Radiator', 'High-Flow Catalytic Converter',
      'Performance Ignition Coils', 'Sport Clutch Kit', 'Performance Fuel Injectors', 'Racing Steering Wheel',
      'Carbon Fiber Spoiler', 'LED Headlight Kit', 'Performance Tires', 'Racing Seat',
      'Performance Water Pump', 'Racing Brake Lines', 'Performance Air Filter', 'Fuel Pressure Regulator',
      'Performance Alternator', 'Racing Battery', 'Performance Thermostat', 'Oil Cooler Kit',
      'Turbo Timer', 'Performance ECU', 'Roll Cage Kit', 'Performance Clutch'
    ]
    const brands = ['Brembo', 'Bosch', 'Mann-Filter', 'NGK', 'Denso', 'ZF', 'Valeo', 'Mahle', 'Akebono', 'ATE']
    const categories = ['Engine Parts', 'Brake System', 'Electrical', 'Suspension', 'Cooling System', 'Exhaust', 'Interior', 'Exterior']

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: productNames[i % productNames.length],
      price: Math.round((35 + Math.random() * 300) * 100) / 100,
      oldPrice: Math.random() > 0.5 ? Math.round((55 + Math.random() * 400) * 100) / 100 : null,
      rating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      image: productImages[i % productImages.length],
      category: { name: categories[i % categories.length], id: i % 8 + 1 },
      brand: brands[i % brands.length],
      inStock: Math.random() > 0.15,
      discount: Math.random() > 0.5 ? Math.round(Math.random() * 45 + 5) : 0,
      isNew: i < 15,
      badge: ['best', 'sale', 'new', 'premium', '', '', '', ''][i % 8],
      salesCount: Math.floor(Math.random() * 1000) + 100,
      sku: `AP-${String(i + 1).padStart(4, '0')}`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    }))
  }

  const fetchHomeData = async () => {
    setLoading(true)
    try {
      const [productsRes, brandsRes, categoriesRes, vehiclesRes] = await Promise.allSettled([
        api.get('/api/products/featured'),
        api.get('/api/admin/brands'),
        api.get('/api/admin/categories'),
        api.get('/api/admin/vehicles')
      ])

      let productsData = productsRes.status === 'fulfilled' ? productsRes.value.data?.content || [] : []

      if (productsData.length === 0) {
        productsData = generateMoreProducts(48)
      }

      const enhancedProducts = productsData.map((p, index) => ({
        ...p,
        id: p.id || index + 1,
        name: p.name || `Premium Auto Part ${index + 1}`,
        price: p.price || Math.round((35 + Math.random() * 300) * 100) / 100,
        oldPrice: p.oldPrice || (Math.random() > 0.5 ? Math.round((55 + Math.random() * 400) * 100) / 100 : null),
        rating: p.rating || (3.5 + Math.random() * 1.5),
        reviewCount: p.reviewCount || Math.floor(Math.random() * 500) + 50,
        image: p.image || productImages[index % productImages.length],
        category: p.category || {
          name: ['Engine Parts', 'Brake System', 'Electrical', 'Suspension', 'Cooling System', 'Exhaust', 'Interior', 'Exterior'][index % 8],
          id: index % 8 + 1
        },
        brand: p.brand || ['Brembo', 'Bosch', 'Mann-Filter', 'NGK', 'Denso', 'ZF', 'Valeo', 'Mahle', 'Akebono', 'ATE'][index % 10],
        inStock: p.inStock !== undefined ? p.inStock : Math.random() > 0.15,
        discount: p.discount || (Math.random() > 0.5 ? Math.round(Math.random() * 45 + 5) : 0),
        isNew: p.isNew || (index < 15),
        badge: ['best', 'sale', 'new', 'premium', '', '', '', ''][index % 8],
        salesCount: p.salesCount || Math.floor(Math.random() * 1000) + 100,
        sku: p.sku || `AP-${String(index + 1).padStart(4, '0')}`,
        createdAt: p.createdAt || new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      }))

      setAllProducts(enhancedProducts)

      const sortedBySales = [...enhancedProducts].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      const sortedByDate = [...enhancedProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const sortedByDiscount = [...enhancedProducts].filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount)
      const sortedByRating = [...enhancedProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0))

      setFeaturedProducts(enhancedProducts.slice(0, 8))
      setBestSellers(sortedBySales.slice(0, 8))
      setNewArrivals(sortedByDate.slice(0, 8))
      setSaleProducts(sortedByDiscount.slice(0, 8))
      setTrendingProducts(sortedByRating.slice(0, 8))

      const totalProducts = enhancedProducts.length || 156
      const totalBrands = brandsRes.status === 'fulfilled' ? brandsRes.value.data?.length || 24 : 24
      const totalCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data?.length || 12 : 12
      const totalVehicles = vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.data?.length || 45 : 45

      setStats({ totalProducts, totalBrands, totalCategories, totalVehicles })
    } catch (error) {
      console.error('Failed to fetch home data:', error)
      const fallbackProducts = generateMoreProducts(48)
      setAllProducts(fallbackProducts)

      const sortedBySales = [...fallbackProducts].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      const sortedByDate = [...fallbackProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const sortedByDiscount = [...fallbackProducts].filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount)
      const sortedByRating = [...fallbackProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0))

      setFeaturedProducts(fallbackProducts.slice(0, 8))
      setBestSellers(sortedBySales.slice(0, 8))
      setNewArrivals(sortedByDate.slice(0, 8))
      setSaleProducts(sortedByDiscount.slice(0, 8))
      setTrendingProducts(sortedByRating.slice(0, 8))
      setStats({ totalProducts: 156, totalBrands: 24, totalCategories: 12, totalVehicles: 45 })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    setCartCount(prev => prev + 1)
    setCartTotal(prev => prev + product.price)
    setLastAddedProduct(product)
    setShowCartNotification(true)
    if (navigator.vibrate) navigator.vibrate(50)
    setTimeout(() => setShowCartNotification(false), 3000)
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) return

    try {
      await api.post('/api/newsletter/subscribe', { email: newsletterEmail })
      setNewsletterSubscribed(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSubscribed(false), 5000)
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
      setNewsletterSubscribed(true)
      setTimeout(() => setNewsletterSubscribed(false), 5000)
    }
  }

  const handleVehicleSearch = () => {
    if (selectedMake && selectedModel && selectedYear) {
      navigate(`/shop?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${selectedYear}`)
    }
  }

  const getModelsForMake = () => vehicleData[selectedMake] || []

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    if (query.length > 1) {
      const results = allProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query)
      )
      setSearchResults(results.slice(0, 6))
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }

  const getFilteredProducts = () => {
    let filtered = allProducts
    if (selectedCategory !== 'all') {
      const categoryMap = {
        'engine': 'Engine Parts',
        'brake': 'Brake System',
        'electrical': 'Electrical',
        'suspension': 'Suspension',
        'cooling': 'Cooling System',
        'exhaust': 'Exhaust',
        'interior': 'Interior'
      }
      filtered = filtered.filter(p => p.category?.name === categoryMap[selectedCategory])
    }
    return filtered
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <>
      <Helmet>
        <title>AutoHive - Premium Auto Parts Marketplace</title>
        <meta name="description" content="Premium auto parts for all vehicles. Shop high-quality parts from top brands at great prices." />
        <meta name="keywords" content="auto parts, premium auto parts, automotive, vehicle parts, car accessories" />
        <link rel="canonical" href="https://autohive.com" />
      </Helmet>

      <div className="home-page-modern">
        {/* Floating Cart */}
        <div className="floating-cart" onClick={() => navigate('/cart')}>
          <div className="cart-icon-wrapper">
            <i className="fa-solid fa-shopping-cart"></i>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          {cartTotal > 0 && <span className="cart-total">${cartTotal.toFixed(2)}</span>}
        </div>

        {/* Cart Notification */}
        <AnimatePresence>
          {showCartNotification && lastAddedProduct && (
            <motion.div
              className="cart-notification"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <i className="fa-solid fa-circle-check"></i>
              <div className="notification-content">
                <strong>Added to Cart!</strong>
                <span>{lastAddedProduct.name}</span>
              </div>
              <button className="notification-btn" onClick={() => navigate('/cart')}>
                View Cart
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Slider */}
        <HeroSlider />


{/*         FEATURED PRODUCTS */}
        <div className="products-section-modern">
          <div className="container">
            <div className="section-header-modern">
              <div className="header-badge-modern">
                <i className="fa-solid fa-fire"></i>
                <span>Top Picks</span>
              </div>
              <h2 className="section-title-modern">Featured <span className="gradient-text-modern">Products</span></h2>
              <p className="section-subtitle">Handpicked premium auto parts for your vehicle</p>
            </div>

            {loading ? (
              <div className="products-skeleton">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-image shimmer"></div>
                    <div className="skeleton-text shimmer"></div>
                    <div className="skeleton-text short shimmer"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="products-grid">
                {featuredProducts.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BEST SELLERS */}
        <div className="products-section-modern bg-gradient">
          <div className="container">
            <div className="section-header-modern">
              <div className="header-badge-modern">
                <i className="fa-solid fa-trophy"></i>
                <span>Customer Favorites</span>
              </div>
              <h2 className="section-title-modern">Best <span className="gradient-text-modern">Sellers</span></h2>
              <p className="section-subtitle">Most popular products loved by our customers</p>
            </div>
            <div className="products-grid">
              {bestSellers.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* NEW ARRIVALS */}
        <div className="products-section-modern">
          <div className="container">
            <div className="section-header-modern">
              <div className="header-badge-modern">
                <i className="fa-regular fa-star"></i>
                <span>Just Landed</span>
              </div>
              <h2 className="section-title-modern">New <span className="gradient-text-modern">Arrivals</span></h2>
              <p className="section-subtitle">Fresh from the factory - Latest products added</p>
            </div>
            <div className="products-grid">
              {newArrivals.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* SALE PRODUCTS */}
        <div className="products-section-modern bg-sale">
          <div className="container">
            <div className="section-header-modern">
              <div className="header-badge-modern sale-badge-header">
                <i className="fa-solid fa-tag"></i>
                <span>Special Deals</span>
              </div>
              <h2 className="section-title-modern">Hot <span className="gradient-text-sale">Deals</span></h2>
              <p className="section-subtitle">Limited time offers - Don't miss out!</p>
            </div>
            <div className="products-grid">
              {saleProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

{/*         ALL PRODUCTS */}
        <div className="products-section-modern">
          <div className="container">
            <div className="section-header-modern">
              <div className="header-badge-modern">
                <i className="fa-solid fa-grid-2"></i>
                <span>All Products</span>
              </div>
              <h2 className="section-title-modern">Browse <span className="gradient-text-modern">All Parts</span></h2>
              <p className="section-subtitle">{getFilteredProducts().length} products available</p>
            </div>

            {loading ? (
              <div className="products-skeleton">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-image shimmer"></div>
                    <div className="skeleton-text shimmer"></div>
                    <div className="skeleton-text short shimmer"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="products-grid">
                {getFilteredProducts().slice(0, 16).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.02 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </div>
            )}

            {getFilteredProducts().length > 16 && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={() => navigate('/shop')}>
                  <span>Load More Products</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section-modern">
          <div className="container">
            <div className="features-grid">
              {[
                { icon: 'fa-solid fa-truck-fast', title: 'Lightning Delivery', description: 'Free shipping on orders over $100', color: '#10b981' },
                { icon: 'fa-solid fa-rotate-left', title: '30 Day Returns', description: 'No questions asked policy', color: '#3b82f6' },
                { icon: 'fa-solid fa-shield-haltered', title: 'Secure Payment', description: '256-bit SSL encryption', color: '#8b5cf6' },
                { icon: 'fa-solid fa-headset', title: '24/7 Support', description: 'Instant assistance anytime', color: '#f59e0b' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <div className="feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                    <i className={feature.icon}></i>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-hover-line" style={{ background: feature.color }}></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="newsletter-section-modern">
          <div className="container">
            <div className="newsletter-wrapper">
              <div className="newsletter-content">
                <div className="newsletter-icon">
                  <i className="fa-regular fa-envelope-open"></i>
                  <div className="icon-ring"></div>
                </div>
                <h2>Stay <span className="gradient-text-light">Ahead</span> of the Curve</h2>
                <p>Get exclusive offers, new arrivals, and expert tips delivered to your inbox</p>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <div className="form-group">
                    <i className="fa-regular fa-envelope"></i>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                    <button type="submit">
                      <span>Subscribe</span>
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                  <p className="form-note">
                    <i className="fa-solid fa-lock"></i> No spam, unsubscribe anytime
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Toast */}
        <AnimatePresence>
          {newsletterSubscribed && (
            <motion.div
              className="toast-notification"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <i className="fa-solid fa-circle-check"></i>
              <div className="toast-content">
                <strong>Success!</strong>
                <span>Thank you for subscribing!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default Home