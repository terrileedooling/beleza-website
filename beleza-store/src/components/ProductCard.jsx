import React from "react";
import { Link } from "react-router-dom";
import "../styles/products.css";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-img-container">
          <img src={product.image} alt={product.name} className="product-img" />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="category">{product.category}</p>
          <p className="price">{product.price}</p>
          <button className="add-to-cart">View Details</button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;