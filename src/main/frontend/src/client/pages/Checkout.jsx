// src/client/pages/Checkout.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Checkout = () => {
  const navigate = useNavigate()
  const [cartItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'))
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Order placed successfully! (Demo)')
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))
    navigate('/')
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <i className="fas fa-shopping-cart" style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '20px' }}></i>
        <h2>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <h1 style={{ marginBottom: '30px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
            <h3>Shipping Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <input type="text" placeholder="First Name" className="form-control" required onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <input type="text" placeholder="Last Name" className="form-control" required onChange={e => setFormData({...formData, lastName: e.target.value})} />
              <input type="email" placeholder="Email" className="form-control" required onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="tel" placeholder="Phone" className="form-control" required onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input type="text" placeholder="Address" className="form-control" required style={{ gridColumn: 'span 2' }} onChange={e => setFormData({...formData, address: e.target.value})} />
              <input type="text" placeholder="City" className="form-control" required onChange={e => setFormData({...formData, city: e.target.value})} />
              <input type="text" placeholder="Postal Code" className="form-control" required onChange={e => setFormData({...formData, postalCode: e.target.value})} />
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '16px' }}>
            <h3>Payment Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <input type="text" placeholder="Card Number" className="form-control" required style={{ gridColumn: 'span 2' }} onChange={e => setFormData({...formData, cardNumber: e.target.value})} />
              <input type="text" placeholder="MM/YY" className="form-control" required onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              <input type="text" placeholder="CVV" className="form-control" required onChange={e => setFormData({...formData, cvv: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '24px' }}>
            Place Order (${total.toFixed(2)})
          </button>
        </form>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', height: 'fit-content' }}>
          <h3>Order Summary</h3>
          <div style={{ marginTop: '20px' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <hr style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout