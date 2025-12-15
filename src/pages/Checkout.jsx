import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/checkout.css";

const Checkout = () => {
  const { finalTotal, DELIVERY_FEE, checkoutPayFast } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate individual field on blur
    validateField(name, form[name]);
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) error = "Full name is required";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        const phoneDigits = value.replace(/\D/g, '');
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (phoneDigits.length !== 10) {
          error = "Please enter a valid 10-digit phone number";
        }
        break;
      case "address":
        if (!value.trim()) error = "Street address is required";
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["name", "email", "phone", "address"];
    
    requiredFields.forEach(field => {
      if (!form[field]?.trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    // Specific validations
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (form.phone) {
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        newErrors.phone = "Please enter a valid 10-digit phone number";
      }
    }
    
    setErrors(newErrors);
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await checkoutPayFast(form);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getFieldClassName = (name) => {
    if (!touched[name]) return "";
    return errors[name] ? "invalid" : form[name] ? "valid" : "";
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        {/* LEFT - Delivery Details */}
        <div className="checkout-form">
          <h3>Delivery Details</h3>
          
          <div className="field-group">
            <label htmlFor="name">Full Name <span className="required">*</span></label>
            <input 
              id="name"
              name="name" 
              placeholder="Enter your full name" 
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName("name")}
              required 
            />
            {errors.name && <div className="error-text"><i className="fas fa-exclamation-circle"></i> {errors.name}</div>}
          </div>
          
          <div className="field-group">
            <label htmlFor="email">Email Address <span className="required">*</span></label>
            <input 
              id="email"
              type="email"
              name="email" 
              placeholder="your@email.com" 
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName("email")}
              required 
            />
            {errors.email && <div className="error-text"><i className="fas fa-exclamation-circle"></i> {errors.email}</div>}
          </div>
          
          <div className="field-group">
            <label htmlFor="phone">Phone Number <span className="required">*</span></label>
            <input 
              id="phone"
              type="tel"
              name="phone" 
              placeholder="083 123 4567" 
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName("phone")}
              required 
            />
            {errors.phone && <div className="error-text"><i className="fas fa-exclamation-circle"></i> {errors.phone}</div>}
          </div>
          
          <div className="field-group">
            <label htmlFor="address">Street Address <span className="required">*</span></label>
            <textarea 
              id="address"
              name="address" 
              placeholder="123 Main Street, Complex Name, Unit Number" 
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName("address")}
              required 
            />
            {errors.address && <div className="error-text"><i className="fas fa-exclamation-circle"></i> {errors.address}</div>}
          </div>
          
          <div className="field-group">
            <label htmlFor="suburb">Suburb</label>
            <input 
              id="suburb"
              name="suburb" 
              placeholder="e.g., Sandton, Claremont" 
              value={form.suburb}
              onChange={handleChange}
            />
          </div>
          
          <div className="field-group">
            <label htmlFor="city">City</label>
            <input 
              id="city"
              name="city" 
              placeholder="e.g., Johannesburg, Cape Town" 
              value={form.city}
              onChange={handleChange}
            />
          </div>
          
          <div className="field-group">
            <label htmlFor="postal">Postal Code</label>
            <input 
              id="postal"
              name="postal" 
              placeholder="e.g., 2196, 7700" 
              value={form.postal}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* RIGHT - Order Summary */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-details">
            <p>
              <span>Subtotal:</span>
              <span>R{(finalTotal - DELIVERY_FEE).toFixed(2)}</span>
            </p>
            <p>
              <span>Delivery Fee:</span>
              <span>R{DELIVERY_FEE.toFixed(2)}</span>
            </p>
            <h2>
              <span>Total Amount:</span>
              <span>R{finalTotal.toFixed(2)}</span>
            </h2>
          </div>
          
          <button 
            className={`checkout-btn ${isProcessing ? 'loading' : ''}`}
            onClick={handlePay}
            disabled={isProcessing}
          >
            {isProcessing ? '' : (
              <>
                <i className="fas fa-lock"></i>
                Pay Securely with PayFast
              </>
            )}
          </button>
          
          <div className="payment-notice">
            <i className="fas fa-shield-alt"></i>
            Your payment is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;