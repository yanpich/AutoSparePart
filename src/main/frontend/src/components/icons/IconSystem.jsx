// src/client/components/icons/IconSystem.jsx
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as FaSolid from '@fortawesome/free-solid-svg-icons'
import * as FaRegular from '@fortawesome/free-regular-svg-icons'
import * as FaBrands from '@fortawesome/free-brands-svg-icons'
import {
  FiHome, FiHeart, FiShoppingCart, FiUser, FiSearch, FiMenu, FiX,
  FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown,
  FiStar, FiTruck, FiShield, FiClock, FiMapPin, FiMail, FiPhone,
  FiCalendar, FiTag, FiEye, FiTrash2, FiPlus, FiMinus,
  FiCheck, FiXCircle, FiInfo, FiAlertCircle, FiCheckCircle,
  FiSettings, FiLogOut, FiArrowRight, FiArrowLeft, FiArrowUp
} from 'react-icons/fi'
import {
  AiFillHeart, AiOutlineHeart, AiFillStar, AiOutlineStar,
  AiFillShop, AiOutlineShop, AiFillCar, AiOutlineCar,
  AiFillThunderbolt, AiOutlineThunderbolt
} from 'react-icons/ai'
import {
  BsCartFill, BsCartPlus, BsCartCheck, BsFillBagFill,
  BsWhatsapp, BsFacebook, BsInstagram, BsTwitter, BsYoutube, BsLinkedin,
  BsFillHeartFill, BsHeart, BsFillStarFill, BsStar, BsStarHalf,
  BsTruck, BsShieldCheck, BsShieldFill, BsClockFill, BsCalendarFill,
  BsGeoAltFill, BsEnvelopeFill, BsTelephoneFill, BsTagFill
} from 'react-icons/bs'
import {
  IoLogoWhatsapp, IoLogoFacebook, IoLogoInstagram, IoLogoTwitter, IoLogoYoutube, IoLogoLinkedin,
  IoCartOutline, IoCartSharp, IoHeartOutline, IoHeartSharp, IoPersonOutline, IoPersonSharp,
  IoSearchOutline, IoSearchSharp, IoMenuOutline, IoCloseSharp,
  IoChevronBackOutline, IoChevronForwardOutline, IoChevronUpOutline, IoChevronDownOutline,
  IoStarOutline, IoStarSharp, IoStarHalfSharp,
  IoSpeedometerOutline, IoSettingsOutline, IoLogOutOutline,
  IoCheckmarkCircleOutline, IoWarningOutline, IoInformationCircleOutline,
  IoArrowForwardOutline, IoArrowBackOutline, IoArrowUpOutline
} from 'react-icons/io5'

// Icon Component with unified API
export const Icon = ({ name, size = 20, color, className, onClick, solid = false }) => {
  const iconMap = {
    // Navigation
    home: solid ? <FaSolid.faHome size={size} color={color} /> : <FiHome size={size} color={color} />,
    heart: solid ? <BsFillHeartFill size={size} color={color} /> : <BsHeart size={size} color={color} />,
    cart: solid ? <BsCartFill size={size} color={color} /> : <FiShoppingCart size={size} color={color} />,
    user: solid ? <IoPersonSharp size={size} color={color} /> : <FiUser size={size} color={color} />,
    search: solid ? <IoSearchSharp size={size} color={color} /> : <FiSearch size={size} color={color} />,
    menu: solid ? <IoMenuOutline size={size} color={color} /> : <FiMenu size={size} color={color} />,
    close: <FiX size={size} color={color} />,

    // Chevrons
    chevronLeft: <FiChevronLeft size={size} color={color} />,
    chevronRight: <FiChevronRight size={size} color={color} />,
    chevronUp: <FiChevronUp size={size} color={color} />,
    chevronDown: <FiChevronDown size={size} color={color} />,

    // Arrows
    arrowLeft: <FiArrowLeft size={size} color={color} />,
    arrowRight: <FiArrowRight size={size} color={color} />,
    arrowUp: <FiArrowUp size={size} color={color} />,

    // Star ratings
    star: solid ? <BsFillStarFill size={size} color={color} /> : <FiStar size={size} color={color} />,
    starHalf: <BsStarHalf size={size} color={color} />,

    // Actions
    trash: <FiTrash2 size={size} color={color} />,
    plus: <FiPlus size={size} color={color} />,
    minus: <FiMinus size={size} color={color} />,
    check: <FiCheck size={size} color={color} />,
    xCircle: <FiXCircle size={size} color={color} />,
    checkCircle: <FiCheckCircle size={size} color={color} />,

    // Status
    info: <FiInfo size={size} color={color} />,
    alert: <FiAlertCircle size={size} color={color} />,
    warning: <IoWarningOutline size={size} color={color} />,

    // Social Media
    whatsapp: <BsWhatsapp size={size} color={color} />,
    facebook: <BsFacebook size={size} color={color} />,
    instagram: <BsInstagram size={size} color={color} />,
    twitter: <BsTwitter size={size} color={color} />,
    youtube: <BsYoutube size={size} color={color} />,
    linkedin: <BsLinkedin size={size} color={color} />,

    // E-commerce
    shop: solid ? <AiFillShop size={size} color={color} /> : <AiOutlineShop size={size} color={color} />,
    bag: <BsFillBagFill size={size} color={color} />,
    cartPlus: <BsCartPlus size={size} color={color} />,
    cartCheck: <BsCartCheck size={size} color={color} />,

    // Delivery & Support
    truck: <FiTruck size={size} color={color} />,
    shield: solid ? <BsShieldFill size={size} color={color} /> : <FiShield size={size} color={color} />,
    clock: <FiClock size={size} color={color} />,

    // Contact
    mapPin: <BsGeoAltFill size={size} color={color} />,
    mail: <BsEnvelopeFill size={size} color={color} />,
    phone: <BsTelephoneFill size={size} color={color} />,
    calendar: <FiCalendar size={size} color={color} />,
    tag: solid ? <BsTagFill size={size} color={color} /> : <FiTag size={size} color={color} />,
    eye: <FiEye size={size} color={color} />,

    // Settings & Account
    settings: <FiSettings size={size} color={color} />,
    logout: <FiLogOut size={size} color={color} />,
    dashboard: <IoSpeedometerOutline size={size} color={color} />,

    // Auto Parts Specific
    car: solid ? <AiFillCar size={size} color={color} /> : <AiOutlineCar size={size} color={color} />,
    thunder: solid ? <AiFillThunderbolt size={size} color={color} /> : <AiOutlineThunderbolt size={size} color={color} />,
  }

  return (
    <span className={className} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {iconMap[name] || iconMap.home}
    </span>
  )
}

// Enhanced Heart Icon (Favorite)
export const HeartIcon = ({ active, size = 20, color, onClick, className }) => {
  if (active) {
    return <BsFillHeartFill size={size} color={color || '#e63946'} onClick={onClick} className={className} />
  }
  return <BsHeart size={size} color={color || '#64748b'} onClick={onClick} className={className} />
}

// Star Rating Component
export const StarRating = ({ rating, size = 16, onRatingChange, interactive = false }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<BsFillStarFill key={i} size={size} color="#ffc107" onClick={() => onRatingChange?.(i)} style={{ cursor: interactive ? 'pointer' : 'default' }} />)
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<BsStarHalf key={i} size={size} color="#ffc107" onClick={() => onRatingChange?.(i)} style={{ cursor: interactive ? 'pointer' : 'default' }} />)
    } else {
      stars.push(<BsStar key={i} size={size} color="#cbd5e1" onClick={() => onRatingChange?.(i)} style={{ cursor: interactive ? 'pointer' : 'default' }} />)
    }
  }

  return <div className="star-rating">{stars}</div>
}

// Social Icon Component
export const SocialIcon = ({ platform, size = 20, color, onClick, url }) => {
  const platforms = {
    whatsapp: { icon: <BsWhatsapp size={size} color={color || '#25D366'} />, color: '#25D366' },
    facebook: { icon: <BsFacebook size={size} color={color || '#1877f2'} />, color: '#1877f2' },
    instagram: { icon: <BsInstagram size={size} color={color || '#e4405f'} />, color: '#e4405f' },
    twitter: { icon: <BsTwitter size={size} color={color || '#1da1f2'} />, color: '#1da1f2' },
    youtube: { icon: <BsYoutube size={size} color={color || '#ff0000'} />, color: '#ff0000' },
    linkedin: { icon: <BsLinkedin size={size} color={color || '#0077b5'} />, color: '#0077b5' },
  }

  const social = platforms[platform]
  if (!social) return null

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="social-icon-link" style={{ color: social.color }}>
        {social.icon}
      </a>
    )
  }

  return <span onClick={onClick} className="social-icon" style={{ color: social.color }}>{social.icon}</span>
}

// Payment Method Icon
export const PaymentIcon = ({ method, size = 24 }) => {
  const methods = {
    visa: <FaBrands.faCcVisa size={size} />,
    mastercard: <FaBrands.faCcMastercard size={size} />,
    amex: <FaBrands.faCcAmex size={size} />,
    paypal: <FaBrands.faCcPaypal size={size} />,
    discover: <FaBrands.faCcDiscover size={size} />,
    applePay: <FaBrands.faCcApplePay size={size} />,
    googlePay: <FaBrands.faGooglePay size={size} />,
  }

  return methods[method] || <FaSolid.faCreditCard size={size} />
}