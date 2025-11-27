import { Link } from "react-router-dom";
import "../styles/success.css";

const Cancel = () => (
  <div className="checkout-cancel">
    <h1>Payment Cancelled</h1>
    <p>Your payment was not completed. You can try again.</p>
    <Link to="/cart">Back to Cart</Link>
  </div>
);

export default Cancel;
