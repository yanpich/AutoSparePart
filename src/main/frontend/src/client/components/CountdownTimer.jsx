// src/client/components/CountdownTimer.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CountdownTimer = ({
  targetDate,
  onComplete,
  size = 'default',
  showLabels = true,
  showSeconds = true,
  showDays = true,
  title = '',
  subtitle = '',
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isExpired, setIsExpired] = useState(false)

  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate) - new Date()

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
      if (isExpired) setIsExpired(false)
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      if (!isExpired) {
        setIsExpired(true)
        if (onComplete) onComplete()
      }
    }
  }, [targetDate, onComplete, isExpired])

  useEffect(() => {
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  const formatNumber = (num) => String(num).padStart(2, '0')

  const sizeStyles = {
    small: {
      numberSize: '28px',
      labelSize: '10px',
      gap: '8px',
      padding: '8px 12px',
      minWidth: '60px',
      borderRadius: '12px'
    },
    default: {
      numberSize: '40px',
      labelSize: '12px',
      gap: '12px',
      padding: '12px 16px',
      minWidth: '80px',
      borderRadius: '16px'
    },
    large: {
      numberSize: '56px',
      labelSize: '14px',
      gap: '16px',
      padding: '16px 20px',
      minWidth: '100px',
      borderRadius: '20px'
    }
  }

  const styles = sizeStyles[size] || sizeStyles.default

  const timeUnits = []
  if (showDays && (timeLeft.days > 0 || size !== 'small')) {
    timeUnits.push({ value: timeLeft.days, label: 'Days', key: 'days' })
  }
  timeUnits.push({ value: timeLeft.hours, label: 'Hours', key: 'hours' })
  timeUnits.push({ value: timeLeft.minutes, label: 'Minutes', key: 'minutes' })
  if (showSeconds) {
    timeUnits.push({ value: timeLeft.seconds, label: 'Seconds', key: 'seconds' })
  }

  return (
    <div className={`countdown-modern ${className}`}>
      {(title || subtitle) && (
        <div className="countdown-header-modern">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}

      <div className={`countdown-container-glass ${isExpired ? 'expired' : ''}`}>
        <div className="countdown-grid" style={{ gap: styles.gap }}>
          {timeUnits.map((unit, idx) => (
            <motion.div
              key={unit.key}
              className="countdown-card-glass"
              style={{
                minWidth: styles.minWidth,
                padding: styles.padding,
                borderRadius: styles.borderRadius
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="countdown-number-glass" style={{ fontSize: styles.numberSize }}>
                {formatNumber(unit.value)}
              </div>
              {showLabels && (
                <div className="countdown-label-glass" style={{ fontSize: styles.labelSize }}>
                  {unit.label}
                </div>
              )}
              <div className="card-glow"></div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isExpired && (
            <motion.div
              className="expired-badge-glass"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <i className="fas fa-clock"></i>
              <span>Offer Expired</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .countdown-modern {
          display: inline-block;
          width: 100%;
        }

        .countdown-header-modern {
          text-align: center;
          margin-bottom: 20px;
        }

        .countdown-header-modern h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 5px;
          color: white;
        }

        .countdown-header-modern p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Glassmorphism Container */
        .countdown-container-glass {
          position: relative;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border-radius: 32px;
          padding: 24px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .countdown-container-glass.expired {
          opacity: 0.6;
        }

        .countdown-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        /* Glass Card */
        .countdown-card-glass {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .countdown-card-glass::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .countdown-card-glass:hover::before {
          opacity: 1;
        }

        .card-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #e63946, transparent);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .countdown-card-glass:hover .card-glow {
          transform: scaleX(1);
        }

        .countdown-number-glass {
          font-weight: 800;
          font-family: 'Inter', monospace;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease;
          letter-spacing: 2px;
        }

        .countdown-card-glass:hover .countdown-number-glass {
          transform: scale(1.05);
        }

        .countdown-label-glass {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.7);
        }

        .expired-badge-glass {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          border-radius: 30px;
          color: #e63946;
          font-size: 0.9rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .countdown-container-glass {
            padding: 15px;
          }
          .countdown-grid {
            gap: 10px !important;
          }
          .countdown-card-glass {
            padding: 8px 12px !important;
            min-width: 65px !important;
          }
          .countdown-number-glass {
            font-size: 22px !important;
          }
          .countdown-label-glass {
            font-size: 9px !important;
          }
        }

        @media (max-width: 480px) {
          .countdown-grid {
            gap: 6px !important;
          }
          .countdown-card-glass {
            padding: 6px 8px !important;
            min-width: 55px !important;
          }
          .countdown-number-glass {
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default CountdownTimer