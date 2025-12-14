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
      
      // Get ALL URL parameters
      const searchParams = new URLSearchParams(window.location.search);
      const allParams = {};
      searchParams.forEach((value, key) => {
        allParams[key] = value;
      });
      
      // Try different possible parameter names for order ID
      let orderId = searchParams.get("m_payment_id") || 
                    searchParams.get("order_id") ||
                    searchParams.get("custom_str1") ||
                    localStorage.getItem('lastOrderId');
      
      // Try different possible parameter names for transaction ID
      let transactionId = searchParams.get("pf_payment_id") || 
                         searchParams.get("transaction_id") ||
                         searchParams.get("txn_id");
      
      // If no orderId found, show error
      if (!orderId) {
        console.error("No order ID found in URL or localStorage");
        setLoading(false);
        return;
      }

      try {
        // Reference the order document in Firestore
        const orderRef = doc(db, "orders", orderId);
        
        // Get the current order data
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists()) {
          setLoading(false);
          return;
        }
        
        const order = { id: orderSnap.id, ...orderSnap.data() };
        setOrderData(order);
        
        // If we have a transaction ID, update the order
        if (transactionId) {
          if (order.status !== "paid") {
            await updateDoc(orderRef, {
              status: "paid",
              payfastTransactionId: transactionId,
              paidAt: new Date(),
            });
          }
        } else {
          // If no transaction ID, still mark as paid if not already
          if (order.status !== "paid") {
            await updateDoc(orderRef, {
              status: "paid",
              paidAt: new Date(),
            });
          }
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
          <i className="fas fa-spinner"></i>
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
          <h1>Payment Successful</h1>
          <p>
            Your order <strong>{orderData.id}</strong> has been confirmed.
          </p>
          {orderData.payfastTransactionId && (
            <p>Transaction ID: <strong>{orderData.payfastTransactionId}</strong></p>
          )}
          <button className="primary-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="success-message">
          <i className="fas fa-exclamation-circle danger-icon"></i>
          <h1>Payment could not be confirmed</h1>
          <p>No order ID was received. Please contact support.</p>
          <button className="primary-btn" onClick={handleContinueShopping}>
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default Success;