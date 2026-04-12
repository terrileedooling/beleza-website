import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/eft-instructions.css";

const EFTInstructions = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() });
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
        <h1>Order Not Found</h1>
        <Link to="/" className="home-link">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="eft-instructions-container">
      <div className="eft-success-header">
        <i className="fas fa-check-circle"></i>
        <h1>Order Received!</h1>
        <p>Order #{order.id.slice(0, 8)}</p>
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
            <div className="detail-row">
              <span className="label">Reference:</span>
              <span className="value reference">BELEZA-{order.id.slice(0, 8)}</span>
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(`BELEZA-${order.id.slice(0, 8)}`);
                  alert("Reference copied!");
                }}
              >
                <i className="fas fa-copy"></i>
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
            <li>Email your proof of payment to <strong>orders@beleza.co.za</strong></li>
            <li>Your order will be processed within 24 hours of payment confirmation</li>
          </ol>
        </div>

        <div className="order-summary-card">
          <h3><i className="fas fa-shopping-cart"></i> Order Summary</h3>
          {order.items?.map((item, idx) => (
            <div key={idx} className="order-item">
              <span>{item.name} x {item.quantity}</span>
              <span>R{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-totals">
            <div>Subtotal:</div>
            <div>R{order.subtotal?.toFixed(2)}</div>
            <div>Delivery:</div>
            <div>R{order.deliveryFee?.toFixed(2)}</div>
            <div className="total">Total:</div>
            <div className="total">R{order.finalTotal?.toFixed(2)}</div>
          </div>
        </div>

        <div className="contact-support">
          <i className="fas fa-headset"></i>
          <p>Need help? Contact us on WhatsApp: <a href="https://wa.me/27721143123">+27 72 114 3123</a></p>
        </div>

        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default EFTInstructions;