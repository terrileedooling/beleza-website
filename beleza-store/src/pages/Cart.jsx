import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import "../styles/cart.css";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, checkoutPayFast } =
    useCart();

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    updateQuantity(item.id, newQuantity);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <Link to="/products" className="primary-btn">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="section-title">Your Cart</h2>

      <div className="cart-layout">
        {/* LEFT - ITEMS */}
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-row">
              <img className="cart-thumb" src={item.image} alt={item.name} />

              <div className="cart-details">
                <h3>{item.name}</h3>
                <p className="cart-price">R{item.price.toFixed(2)}</p>

                <div className="cart-actions">
                  <div className="quantity-box">
                    <button onClick={() => handleQuantityChange(item, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, 1)}>
                      +
                    </button>
                  </div>

                  <button
                    className="remove-link"
                    onClick={() => removeFromCart(item.id)}
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

        {/* RIGHT - SUMMARY */}
        <div className="cart-summary-card">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>R{cartTotal.toFixed(2)}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>R{cartTotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>

          <Link to="/products" className="continue-link">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
