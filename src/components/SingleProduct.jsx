import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import "../styles/single-product.css";

const SingleProduct = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getProduct, products } = useProducts();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const found = await getProduct(id);
        setProduct(found);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, getProduct]);

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  // Get related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.category === product?.category && p.id !== id)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="single-product-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <Link to="/products" className="back-to-products">Back to Products</Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `R${price.toFixed(2)}`;
    }
    return price;
  };

  return (
    <section className="single-product-page">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-details-container">
        <div className="product-image-section">
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-main-image"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/500x500?text=No+Image";
            }}
          />
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <p className="product-price">{formatPrice(product.price)}</p>

          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart - {formatPrice(product.price)}
          </button>
        </div>
      </div>

      <div className="product-description-section">
        <h2>Product Description</h2>
        <div className="description-content">
          {product.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

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
                <img 
                  src={relatedProduct.image} 
                  alt={relatedProduct.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150x150?text=No+Image";
                  }}
                />
                <h3>{relatedProduct.name}</h3>
                <p className="related-product-price">{formatPrice(relatedProduct.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SingleProduct;