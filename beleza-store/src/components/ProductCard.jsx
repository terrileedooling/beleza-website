import React from "react";
import "../styles/products.css";

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-img-container">
        <img src={product.image} alt={product.name} className="product-img" />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="category">{product.category}</p>
        {product.description && (
          <p className="description">{product.description}</p>
        )}
        <p className="price">{product.price}</p>
        <button className="add-to-cart">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;