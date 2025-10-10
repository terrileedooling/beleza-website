import React from "react";
import "../styles/products.css";

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-img" />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="category">{product.category}</p>
        <p className="description">{product.description}</p>
        <p className="price">{product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;