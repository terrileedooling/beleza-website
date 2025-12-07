import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/beleza-logo.png";
import "../styles/global.css";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/" className="logo">
          <img src={logo} alt="BELEZA PROFESSIONAL PTY LTD" className="logo-image" />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div className="nav-icons">
        <a
            href="https://wa.me/27721143123"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn-nav"
        >
        <i className="fab fa-whatsapp"></i>
        </a>
        <i className="fas fa-search"></i>
                <Link to="/cart" className="cart-icon">
          <i className="fas fa-shopping-bag"></i>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        <i className="fas fa-user"></i>
      </div>
    </nav>
  );
}