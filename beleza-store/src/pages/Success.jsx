import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import "../styles/success.css";

const Success = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    const updateOrder = async () => {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("custom_str1"); // PayFast sends it as custom_str1

      if (!orderId) {
        console.warn("No orderId found in return URL");
        return;
      }

      try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          status: "paid",
          paidAt: new Date(),
        });

        console.log("Order marked as paid:", orderId);
      } catch (err) {
        console.error("Failed to update order:", err);
      }

      clearCart();
    };

    updateOrder();
  }, []);

  return (
    <div className="checkout-success">
      <h1>Payment Successful!</h1>
      <p>Your order has been updated. Thank you for your purchase!</p>
      <Link to="/products">Continue Shopping</Link>
    </div>
  );
};

export default Success;
