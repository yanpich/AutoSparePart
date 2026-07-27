// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'  // Change to BrowserRouter
import { HelmetProvider } from 'react-helmet-async'

// Admin Layout & Pages
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import Users from './pages/Auth/Users'
import Brands from './pages/brand/Brands'
import Categories from './pages/category/Categories'
import Vehicles from './pages/Vehicles'
import Products from './pages/Products'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

// Client Layout & Pages
import ClientLayout from './client/layouts/ClientLayout'
import Home from './client/pages/Home'
import Shop from './client/pages/Shop'
import ProductDetail from './client/pages/ProductDetail'
import Contact from './client/pages/Contact'
import About from './client/pages/About'
import Cart from './client/pages/Cart'
import Checkout from './client/pages/Checkout'
import Wishlist from './client/pages/Wishlist'

const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return !!token && token !== 'undefined' && token !== 'null'
}

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Client Public Routes */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App