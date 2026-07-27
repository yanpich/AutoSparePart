// src/client/pages/Wishlist.jsx - NEW MODERN INTERFACE
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Wishlist = () => {
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState({})
  const [removingItem, setRemovingItem] = useState(null)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setWishlistItems(wishlist)
    } catch (error) {
      console.error('Error loading wishlist:', error)
      setWishlistItems([])
    }
    setLoading(false)
  }

  const removeFromWishlist = (id) => {
    setRemovingItem(id)
    setTimeout(() => {
      const updatedWishlist = wishlistItems.filter(item => item.id !== id)
      setWishlistItems(updatedWishlist)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      window.dispatchEvent(new Event('wishlistUpdated'))
      setRemovingItem(null)
    }, 300)
  }

  const addToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product.id]: true }))

    setTimeout(() => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItem = cart.find(item => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cart.push({ ...product, quantity: 1 })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))

      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
    }, 500)
  }

  const moveAllToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const updatedCart = [...cart]

    wishlistItems.forEach(item => {
      const existingItem = updatedCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        updatedCart.push({ ...item, quantity: 1 })
      }
    })

    localStorage.setItem('cart', JSON.stringify(updatedCart))
    localStorage.setItem('wishlist', '[]')
    setWishlistItems([])
    window.dispatchEvent(new Event('cartUpdated'))
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      setWishlistItems([])
      localStorage.setItem('wishlist', '[]')
      window.dispatchEvent(new Event('wishlistUpdated'))
    }
  }

  const getStockStatus = (product) => {
    if (product.stock === 0) return { text: 'Out of Stock', color: '#ef4444', icon: 'fas fa-times-circle' }
    if (product.stock < 10) return { text: `Only ${product.stock} left`, color: '#f59e0b', icon: 'fas fa-exclamation-triangle' }
    return { text: 'In Stock', color: '#10b981', icon: 'fas fa-check-circle' }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const getBrandName = (product) => {
    if (!product.brand) return null
    if (typeof product.brand === 'object' && product.brand !== null) {
      return product.brand.name || product.brand.brandName || null
    }
    if (typeof product.brand === 'string') {
      return product.brand
    }
    return null
  }

  const getCategoryName = (product) => {
    if (!product.category) return null
    if (typeof product.category === 'object' && product.category !== null) {
      return product.category.name || null
    }
    if (typeof product.category === 'string') {
      return product.category
    }
    return null
  }

  if (loading) {
    return (
      <div className="wishlist-loading-new">
        <div className="loading-spinner-new">
          <div className="spinner-ring-new"></div>
          <div className="spinner-ring-new"></div>
          <div className="spinner-ring-new"></div>
        </div>
        <p>Loading your wishlist...</p>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty-new">
        <div className="empty-wishlist-new">
          <div className="empty-heart-animation">
            <svg viewBox="0 0 200 200" width="120" height="120">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e63946" strokeWidth="2" opacity="0.1"/>
              <path d="M100 60 C60 30 30 60 30 90 C30 120 50 140 100 170 C150 140 170 120 170 90 C170 60 140 30 100 60Z" fill="none" stroke="#e63946" strokeWidth="2.5"/>
              <path d="M100 80 C80 60 60 80 60 100 C60 120 100 140 100 140 C100 140 140 120 140 100 C140 80 120 60 100 80Z" fill="#e63946" opacity="0.15"/>
            </svg>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items here for easy access and quick checkout.</p>
          <button className="btn-shop-now" onClick={() => navigate('/shop')}>
            <span>Start Shopping</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist-page-new">
      <div className="wishlist-container-new">
        {/* Header */}
        <div className="wishlist-header-new">
          <div className="wishlist-header-content">
            <div className="wishlist-title-section">
              <h1>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                My Wishlist
                <span className="wishlist-count-badge">{wishlistItems.length}</span>
              </h1>
              <p>Items you've saved for later</p>
            </div>
            <div className="wishlist-actions-new">
              <button className="move-all-wishlist-btn" onClick={moveAllToCart}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Move All to Cart
              </button>
              <button className="clear-wishlist-btn-new" onClick={clearWishlist}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="wishlist-grid-new">
          <AnimatePresence>
            {wishlistItems.map((product, index) => {
              const stockStatus = getStockStatus(product)
              const isAdding = addingToCart[product.id]
              const isRemoving = removingItem === product.id
              const brandName = getBrandName(product)
              const categoryName = getCategoryName(product)

              return (
                <motion.div
                  key={product.id}
                  className={`wishlist-card-new ${isRemoving ? 'removing' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  {/* Badge */}
                  {product.badge && (
                    <div className={`wishlist-badge-new ${product.badge}`}>
                      {product.badge === 'sale' && 'Sale'}
                      {product.badge === 'new' && 'New'}
                      {product.badge === 'best' && 'Best Seller'}
                    </div>
                  )}

                  {/* Image */}
                  <div className="wishlist-image-new" onClick={() => navigate(`/product/${product.id}`)}>
                    <img src={product.image || '/images/placeholder.jpg'} alt={product.name} />
                    <div className="wishlist-image-overlay">
                      <button className="quick-view-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="wishlist-info-new">
                    <div className="wishlist-meta-new">
                      {brandName && typeof brandName === 'string' && (
                        <span className="wishlist-brand">{brandName}</span>
                      )}
                      {categoryName && typeof categoryName === 'string' && (
                        <span className="wishlist-category">{categoryName}</span>
                      )}
                    </div>

                    <h3 className="wishlist-title" onClick={() => navigate(`/product/${product.id}`)}>
                      {product.name}
                    </h3>

                    <div className="wishlist-rating-new">
                      <div className="stars-new">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas fa-star ${i < (product.rating || 4) ? 'filled' : ''}`} />
                        ))}
                      </div>
                      <span className="review-count-new">({product.reviewCount || 0})</span>
                    </div>

                    <div className="wishlist-price-new">
                      <span className="current-price-new">${formatPrice(product.price)}</span>
                      {product.oldPrice && (
                        <span className="old-price-new">${formatPrice(product.oldPrice)}</span>
                      )}
                      {product.oldPrice && (
                        <span className="discount-badge-new">
                          -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    <div className="wishlist-stock-new" style={{ color: stockStatus.color }}>
                      <span className={`stock-dot-${stockStatus.color === '#10b981' ? 'in' : stockStatus.color === '#f59e0b' ? 'low' : 'out'}`} />
                      <span>{stockStatus.text}</span>
                    </div>

                    <div className="wishlist-actions-new">
                      <button
                        className={`wishlist-add-cart-btn ${isAdding ? 'loading' : ''}`}
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0 || isAdding}
                      >
                        {isAdding ? (
                          <>
                            <span className="spinner-small-new"></span>
                            Adding...
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>
                      <button
                        className="wishlist-remove-btn"
                        onClick={() => removeFromWishlist(product.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Recommendations */}
        <div className="recommendations-new">
          <div className="recommendations-header">
            <h3>You May Also Like</h3>
            <Link to="/shop" className="view-all-link-new">
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
              </svg>
            </Link>
          </div>
          <div className="recommendations-grid-new">
            {[
              { id: 1, name: 'Premium Brake Rotors', price: 159.99, oldPrice: 199.99, rating: 4.7 },
              { id: 2, name: 'Brake Fluid DOT 4', price: 19.99, rating: 4.6 },
              { id: 3, name: 'Brake Calipers', price: 89.99, rating: 4.5 },
              { id: 4, name: 'Brake Hardware Kit', price: 24.99, rating: 4.4 }
            ].map(product => (
              <div
                key={product.id}
                className="recommendation-card-new"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="rec-image-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                    <path d="M8 2v20M16 2v20M2 8h20M2 16h20"/>
                  </svg>
                </div>
                <h4>{product.name}</h4>
                <div className="rec-price">
                  <span className="rec-current">${product.price}</span>
                  {product.oldPrice && <span className="rec-old">${product.oldPrice}</span>}
                </div>
                <div className="rec-rating">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < (product.rating || 4) ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wishlist-page-new {
          min-height: 100vh;
          background: #f5f7fa;
          padding: 0;
        }

        .wishlist-container-new {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 40px 60px;
        }

        /* Loading */
        .wishlist-loading-new {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner-new {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .spinner-ring-new {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring-new:nth-child(1) { border-top-color: #e63946; animation-delay: -0.45s; }
        .spinner-ring-new:nth-child(2) { border-right-color: #667eea; animation-delay: -0.3s; }
        .spinner-ring-new:nth-child(3) { border-bottom-color: #764ba2; animation-delay: -0.15s; }

        /* Empty */
        .wishlist-empty-new {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .empty-wishlist-new {
          text-align: center;
          max-width: 420px;
        }

        .empty-wishlist-new h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 24px 0 8px;
        }

        .empty-wishlist-new p {
          color: #64748b;
          margin-bottom: 32px;
          font-size: 16px;
        }

        .btn-shop-now {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #0f172a;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-shop-now:hover {
          background: #e63946;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(230, 57, 70, 0.25);
        }

        /* Header */
        .wishlist-header-new {
          background: white;
          border-radius: 20px;
          padding: 24px 32px;
          margin-bottom: 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .wishlist-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .wishlist-title-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wishlist-title-section h1 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wishlist-title-section h1 svg {
          flex-shrink: 0;
        }

        .wishlist-count-badge {
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
        }

        .wishlist-title-section p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .wishlist-actions-new {
          display: flex;
          gap: 12px;
        }

        .move-all-wishlist-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .move-all-wishlist-btn:hover {
          background: #e63946;
          transform: translateY(-2px);
        }

        .clear-wishlist-btn-new {
          background: transparent;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 40px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          transition: all 0.3s;
        }

        .clear-wishlist-btn-new:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }

        /* Grid */
        .wishlist-grid-new {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 60px;
        }

        /* Card */
        .wishlist-card-new {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          position: relative;
        }

        .wishlist-card-new:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }

        .wishlist-card-new.removing {
          opacity: 0;
          transform: scale(0.8);
        }

        .wishlist-badge-new {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 14px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          z-index: 2;
        }

        .wishlist-badge-new.sale {
          background: #ef4444;
          color: white;
        }

        .wishlist-badge-new.new {
          background: #3b82f6;
          color: white;
        }

        .wishlist-badge-new.best {
          background: #f59e0b;
          color: white;
        }

        /* Image */
        .wishlist-image-new {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          cursor: pointer;
          background: #f8fafc;
        }

        .wishlist-image-new img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .wishlist-card-new:hover .wishlist-image-new img {
          transform: scale(1.05);
        }

        .wishlist-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .wishlist-image-new:hover .wishlist-image-overlay {
          opacity: 1;
        }

        .quick-view-btn {
          background: white;
          border: none;
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transform: translateY(20px);
          transition: all 0.3s;
        }

        .wishlist-image-new:hover .quick-view-btn {
          transform: translateY(0);
        }

        .quick-view-btn:hover {
          background: #e63946;
          color: white;
        }

        /* Info */
        .wishlist-info-new {
          padding: 16px;
        }

        .wishlist-meta-new {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .wishlist-brand {
          font-size: 12px;
          color: #667eea;
          font-weight: 500;
        }

        .wishlist-category {
          font-size: 12px;
          color: #94a3b8;
        }

        .wishlist-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: color 0.3s;
          line-height: 1.4;
          margin: 0 0 6px;
        }

        .wishlist-title:hover {
          color: #e63946;
        }

        .wishlist-rating-new {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .stars-new {
          display: flex;
          gap: 2px;
        }

        .stars-new i {
          font-size: 12px;
          color: #cbd5e1;
        }

        .stars-new i.filled {
          color: #f59e0b;
        }

        .review-count-new {
          font-size: 12px;
          color: #94a3b8;
        }

        .wishlist-price-new {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .current-price-new {
          font-size: 18px;
          font-weight: 700;
          color: #e63946;
        }

        .old-price-new {
          font-size: 14px;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .discount-badge-new {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          background: #d1fae5;
          padding: 2px 10px;
          border-radius: 30px;
        }

        .wishlist-stock-new {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .stock-dot-in {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }

        .stock-dot-low {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
        }

        .stock-dot-out {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
        }

        /* Actions */
        .wishlist-actions-new {
          display: flex;
          gap: 10px;
        }

        .wishlist-add-cart-btn {
          flex: 1;
          background: #0f172a;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .wishlist-add-cart-btn:hover:not(:disabled) {
          background: #e63946;
          transform: translateY(-1px);
        }

        .wishlist-add-cart-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wishlist-add-cart-btn.loading {
          opacity: 0.7;
        }

        .spinner-small-new {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .wishlist-remove-btn {
          width: 40px;
          background: #f1f5f9;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.3s;
        }

        .wishlist-remove-btn:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        /* Recommendations */
        .recommendations-new {
          padding-top: 40px;
          border-top: 1px solid #e2e8f0;
        }

        .recommendations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .recommendations-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .view-all-link-new {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .view-all-link-new:hover {
          color: #e63946;
          gap: 10px;
        }

        .recommendations-grid-new {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .recommendation-card-new {
          background: white;
          padding: 16px;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .recommendation-card-new:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }

        .rec-image-placeholder {
          width: 100%;
          height: 120px;
          background: #f8fafc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .recommendation-card-new h4 {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 6px;
        }

        .rec-price {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .rec-current {
          font-weight: 700;
          color: #e63946;
        }

        .rec-old {
          font-size: 13px;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .rec-rating i {
          font-size: 12px;
          color: #cbd5e1;
        }

        .rec-rating i.filled {
          color: #f59e0b;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .wishlist-grid-new {
            grid-template-columns: repeat(3, 1fr);
          }
          .recommendations-grid-new {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .wishlist-container-new {
            padding: 20px;
          }
          .wishlist-grid-new {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .wishlist-header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .wishlist-actions-new {
            width: 100%;
          }
          .move-all-wishlist-btn, .clear-wishlist-btn-new {
            flex: 1;
            justify-content: center;
          }
          .wishlist-grid-new {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .recommendations-grid-new {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .wishlist-container-new {
            padding: 12px;
          }
          .wishlist-header-new {
            padding: 16px 20px;
          }
          .wishlist-title-section h1 {
            font-size: 20px;
          }
          .wishlist-actions-new {
            flex-direction: column;
          }
          .current-price-new {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default Wishlist