// src/client/pages/ProductDetail.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../../api/axios'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [addedToCart, setAddedToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState({})
  const [showZoom, setShowZoom] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState([])
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)

  useEffect(() => {
    fetchProductDetail()
    checkWishlistStatus()
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const fetchProductDetail = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/products/${id}`)
      setProduct(response.data)

      const relatedRes = await api.get(`/api/products/related/${id}`)
      setRelatedProducts(relatedRes.data?.content?.slice(0, 4) || getFallbackRelated())

      setReviews([
        { id: 1, name: 'David Chen', rating: 5, date: '2024-01-15', title: 'Excellent quality!', content: 'These brake pads are amazing. Great stopping power and very quiet.', verified: true, helpful: 24 },
        { id: 2, name: 'Sarah Johnson', rating: 5, date: '2024-01-10', title: 'Highly recommend', content: 'Perfect fit for my car. Installation was straightforward.', verified: true, helpful: 18 },
        { id: 3, name: 'Mike Wilson', rating: 4, date: '2024-01-05', title: 'Good value', content: 'Great product for the price. Would buy again.', verified: false, helpful: 7 }
      ])
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setFallbackProduct()
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setIsWishlisted(wishlist.some(item => item.id === parseInt(id)))
  }

  const setFallbackProduct = () => {
    setProduct({
      id: parseInt(id),
      name: 'Premium Ceramic Brake Pads',
      price: 89.99,
      oldPrice: 129.99,
      rating: 4.8,
      reviewCount: 234,
      stock: 45,
      sku: 'BP-2024-001',
      category: { name: 'Brake System', id: 1 },
      brand: { name: 'Brembo', id: 1, logo: null },
      description: 'High-performance ceramic brake pads designed for superior stopping power and reduced brake dust. Perfect for both daily driving and performance applications. Features advanced friction technology that provides consistent braking performance in all weather conditions.',
      shortDescription: 'Premium ceramic brake pads with superior stopping power and low dust formula.',
      features: [
        'Ceramic friction material for quiet operation',
        'Low dust formula keeps wheels clean',
        'Excellent stopping power in all conditions',
        'OEM fitment guaranteed',
        'Includes hardware kit with clips and lubricant',
        'Heat-treated for durability',
        'Environmentally friendly materials'
      ],
      specifications: {
        'Material': 'Ceramic Composite',
        'Position': 'Front',
        'Fitment': 'Direct replacement',
        'Warranty': '2 years / 24,000 miles',
        'Quantity': '4 pads per set',
        'Friction Rating': 'GG',
        'Temperature Range': '-40°F to 1000°F'
      },
      images: [
        'https://images.unsplash.com/photo-1486262716152-6e81c192ec02?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=600&h=600&fit=crop'
      ],
      compatibleVehicles: [
        'Toyota Camry 2018-2024',
        'Honda Accord 2018-2024',
        'Nissan Altima 2019-2024',
        'Hyundai Sonata 2020-2024',
        'Kia Optima 2019-2024'
      ],
      delivery: {
        freeShipping: true,
        estimatedDays: '3-5',
        inStock: true
      }
    })
    setRelatedProducts(getFallbackRelated())
  }

  const getFallbackRelated = () => {
    return [
      { id: 2, name: 'Premium Brake Rotors', price: 159.99, oldPrice: 199.99, rating: 4.7, image: null, brand: 'Brembo' },
      { id: 3, name: 'Brake Fluid DOT 4', price: 19.99, rating: 4.6, image: null, brand: 'Bosch' },
      { id: 4, name: 'Brake Calipers', price: 89.99, rating: 4.5, image: null, brand: 'TRW' },
      { id: 5, name: 'Brake Hardware Kit', price: 24.99, rating: 4.4, image: null, brand: 'Brembo' }
    ]
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')

    if (isWishlisted) {
      const updatedWishlist = wishlist.filter(item => item.id !== product.id)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      setIsWishlisted(false)
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Removed from wishlist', type: 'info' }
      }))
    } else {
      wishlist.push(product)
      localStorage.setItem('wishlist', JSON.stringify(wishlist))
      setIsWishlisted(true)
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Added to wishlist!', type: 'success' }
      }))
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity)
    }
  }

  const handleImageZoom = (e) => {
    if (!imageRef.current) return
    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPosition({ x, y })
  }

  const submitReview = () => {
    if (!reviewText.trim()) return
    const newReview = {
      id: reviews.length + 1,
      name: 'You',
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      title: 'My Review',
      content: reviewText,
      verified: true,
      helpful: 0
    }
    setReviews([newReview, ...reviews])
    setReviewText('')
    setReviewRating(5)
    setShowReviewForm(false)
  }

  const renderStars = (rating, size = 'default') => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const starSize = size === 'large' ? '1.2rem' : '0.9rem'

    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`fas fa-star ${i < fullStars ? 'filled' : (i === fullStars && hasHalfStar ? 'half' : '')}`}
            style={{ fontSize: starSize }}
          ></i>
        ))}
      </div>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const calculateDiscount = () => {
    if (product?.oldPrice) {
      return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    }
    return 0
  }

  if (loading) {
    return (
      <div className="product-loading-premium">
        <div className="loading-content">
          <div className="loading-spinner-premium">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <div className="loading-text">
            <span>L</span><span>o</span><span>a</span><span>d</span><span>i</span><span>n</span><span>g</span>
            <span className="dots">...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-not-found-premium">
        <div className="not-found-content">
          <div className="not-found-icon">
            <i className="fas fa-box-open"></i>
            <div className="icon-pulse"></div>
          </div>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button className="btn-primary-premium" onClick={() => navigate('/shop')}>
            Continue Shopping <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    )
  }

  const discount = calculateDiscount()
  const discountAmount = product.oldPrice ? (product.oldPrice - product.price).toFixed(2) : 0

  return (
    <>
      <Helmet>
        <title>{product.name} | AutoHive - Premium Auto Parts</title>
        <meta name="description" content={product.shortDescription || product.description?.substring(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.shortDescription || product.description?.substring(0, 160)} />
        <meta property="og:image" content={product.images?.[0] || product.image} />
      </Helmet>

      {/* Modern Cursor Effect */}
      <div className="custom-cursor" style={{ transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)` }}>
        <div className="cursor-dot"></div>
        <div className="cursor-ring"></div>
      </div>

      <div className="product-detail-premium">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb-premium">
            <a onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </a>
            <i className="fas fa-chevron-right"></i>
            <a onClick={() => navigate('/shop')}>
              <i className="fas fa-store"></i>
              <span>Shop</span>
            </a>
            <i className="fas fa-chevron-right"></i>
            <a onClick={() => navigate(`/shop?category=${product.category?.id}`)}>
              <i className="fas fa-tag"></i>
              <span>{product.category?.name}</span>
            </a>
            <i className="fas fa-chevron-right"></i>
            <span className="current">{product.name}</span>
          </div>

          {/* Product Main Section */}
          <div className="product-main-premium">
            {/* Product Gallery with 3D Effect */}
            <div className="product-gallery-premium">
              <div className="gallery-container">
                <div
                  className="main-image-premium"
                  onMouseMove={handleImageZoom}
                  onMouseEnter={() => setShowZoom(true)}
                  onMouseLeave={() => setShowZoom(false)}
                >
                  <div className="image-wrapper">
                    <img
                      ref={imageRef}
                      src={product.images?.[selectedImage] || product.image || '/images/placeholder.jpg'}
                      alt={product.name}
                      className={imageLoaded[selectedImage] ? 'loaded' : ''}
                      onLoad={() => setImageLoaded(prev => ({ ...prev, [selectedImage]: true }))}
                    />
                    <div className="image-shine"></div>
                  </div>
                  {showZoom && (
                    <div
                      className="zoom-lens-premium"
                      style={{
                        backgroundImage: `url(${product.images?.[selectedImage] || product.image})`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }}
                    />
                  )}
                  {discount > 0 && (
                    <div className="discount-badge-premium">
                      <span className="discount-value">-{discount}%</span>
                      <span className="discount-label">OFF</span>
                    </div>
                  )}
                  <div className="image-actions">
                    <button className="image-action-btn">
                      <i className="fas fa-expand-alt"></i>
                    </button>
                  </div>
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="thumbnail-list-premium">
                    {product.images.map((img, index) => (
                      <div
                        key={index}
                        className={`thumbnail-premium ${selectedImage === index ? 'active' : ''}`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img src={img} alt={`${product.name} - ${index + 1}`} />
                        <div className="thumbnail-overlay"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info with Glassmorphism */}
            <div className="product-info-premium">
              <div className="info-card">
                {/* Brand */}
                <div className="brand-section">
                  <div className="brand-logo-premium">
                    {product.brand?.logo ? (
                      <img src={product.brand.logo} alt={product.brand.name} />
                    ) : (
                      <i className="fas fa-building"></i>
                    )}
                  </div>
                  <div className="brand-info">
                    <span className="brand-name">{product.brand?.name}</span>
                    <span className="verified-badge">
                      <i className="fas fa-check-circle"></i> Verified Seller
                    </span>
                  </div>
                </div>

                <h1 className="product-title-premium">{product.name}</h1>

                {/* Rating */}
                <div className="rating-section-premium">
                  <div className="stars-wrapper">
                    {renderStars(product.rating, 'large')}
                    <span className="rating-value">{product.rating}</span>
                  </div>
                  <span className="review-count">{product.reviewCount || 0} customer reviews</span>
                  <div className="stock-indicator-premium">
                    <span className="stock-dot"></span>
                    <span>In Stock</span>
                  </div>
                </div>

                {/* Price with Animation */}
                <div className="price-section-premium">
                  <div className="price-wrapper">
                    <span className="current-price">${formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <>
                        <span className="old-price">${formatPrice(product.oldPrice)}</span>
                        <div className="save-tag">
                          <i className="fas fa-tag"></i>
                          <span>Save ${formatPrice(discountAmount)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="price-note">
                      <i className="fas fa-clock"></i>
                      Limited time offer - {discount}% off
                    </div>
                  )}
                </div>

                {/* Short Description */}
                <div className="short-description-premium">
                  <p>{product.shortDescription || product.description?.substring(0, 200)}</p>
                </div>

                {/* Stock Progress */}
                <div className="stock-progress-premium">
                  <div className="stock-header">
                    <span><i className="fas fa-boxes"></i> Availability</span>
                    <span className="stock-count">{product.stock} units left</span>
                  </div>
                  <div className="stock-bar-premium">
                    <div
                      className="stock-fill-premium"
                      style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                    />
                  </div>
                  {product.stock < 20 && (
                    <div className="low-stock-alert">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>Hurry! Only {product.stock} items left in stock</span>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="quantity-section-premium">
                  <label className="quantity-label">
                    <i className="fas fa-sort-amount-up"></i>
                    Quantity
                  </label>
                  <div className="quantity-control-premium">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="quantity-message">
                    {product.stock >= 100 ? (
                      <span><i className="fas fa-check"></i> Bulk orders available</span>
                    ) : (
                      <span><i className="fas fa-clock"></i> Only {product.stock} left</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-premium">
                  <button
                    className={`add-to-cart-premium ${addedToCart ? 'added' : ''}`}
                    onClick={addToCart}
                    disabled={product.stock === 0}
                  >
                    <div className="btn-content">
                      {addedToCart ? (
                        <>
                          <i className="fas fa-check"></i>
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shopping-cart"></i>
                          <span>Add to Cart</span>
                        </>
                      )}
                    </div>
                    <div className="btn-shine"></div>
                  </button>
                  <button
                    className={`wishlist-premium ${isWishlisted ? 'active' : ''}`}
                    onClick={toggleWishlist}
                  >
                    <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
                  </button>
                </div>

                {/* Delivery Info */}
                <div className="delivery-grid-premium">
                  <div className="delivery-card">
                    <div className="delivery-icon">
                      <i className="fas fa-truck-fast"></i>
                    </div>
                    <div>
                      <strong>Free Shipping</strong>
                      <p>On orders over $100</p>
                    </div>
                  </div>
                  <div className="delivery-card">
                    <div className="delivery-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div>
                      <strong>Fast Delivery</strong>
                      <p>{product.delivery?.estimatedDays || '3-5'} business days</p>
                    </div>
                  </div>
                  <div className="delivery-card">
                    <div className="delivery-icon">
                      <i className="fas fa-undo-alt"></i>
                    </div>
                    <div>
                      <strong>30-Day Returns</strong>
                      <p>Easy return policy</p>
                    </div>
                  </div>
                  <div className="delivery-card">
                    <div className="delivery-icon">
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <div>
                      <strong>Secure Payment</strong>
                      <p>SSL encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs - Modern */}
          <div className="tabs-section-premium">
            <div className="tabs-header">
              {[
                { id: 'description', label: 'Description', icon: 'fas fa-align-left' },
                { id: 'specifications', label: 'Specifications', icon: 'fas fa-list' },
                { id: 'vehicles', label: 'Compatible Vehicles', icon: 'fas fa-car' },
                { id: 'reviews', label: `Reviews (${reviews.length})`, icon: 'fas fa-star' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn-premium ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <div className="tab-indicator"></div>}
                </button>
              ))}
            </div>

            <div className="tabs-content">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="description-tab">
                  <div className="description-text">
                    <p>{product.description}</p>
                  </div>
                  {product.features && product.features.length > 0 && (
                    <div className="features-showcase">
                      <h3>
                        <i className="fas fa-gem"></i>
                        Key Features
                      </h3>
                      <div className="features-grid-premium">
                        {product.features.map((feature, index) => (
                          <div key={index} className="feature-card-mini">
                            <div className="feature-icon-mini">
                              <i className="fas fa-check-circle"></i>
                            </div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === 'specifications' && (
                <div className="specifications-tab">
                  <div className="specs-grid-premium">
                    {Object.entries(product.specifications || {}).map(([key, value], index) => (
                      <div key={index} className="spec-item">
                        <div className="spec-key">{key}</div>
                        <div className="spec-value">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles Tab */}
              {activeTab === 'vehicles' && (
                <div className="vehicles-tab">
                  <div className="vehicles-header">
                    <i className="fas fa-car"></i>
                    <h3>Compatible Vehicles</h3>
                  </div>
                  <div className="vehicles-grid-premium">
                    {product.compatibleVehicles?.map((vehicle, index) => (
                      <div key={index} className="vehicle-card-premium">
                        <i className="fas fa-check-circle"></i>
                        <span>{vehicle}</span>
                      </div>
                    ))}
                  </div>
                  <div className="compatibility-note-premium">
                    <i className="fas fa-info-circle"></i>
                    <div>
                      <strong>Need help with fitment?</strong>
                      <p>Contact our support team for assistance or use our vehicle fitment guide.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="reviews-tab">
                  <div className="reviews-header-premium">
                    <div className="rating-summary">
                      <div className="rating-big">{product.rating || 4.8}</div>
                      <div className="rating-stars-big">
                        {renderStars(product.rating || 4.8, 'large')}
                        <span className="rating-total">Based on {product.reviewCount || reviews.length} reviews</span>
                      </div>
                    </div>
                    <button
                      className="write-review-premium"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      <i className="fas fa-pen"></i>
                      Write a Review
                    </button>
                  </div>

                  {showReviewForm && (
                    <div className="review-form-premium">
                      <h4>Share Your Experience</h4>
                      <div className="rating-select">
                        <span>Your Rating:</span>
                        <div className="star-select">
                          {[1, 2, 3, 4, 5].map(star => (
                            <i
                              key={star}
                              className={`fas fa-star ${star <= reviewRating ? 'filled' : ''}`}
                              onClick={() => setReviewRating(star)}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <textarea
                        placeholder="What do you think about this product?"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows="4"
                      />
                      <div className="form-actions">
                        <button className="cancel-btn" onClick={() => setShowReviewForm(false)}>Cancel</button>
                        <button className="submit-btn" onClick={submitReview}>Submit Review</button>
                      </div>
                    </div>
                  )}

                  <div className="reviews-list-premium">
                    {reviews.map((review, index) => (
                      <div key={index} className="review-card-premium">
                        <div className="review-header">
                          <div className="reviewer-avatar">
                            {review.name.charAt(0)}
                          </div>
                          <div className="reviewer-details">
                            <div className="reviewer-name">
                              {review.name}
                              {review.verified && <span className="verified"><i className="fas fa-check-circle"></i> Verified</span>}
                            </div>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                              <span className="review-date">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <h5>{review.title}</h5>
                        <p>{review.content}</p>
                        <button className="helpful-btn">
                          <i className="far fa-thumbs-up"></i> Helpful ({review.helpful})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products - Modern Carousel */}
          {relatedProducts.length > 0 && (
            <div className="related-products-premium">
              <div className="section-header-premium">
                <div>
                  <span className="section-badge">You May Also Like</span>
                  <h2>Related <span className="gradient-text">Products</span></h2>
                  <p>Customers who bought this also viewed</p>
                </div>
              </div>
              <div className="related-grid-premium">
                {relatedProducts.map(related => (
                  <div
                    key={related.id}
                    className="related-card-premium"
                    onClick={() => navigate(`/product/${related.id}`)}
                  >
                    <div className="related-image-container">
                      <img src={related.image || '/images/placeholder.jpg'} alt={related.name} />
                      {related.oldPrice && (
                        <div className="related-badge">
                          -{Math.round(((related.oldPrice - related.price) / related.oldPrice) * 100)}%
                        </div>
                      )}
                      <div className="related-overlay">
                        <button className="related-view-btn">
                          <i className="fas fa-eye"></i> Quick View
                        </button>
                      </div>
                    </div>
                    <div className="related-info">
                      <h4>{related.name}</h4>
                      <div className="related-brand">
                        <i className="fas fa-building"></i>
                        <span>{related.brand || 'AutoHive'}</span>
                      </div>
                      <div className="related-price">
                        <span className="current">${related.price}</span>
                        {related.oldPrice && <span className="old">${related.oldPrice}</span>}
                      </div>
                      <div className="related-rating">
                        {renderStars(related.rating || 4)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-detail-premium {
          padding: 40px 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          min-height: 100vh;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Custom Cursor */
        .custom-cursor {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 99999;
          transition: transform 0.05s ease;
        }

        .cursor-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #e63946;
          border-radius: 50%;
          top: -3px;
          left: -3px;
        }

        .cursor-ring {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 2px solid rgba(230, 57, 70, 0.3);
          border-radius: 50%;
          top: -20px;
          left: -20px;
          transition: all 0.2s ease;
          animation: cursorPulse 2s infinite;
        }

        @keyframes cursorPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }

        @media (max-width: 768px) {
          .custom-cursor { display: none; }
        }

        /* Breadcrumb */
        .breadcrumb-premium {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          font-size: 0.85rem;
          flex-wrap: wrap;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 50px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .breadcrumb-premium a {
          cursor: pointer;
          color: #64748b;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-premium a:hover {
          color: #e63946;
          transform: translateX(3px);
        }

        .breadcrumb-premium i {
          font-size: 0.8rem;
        }

        .breadcrumb-premium .current {
          color: #e63946;
          font-weight: 500;
        }

        /* Product Main Layout */
        .product-main-premium {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          margin-bottom: 60px;
        }

        /* Gallery */
        .product-gallery-premium {
          position: sticky;
          top: 100px;
        }

        .gallery-container {
          background: white;
          border-radius: 32px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
        }

        .main-image-premium {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          cursor: zoom-in;
          background: #f8fafc;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .main-image-premium img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease, transform 0.6s ease;
          opacity: 0;
        }

        .main-image-premium img.loaded {
          opacity: 1;
        }

        .main-image-premium:hover img {
          transform: scale(1.05);
        }

        .image-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }

        .main-image-premium:hover .image-shine {
          left: 100%;
        }

        .zoom-lens-premium {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: 200% 200%;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .discount-badge-premium {
          position: absolute;
          top: 20px;
          left: 20px;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          padding: 10px 16px;
          border-radius: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
        }

        .discount-value {
          font-size: 1.2rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .discount-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .image-actions {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 3;
        }

        .image-action-btn {
          width: 40px;
          height: 40px;
          background: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .image-action-btn:hover {
          background: #e63946;
          color: white;
          transform: scale(1.1);
        }

        .thumbnail-list-premium {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .thumbnail-premium {
          position: relative;
          width: 85px;
          height: 85px;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .thumbnail-premium.active {
          border-color: #e63946;
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.2);
        }

        .thumbnail-premium img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.2);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .thumbnail-premium:hover .thumbnail-overlay {
          opacity: 1;
        }

        /* Product Info Card */
        .product-info-premium {
          position: relative;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 32px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .brand-logo-premium {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo-premium i {
          font-size: 1.5rem;
          color: #e63946;
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-weight: 700;
          color: #1e293b;
        }

        .verified-badge {
          font-size: 0.7rem;
          color: #10b981;
        }

        .product-title-premium {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1e293b;
          line-height: 1.3;
        }

        .rating-section-premium {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .stars-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rating-value {
          font-weight: 700;
          color: #1e293b;
        }

        .review-count {
          color: #64748b;
          font-size: 0.85rem;
        }

        .stock-indicator-premium {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #d1fae5;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #059669;
        }

        .stock-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulseGreen 2s infinite;
        }

        @keyframes pulseGreen {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Price Section */
        .price-section-premium {
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          padding: 20px;
          border-radius: 20px;
          margin: 20px 0;
        }

        .price-wrapper {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }

        .current-price {
          font-size: 2.2rem;
          font-weight: 800;
          color: #e63946;
        }

        .old-price {
          font-size: 1.1rem;
          text-decoration: line-through;
          color: #94a3b8;
        }

        .save-tag {
          background: #d1fae5;
          color: #059669;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .price-note {
          margin-top: 12px;
          font-size: 0.75rem;
          color: #f59e0b;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .short-description-premium {
          color: #475569;
          line-height: 1.6;
          margin: 20px 0;
        }

        /* Stock Progress */
        .stock-progress-premium {
          margin: 24px 0;
        }

        .stock-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.8rem;
        }

        .stock-bar-premium {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .stock-fill-premium {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 3px;
          transition: width 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .stock-fill-premium::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 30px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .low-stock-alert {
          margin-top: 10px;
          background: #fef3c7;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          color: #d97706;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Quantity Section */
        .quantity-section-premium {
          margin: 24px 0;
        }

        .quantity-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .quantity-control-premium {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #f1f5f9;
          border-radius: 50px;
          width: fit-content;
          padding: 4px;
        }

        .quantity-control-premium button {
          width: 40px;
          height: 40px;
          border: none;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
          color: #64748b;
        }

        .quantity-control-premium button:hover:not(:disabled) {
          background: #e63946;
          color: white;
          transform: scale(1.05);
        }

        .quantity-control-premium button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-value {
          min-width: 50px;
          text-align: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .quantity-message {
          margin-top: 10px;
          font-size: 0.7rem;
          color: #10b981;
        }

        /* Action Buttons */
        .action-buttons-premium {
          display: flex;
          gap: 15px;
          margin: 24px 0;
        }

        .add-to-cart-premium {
          flex: 1;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .btn-content {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          color: white;
        }

        .add-to-cart-premium:hover:not(:disabled) {
          background: linear-gradient(135deg, #e63946, #c92c3a);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(230, 57, 70, 0.3);
        }

        .add-to-cart-premium.added .btn-content {
          background: #10b981;
        }

        .btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .add-to-cart-premium:hover .btn-shine {
          left: 100%;
        }

        .wishlist-premium {
          width: 54px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s;
          color: #64748b;
        }

        .wishlist-premium:hover {
          border-color: #e63946;
          color: #e63946;
          transform: translateY(-2px);
        }

        .wishlist-premium.active {
          background: #e63946;
          color: white;
          border-color: #e63946;
        }

        /* Delivery Grid */
        .delivery-grid-premium {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .delivery-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 16px;
        }

        .delivery-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delivery-icon i {
          font-size: 1.1rem;
          color: #e63946;
        }

        .delivery-card strong {
          display: block;
          font-size: 0.8rem;
        }

        .delivery-card p {
          font-size: 0.7rem;
          color: #64748b;
          margin: 0;
        }

        /* Tabs Section */
        .tabs-section-premium {
          background: white;
          border-radius: 32px;
          overflow: hidden;
          margin-bottom: 60px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
        }

        .tabs-header {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0 24px;
        }

        .tab-btn-premium {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 28px;
          background: none;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          color: #64748b;
        }

        .tab-btn-premium.active {
          color: #e63946;
        }

        .tab-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e63946;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { width: 0; left: 50%; }
          to { width: 100%; left: 0; }
        }

        .tabs-content {
          padding: 32px;
        }

        /* Features Grid */
        .features-grid-premium {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 20px;
        }

        .feature-card-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 16px;
          transition: all 0.3s;
        }

        .feature-card-mini:hover {
          transform: translateX(5px);
          background: #f1f5f9;
        }

        .feature-icon-mini i {
          color: #10b981;
        }

        /* Specs Grid */
        .specs-grid-premium {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .spec-key {
          font-weight: 600;
          color: #1e293b;
        }

        .spec-value {
          color: #64748b;
        }

        /* Vehicles Grid */
        .vehicles-grid-premium {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 20px 0;
        }

        .vehicle-card-premium {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .vehicle-card-premium i {
          color: #10b981;
        }

        .compatibility-note-premium {
          background: linear-gradient(135deg, #fef3c7, #fffbeb);
          padding: 16px;
          border-radius: 16px;
          display: flex;
          gap: 12px;
        }

        /* Reviews */
        .reviews-header-premium {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .rating-summary {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .rating-big {
          font-size: 3rem;
          font-weight: 800;
          color: #1e293b;
        }

        .rating-total {
          font-size: 0.75rem;
          color: #64748b;
        }

        .write-review-premium {
          padding: 12px 24px;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .write-review-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(230, 57, 70, 0.3);
        }

        .review-form-premium {
          background: #f8fafc;
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 30px;
        }

        .rating-select {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .star-select i {
          font-size: 1.3rem;
          color: #cbd5e1;
          cursor: pointer;
          transition: color 0.2s;
          margin-right: 4px;
        }

        .star-select i.filled {
          color: #ffc107;
        }

        .review-form-premium textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-family: inherit;
          margin-bottom: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: #e2e8f0;
          border: none;
          border-radius: 30px;
          cursor: pointer;
        }

        .submit-btn {
          padding: 10px 24px;
          background: #e63946;
          color: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
        }

        .reviews-list-premium {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review-card-premium {
          padding: 20px;
          background: #f8fafc;
          border-radius: 20px;
          transition: all 0.3s;
        }

        .review-card-premium:hover {
          transform: translateX(5px);
          background: #f1f5f9;
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .reviewer-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .reviewer-name {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .verified {
          font-size: 0.7rem;
          color: #10b981;
        }

        .review-date {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-left: 10px;
        }

        .helpful-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          margin-top: 12px;
          font-size: 0.8rem;
        }

        /* Related Products */
        .related-products-premium {
          margin-top: 60px;
        }

        .section-header-premium {
          text-align: center;
          margin-bottom: 40px;
        }

        .section-badge {
          display: inline-block;
          background: rgba(230, 57, 70, 0.1);
          padding: 5px 15px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #e63946;
          margin-bottom: 15px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #e63946, #667eea, #764ba2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .related-grid-premium {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 25px;
        }

        .related-card-premium {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .related-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 35px rgba(0, 0, 0, 0.1);
        }

        .related-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .related-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .related-card-premium:hover .related-image-container img {
          transform: scale(1.1);
        }

        .related-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #e63946;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .related-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .related-card-premium:hover .related-overlay {
          opacity: 1;
        }

        .related-view-btn {
          background: white;
          border: none;
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transform: translateY(20px);
          transition: transform 0.3s;
        }

        .related-card-premium:hover .related-view-btn {
          transform: translateY(0);
        }

        .related-info {
          padding: 16px;
        }

        .related-info h4 {
          font-size: 0.9rem;
          margin-bottom: 6px;
        }

        .related-brand {
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .related-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .related-price .current {
          color: #e63946;
          font-weight: 700;
        }

        .related-price .old {
          font-size: 0.8rem;
          text-decoration: line-through;
          color: #94a3b8;
        }

        /* Star Rating */
        .star-rating {
          display: inline-flex;
          gap: 2px;
        }

        .star-rating i {
          color: #cbd5e1;
        }

        .star-rating i.filled {
          color: #ffc107;
        }

        .star-rating i.half {
          position: relative;
          color: #cbd5e1;
        }

        .star-rating i.half::before {
          content: '\f089';
          position: absolute;
          left: 0;
          top: 0;
          color: #ffc107;
          width: 50%;
          overflow: hidden;
        }

        /* Loading Premium */
        .product-loading-premium {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa, #e9ecef);
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner-premium {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(1) { border-top-color: #e63946; animation-delay: -0.45s; }
        .spinner-ring:nth-child(2) { border-right-color: #667eea; animation-delay: -0.3s; }
        .spinner-ring:nth-child(3) { border-bottom-color: #764ba2; animation-delay: -0.15s; }
        .spinner-ring:nth-child(4) { border-left-color: #10b981; animation-delay: 0s; }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text span {
          font-size: 1.2rem;
          font-weight: 600;
          color: #64748b;
          display: inline-block;
          animation: bounce 0.8s infinite;
        }

        .loading-text span:nth-child(1) { animation-delay: 0s; }
        .loading-text span:nth-child(2) { animation-delay: 0.1s; }
        .loading-text span:nth-child(3) { animation-delay: 0.2s; }
        .loading-text span:nth-child(4) { animation-delay: 0.3s; }
        .loading-text span:nth-child(5) { animation-delay: 0.4s; }
        .loading-text span:nth-child(6) { animation-delay: 0.5s; }
        .loading-text span:nth-child(7) { animation-delay: 0.6s; }

        .dots {
          animation: blink 1s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Not Found Premium */
        .product-not-found-premium {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa, #e9ecef);
        }

        .not-found-content {
          text-align: center;
        }

        .not-found-icon {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 30px;
        }

        .not-found-icon i {
          font-size: 5rem;
          color: #cbd5e1;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .icon-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(230, 57, 70, 0.1);
          animation: pulseExpand 2s infinite;
        }

        @keyframes pulseExpand {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .btn-primary-premium {
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 20px;
        }

        .btn-primary-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(230, 57, 70, 0.3);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .container { padding: 0 30px; }
          .related-grid-premium { grid-template-columns: repeat(2, 1fr); }
          .features-grid-premium, .specs-grid-premium, .vehicles-grid-premium { grid-template-columns: 1fr; }
        }

        @media (max-width: 992px) {
          .product-main-premium { grid-template-columns: 1fr; gap: 30px; }
          .delivery-grid-premium { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .container { padding: 0 20px; }
          .related-grid-premium { grid-template-columns: 1fr; }
          .tabs-header { overflow-x: auto; }
          .tab-btn-premium { padding: 12px 16px; }
          .reviews-header-premium { flex-direction: column; text-align: center; }
          .rating-summary { flex-direction: column; }
          .action-buttons-premium { flex-direction: column; }
          .wishlist-premium { width: 100%; padding: 16px; }
          .breadcrumb-premium { overflow-x: auto; white-space: nowrap; }
        }
      `}</style>
    </>
  )
}

export default ProductDetail