import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/eft-instructions.css";

const EFTInstructions = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const copyReference = async () => {
    const reference = `BELEZA-${order.id.slice(0, 8)}`;
    try {
      await navigator.clipboard.writeText(reference);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      setCopySuccess("Failed to copy");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  if (loading) {
    return (
      <div className="eft-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="eft-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h1>Order Not Found</h1>
        <p>We couldn't find your order. Please check your order ID or contact support.</p>
        <Link to="/" className="home-link">Return to Home</Link>
      </div>
    );
  }

  const referenceNumber = `BELEZA-${order.id.slice(0, 8)}`;

  return (
    <div className="eft-instructions-container">
      <div className="eft-success-header">
        <i className="fas fa-check-circle"></i>
        <h1>Order Received!</h1>
        <p>Order #{order.id.slice(0, 8)}</p>
        <div className="header-badges">
          <span className="badge pending">Pending Payment</span>
        </div>
      </div>

      <div className="eft-content">
        <div className="bank-details-card">
          <h2><i className="fas fa-university"></i> Bank Transfer Details</h2>
          <div className="bank-details">
            <div className="detail-row">
              <span className="label">Bank:</span>
              <span className="value">First National Bank (FNB)</span>
            </div>
            <div className="detail-row">
              <span className="label">Account Name:</span>
              <span className="value">Beleza Professional Pty Ltd</span>
            </div>
            <div className="detail-row">
              <span className="label">Account Number:</span>
              <span className="value">628 789 456 12</span>
            </div>
            <div className="detail-row">
              <span className="label">Branch Code:</span>
              <span className="value">250655</span>
            </div>
            <div className="detail-row reference-row">
              <span className="label">Reference:</span>
              <span className="value reference">{referenceNumber}</span>
              <button 
                className="copy-btn"
                onClick={copyReference}
              >
                <i className="fas fa-copy"></i>
                {copySuccess && <span className="copy-feedback">{copySuccess}</span>}
              </button>
            </div>
          </div>
          <div className="payment-amount">
            <span>Amount to Pay:</span>
            <strong>R{order.finalTotal?.toFixed(2)}</strong>
          </div>
        </div>

        <div className="instructions-card">
          <h3><i className="fas fa-info-circle"></i> How to Complete Your Payment</h3>
          <ol>
            <li>Log into your online banking or visit your nearest branch</li>
            <li>Use the bank details above to make a transfer</li>
            <li>Enter the reference number exactly as shown</li>
            <li>Pay the exact amount of <strong>R{order.finalTotal?.toFixed(2)}</strong></li>
            <li>Send your proof of payment via <strong>WhatsApp to +27 72 114 3123</strong></li>
            <li>Your order will be processed within 24 hours of payment confirmation</li>
          </ol>
        </div>

        <div className="order-summary-card">
          <h3><i className="fas fa-shopping-cart"></i> Order Summary</h3>
          <div className="order-items">
            {order.items?.map((item, idx) => (
              <div key={idx} className="order-item">
                <span>{item.name} x {item.quantity}</span>
                <span>R{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>R{order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Delivery Fee:</span>
              <span>R{order.deliveryFee?.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total Amount:</span>
              <span>R{order.finalTotal?.toFixed(2)}</span>
            </div>
          </div>

          {order.address && (
            <div className="delivery-card">
              <h3><i className="fas fa-truck"></i> Delivery Address</h3>
              <p>
                {order.address}<br/>
                {order.suburb && `${order.suburb}, `}{order.city && `${order.city}`}<br/>
                {order.postal && `Postal Code: ${order.postal}`}
              </p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <Link to="/" className="continue-shopping">
            <i className="fas fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EFTInstructions;