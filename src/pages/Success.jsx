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

  useEffect(() => {
    const processPaymentSuccess = async () => {
      // Get URL parameters
      const searchParams = new URLSearchParams(window.location.search);
      
      // Try different possible parameter names for order ID
      let orderId = searchParams.get("m_payment_id") || 
                    searchParams.get("order_id") ||
                    searchParams.get("custom_str1") ||
                    localStorage.getItem('lastOrderId');
      
      // Try different possible parameter names for transaction ID
      let transactionId = searchParams.get("pf_payment_id") || 
                         searchParams.get("transaction_id") ||
                         searchParams.get("txn_id");
      
      if (!orderId) {
        console.error("No order ID found in URL or localStorage");
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists()) {
          setLoading(false);
          return;
        }
        
        const order = { id: orderSnap.id, ...orderSnap.data() };
        setOrderData(order);
        
        // ONLY update payment status - leave fulfillment status unchanged
        const updateData = {
          paymentStatus: "paid",  // Separate payment status
          payfastTransactionId: transactionId || null,
          paidAt: new Date(),
          updatedAt: new Date()
        };
        
        // Only update if not already marked as paid
        if (order.paymentStatus !== "paid") {
          await updateDoc(orderRef, updateData);
          console.log("Payment status updated to: paid");
        }
        
        // Clear stored order ID
        localStorage.removeItem('lastOrderId');
        sessionStorage.removeItem('pendingOrderId');
        
        setOrderUpdated(true);
        
      } catch (error) {
        console.error("Error processing order:", error);
        alert("Something went wrong while confirming your payment.");
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
          <h1>Payment Successful!</h1>
          <p>
            Your payment for order <strong>{orderData.id.slice(0, 8)}</strong> has been confirmed.
          </p>
          {orderData.payfastTransactionId && (
            <p>Transaction ID: <strong>{orderData.payfastTransactionId}</strong></p>
          )}
          <p>We will process your order and notify you once it's ready for shipping.</p>
          <button className="primary-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="success-message">
          <i className="fas fa-exclamation-circle danger-icon"></i>
          <h1>Payment could not be confirmed</h1>
          <p>Please contact support with your order reference.</p>
          <button className="primary-btn" onClick={handleContinueShopping}>
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default Success;