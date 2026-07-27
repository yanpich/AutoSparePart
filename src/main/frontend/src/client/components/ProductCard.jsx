// src/client/components/ProductCard.jsx - WITH REAL PRODUCT IMAGES
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

const ProductCard = ({
  product,
  onAddToCart,
  onQuickView,
  onWishlist,
  onCompare,
  layout = 'grid',
  showActions = true,
  showRating = true,
  showDescription = true,
  showBrand = true,
  badgePosition = 'top-left',
  cardClassName = '',
  animated = true
}) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [imagesLoaded, setImagesLoaded] = useState([])
  const imageContainerRef = useRef(null)

  const {
    id,
    name,
    description,
    price,
    oldPrice,
    rating,
    reviewCount,
    image,
    images = [],
    brand,
    category,
    inStock = true,
    discount,
    isNew,
    badge,
    sku,
    weight,
    dimensions,
    warranty,
    compatibility,
    colors = []
  } = product

  // Combine main image with additional images - use real product images
  const defaultImages = [
    'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1556707904-87bb6c297a70?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1629904853716-d0bc5b4e91d7?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1577998474511-ee2d9b7f2d0a?w=400&h=400&fit=crop&crop=center'
  ]

  const allImages = [image, ...images].filter(Boolean)
  const finalImages = allImages.length > 0 ? allImages : defaultImages
  const hasMultipleImages = finalImages.length > 1

  const discountPercentage = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : discount || 0
  const isOnSale = discountPercentage > 0
  const ratingStars = Math.round(rating || 0)

  // Auto-rotate images when hovering
  useEffect(() => {
    let interval
    if (isHovered && hasMultipleImages && !isImageZoomed) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % finalImages.length)
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isHovered, hasMultipleImages, finalImages.length, isImageZoomed])

  // Track image loading
  useEffect(() => {
    finalImages.forEach((img, index) => {
      const imgElement = new Image()
      imgElement.src = img
      imgElement.onload = () => {
        setImagesLoaded(prev => [...prev, index])
      }
    })
  }, [finalImages])

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current || !isImageZoomed) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  const handleClick = () => {
    navigate(`/product/${id}`)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!inStock || isAdding) return

    setIsAdding(true)
    if (onAddToCart) {
      onAddToCart({ ...product, quantity })
    }

    setTimeout(() => {
      setIsAdding(false)
    }, 1500)
  }

  const handleWishlist = (e) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    if (onWishlist) {
      onWishlist(product)
    }
  }

  const handleQuickView = (e) => {
    e.stopPropagation()
    setIsQuickViewOpen(true)
    if (onQuickView) {
      onQuickView(product)
    }
  }

  const handleCompare = (e) => {
    e.stopPropagation()
    if (onCompare) {
      onCompare(product)
    }
  }

  const handleImageClick = (e) => {
    e.stopPropagation()
    setIsImageZoomed(!isImageZoomed)
  }

  const handleThumbnailClick = (e, index) => {
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  const getBadgePositionClass = () => {
    const positions = {
      'top-left': 'badges-top-left',
      'top-right': 'badges-top-right',
      'bottom-left': 'badges-bottom-left',
      'bottom-right': 'badges-bottom-right'
    }
    return positions[badgePosition] || 'badges-top-left'
  }

  const getLayoutClass = () => {
    switch(layout) {
      case 'list': return 'product-card-list'
      case 'compact': return 'product-card-compact'
      default: return 'product-card-grid'
    }
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    hover: { y: -8, transition: { duration: 0.3 } }
  }

  const quickViewVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }

  // Get current image with fallback
  const currentImage = finalImages[currentImageIndex] || defaultImages[0]

  return (
    <>
      <motion.div
        className={`product-card-modern ${getLayoutClass()} ${cardClassName}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setIsImageZoomed(false)
        }}
        onMouseMove={handleMouseMove}
        variants={animated ? cardVariants : {}}
        initial={animated ? 'initial' : false}
        animate={animated ? 'animate' : false}
        whileHover={animated ? 'hover' : {}}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
      >
        {/* Image Section */}
        <div className="product-image-wrapper" ref={imageContainerRef}>
          <div className="product-image-container">
            {/* Image Placeholder */}
            {!imageLoaded && (
              <div className="image-placeholder shimmer">
                <i className="fa-solid fa-image"></i>
              </div>
            )}

            {/* Main Image */}
            <motion.img
              src={currentImage}
              alt={`${name} - Image ${currentImageIndex + 1}`}
              className={`product-image ${imageLoaded ? 'loaded' : ''} ${isImageZoomed ? 'zoomed' : ''}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              onClick={handleImageClick}
              style={isImageZoomed ? {
                transform: `scale(2) translate(${-mousePosition.x / 2}%, ${-mousePosition.y / 2}%)`,
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
              } : {}}
            />

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="image-counter">
                <span>{currentImageIndex + 1} / {finalImages.length}</span>
              </div>
            )}

            {/* Thumbnail Navigation */}
            {hasMultipleImages && isHovered && !isImageZoomed && (
              <div className="image-thumbnails">
                {finalImages.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => handleThumbnailClick(e, index)}
                    onMouseEnter={() => setCurrentImageIndex(index)}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Badges */}
            <div className={`product-badges ${getBadgePositionClass()}`}>
              {isOnSale && (
                <span className="badge badge-sale">
                  <i className="fa-solid fa-tag"></i>
                  -{discountPercentage}%
                </span>
              )}
              {isNew && (
                <span className="badge badge-new">
                  <i className="fa-regular fa-star"></i>
                  New
                </span>
              )}
              {badge && badge !== 'best' && (
                <span className="badge badge-custom">
                  {badge}
                </span>
              )}
              {badge === 'best' && (
                <span className="badge badge-best">
                  <i className="fa-solid fa-trophy"></i>
                  Best Seller
                </span>
              )}
              {!inStock && (
                <span className="badge badge-out">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Color Options */}
            {colors.length > 0 && isHovered && (
              <div className="color-options">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    className="color-btn"
                    style={{ background: color }}
                    title={`Color ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Hover Actions */}
            {showActions && inStock && (
              <div className={`product-actions ${isHovered ? 'visible' : ''}`}>
                <motion.button
                  className="action-btn action-quickview"
                  onClick={handleQuickView}
                  title="Quick View"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fa-regular fa-eye"></i>
                </motion.button>
                <motion.button
                  className={`action-btn action-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlist}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className={`fa-${isWishlisted ? 'solid' : 'regular'} fa-heart`}></i>
                </motion.button>
                <motion.button
                  className="action-btn action-compare"
                  onClick={handleCompare}
                  title="Compare"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fa-regular fa-copy"></i>
                </motion.button>
              </div>
            )}

            {/* Quick Add Button */}
            {inStock && (
              <motion.button
                className={`quick-add-btn ${isHovered ? 'visible' : ''}`}
                onClick={handleAddToCart}
                disabled={isAdding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                transition={{ duration: 0.3 }}
              >
                {isAdding ? (
                  <span className="spinner-small"></span>
                ) : (
                  <>
                    <i className="fa-solid fa-cart-plus"></i>
                    <span>Quick Add</span>
                  </>
                )}
              </motion.button>
            )}

            {/* Quick View Overlay */}
            <AnimatePresence>
              {isQuickViewOpen && (
                <motion.div
                  className="quick-view-overlay"
                  variants={quickViewVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="quick-view-close"
                    onClick={() => setIsQuickViewOpen(false)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                  <div className="quick-view-content">
                    <img src={currentImage} alt={name} />
                    <div className="quick-view-info">
                      <h4>{name}</h4>
                      {brand && <span className="quick-view-brand">{brand}</span>}
                      <div className="quick-view-price">
                        {oldPrice && <span className="old-price">${oldPrice.toFixed(2)}</span>}
                        <span className="current-price">${price.toFixed(2)}</span>
                      </div>
                      {description && <p>{description.substring(0, 120)}...</p>}
                      <div className="quick-view-actions">
                        <div className="quantity-selector">
                          <button onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}>-</button>
                          <span>{quantity}</span>
                          <button onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}>+</button>
                        </div>
                        <button
                          className="quick-view-cart-btn"
                          onClick={handleAddToCart}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <span className="spinner-small"></span>
                          ) : (
                            <>
                              <i className="fa-solid fa-cart-plus"></i>
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        className="quick-view-details-btn"
                        onClick={() => navigate(`/product/${id}`)}
                      >
                        View Full Details <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Brand & SKU */}
          <div className="product-meta">
            {showBrand && brand && (
              <span className="product-brand">{brand}</span>
            )}
            {sku && (
              <span className="product-sku">SKU: {sku}</span>
            )}
            {category && (
              <span className="product-category">{category.name}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="product-title" title={name}>
            {name}
          </h3>

          {/* Description */}
          {showDescription && description && (
            <p className="product-description">
              {description.length > 80 ? description.substring(0, 80) + '...' : description}
            </p>
          )}

          {/* Compatibility */}
          {compatibility && (
            <div className="product-compatibility">
              <i className="fa-solid fa-car"></i>
              <span>{compatibility}</span>
            </div>
          )}

          {/* Rating */}
          {showRating && (
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fa-solid fa-star ${i < ratingStars ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <span className="review-count">({reviewCount || 0})</span>
              {rating && rating > 4.5 && (
                <span className="rating-badge">
                  <i className="fa-solid fa-circle-check"></i>
                  Top Rated
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="product-price">
            {oldPrice && (
              <span className="old-price">${oldPrice.toFixed(2)}</span>
            )}
            <span className={`current-price ${oldPrice ? 'has-discount' : ''}`}>
              ${price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="savings-badge">
                Save ${(oldPrice - price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="product-stock-info">
            {inStock ? (
              <span className="stock in-stock">
                <i className="fa-solid fa-circle-check"></i>
                In Stock
              </span>
            ) : (
              <span className="stock out-of-stock">
                <i className="fa-solid fa-circle-exclamation"></i>
                Out of Stock
              </span>
            )}
            {warranty && (
              <span className="warranty-info">
                <i className="fa-solid fa-shield-haltered"></i>
                {warranty}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            className={`add-to-cart-btn ${!inStock ? 'disabled' : ''} ${isAdding ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            whileHover={inStock && !isAdding ? { scale: 1.02 } : {}}
            whileTap={inStock && !isAdding ? { scale: 0.98 } : {}}
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
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </motion.button>

          {/* Quick Info Tooltip */}
          {isHovered && inStock && (
            <motion.div
              className="quick-info-tooltip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {weight && (
                <span><i className="fa-solid fa-weight-scale"></i> {weight}</span>
              )}
              {dimensions && (
                <span><i className="fa-solid fa-arrows-up-down"></i> {dimensions}</span>
              )}
              <span><i className="fa-regular fa-clock"></i> Fast Shipping</span>
            </motion.div>
          )}
        </div>

        {/* Added to Cart Animation */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              className="added-to-cart-overlay"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="added-to-cart-content">
                <i className="fa-solid fa-circle-check"></i>
                <span>Added to Cart!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

export default ProductCard