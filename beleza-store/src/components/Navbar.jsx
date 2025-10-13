import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/beleza-logo.png";
import "../styles/global.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="BELEZA PROFESSIONAL PTY LTD" className="logo-image" />
      </Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div className="nav-icons">
        <i className="fas fa-search"></i>
        <i className="fas fa-shopping-bag"></i>
        <i className="fas fa-user"></i>
      </div>
    </nav>
  );
}