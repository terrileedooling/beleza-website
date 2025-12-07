import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/checkout.css";

const Checkout = () => {
  const { cart, finalTotal, DELIVERY_FEE, checkoutPayFast } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
    city: "",
    postal: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePay = () => {
    // TODO: Save form in Firebase (Phase 2)
    checkoutPayFast();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        
        {/* LEFT */}
        <div className="checkout-form">
          <h3>Delivery Details</h3>

          <input name="name" placeholder="Full Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="phone" placeholder="Phone" onChange={handleChange} />

          <textarea
            name="address"
            placeholder="Street Address"
            onChange={handleChange}
          />

          <input name="suburb" placeholder="Suburb" onChange={handleChange} />
          <input name="city" placeholder="City" onChange={handleChange} />
          <input name="postal" placeholder="Postal Code" onChange={handleChange} />
        </div>

        {/* RIGHT */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>

          <p>Subtotal: R{finalTotal - DELIVERY_FEE}</p>
          <p>Delivery: R{DELIVERY_FEE}</p>

          <h2>Total: R{finalTotal}</h2>

          <button className="checkout-btn" onClick={handlePay}>
            Pay with PayFast
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
