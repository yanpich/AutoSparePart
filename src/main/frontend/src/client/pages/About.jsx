// src/client/pages/About.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const About = () => {
  const navigate = useNavigate()
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [animatedStats, setAnimatedStats] = useState({
    years: 0,
    products: 0,
    brands: 0,
    customers: 0
  })

  const statsRef = useRef(null)
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })
  const timelineRef = useRef(null)
  const isTimelineInView = useInView(timelineRef, { once: true })

  // Animate stats when in view
  useEffect(() => {
    if (isStatsInView) {
      const targets = { years: 32, products: 5000, brands: 120, customers: 50000 }
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const progress = Math.min(1, currentStep / steps)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)

        setAnimatedStats({
          years: Math.floor(targets.years * easeOutCubic),
          products: Math.floor(targets.products * easeOutCubic),
          brands: Math.floor(targets.brands * easeOutCubic),
          customers: Math.floor(targets.customers * easeOutCubic)
        })

        if (currentStep >= steps) clearInterval(interval)
      }, stepDuration)
    }
  }, [isStatsInView])

  const stats = [
    { value: animatedStats.years, label: 'Years of Excellence', icon: 'fas fa-calendar-alt', suffix: '+' },
    { value: animatedStats.products, label: 'Products Available', icon: 'fas fa-boxes', suffix: '+' },
    { value: animatedStats.brands, label: 'Trusted Brands', icon: 'fas fa-building', suffix: '+' },
    { value: animatedStats.customers, label: 'Happy Customers', icon: 'fas fa-smile', suffix: '+' }
  ]

  const teamMembers = [
    { name: 'John Smith', role: 'CEO & Founder', bio: '30+ years in auto parts industry', avatar: 'JS', social: { linkedin: '#', twitter: '#' } },
    { name: 'Sarah Johnson', role: 'Operations Manager', bio: 'Expert in supply chain management', avatar: 'SJ', social: { linkedin: '#', twitter: '#' } },
    { name: 'Mike Chen', role: 'Technical Director', bio: 'Automotive engineering specialist', avatar: 'MC', social: { linkedin: '#', twitter: '#' } },
    { name: 'Lisa Wong', role: 'Customer Support Lead', bio: 'Dedicated to customer satisfaction', avatar: 'LW', social: { linkedin: '#', twitter: '#' } }
  ]

  const values = [
    { icon: 'fas fa-gem', title: 'Quality First', description: 'We source only the highest quality OEM and aftermarket parts', color: '#e63946' },
    { icon: 'fas fa-handshake', title: 'Trust & Integrity', description: 'Building lasting relationships with honesty and transparency', color: '#10b981' },
    { icon: 'fas fa-rocket', title: 'Innovation', description: 'Constantly evolving to meet modern automotive needs', color: '#3b82f6' },
    { icon: 'fas fa-users', title: 'Customer Focus', description: 'Your satisfaction is our top priority', color: '#f59e0b' }
  ]

  const timelineEvents = [
    { year: '1992', title: 'Founded', description: 'AutoHive started as a small family-owned auto parts store' },
    { year: '2000', title: 'Expansion', description: 'Opened second location and expanded inventory' },
    { year: '2010', title: 'Digital Transformation', description: 'Launched online store and e-commerce platform' },
    { year: '2020', title: 'Industry Leader', description: 'Became Cambodia\'s leading auto parts supplier' },
    { year: '2024', title: 'Innovation Hub', description: 'Launched AI-powered parts matching system' }
  ]

  const testimonials = [
    { name: 'David Chen', role: 'Professional Mechanic', text: 'AutoHive has been my go-to supplier for years. Their parts are reliable and delivery is always on time.', rating: 5, avatar: 'DC', verified: true },
    { name: 'Sophia Rodriguez', role: 'Car Enthusiast', text: 'Great selection of parts and excellent customer service. They helped me find the perfect brake pads for my BMW.', rating: 5, avatar: 'SR', verified: true },
    { name: 'James Wilson', role: 'Auto Shop Owner', text: 'Competitive prices and quality products. Highly recommended for any auto repair business.', rating: 5, avatar: 'JW', verified: true },
    { name: 'Emily Brown', role: 'Fleet Manager', text: 'Outstanding service and fast shipping. Our entire fleet relies on AutoHive for maintenance parts.', rating: 5, avatar: 'EB', verified: true }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

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
    <div className="about-page-modern">
      {/* Hero Section with Parallax */}
      <div className="about-hero-modern">
        <div className="hero-background"></div>
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--delay': `${i * 0.5}s`,
              '--duration': `${3 + Math.random() * 4}s`,
              '--left': `${Math.random() * 100}%`,
              '--top': `${Math.random() * 100}%`
            }} />
          ))}
        </div>
        <div className="container">
          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">
              <i className="fas fa-crown"></i>
              <span>Since 1992</span>
            </div>
            <h1>
              <span className="gradient-text">About</span> AutoHive
            </h1>
            <p className="hero-tagline">Premium Auto Parts | Excellence Since 1992</p>
            <div className="hero-line"></div>
            <p className="hero-description">
              We are dedicated to providing the highest quality auto parts with exceptional customer service.
              With over three decades of experience, we've become a trusted name in the automotive industry.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">32+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">100+</span>
                <span className="stat-label">Expert Team</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section with Counter Animation */}
      <div className="about-stats-modern" ref={statsRef}>
        <div className="container">
          <motion.div
            className="stats-grid-modern"
            variants={containerVariants}
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} className="stat-card-modern" variants={itemVariants}>
                <div className="stat-icon-modern">
                  <i className={stat.icon}></i>
                  <div className="stat-glow"></div>
                </div>
                <h3 className="stat-number-modern">{stat.value.toLocaleString()}{stat.suffix}</h3>
                <p className="stat-label-modern">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="about-timeline-modern" ref={timelineRef}>
        <div className="container">
          <div className="section-header-modern">
            <div className="header-badge">
              <i className="fas fa-history"></i>
              <span>Our Journey</span>
            </div>
            <h2>Company <span className="gradient-text">Timeline</span></h2>
            <p>Over three decades of excellence in auto parts industry</p>
          </div>
          <div className="timeline-container">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isTimelineInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="timeline-dot">
                  <div className="dot-inner"></div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-year">{event.year}</div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </motion.div>
            ))}
            <div className="timeline-line"></div>
          </div>
        </div>
      </div>

      {/* Values Section with 3D Cards */}
      <div className="about-values-modern">
        <div className="container">
          <div className="section-header-modern">
            <div className="header-badge">
              <i className="fas fa-diamond"></i>
              <span>What Drives Us</span>
            </div>
            <h2>Our Core <span className="gradient-text">Values</span></h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid-modern">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card-modern"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="value-icon-modern" style={{ background: `${value.color}15`, color: value.color }}>
                  <i className={value.icon}></i>
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
                <div className="value-progress" style={{ background: value.color }}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us - Feature Grid */}
      <div className="why-choose-modern">
        <div className="container">
          <div className="why-grid-modern">
            <motion.div
              className="why-content-modern"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="section-badge">
                <i className="fas fa-check-circle"></i>
                <span>Why Choose Us</span>
              </div>
              <h2>Why <span className="gradient-text">AutoHive</span> Stands Out</h2>
              <p>We combine quality products, expert knowledge, and exceptional service to deliver the best auto parts experience.</p>
              <div className="features-grid-modern">
                {[
                  { icon: 'fas fa-check-circle', title: 'OEM Quality Parts', description: 'All our parts meet or exceed OEM specifications' },
                  { icon: 'fas fa-truck-fast', title: 'Fast & Reliable Shipping', description: 'Free shipping on orders over $100' },
                  { icon: 'fas fa-headset', title: 'Expert Support Team', description: 'Knowledgeable staff ready to help' },
                  { icon: 'fas fa-undo-alt', title: '30-Day Returns', description: 'Hassle-free returns policy' },
                  { icon: 'fas fa-shield-alt', title: 'Secure Payment', description: '100% secure transactions' },
                  { icon: 'fas fa-award', title: 'Best Price Guarantee', description: 'We match competitor prices' }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="feature-card-mini"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <div className="feature-icon-mini">
                      <i className={feature.icon}></i>
                    </div>
                    <div>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="why-image-modern"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="image-wrapper">
                <div className="image-glow"></div>
                <i className="fas fa-certificate"></i>
                <div className="floating-badge badge-1">
                  <i className="fas fa-star"></i>
                  <span>Quality Certified</span>
                </div>
                <div className="floating-badge badge-2">
                  <i className="fas fa-truck"></i>
                  <span>Fast Delivery</span>
                </div>
                <div className="floating-badge badge-3">
                  <i className="fas fa-headset"></i>
                  <span>24/7 Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Team Section - Glassmorphism Cards */}
      <div className="about-team-modern">
        <div className="container">
          <div className="section-header-modern">
            <div className="header-badge">
              <i className="fas fa-users"></i>
              <span>Leadership</span>
            </div>
            <h2>Meet Our <span className="gradient-text">Team</span></h2>
            <p>Dedicated professionals passionate about auto parts</p>
          </div>
          <div className="team-grid-modern">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="team-card-modern"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <div className="team-avatar-modern">
                  {member.avatar}
                </div>
                <h4>{member.name}</h4>
                <p className="team-role-modern">{member.role}</p>
                <p className="team-bio-modern">{member.bio}</p>
                <div className="team-social">
                  <a href={member.social.linkedin}><i className="fab fa-linkedin-in"></i></a>
                  <a href={member.social.twitter}><i className="fab fa-twitter"></i></a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section - Carousel */}
      <div className="about-testimonials-modern">
        <div className="container">
          <div className="section-header-modern">
            <div className="header-badge">
              <i className="fas fa-comments"></i>
              <span>Testimonials</span>
            </div>
            <h2>What Our <span className="gradient-text">Customers Say</span></h2>
            <p>Trusted by thousands of satisfied customers worldwide</p>
          </div>

          <div className="testimonials-carousel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="testimonial-card-modern"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="testimonial-quote-modern">
                  <i className="fas fa-quote-left"></i>
                </div>
                <p className="testimonial-text-modern">{testimonials[activeTestimonial].text}</p>
                <div className="testimonial-rating-modern">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < testimonials[activeTestimonial].rating ? 'filled' : ''}`}></i>
                  ))}
                </div>
                <div className="testimonial-author-modern">
                  <div className="author-avatar-modern">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <strong>{testimonials[activeTestimonial].name}</strong>
                    <span>{testimonials[activeTestimonial].role}</span>
                    {testimonials[activeTestimonial].verified && (
                      <span className="verified-badge-modern">
                        <i className="fas fa-check-circle"></i> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${activeTestimonial === index ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta-modern">
        <div className="container">
          <motion.div
            className="cta-content-modern"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="cta-icon">
              <i className="fas fa-car"></i>
              <div className="cta-pulse"></div>
            </div>
            <h2>Ready to Find Your <span className="gradient-text">Auto Parts</span>?</h2>
            <p>Browse our extensive collection of premium auto parts</p>
            <div className="cta-buttons-modern">
              <button className="btn-primary-modern" onClick={() => navigate('/shop')}>
                Shop Now <i className="fas fa-arrow-right"></i>
              </button>
              <button className="btn-outline-modern" onClick={() => navigate('/contact')}>
                Contact Us <i className="fas fa-envelope"></i>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .about-page-modern {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          overflow-x: hidden;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Hero Section */
        .about-hero-modern {
          position: relative;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 120px 0;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle at 20% 80%, rgba(230, 57, 70, 0.1) 0%, transparent 50%);
        }

        .hero-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          left: var(--left);
          top: var(--top);
          animation: float var(--duration) ease-in infinite;
          animation-delay: var(--delay);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
        }

        .about-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
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
          margin-bottom: 30px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #e63946, #fbbf24);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .about-hero-content h1 {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .hero-tagline {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .hero-line {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #e63946, #fbbf24);
          margin: 20px auto;
          border-radius: 3px;
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.7;
          opacity: 0.85;
          margin-bottom: 40px;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 50px;
          flex-wrap: wrap;
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #e63946;
        }

        .hero-stat .stat-label {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        /* Stats Section */
        .about-stats-modern {
          padding: 80px 0;
          background: white;
        }

        .stats-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        .stat-card-modern {
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 24px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .stat-card-modern:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1);
        }

        .stat-icon-modern {
          position: relative;
          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
        }

        .stat-icon-modern i {
          font-size: 2.5rem;
          color: #e63946;
          position: relative;
          z-index: 1;
        }

        .stat-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(230, 57, 70, 0.2), transparent);
          transform: translate(-50%, -50%);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }

        .stat-number-modern {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #1e293b, #334155);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .stat-label-modern {
          color: #64748b;
          font-weight: 500;
        }

        /* Timeline Section */
        .about-timeline-modern {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8fafc, white);
        }

        .section-header-modern {
          text-align: center;
          margin-bottom: 60px;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(230, 57, 70, 0.1);
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #e63946;
          margin-bottom: 20px;
        }

        .section-header-modern h2 {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .section-header-modern p {
          color: #64748b;
        }

        .timeline-container {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: linear-gradient(180deg, #e63946, #fbbf24);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 50px;
          width: calc(50% - 30px);
        }

        .timeline-item.left {
          left: 0;
        }

        .timeline-item.right {
          left: 50%;
          margin-left: 30px;
        }

        .timeline-dot {
          position: absolute;
          right: -45px;
          top: 0;
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #e63946;
          border-radius: 50%;
          z-index: 2;
        }

        .timeline-item.right .timeline-dot {
          left: -45px;
        }

        .dot-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: #e63946;
          border-radius: 50%;
        }

        .timeline-content {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .timeline-year {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .timeline-content h3 {
          margin-bottom: 8px;
        }

        .timeline-content p {
          color: #64748b;
          font-size: 0.9rem;
        }

        /* Values Section */
        .about-values-modern {
          padding: 80px 0;
          background: white;
        }

        .values-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        .value-card-modern {
          text-align: center;
          padding: 35px 25px;
          background: #f8fafc;
          border-radius: 24px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .value-icon-modern {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .value-icon-modern i {
          font-size: 2rem;
        }

        .value-card-modern h3 {
          margin-bottom: 12px;
        }

        .value-card-modern p {
          color: #64748b;
          line-height: 1.6;
        }

        .value-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 3px;
          transition: width 0.4s ease;
        }

        .value-card-modern:hover .value-progress {
          width: 100%;
        }

        /* Why Choose Us */
        .why-choose-modern {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8fafc, white);
        }

        .why-grid-modern {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }

        .why-content-modern .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(230, 57, 70, 0.1);
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #e63946;
          margin-bottom: 20px;
        }

        .why-content-modern h2 {
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .why-content-modern p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .features-grid-modern {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .feature-card-mini {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 16px;
          transition: all 0.3s;
        }

        .feature-card-mini:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .feature-icon-mini i {
          font-size: 1.2rem;
          color: #e63946;
        }

        .feature-card-mini h4 {
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .feature-card-mini p {
          font-size: 0.75rem;
          margin: 0;
        }

        .why-image-modern {
          position: relative;
        }

        .image-wrapper {
          position: relative;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 30px;
          padding: 60px;
          text-align: center;
          overflow: hidden;
        }

        .image-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent);
        }

        .image-wrapper i {
          font-size: 6rem;
          color: white;
          position: relative;
          z-index: 1;
        }

        .floating-badge {
          position: absolute;
          background: white;
          padding: 8px 16px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          animation: float 3s infinite;
        }

        .badge-1 { top: 20px; left: -20px; animation-delay: 0s; }
        .badge-2 { bottom: 20px; right: -20px; animation-delay: 1s; }
        .badge-3 { top: 50%; right: -30px; animation-delay: 2s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Team Section */
        .about-team-modern {
          padding: 80px 0;
          background: white;
        }

        .team-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        .team-card-modern {
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 24px;
          transition: all 0.3s;
        }

        .team-avatar-modern {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 2rem;
          font-weight: bold;
          color: white;
        }

        .team-card-modern h4 {
          margin-bottom: 5px;
        }

        .team-role-modern {
          color: #e63946;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .team-bio-modern {
          color: #64748b;
          font-size: 0.85rem;
          margin-bottom: 15px;
        }

        .team-social {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .team-social a {
          width: 32px;
          height: 32px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.3s;
        }

        .team-social a:hover {
          background: #e63946;
          color: white;
        }

        /* Testimonials Carousel */
        .about-testimonials-modern {
          padding: 80px 0;
          background: #f8fafc;
        }

        .testimonials-carousel {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .testimonial-card-modern {
          background: white;
          padding: 40px;
          border-radius: 30px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
        }

        .testimonial-quote-modern i {
          font-size: 3rem;
          color: #e63946;
          opacity: 0.3;
          margin-bottom: 20px;
        }

        .testimonial-text-modern {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #475569;
          margin-bottom: 20px;
        }

        .testimonial-rating-modern {
          margin-bottom: 20px;
        }

        .testimonial-rating-modern i {
          color: #ffc107;
          font-size: 1rem;
        }

        .testimonial-author-modern {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .author-avatar-modern {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .testimonial-author-modern strong {
          display: block;
          font-size: 1rem;
        }

        .testimonial-author-modern span {
          font-size: 0.8rem;
          color: #64748b;
        }

        .verified-badge-modern {
          display: block;
          font-size: 0.7rem;
          color: #10b981;
          margin-top: 4px;
        }

        .testimonial-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 30px;
        }

        .testimonial-dots .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .testimonial-dots .dot.active {
          width: 24px;
          background: #e63946;
          border-radius: 4px;
        }

        /* CTA Section */
        .about-cta-modern {
          padding: 80px 0;
          background: linear-gradient(135deg, #0f172a, #1e293b);
        }

        .cta-content-modern {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-icon {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
        }

        .cta-icon i {
          font-size: 3rem;
          color: #e63946;
          position: relative;
          z-index: 1;
        }

        .cta-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: rgba(230, 57, 70, 0.2);
          border-radius: 50%;
          animation: pulseRing 2s infinite;
        }

        @keyframes pulseRing {
          0% { width: 100%; height: 100%; opacity: 0.5; }
          100% { width: 200%; height: 200%; opacity: 0; }
        }

        .cta-content-modern h2 {
          font-size: 2rem;
          color: white;
          margin-bottom: 16px;
        }

        .cta-content-modern p {
          color: #94a3b8;
          margin-bottom: 30px;
        }

        .cta-buttons-modern {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .btn-primary-modern {
          background: linear-gradient(135deg, #e63946, #c92c3a);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(230, 57, 70, 0.3);
        }

        .btn-outline-modern {
          background: transparent;
          border: 2px solid #e63946;
          color: #e63946;
          padding: 12px 30px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-outline-modern:hover {
          background: #e63946;
          color: white;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 992px) {
          .container { padding: 0 20px; }
          .stats-grid-modern, .values-grid-modern, .team-grid-modern {
            grid-template-columns: repeat(2, 1fr);
          }
          .why-grid-modern { grid-template-columns: 1fr; }
          .timeline-line { left: 20px; }
          .timeline-item { width: calc(100% - 40px); left: 40px !important; margin-left: 0 !important; }
          .timeline-item.right .timeline-dot { left: -30px; }
          .timeline-item.left .timeline-dot { left: -30px; right: auto; }
          .features-grid-modern { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .stats-grid-modern, .values-grid-modern, .team-grid-modern {
            grid-template-columns: 1fr;
          }
          .about-hero-content h1 { font-size: 2.5rem; }
          .hero-stats { flex-direction: column; gap: 15px; }
          .cta-buttons-modern { flex-direction: column; align-items: center; }
          .floating-badge { display: none; }
          .testimonial-card-modern { padding: 25px; }
        }
      `}</style>
    </div>
  )
}

export default About