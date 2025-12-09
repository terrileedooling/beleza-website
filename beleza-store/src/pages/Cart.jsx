import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import "../styles/cart.css";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, DELIVERY_FEE } = useCart();

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = (id) => {
    if (window.confirm("Remove this item from your cart?")) {
      removeFromCart(id);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-shopping-cart"></i>
        <h3>Your Cart is Empty</h3>
        <p>Looks like you haven't added any products to your cart yet.</p>
        <Link to="/products" className="primary-btn">
          <i className="fas fa-shopping-bag"></i>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="section-title">Your Shopping Cart</h2>

      {/* Optional Promo Banner */}
      {cart.length >= 2 && (
        <div className="cart-promo">
          <i className="fas fa-gift"></i>
          <span>Free delivery on orders over R500!</span>
        </div>
      )}

      <div className="cart-layout">
        {/* LEFT - Cart Items */}
        <div className="cart-items">
          {cart.map((item) => (
            <div key={`${item.id}-${item.quantity}`} className="cart-item-row">
              <img className="cart-thumb" src={item.image} alt={item.name} />

              <div className="cart-details">
                <h3>{item.name}</h3>
                <p className="cart-price">R{item.price.toFixed(2)} each</p>

                <div className="cart-actions">
                  <div className="quantity-box">
                    <button 
                      onClick={() => handleQuantityChange(item, -1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item, 1)}
                      disabled={item.quantity >= 10}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-link"
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-line-total">
                R{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT - Order Summary */}
        <div className="cart-summary-card">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
            <span>R{cartTotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>
              {cartTotal >= 500 ? (
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                  FREE
                </span>
              ) : (
                `R${DELIVERY_FEE.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>
              R{(cartTotal + (cartTotal >= 500 ? 0 : DELIVERY_FEE)).toFixed(2)}
            </span>
          </div>

          <Link to="/checkout" className="checkout-btn">
            <i className="fas fa-lock"></i>
            Proceed to Secure Checkout
          </Link>

          <Link to="/products" className="continue-link">
            Continue shopping
          </Link>

          <div className="payment-notice" style={{ marginTop: '20px', fontSize: '0.9rem' }}>
            <i className="fas fa-shield-alt"></i>
            Secure payment · Free returns · Customer support
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;