import { Link } from "react-router-dom";
import "../styles/success.css";

const Cancel = () => {
  return (
    <div className="cancel-container">
      <div className="cancel-message">
        <i className="fas fa-times-circle cancel-icon"></i>
        <h1>Payment Cancelled</h1>
        <p>Your payment was not completed. You can try again.</p>
        <Link to="/cart" className="primary-btn">Back to Cart</Link>
      </div>
    </div>
  );
};

export default Cancel;