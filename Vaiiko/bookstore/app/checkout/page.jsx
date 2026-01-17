'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './checkout.css';

const Checkout = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    // Shipping info
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Payment info
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Additional
    shippingMethod: 'standard',
    saveInfo: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/token');
        const data = await res.json();
        if (data.user) {
          setUserId(data.user.user_id);
          
          // Fetch cart
          const cartRes = await fetch(`/api/user/${data.user.user_id}/cart`);
          const cartData = await cartRes.json();
          setCartItems(cartData);
          
          // Pre-fill user info if available
          setFormData(prev => ({
            ...prev,
            fullName: data.user.name || '',
            email: data.user.email || ''
          }));
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.zipCode) {
      alert('Please fill in all required shipping fields');
      return;
    }

    if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
      alert('Please fill in all payment fields');
      return;
    }

    setProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      alert('Order placed successfully! 🎉');
      // Clear cart and redirect
      router.push('/');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">Loading...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <Link href="/browse" className="back-to-shop-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const shippingCost = formData.shippingMethod === 'express' ? 15.99 : (subtotal > 50 ? 0 : 5.99);
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <Link href="/cart" className="back-to-cart">← Back to Cart</Link>
        </div>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Shipping Information */}
            <div className="checkout-section">
              <h2>1. Shipping Information</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>ZIP/Postal Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="USA"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="checkout-section">
              <h2>2. Shipping Method</h2>
              <div className="shipping-options">
                <label className="shipping-option">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={formData.shippingMethod === 'standard'}
                    onChange={handleInputChange}
                  />
                  <div className="shipping-option-details">
                    <span className="shipping-name">Standard Shipping</span>
                    <span className="shipping-time">5-7 business days</span>
                  </div>
                  <span className="shipping-price">
                    {subtotal > 50 ? 'FREE' : '$5.99'}
                  </span>
                </label>

                <label className="shipping-option">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={formData.shippingMethod === 'express'}
                    onChange={handleInputChange}
                  />
                  <div className="shipping-option-details">
                    <span className="shipping-name">Express Shipping</span>
                    <span className="shipping-time">2-3 business days</span>
                  </div>
                  <span className="shipping-price">$15.99</span>
                </label>
              </div>
            </div>

            {/* Payment Information */}
            <div className="checkout-section">
              <h2>3. Payment Information</h2>
              <div className="payment-secure">
                🔒 Your payment information is secure
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="saveInfo"
                  checked={formData.saveInfo}
                  onChange={handleInputChange}
                />
                Save this information for next time
              </label>
            </div>

            <button type="submit" className="place-order-btn" disabled={processing}>
              {processing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>

            <p className="checkout-notice">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.cart_item_id} className="summary-item">
                  <img src={item.book.image || '/placeholder.png'} alt={item.book.name} />
                  <div className="summary-item-details">
                    <p className="summary-item-name">{item.book.name}</p>
                    <p className="summary-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="summary-item-price">
                    ${(item.book.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;