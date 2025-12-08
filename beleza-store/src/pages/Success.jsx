import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/success.css";

const Success = () => {
  const { cart, cartTotal, DELIVERY_FEE, finalTotal, clearCart } = useCart();

  useEffect(() => {
    const saveOrder = async () => {
      if (cart.length === 0) return;

      await addDoc(collection(db, "orders"), {
        items: cart,
        subtotal: cartTotal,
        deliveryFee: DELIVERY_FEE,
        finalTotal: finalTotal,
        status: "paid",
        createdAt: serverTimestamp(),
      });

      clearCart();
    };

    saveOrder();
  }, []);

  return (
    <div className="checkout-success">
      <h1>Payment Successful!</h1>
      <p>Your order has been saved. Thank you for your purchase!</p>
      <Link to="/products">Continue Shopping</Link>
    </div>
  );
};

export default Success;
