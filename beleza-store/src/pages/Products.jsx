import React from "react";
import { products } from "../data/products.js";
import ProductCard from "../components/ProductCard";
import "../styles/products.css";

const Products = () => {
  return (
    <section className="products-section">
      <h2 className="section-title">Our Products & Services</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default Products;