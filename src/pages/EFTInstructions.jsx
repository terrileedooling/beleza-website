import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/eft-instructions.css";

const EFTInstructions = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          setOrder(orderData);
          
          // Auto-send WhatsApp message when order loads (optional)
          // Uncomment if you want automatic sending
          // setTimeout(() => sendToWhatsApp(orderData), 1000);
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

  const generateWhatsAppMessage = (orderData) => {
    const orderRef = `BELEZA-${orderData.id.slice(0, 8)}`;
    const amount = `R${orderData.finalTotal?.toFixed(2)}`;
    const customerName = orderData.name || "Valued Customer";
    
    return `*BELEZA PROFESSIONAL - EFT PAYMENT INSTRUCTIONS* 🏦

Hi ${customerName},

Thank you for shopping with Beleza Professional!

*ORDER DETAILS*
━━━━━━━━━━━━━━━━━━━
Order #: ${orderData.id.slice(0, 8)}
Amount Due: ${amount}
Status: Pending Payment

*BANK TRANSFER DETAILS*
━━━━━━━━━━━━━━━━━━━
Bank: First National Bank (FNB)
Account Name: Beleza Professional Pty Ltd
Account Number: 628 789 456 12
Branch Code: 250655
Reference: ${orderRef}

*HOW TO COMPLETE YOUR PAYMENT*
━━━━━━━━━━━━━━━━━━━
1️⃣ Log into your online banking or visit your nearest branch
2️⃣ Use the bank details above to make a transfer
3️⃣ Enter the reference number EXACTLY as shown
4️⃣ Pay the exact amount of ${amount}
5️⃣ Send your proof of payment via WhatsApp to +27 72 114 3123
6️⃣ Your order will be processed within 24 hours of payment confirmation

*ORDER SUMMARY*
━━━━━━━━━━━━━━━━━━━
${orderData.items?.map(item => `📦 ${item.name} x ${item.quantity} = R${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Subtotal: R${orderData.subtotal?.toFixed(2)}
Delivery: R${orderData.deliveryFee?.toFixed(2)}
Total: ${amount}

*DELIVERY ADDRESS*
━━━━━━━━━━━━━━━━━━━
${orderData.address || "Not provided"}
${orderData.suburb ? orderData.suburb + ", " : ""}${orderData.city || ""}
${orderData.postal ? orderData.postal : ""}

*NEED HELP?*
━━━━━━━━━━━━━━━━━━━
📞 Call/WhatsApp: +27 72 114 3123
📧 Email: orders@beleza.co.za

Thank you for choosing Beleza Professional! 💫`;
  };

  const sendToWhatsApp = () => {
    if (!order) return;
    
    const phoneNumber = order.phone?.replace(/\D/g, '');
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert("Please ensure your phone number is correct in the order details");
      return;
    }
    
    const message = generateWhatsAppMessage(order);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setWhatsappSent(true);
    
    // Reset the sent status after 3 seconds
    setTimeout(() => setWhatsappSent(false), 3000);
  };

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

  const copyBankDetails = () => {
    const bankDetails = `Bank: First National Bank (FNB)
Account Name: Beleza Professional Pty Ltd
Account Number: 628 789 456 12
Branch Code: 250655
Reference: BELEZA-${order.id.slice(0, 8)}
Amount: R${order.finalTotal?.toFixed(2)}`;
    
    navigator.clipboard.writeText(bankDetails);
    alert("Bank details copied to clipboard!");
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
          {/* <button className="copy-all-btn" onClick={copyBankDetails}>
            <i className="fas fa-copy"></i> Copy All Details
          </button> */}
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

        {/* <div className="contact-support">
          <i className="fas fa-headset"></i>
          <div className="support-content">
            <p>Need help with your payment?</p>
            <div className="support-links">
              <a href="https://wa.me/27721143123" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i> WhatsApp Support
              </a>
              <a href="mailto:orders@beleza.co.za">
                <i className="fas fa-envelope"></i> Email Support
              </a>
            </div>
          </div>
        </div> */}

        <div className="action-buttons">
          <Link to="/" className="continue-shopping">
            <i className="fas fa-arrow-left"></i> Continue Shopping
          </Link>
          {/* <button onClick={sendToWhatsApp} className="resend-whatsapp">
            <i className="fab fa-whatsapp"></i> Resend Instructions
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default EFTInstructions;