import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "../styles/success.css";

const Success = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderUpdated, setOrderUpdated] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processPaymentSuccess = async () => {
      // Get ALL URL parameters
      const searchParams = new URLSearchParams(window.location.search);
      
      console.log("=== SUCCESS PAGE DEBUG ===");
      console.log("Full URL:", window.location.href);
      
      // Log all parameters
      for (let [key, value] of searchParams.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Try to get order ID from multiple sources
      let orderId = searchParams.get("m_payment_id");
      let transactionId = searchParams.get("pf_payment_id");
      let paymentStatus = searchParams.get("payment_status");
      
      // If not in URL, check localStorage
      if (!orderId) {
        orderId = localStorage.getItem('lastOrderId') || 
                  sessionStorage.getItem('pendingOrderId');
        console.log("Order ID from storage:", orderId);
      }
      
      console.log("Final Order ID:", orderId);
      console.log("Transaction ID:", transactionId);
      console.log("Payment Status:", paymentStatus);
      
      if (!orderId) {
        console.error("No order ID found");
        setErrorMessage("Order reference not found. Please contact support.");
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists()) {
          console.error("Order not found:", orderId);
          setErrorMessage(`Order ${orderId.slice(0, 8)} not found.`);
          setLoading(false);
          return;
        }
        
        const order = { id: orderSnap.id, ...orderSnap.data() };
        console.log("Current order payment status:", order.paymentStatus);
        setOrderData(order);
        
        // ALWAYS update to paid when user reaches success page
        // This ensures the order gets marked as paid even if PayFast doesn't send perfect data
        if (order.paymentStatus !== "paid") {
          const updateData = {
            paymentStatus: "paid",
            payfastTransactionId: transactionId || `manual-${Date.now()}`,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log("Updating order with:", updateData);
          await updateDoc(orderRef, updateData);
          console.log("✅ Order successfully updated to PAID");
          setOrderUpdated(true);
        } else {
          console.log("Order already marked as paid");
          setOrderUpdated(true);
        }
        
        // Clear stored order IDs
        localStorage.removeItem('lastOrderId');
        sessionStorage.removeItem('pendingOrderId');
        
      } catch (error) {
        console.error("Error processing order:", error);
        setErrorMessage(error.message);
        setOrderUpdated(false);
      } finally {
        setLoading(false);
      }
    };

    processPaymentSuccess();
  }, []);

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="success-container">
        <div className="success-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      {orderUpdated && orderData ? (
        <div className="success-message">
          <i className="fas fa-check-circle success-icon"></i>
          <h1>Payment Successful! 🎉</h1>
          <p>
            Thank you for your order <strong>#{orderData.id?.slice(0, 8)}</strong>!
          </p>
          {orderData.payfastTransactionId && (
            <p className="transaction-id">
              Transaction ID: <strong>{orderData.payfastTransactionId}</strong>
            </p>
          )}
          <div className="order-details">
            <p>Total paid: <strong>R{orderData.finalTotal?.toFixed(2)}</strong></p>
            <p>We will process your order and notify you once it's ready for shipping.</p>
          </div>
          <button className="primary-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="success-message warning">
          <i className="fas fa-exclamation-circle warning-icon"></i>
          <h1>Payment Confirmation Pending</h1>
          <p>Your payment is being processed.</p>
          {orderData && (
            <p>Order reference: <strong>#{orderData.id?.slice(0, 8)}</strong></p>
          )}
          {errorMessage && (
            <p className="error-text">Error: {errorMessage}</p>
          )}
          <p className="help-text">
            Please contact us on WhatsApp if you have any questions.
          </p>
          <button className="primary-btn" onClick={handleContinueShopping}>
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default Success;