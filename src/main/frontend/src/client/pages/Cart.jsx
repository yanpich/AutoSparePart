// src/client/pages/Cart.jsx - NEW MODERN INTERFACE
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [savedItems, setSavedItems] = useState([])
  const [isCouponValid, setIsCouponValid] = useState(null)
  const [deliveryDate, setDeliveryDate] = useState(null)

  useEffect(() => {
    loadCart()
    calculateDeliveryDate()
  }, [])

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const saved = JSON.parse(localStorage.getItem('savedForLater') || '[]')
      setCartItems(cart)
      setSavedItems(saved)
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
      setSavedItems([])
    }
    setLoading(false)
  }

  const calculateDeliveryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    setDeliveryDate(date)
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.min(quantity, item.stock || 999) } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const moveToSaved = (item) => {
    const updatedCart = cartItems.filter(i => i.id !== item.id)
    const updatedSaved = [...savedItems, { ...item, savedAt: new Date().toISOString() }]
    setCartItems(updatedCart)
    setSavedItems(updatedSaved)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    localStorage.setItem('savedForLater', JSON.stringify(updatedSaved))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const moveToCart = (item) => {
    const updatedSaved = savedItems.filter(i => i.id !== item.id)
    const updatedCart = [...cartItems, { ...item, quantity: 1 }]
    setSavedItems(updatedSaved)
    setCartItems(updatedCart)
    localStorage.setItem('savedForLater', JSON.stringify(updatedSaved))
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeSavedItem = (id) => {
    const updatedSaved = savedItems.filter(item => item.id !== id)
    setSavedItems(updatedSaved)
    localStorage.setItem('savedForLater', JSON.stringify(updatedSaved))
  }

  const applyCoupon = () => {
    const validCoupons = {
      'SAVE10': 10,
      'SAVE20': 20,
      'AUTOHIVE': 15,
      'WELCOME': 10
    }
    const code = couponCode.toUpperCase().trim()
    if (validCoupons[code]) {
      setDiscount(validCoupons[code])
      setCouponApplied(true)
      setIsCouponValid(true)
    } else {
      setIsCouponValid(false)
      setTimeout(() => setIsCouponValid(null), 3000)
    }
  }

  const removeCoupon = () => {
    setDiscount(0)
    setCouponApplied(false)
    setCouponCode('')
    setIsCouponValid(null)
  }

  const getBrandName = (item) => {
    if (!item.brand) return null
    if (typeof item.brand === 'object' && item.brand !== null) {
      return item.brand.name || item.brand.brandName || null
    }
    if (typeof item.brand === 'string') return item.brand
    return null
  }

  const getCategoryName = (item) => {
    if (!item.category) return null
    if (typeof item.category === 'object' && item.category !== null) {
      return item.category.name || null
    }
    if (typeof item.category === 'string') return item.category
    return null
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discountAmount = (subtotal * discount) / 100
  const shipping = subtotal > 100 ? 0 : 10
  const tax = (subtotal - discountAmount) * 0.1
  const total = subtotal - discountAmount + shipping + tax

  if (loading) {
    return (
      <div className="cart-loading-new">
        <div className="loading-spinner-new">
          <div className="spinner-ring-new"></div>
          <div className="spinner-ring-new"></div>
          <div className="spinner-ring-new"></div>
        </div>
        <p>Loading your cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-new">
        <div className="empty-cart-new">
          <div className="empty-cart-animation">
            <svg viewBox="0 0 200 200" width="120" height="120">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e63946" strokeWidth="2" opacity="0.1"/>
              <path d="M60 80 L70 80 L80 60 L120 60 L130 80 L140 80 L130 120 L70 120 L60 80 Z" fill="none" stroke="#e63946" strokeWidth="2.5"/>
              <circle cx="85" cy="130" r="10" fill="#e63946" opacity="0.3"/>
              <circle cx="115" cy="130" r="10" fill="#e63946" opacity="0.3"/>
              <path d="M80 100 L90 110 L110 90" stroke="#e63946" strokeWidth="2.5" fill="none"/>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Ready to find the perfect parts for your vehicle?</p>
          <button className="btn-shop-now" onClick={() => navigate('/shop')}>
            <span>Start Shopping</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
            </svg>
          </button>
          {savedItems.length > 0 && (
            <button className="btn-restore" onClick={() => {
              const allItems = [...cartItems, ...savedItems]
              setCartItems(allItems)
              setSavedItems([])
              localStorage.setItem('cart', JSON.stringify(allItems))
              localStorage.setItem('savedForLater', '[]')
              window.dispatchEvent(new Event('cartUpdated'))
            }}>
              Restore Saved Items ({savedItems.length})
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page-new">
      <div className="cart-container-new">
        {/* Header */}
        <div className="cart-header-new">
          <div className="cart-header-content">
            <div className="cart-title-section">
              <h1>Shopping Cart</h1>
              <span className="cart-item-count">{cartItems.length} items</span>
            </div>
            <div className="cart-progress">
              <div className="progress-step active">
                <span className="step-number">1</span>
                <span className="step-label">Cart</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <span className="step-number">2</span>
                <span className="step-label">Checkout</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <span className="step-number">3</span>
                <span className="step-label">Confirmation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cart-grid-new">
          {/* Left Column - Cart Items */}
          <div className="cart-items-new">
            {cartItems.map((item, index) => {
              const brandName = getBrandName(item)
              const categoryName = getCategoryName(item)

              return (
                <motion.div
                  key={item.id}
                  className="cart-item-new"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="cart-item-select">
                    <input type="checkbox" defaultChecked />
                  </div>

                  <div className="cart-item-image-new">
                    <img src={item.image || '/images/placeholder.jpg'} alt={item.name} />
                    {item.badge === 'sale' && <span className="badge-sale-new">Sale</span>}
                  </div>

                  <div className="cart-item-details-new">
                    <div className="item-header-new">
                      <h3>{item.name}</h3>
                      <div className="item-actions-new">
                        <button className="item-action-btn" onClick={() => moveToSaved(item)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                        </button>
                        <button className="item-action-btn delete" onClick={() => removeItem(item.id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="item-meta-new">
                      {brandName && <span className="item-brand">{brandName}</span>}
                      {categoryName && <span className="item-category">{categoryName}</span>}
                      {item.sku && <span className="item-sku">SKU: {item.sku}</span>}
                    </div>

                    {item.stock && item.stock < 20 && (
                      <div className="stock-alert-new">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>Only {item.stock} left</span>
                      </div>
                    )}

                    <div className="item-price-section">
                      <div className="item-price-new">
                        <span className="current-price-new">${item.price.toFixed(2)}</span>
                        {item.oldPrice && (
                          <span className="old-price-new">${item.oldPrice.toFixed(2)}</span>
                        )}
                        {item.oldPrice && (
                          <span className="discount-badge-new">
                            -{Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
                          </span>
                        )}
                      </div>

                      <div className="quantity-control-new">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= (item.stock || 999)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                      </div>

                      <div className="item-total-new">
                        <span className="total-label">Total</span>
                        <span className="total-amount-new">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Saved Items */}
            {savedItems.length > 0 && (
              <div className="saved-items-new">
                <div className="saved-header-new">
                  <h4>Saved for Later</h4>
                  <button className="move-all-new" onClick={() => {
                    const allItems = [...cartItems, ...savedItems]
                    setCartItems(allItems)
                    setSavedItems([])
                    localStorage.setItem('cart', JSON.stringify(allItems))
                    localStorage.setItem('savedForLater', '[]')
                    window.dispatchEvent(new Event('cartUpdated'))
                  }}>
                    Move All to Cart
                  </button>
                </div>
                <div className="saved-grid-new">
                  {savedItems.map((item) => (
                    <div key={item.id} className="saved-item-new">
                      <img src={item.image || '/images/placeholder.jpg'} alt={item.name} />
                      <div className="saved-item-info-new">
                        <span>{item.name}</span>
                        <strong>${item.price.toFixed(2)}</strong>
                      </div>
                      <button className="saved-move-btn" onClick={() => moveToCart(item)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary-new">
            <div className="summary-card-new">
              <h3>Order Summary</h3>

              <div className="summary-items">
                <div className="summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount-new">
                    <span>Discount ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total</span>
                <span className="total-price-new">${total.toFixed(2)}</span>
              </div>

              {subtotal < 100 && (
                <div className="shipping-progress-new">
                  <div className="progress-text">
                    <span>Add ${(100 - subtotal).toFixed(2)} more for free shipping</span>
                  </div>
                  <div className="progress-bar-new">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (subtotal / 100) * 100)}%` }} />
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div className="coupon-section-new">
                <div className={`coupon-input-new ${isCouponValid === false ? 'invalid' : ''}`}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  {couponApplied ? (
                    <button className="coupon-remove" onClick={removeCoupon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  ) : (
                    <button className="coupon-apply" onClick={applyCoupon}>
                      Apply
                    </button>
                  )}
                </div>
                {isCouponValid === false && (
                  <div className="coupon-error-new">Invalid coupon code</div>
                )}
                {couponApplied && (
                  <div className="coupon-success-new">✓ Coupon applied! {discount}% off</div>
                )}
              </div>

              <button className="checkout-btn-new" onClick={() => navigate('/checkout')}>
                <span>Proceed to Checkout</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
                </svg>
              </button>

              <div className="security-badges-new">
                <div className="security-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="security-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                    <path d="M12 12h.01"/>
                    <path d="M8 12h.01"/>
                    <path d="M16 12h.01"/>
                  </svg>
                  <span>SSL Encrypted</span>
                </div>
                <div className="security-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  <span>Easy Returns</span>
                </div>
              </div>

              <div className="delivery-estimate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18" r="2.5"/>
                  <circle cx="18.5" cy="18" r="2.5"/>
                </svg>
                <span>Estimated delivery: <strong>{deliveryDate?.toLocaleDateString() || '3-5 days'}</strong></span>
              </div>

              <Link to="/shop" className="continue-shopping-new">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19L5 12L12 5"/>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cart-page-new {
          min-height: 100vh;
          background: #f5f7fa;
          padding: 0;
        }

        .cart-container-new {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 40px 60px;
        }

        /* Loading */
        .cart-loading-new {
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Empty Cart */
        .cart-empty-new {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .empty-cart-new {
          text-align: center;
          max-width: 420px;
        }

        .empty-cart-new h2 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 24px 0 8px;
        }

        .empty-cart-new p {
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

        .btn-restore {
          display: block;
          margin: 12px auto 0;
          background: none;
          border: none;
          color: #667eea;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-restore:hover {
          color: #764ba2;
        }

        /* Header */
        .cart-header-new {
          background: white;
          border-radius: 20px;
          padding: 24px 32px;
          margin-bottom: 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .cart-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .cart-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cart-title-section h1 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }

        .cart-item-count {
          background: #f1f5f9;
          padding: 2px 14px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
        }

        .cart-progress {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          background: #f1f5f9;
          color: #94a3b8;
          transition: all 0.3s;
        }

        .progress-step.active .step-number {
          background: #e63946;
          color: white;
        }

        .step-label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
        }

        .progress-step.active .step-label {
          color: #0f172a;
        }

        .progress-line {
          width: 40px;
          height: 2px;
          background: #e2e8f0;
          margin: 0 8px;
        }

        /* Grid */
        .cart-grid-new {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
        }

        /* Cart Items */
        .cart-items-new {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item-new {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: stretch;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: box-shadow 0.3s;
        }

        .cart-item-new:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .cart-item-select {
          display: flex;
          align-items: center;
        }

        .cart-item-select input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #e63946;
          cursor: pointer;
        }

        .cart-item-image-new {
          position: relative;
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
        }

        .cart-item-image-new img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge-sale-new {
          position: absolute;
          top: 6px;
          left: 6px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .cart-item-details-new {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-header-new {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .item-header-new h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .item-actions-new {
          display: flex;
          gap: 4px;
        }

        .item-action-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .item-action-btn:hover {
          background: #f1f5f9;
          color: #3b82f6;
        }

        .item-action-btn.delete:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .item-meta-new {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #94a3b8;
        }

        .item-meta-new span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .item-brand { color: #667eea; font-weight: 500; }

        .stock-alert-new {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #f59e0b;
        }

        .item-price-section {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .item-price-new {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .current-price-new {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
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
          border-radius: 20px;
        }

        .quantity-control-new {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          padding: 2px;
          background: #f8fafc;
        }

        .quantity-control-new button {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }

        .quantity-control-new button:hover:not(:disabled) {
          background: #e63946;
          color: white;
        }

        .quantity-control-new button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quantity-control-new span {
          min-width: 30px;
          text-align: center;
          font-weight: 600;
          font-size: 15px;
        }

        .item-total-new {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-left: auto;
        }

        .total-label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .total-amount-new {
          font-size: 18px;
          font-weight: 700;
          color: #e63946;
        }

        /* Saved Items */
        .saved-items-new {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .saved-header-new {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .saved-header-new h4 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .move-all-new {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .move-all-new:hover {
          color: #764ba2;
        }

        .saved-grid-new {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .saved-item-new {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .saved-item-new img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 8px;
        }

        .saved-item-info-new {
          flex: 1;
        }

        .saved-item-info-new span {
          display: block;
          font-size: 13px;
          color: #0f172a;
          line-height: 1.2;
        }

        .saved-item-info-new strong {
          font-size: 13px;
          color: #e63946;
        }

        .saved-move-btn {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: #eff6ff;
          color: #3b82f6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .saved-move-btn:hover {
          background: #3b82f6;
          color: white;
        }

        /* Order Summary */
        .order-summary-new {
          position: sticky;
          top: 100px;
        }

        .summary-card-new {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .summary-card-new h3 {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          color: #475569;
        }

        .summary-row.discount-new {
          color: #10b981;
        }

        .summary-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 16px 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .total-price-new {
          color: #e63946;
        }

        /* Shipping Progress */
        .shipping-progress-new {
          background: #fef3c7;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .progress-text {
          font-size: 13px;
          color: #92400e;
          margin-bottom: 8px;
        }

        .progress-bar-new {
          height: 4px;
          background: #fde68a;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        /* Coupon */
        .coupon-section-new {
          margin: 20px 0;
        }

        .coupon-input-new {
          display: flex;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .coupon-input-new:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .coupon-input-new.invalid {
          border-color: #ef4444;
        }

        .coupon-input-new input {
          flex: 1;
          padding: 12px 16px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
        }

        .coupon-input-new input:disabled {
          opacity: 0.6;
        }

        .coupon-apply {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .coupon-apply:hover {
          background: #e63946;
        }

        .coupon-remove {
          background: none;
          border: none;
          padding: 0 16px;
          color: #ef4444;
          cursor: pointer;
        }

        .coupon-error-new {
          font-size: 13px;
          color: #ef4444;
          margin-top: 8px;
        }

        .coupon-success-new {
          font-size: 13px;
          color: #10b981;
          margin-top: 8px;
        }

        /* Checkout Button */
        .checkout-btn-new {
          width: 100%;
          background: #0f172a;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s;
          margin-top: 4px;
        }

        .checkout-btn-new:hover {
          background: #e63946;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(230, 57, 70, 0.2);
        }

        /* Security Badges */
        .security-badges-new {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .security-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #94a3b8;
        }

        .security-item svg {
          color: #10b981;
        }

        /* Delivery Estimate */
        .delivery-estimate {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
          padding: 12px 0;
          border-top: 1px solid #f1f5f9;
        }

        .delivery-estimate strong {
          color: #0f172a;
        }

        /* Continue Shopping */
        .continue-shopping-new {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          font-size: 14px;
          color: #64748b;
          text-decoration: none;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s;
          margin-top: 8px;
        }

        .continue-shopping-new:hover {
          color: #e63946;
          background: #fef2f2;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .cart-grid-new {
            grid-template-columns: 1fr;
          }
          .order-summary-new {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .cart-container-new {
            padding: 16px;
          }
          .cart-header-new {
            padding: 16px 20px;
          }
          .cart-header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .cart-progress {
            width: 100%;
            justify-content: space-between;
          }
          .progress-line {
            flex: 1;
            width: auto;
          }
          .step-label {
            display: none;
          }
          .cart-item-new {
            flex-direction: column;
            padding: 16px;
          }
          .cart-item-select {
            display: none;
          }
          .cart-item-image-new {
            width: 100%;
            height: 180px;
          }
          .item-price-section {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .item-total-new {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-left: 0;
          }
          .saved-grid-new {
            grid-template-columns: 1fr;
          }
          .summary-card-new {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .cart-container-new {
            padding: 12px;
          }
          .cart-title-section h1 {
            font-size: 20px;
          }
          .cart-item-count {
            font-size: 12px;
          }
          .item-header-new h3 {
            font-size: 14px;
          }
          .current-price-new {
            font-size: 16px;
          }
          .security-badges-new {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  )
}

export default Cart