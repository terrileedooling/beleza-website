import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/checkout.css";

const Checkout = () => {
  const { 
    finalTotal, 
    DELIVERY_FEE, 
    checkoutPayFast, 
    checkoutEFT,
    checkoutPayJustNow,
    checkoutPayFlex,
    getAvailablePaymentMethods 
  } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("payfast");
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

  // Get available payment methods (PayJustNow and PayFlex will be hidden until enabled)
  const availablePaymentMethods = getAvailablePaymentMethods();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
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

  const handlePayment = async () => {
    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      switch (selectedPaymentMethod) {
        case "payfast":
          await checkoutPayFast(form);
          break;
        case "eft":
          await checkoutEFT(form);
          break;
        case "payjustnow":
          await checkoutPayJustNow(form);
          break;
        case "payflex":
          await checkoutPayFlex(form);
          break;
        default:
          await checkoutPayFast(form);
      }
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

  // Get the selected payment method name for the button
  const getSelectedMethodName = () => {
    const method = availablePaymentMethods.find(m => m.id === selectedPaymentMethod);
    return method ? method.name : "Selected Method";
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

        {/* RIGHT - Order Summary & Payment */}
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

          {/* Payment Methods Selection */}
          <div className="payment-methods-section">
            <h4>Select Payment Method</h4>
            <div className="payment-options">
              {availablePaymentMethods.map(method => (
                <label 
                  key={method.id} 
                  className={`payment-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <i className={method.icon}></i>
                  <span>{method.name}</span>
                </label>
              ))}
            </div>
            
            {/* EFT Information */}
            {selectedPaymentMethod === 'eft' && (
              <div className="payment-info eft-info">
                <i className="fas fa-info-circle"></i>
                <div>
                  <strong>How EFT payments work:</strong>
                  <ul>
                    <li>You'll receive the bank details via WhatsApp</li>
                    <li>Make a transfer using the provided reference number</li>
                    <li>Email proof of payment to orders@beleza.co.za</li>
                    <li>Your order will be processed once payment is confirmed</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* PayJustNow Coming Soon (hidden until enabled in CartContext) */}
            {selectedPaymentMethod === 'payjustnow' && (
              <div className="payment-info coming-soon">
                <i className="fas fa-clock"></i>
                <p>PayJustNow is coming soon! You'll be able to pay in 3 interest-free installments.</p>
              </div>
            )}
            
            {/* PayFlex Coming Soon (hidden until enabled in CartContext) */}
            {selectedPaymentMethod === 'payflex' && (
              <div className="payment-info coming-soon">
                <i className="fas fa-clock"></i>
                <p>PayFlex is coming soon! Split your payment into 4 interest-free installments.</p>
              </div>
            )}
          </div>
          
          <button 
            className={`checkout-btn ${isProcessing ? 'loading' : ''}`}
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <><i className="fas fa-spinner fa-spin"></i> Processing...</>
            ) : (
              <>
                <i className="fas fa-lock"></i>
                Pay with {getSelectedMethodName()}
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