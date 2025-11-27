import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { products } from "../data/products.js";
import { useCart } from "../context/CartContext"; // ADD THIS
import "../styles/single-product.css";

const SingleProduct = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart(); // ADD THIS
  const product = products.find(p => p.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <Link to="/products" className="back-to-products">Back to Products</Link>
      </div>
    );
  }

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  // UPDATE THIS FUNCTION
  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  // Get related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <section className="single-product-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="product-details-container">
        <div className="product-image-section">
          <img src={product.image} alt={product.name} className="product-main-image" />
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <p className="product-price">{product.price}</p>
          
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart - {product.price}
          </button>
        </div>
      </div>

      {/* Product Description */}
      <div className="product-description-section">
        <h2>Product Description</h2>
        <div className="description-content">
          {product.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => (
              <Link 
                key={relatedProduct.id} 
                to={`/product/${relatedProduct.id}`}
                className="related-product-card"
              >
                <img src={relatedProduct.image} alt={relatedProduct.name} />
                <h3>{relatedProduct.name}</h3>
                <p className="related-product-price">{relatedProduct.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SingleProduct;