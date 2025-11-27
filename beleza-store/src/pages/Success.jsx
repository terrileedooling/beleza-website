import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import "../styles/success.css";

const Success = () => {
  const { clearCart } = useCart();

  // Clear the cart after successful payment
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="checkout-success">
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your order is confirmed.</p>
      <Link to="/products">Continue Shopping</Link>
    </div>
  );
};

export default Success;
