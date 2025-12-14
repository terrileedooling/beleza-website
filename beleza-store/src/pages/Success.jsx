import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import "../styles/success.css";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderUpdated, setOrderUpdated] = useState(false);

  // Retrieve orderId and PayFast info passed from checkout
  const { orderId, payfastTransactionId } = location.state || {};

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (!orderId || !payfastTransactionId) {
        console.error("Missing orderId or PayFast transaction ID");
        setLoading(false);
        return;
      }

      try {
        // Reference the order doc
        const orderRef = doc(db, "orders", orderId);

        // Update Firestore: status and PayFast transaction
        await updateDoc(orderRef, {
          status: "paid",
          payfastTransactionId,
          paidAt: new Date(),
        });

        setOrderUpdated(true);
      } catch (error) {
        console.error("Error updating order:", error);
        alert("Something went wrong while confirming your payment.");
      } finally {
        setLoading(false);
      }
    };

    updateOrderStatus();
  }, [orderId, payfastTransactionId]);

  const handleContinueShopping = () => {
    navigate("/"); // redirect to home or shop page
  };

  if (loading) {
    return (
      <div className="success-loading">
        <i className="fas fa-spinner"></i>
        <p>Confirming your payment...</p>
      </div>
    );
  }

  return (
    <div className="success-container">
      {orderUpdated ? (
        <div className="success-message">
          <i className="fas fa-check-circle success-icon"></i>
          <h1>Payment Successful!</h1>
          <p>
            Your order <strong>{orderId}</strong> has been confirmed.
          </p>
          <p>PayFast Transaction ID: <strong>{payfastTransactionId}</strong></p>
          <button className="primary-btn" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="success-message">
          <i className="fas fa-exclamation-circle danger-icon"></i>
          <h1>Payment could not be confirmed</h1>
          <p>Please contact support with your order details.</p>
        </div>
      )}
    </div>
  );
};

export default Success;
