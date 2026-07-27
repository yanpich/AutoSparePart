// src/client/pages/Shop.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import api from '../../api/axios'

const Shop = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 })
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 500 })
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedRatings, setSelectedRatings] = useState([])
  const [availability, setAvailability] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [priceRangeApplied, setPriceRangeApplied] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const priceDebounceRef = useRef(null)
  const sortDropdownRef = useRef(null)

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')
    const brandParam = params.get('brand')
    const searchParam = params.get('search')
    const sortParam = params.get('sort')
    const pageParam = params.get('page')

    if (categoryParam && categoryParam !== 'all') {
      setSelectedCategories([categoryParam])
    }
    if (brandParam) {
      setSelectedBrands([brandParam])
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }
    if (sortParam) {
      setSortBy(sortParam)
    }
    if (pageParam) {
      setCurrentPage(parseInt(pageParam))
    }
  }, [location.search])

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch categories and brands
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get('/api/admin/categories'),
          api.get('/api/admin/brands')
        ])
        setCategories(categoriesRes.data?.content || categoriesRes.data || [])
        setBrands(brandsRes.data || [])
      } catch (error) {
        console.error('Failed to fetch filters:', error)
        setFallbackFilters()
      }
    }
    fetchFilters()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts()
  }, [currentPage, sortBy, selectedCategories, selectedBrands, selectedRatings, availability, priceRangeApplied, priceRange, searchQuery])

  const setFallbackFilters = () => {
    setCategories([
      { id: 1, name: 'Brake System', productCount: 45, icon: 'fas fa-car-side' },
      { id: 2, name: 'Engine Parts', productCount: 38, icon: 'fas fa-oil-can' },
      { id: 3, name: 'Electrical', productCount: 32, icon: 'fas fa-bolt' },
      { id: 4, name: 'Suspension', productCount: 28, icon: 'fas fa-car' },
      { id: 5, name: 'Cooling System', productCount: 24, icon: 'fas fa-temperature-low' }
    ])
    setBrands([
      { brandId: 1, brandName: 'Bosch', productCount: 56, logo: null },
      { brandId: 2, brandName: 'Brembo', productCount: 42, logo: null },
      { brandId: 3, brandName: 'Mann-Filter', productCount: 38, logo: null },
      { brandId: 4, brandName: 'NGK', productCount: 34, logo: null }
    ])
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage - 1,
        size: 12,
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategories.length > 0 && { categories: selectedCategories.join(',') }),
        ...(selectedBrands.length > 0 && { brands: selectedBrands.join(',') }),
        ...(selectedRatings.length > 0 && { ratings: selectedRatings.join(',') }),
        ...(availability !== 'all' && { availability }),
        ...(priceRangeApplied && { minPrice: priceRange.min, maxPrice: priceRange.max })
      })

      const response = await api.get(`/api/products?${params.toString()}`)
      setProducts(response.data?.content || response.data || getFallbackProducts())
      setTotalProducts(response.data?.totalElements || getFallbackProducts().length)
      setTotalPages(response.data?.totalPages || Math.ceil(getFallbackProducts().length / 12))
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts(getFallbackProducts())
      setTotalProducts(getFallbackProducts().length)
      setTotalPages(Math.ceil(getFallbackProducts().length / 12))
    } finally {
      setLoading(false)
    }
  }

  const getFallbackProducts = () => {
    return [
      { id: 1, name: 'Premium Brake Pads', price: 89.99, oldPrice: 129.99, rating: 4.8, reviewCount: 234, image: null, category: { name: 'Brake System' }, brand: 'Brembo', inStock: true, badge: 'best' },
      { id: 2, name: 'Oil Filter', price: 12.99, rating: 4.6, reviewCount: 189, image: null, category: { name: 'Engine Parts' }, brand: 'Mann-Filter', inStock: true, badge: 'sale' },
      { id: 3, name: 'Spark Plugs Set', price: 29.99, oldPrice: 49.99, rating: 4.7, reviewCount: 156, image: null, category: { name: 'Electrical' }, brand: 'NGK', inStock: true, badge: 'new' },
      { id: 4, name: 'Car Battery', price: 119.99, rating: 4.5, reviewCount: 98, image: null, category: { name: 'Electrical' }, brand: 'Bosch', inStock: true },
      { id: 5, name: 'Air Filter', price: 24.99, oldPrice: 34.99, rating: 4.9, reviewCount: 145, image: null, category: { name: 'Engine Parts' }, brand: 'Mann-Filter', inStock: true, badge: 'sale' },
      { id: 6, name: 'Brake Rotors', price: 159.99, oldPrice: 199.99, rating: 4.8, reviewCount: 67, image: null, category: { name: 'Brake System' }, brand: 'Brembo', inStock: true },
      { id: 7, name: 'Radiator', price: 89.99, rating: 4.4, reviewCount: 45, image: null, category: { name: 'Cooling System' }, brand: 'Denso', inStock: false },
      { id: 8, name: 'Alternator', price: 199.99, oldPrice: 249.99, rating: 4.7, reviewCount: 78, image: null, category: { name: 'Electrical' }, brand: 'Bosch', inStock: true, badge: 'best' }
    ]
  }

  const handlePriceChange = (e) => {
    const { name, value } = e.target
    setTempPriceRange(prev => ({ ...prev, [name]: parseInt(value) || 0 }))

    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current)
    priceDebounceRef.current = setTimeout(() => {
      setPriceRange(tempPriceRange)
      setPriceRangeApplied(true)
      setCurrentPage(1)
    }, 500)
  }

  const applyPriceRange = () => {
    setPriceRange(tempPriceRange)
    setPriceRangeApplied(true)
    setCurrentPage(1)
  }

  const clearPriceRange = () => {
    setTempPriceRange({ min: 0, max: 500 })
    setPriceRange({ min: 0, max: 500 })
    setPriceRangeApplied(false)
    setCurrentPage(1)
  }

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
    setCurrentPage(1)
  }

  const handleBrandToggle = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    )
    setCurrentPage(1)
  }

  const handleRatingToggle = (rating) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    )
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedRatings([])
    setAvailability('all')
    clearPriceRange()
    setSearchQuery('')
    setSortBy('newest')
    setCurrentPage(1)
    setPriceRangeApplied(false)
    navigate('/shop')
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setShowSortDropdown(false)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`fas fa-star ${i < Math.floor(rating) ? 'filled' : ''}`}></i>
        ))}
      </div>
    )
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'fas fa-clock' },
    { value: 'price_asc', label: 'Price: Low to High', icon: 'fas fa-arrow-up' },
    { value: 'price_desc', label: 'Price: High to Low', icon: 'fas fa-arrow-down' },
    { value: 'rating', label: 'Highest Rated', icon: 'fas fa-star' },
    { value: 'popularity', label: 'Most Popular', icon: 'fas fa-fire' }
  ]

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy)
    return option ? option.label : 'Sort By'
  }

  const activeFiltersCount = selectedCategories.length + selectedBrands.length + selectedRatings.length + (availability !== 'all' ? 1 : 0) + (priceRangeApplied ? 1 : 0)

  return (
    <div className="shop-page-modern">
      {/* Hero Section */}
      <div className="shop-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-store"></i>
              <span>Auto Parts Store</span>
            </div>
            <h1>Shop <span className="gradient-text">Auto Parts</span></h1>
            <p>Browse our extensive collection of premium auto parts from top brands</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="shop-layout-modern">
          {/* Mobile Filter Toggle */}
          <button className="mobile-filter-toggle-modern" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-filter"></i>
            <span>Filters</span>
            {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
          </button>

          {/* Sidebar Filters - Glassmorphism */}
          <aside className={`shop-sidebar-modern ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header-modern">
              <h3>
                <i className="fas fa-sliders-h"></i>
                Filters
              </h3>
              <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Search Section */}
            <div className="filter-section-modern">
              <div className="filter-header-modern">
                <i className="fas fa-search"></i>
                <h4>Search Products</h4>
              </div>
              <div className="search-input-modern">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, SKU or brand..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>

            {/* Categories Section */}
            <div className="filter-section-modern">
              <div className="filter-header-modern">
                <i className="fas fa-tag"></i>
                <h4>Categories</h4>
              </div>
              <div className="filter-options-modern">
                {categories.map(category => (
                  <label key={category.id} className="filter-option-modern">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                    />
                    <span className="checkmark-modern"></span>
                    <span className="option-text">
                      <i className={category.icon || 'fas fa-folder'}></i>
                      {category.name}
                    </span>
                    <span className="option-count">{category.productCount || 0}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands Section */}
            <div className="filter-section-modern">
              <div className="filter-header-modern">
                <i className="fas fa-building"></i>
                <h4>Brands</h4>
              </div>
              <div className="filter-options-modern">
                {brands.map(brand => (
                  <label key={brand.brandId || brand.id} className="filter-option-modern">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.brandName || brand.name)}
                      onChange={() => handleBrandToggle(brand.brandName || brand.name)}
                    />
                    <span className="checkmark-modern"></span>
                    <span className="option-text">{brand.brandName || brand.name}</span>
                    <span className="option-count">{brand.productCount || 0}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Section */}
            <div className="filter-section-modern">
              <div className="filter-header-modern">
                <i className="fas fa-dollar-sign"></i>
                <h4>Price Range</h4>
              </div>
              <div className="price-range-modern">
                <div className="price-values">
                  <span>${tempPriceRange.min}</span>
                  <span className="price-sep">—</span>
                  <span>${tempPriceRange.max}</span>
                </div>
                <div className="price-slider-modern">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={tempPriceRange.max}
                    onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  />
                  <div className="slider-track"></div>
                </div>
                <div className="price-inputs-modern">
                  <div className="price-input">
                    <span>$</span>
                    <input
                      type="number"
                      name="min"
                      placeholder="Min"
                      value={tempPriceRange.min}
                      onChange={handlePriceChange}
                    />
                  </div>
                  <span className="price-sep">-</span>
                  <div className="price-input">
                    <span>$</span>
                    <input
                      type="number"
                      name="max"
                      placeholder="Max"
                      value={tempPriceRange.max}
                      onChange={handlePriceChange}
                    />
                  </div>
                </div>
                <div className="price-actions-modern">
                  <button className="btn-apply-modern" onClick={applyPriceRange}>Apply</button>
                  <button className="btn-clear-modern" onClick={clearPriceRange}>Clear</button>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="filter-section-modern">
              <div className="filter-header-modern">
                <i className="fas fa-star"></i>
                <h4>Customer Rating</h4>
              </div>
              <div className="filter-options-modern">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="filter-option-modern">
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(rating)}
                      onChange={() => handleRatingToggle(rating)}
                    />
                    <span className="checkmark-modern"></span>
                    <span className="option-text rating-stars-modern">
                      {renderStars(rating)} <span>& Up</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Section */}
            <div className="filter-section-modern">
              <div className="filter-header-modern">
                <i className="fas fa-box"></i>
                <h4>Availability</h4>
              </div>
              <div className="filter-options-modern radio-group">
                <label className="filter-option-modern">
                  <input
                    type="radio"
                    name="availability"
                    value="all"
                    checked={availability === 'all'}
                    onChange={(e) => setAvailability(e.target.value)}
                  />
                  <span className="checkmark-modern radio"></span>
                  <span className="option-text">All Products</span>
                </label>
                <label className="filter-option-modern">
                  <input
                    type="radio"
                    name="availability"
                    value="in_stock"
                    checked={availability === 'in_stock'}
                    onChange={(e) => setAvailability(e.target.value)}
                  />
                  <span className="checkmark-modern radio"></span>
                  <span className="option-text">
                    <i className="fas fa-check-circle"></i> In Stock
                  </span>
                </label>
                <label className="filter-option-modern">
                  <input
                    type="radio"
                    name="availability"
                    value="on_sale"
                    checked={availability === 'on_sale'}
                    onChange={(e) => setAvailability(e.target.value)}
                  />
                  <span className="checkmark-modern radio"></span>
                  <span className="option-text">
                    <i className="fas fa-tag"></i> On Sale
                  </span>
                </label>
              </div>
            </div>

            {(activeFiltersCount > 0 || searchQuery) && (
              <button className="clear-filters-modern" onClick={clearAllFilters}>
                <i className="fas fa-trash-alt"></i>
                Clear All Filters ({activeFiltersCount})
              </button>
            )}
          </aside>

          {/* Products Main Content */}
          <main className="shop-main-modern">
            {/* Toolbar */}
            <div className="shop-toolbar-modern">
              <div className="results-info-modern">
                <span className="result-count">{totalProducts} <span>products found</span></span>
                {activeFiltersCount > 0 && (
                  <span className="active-filters-badge-modern">
                    {activeFiltersCount} active filters
                  </span>
                )}
              </div>

              <div className="toolbar-actions-modern">
                <div className="view-toggle-modern">
                  <button
                    className={`view-btn-modern ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button
                    className={`view-btn-modern ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>

                <div className="sort-dropdown-modern" ref={sortDropdownRef}>
                  <button
                    className="sort-trigger-modern"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                  >
                    <i className="fas fa-sort-amount-down-alt"></i>
                    <span>{getSortLabel()}</span>
                    <i className={`fas fa-chevron-${showSortDropdown ? 'up' : 'down'}`}></i>
                  </button>
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        className="sort-dropdown-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                            onClick={() => handleSortChange(option.value)}
                          >
                            <i className={option.icon}></i>
                            <span>{option.label}</span>
                            {sortBy === option.value && <i className="fas fa-check"></i>}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="active-filters-modern">
                {selectedCategories.map(cat => (
                  <span key={cat} className="filter-tag-modern">
                    <i className="fas fa-tag"></i>
                    {cat}
                    <button onClick={() => handleCategoryToggle(cat)}>×</button>
                  </span>
                ))}
                {selectedBrands.map(brand => (
                  <span key={brand} className="filter-tag-modern">
                    <i className="fas fa-building"></i>
                    {brand}
                    <button onClick={() => handleBrandToggle(brand)}>×</button>
                  </span>
                ))}
                {selectedRatings.map(rating => (
                  <span key={rating} className="filter-tag-modern">
                    <i className="fas fa-star"></i>
                    {rating}+ Stars
                    <button onClick={() => handleRatingToggle(rating)}>×</button>
                  </span>
                ))}
                {availability !== 'all' && (
                  <span className="filter-tag-modern">
                    <i className={availability === 'in_stock' ? 'fas fa-check-circle' : 'fas fa-tag'}></i>
                    {availability === 'in_stock' ? 'In Stock' : 'On Sale'}
                    <button onClick={() => setAvailability('all')}>×</button>
                  </span>
                )}
                {priceRangeApplied && (
                  <span className="filter-tag-modern">
                    <i className="fas fa-dollar-sign"></i>
                    ${priceRange.min} - ${priceRange.max}
                    <button onClick={clearPriceRange}>×</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="filter-tag-modern">
                    <i className="fas fa-search"></i>
                    {searchQuery}
                    <button onClick={() => setSearchQuery('')}>×</button>
                  </span>
                )}
                <button className="clear-all-modern" onClick={clearAllFilters}>
                  Clear All
                </button>
              </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
              <div className={`products-skeleton-modern ${viewMode === 'list' ? 'list-view' : ''}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card-modern">
                    <div className="skeleton-image shimmer-modern"></div>
                    <div className="skeleton-text shimmer-modern"></div>
                    <div className="skeleton-text short shimmer-modern"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state-modern">
                <div className="empty-icon">
                  <i className="fas fa-box-open"></i>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button className="btn-primary-modern" onClick={clearAllFilters}>
                  <i className="fas fa-eraser"></i>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  className={`products-container-modern ${viewMode === 'list' ? 'list-view' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} layout={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-modern">
                <button
                  className="page-btn-modern prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                <div className="page-numbers-modern">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`page-btn-modern ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  className="page-btn-modern next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .shop-page-modern {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Hero Section */
        .shop-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 80px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .shop-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, transparent 70%);
          animation: rotate 30s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 0.8rem;
          margin-bottom: 20px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #e63946, #fbbf24);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .shop-hero h1 {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .shop-hero p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        /* Shop Layout */
        .shop-layout-modern {
          display: flex;
          gap: 40px;
          padding: 60px 0;
        }

        /* Mobile Filter Toggle */
        .mobile-filter-toggle-modern {
          display: none;
          position: fixed;
          bottom: 80px;
          right: 20px;
          z-index: 100;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          padding: 14px 20px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
          align-items: center;
          gap: 8px;
        }

        .filter-count {
          background: white;
          color: #e63946;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 12px;
          margin-left: 4px;
        }

        /* Sidebar - Glassmorphism */
        .shop-sidebar-modern {
          width: 300px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .sidebar-header-modern {
          display: none;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .sidebar-header-modern h3 {
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .close-sidebar {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #64748b;
        }

        .filter-section-modern {
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .filter-section-modern:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .filter-header-modern {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .filter-header-modern i {
          color: #e63946;
          font-size: 1rem;
        }

        .filter-header-modern h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        /* Search Input */
        .search-input-modern {
          position: relative;
        }

        .search-input-modern i {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input-modern input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input-modern input:focus {
          outline: none;
          border-color: #e63946;
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
        }

        /* Filter Options */
        .filter-options-modern {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filter-option-modern {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #475569;
          padding: 4px 0;
        }

        .filter-option-modern input {
          display: none;
        }

        .checkmark-modern {
          width: 18px;
          height: 18px;
          border: 2px solid #cbd5e1;
          border-radius: 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .checkmark-modern.radio {
          border-radius: 50%;
        }

        .filter-option-modern input:checked + .checkmark-modern {
          background: #e63946;
          border-color: #e63946;
        }

        .filter-option-modern input:checked + .checkmark-modern::after {
          content: '✓';
          color: white;
          font-size: 11px;
        }

        .option-text {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .option-count {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        /* Price Range */
        .price-range-modern {
          margin-top: 8px;
        }

        .price-values {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 600;
          color: #1e293b;
        }

        .price-slider-modern {
          position: relative;
          margin-bottom: 20px;
        }

        .price-slider-modern input {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          background: #e2e8f0;
          border-radius: 2px;
          outline: none;
        }

        .price-slider-modern input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #e63946;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .price-inputs-modern {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .price-input {
          flex: 1;
          display: flex;
          align-items: center;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          background: white;
        }

        .price-input span {
          color: #64748b;
          margin-right: 4px;
        }

        .price-input input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 0.85rem;
        }

        .price-sep {
          color: #94a3b8;
        }

        .price-actions-modern {
          display: flex;
          gap: 10px;
        }

        .btn-apply-modern {
          flex: 1;
          padding: 8px;
          background: #e63946;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-apply-modern:hover {
          background: #c92c3a;
        }

        .btn-clear-modern {
          flex: 1;
          padding: 8px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-clear-modern:hover {
          background: #e2e8f0;
        }

        /* Rating Stars */
        .rating-stars-modern {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .rating-stars-modern i {
          font-size: 0.75rem;
          color: #ffc107;
        }

        /* Clear Filters */
        .clear-filters-modern {
          width: 100%;
          padding: 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 12px;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .clear-filters-modern:hover {
          background: #fee2e2;
          color: #e63946;
        }

        /* Shop Main */
        .shop-main-modern {
          flex: 1;
        }

        /* Toolbar */
        .shop-toolbar-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .results-info-modern {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .result-count {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
        }

        .result-count span {
          font-weight: 400;
          color: #64748b;
        }

        .active-filters-badge-modern {
          font-size: 0.75rem;
          padding: 4px 10px;
          background: #e63946;
          color: white;
          border-radius: 20px;
        }

        .toolbar-actions-modern {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .view-toggle-modern {
          display: flex;
          gap: 8px;
        }

        .view-btn-modern {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-btn-modern.active {
          background: #e63946;
          color: white;
          border-color: #e63946;
        }

        /* Sort Dropdown */
        .sort-dropdown-modern {
          position: relative;
        }

        .sort-trigger-modern {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .sort-trigger-modern:hover {
          border-color: #e63946;
        }

        .sort-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 200px;
          z-index: 10;
          overflow: hidden;
        }

        .sort-option {
          width: 100%;
          padding: 12px 16px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
        }

        .sort-option:hover {
          background: #f8fafc;
        }

        .sort-option.active {
          color: #e63946;
          font-weight: 600;
        }

        .sort-option i:last-child {
          margin-left: auto;
        }

        /* Active Filters */
        .active-filters-modern {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 30px;
          padding: 16px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .filter-tag-modern {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f1f5f9;
          border-radius: 30px;
          font-size: 0.8rem;
          color: #1e293b;
        }

        .filter-tag-modern i {
          font-size: 0.7rem;
          color: #e63946;
        }

        .filter-tag-modern button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #64748b;
          margin-left: 4px;
        }

        .filter-tag-modern button:hover {
          color: #e63946;
        }

        .clear-all-modern {
          background: none;
          border: none;
          color: #e63946;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.8rem;
        }

        /* Products Container */
        .products-container-modern {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .products-container-modern.list-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Skeleton Loading */
        .products-skeleton-modern {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .products-skeleton-modern.list-view {
          display: flex;
          flex-direction: column;
        }

        .skeleton-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
        }

        .skeleton-image {
          height: 200px;
          background: #f0f0f0;
        }

        .skeleton-text {
          height: 16px;
          background: #f0f0f0;
          margin: 12px;
          border-radius: 4px;
        }

        .skeleton-text.short {
          width: 60%;
        }

        .shimmer-modern {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty State */
        .empty-state-modern {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 24px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .empty-icon i {
          font-size: 2.5rem;
          color: #94a3b8;
        }

        .empty-state-modern h3 {
          font-size: 1.3rem;
          margin-bottom: 8px;
        }

        .empty-state-modern p {
          color: #64748b;
          margin-bottom: 24px;
        }

        .btn-primary-modern {
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(230, 57, 70, 0.3);
        }

        /* Pagination */
        .pagination-modern {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 50px;
        }

        .page-btn-modern {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-btn-modern:hover:not(:disabled) {
          background: #e63946;
          color: white;
          border-color: #e63946;
        }

        .page-btn-modern.active {
          background: #e63946;
          color: white;
          border-color: #e63946;
        }

        .page-btn-modern:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers-modern {
          display: flex;
          gap: 8px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .products-container-modern {
            grid-template-columns: repeat(2, 1fr);
          }
          .products-skeleton-modern {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .container {
            padding: 0 20px;
          }

          .shop-sidebar-modern {
            position: fixed;
            top: 0;
            left: -100%;
            width: 320px;
            height: 100vh;
            z-index: 1000;
            transition: left 0.3s ease;
            border-radius: 0;
            overflow-y: auto;
          }

          .shop-sidebar-modern.open {
            left: 0;
          }

          .sidebar-header-modern {
            display: flex;
          }

          .mobile-filter-toggle-modern {
            display: flex;
          }

          .products-container-modern {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .shop-hero h1 {
            font-size: 2rem;
          }

          .shop-toolbar-modern {
            flex-direction: column;
            align-items: flex-start;
          }

          .products-container-modern {
            grid-template-columns: 1fr;
          }

          .products-skeleton-modern {
            grid-template-columns: 1fr;
          }

          .pagination-modern {
            flex-wrap: wrap;
          }

          .toolbar-actions-modern {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  )
}

export default Shop