// src/client/components/CountdownTimerCompact.jsx
import React, { useState, useEffect } from 'react'

const CountdownTimerCompact = ({ targetDate, onComplete, showIcon = true }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (onComplete) onComplete()
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  const getCompactString = () => {
    const parts = []
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`)
    if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}h`)
    if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes}m`)
    if (timeLeft.seconds > 0 && parts.length === 0) parts.push(`${timeLeft.seconds}s`)
    return parts.join(' ') || '0s'
  }

  const getFullString = () => {
    const parts = []
    if (timeLeft.days > 0) parts.push(`${timeLeft.days} day${timeLeft.days > 1 ? 's' : ''}`)
    if (timeLeft.hours > 0) parts.push(`${timeLeft.hours} hour${timeLeft.hours > 1 ? 's' : ''}`)
    if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes} minute${timeLeft.minutes > 1 ? 's' : ''}`)
    if (timeLeft.seconds > 0 && parts.length === 0) parts.push(`${timeLeft.seconds} seconds`)
    return parts.join(', ') || '0 seconds'
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24 && timeLeft.hours > 0
  const isVeryUrgent = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 60

  return (
    <div className={`countdown-compact ${isVeryUrgent ? 'urgent' : isUrgent ? 'warning' : ''}`}>
      {showIcon && <i className="fas fa-hourglass-half"></i>}
      <span className="compact-time">{getCompactString()}</span>
      <span className="full-time">{getFullString()}</span>

      <style jsx>{`
        .countdown-compact {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #e63946;
          background: rgba(230, 57, 70, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .countdown-compact.warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          animation: pulse 1s infinite;
        }

        .countdown-compact.urgent {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          animation: pulse 0.5s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .countdown-compact i {
          font-size: 0.8rem;
        }

        .full-time {
          display: none;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          white-space: nowrap;
          margin-bottom: 5px;
          z-index: 10;
        }

        .countdown-compact:hover .full-time {
          display: block;
        }

        @media (max-width: 768px) {
          .countdown-compact {
            font-size: 0.75rem;
            padding: 3px 8px;
          }
        }
      `}</style>
    </div>
  )
}

export default CountdownTimerCompact