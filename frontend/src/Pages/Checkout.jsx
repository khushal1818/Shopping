import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { useAuth } from '../Context/AuthContext';
import './CSS/Checkout.css';

const Checkout = () => {
  const { getTotalCartAmount, all_product, cartItems } = useContext(ShopContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card'
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderPlaced(true);
  };

  const totalAmount = getTotalCartAmount();

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-container order-success-card">
          <div className="success-icon">✓</div>
          <h2>Order Confirmed!</h2>
          <p>Thank you for shopping with Vistora, <strong>{shippingInfo.fullName}</strong>.</p>
          <p className="order-details-text">We sent a confirmation receipt to <strong>{shippingInfo.email}</strong>.</p>
          <button className="checkout-back-btn" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Secure Checkout</h1>
        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3>Shipping Details</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={shippingInfo.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={shippingInfo.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                required
                value={shippingInfo.address}
                onChange={handleChange}
                placeholder="123 Fashion Blvd, Apt 4"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingInfo.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={shippingInfo.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </div>
            </div>

            <button type="submit" className="place-order-btn">
              Place Order (${totalAmount})
            </button>
          </form>

          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {all_product.map((item) => {
                if (cartItems[item.id] > 0) {
                  return (
                    <div key={item.id} className="summary-item">
                      <div className="summary-item-info">
                        <img src={item.image} alt={item.name} />
                        <div>
                          <p className="summary-name">{item.name}</p>
                          <p className="summary-qty">Qty: {cartItems[item.id]}</p>
                        </div>
                      </div>
                      <p className="summary-price">${item.new_price * cartItems[item.id]}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <hr />
            <div className="summary-total-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="summary-total-row total-highlight">
              <span>Total Amount</span>
              <span>${totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
