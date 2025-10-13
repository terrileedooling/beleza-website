import React from "react";
import "../styles/categories.css";

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: "Hair Care",
      description: "Shampoos, conditioners, treatments & styling products",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
      productCount: "24 products"
    },
    {
      id: 2,
      name: "Skincare",
      description: "Cleansers, moisturizers, serums & facial treatments",
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
      productCount: "18 products"
    },
    {
      id: 3,
      name: "Makeup",
      description: "Foundation, lipstick, eyeshadow & beauty essentials",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
      productCount: "32 products"
    },
    {
      id: 4,
      name: "Fragrance",
      description: "Perfumes, body mists & scented products",
      image: "https://images.unsplash.com/photo-1594736797933-d0ea3ff8db41?auto=format&fit=crop&w=600&q=80",
      productCount: "15 products"
    },
    {
      id: 5,
      name: "Bath & Body",
      description: "Body washes, lotions, scrubs & self-care products",
      image: "https://images.unsplash.com/photo-1556228578-7e2c2be6d453?auto=format&fit=crop&w=600&q=80",
      productCount: "20 products"
    },
    {
      id: 6,
      name: "Natural & Organic",
      description: "Clean beauty products with natural ingredients",
      image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=600&q=80",
      productCount: "16 products"
    }
  ];

  return (
    <section className="categories-page">
      <div className="categories-hero">
        <div className="hero-content">
          <h1>Our Categories</h1>
          <p>Explore our carefully curated collection of beauty products</p>
        </div>
      </div>

      <div className="categories-container">
        <h2 className="section-title">Shop By Category</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card-large">
              <img src={category.image} alt={category.name} className="category-img" />
              <div className="category-content">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="product-count">{category.productCount}</span>
                <button className="explore-btn">Explore</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="features-section">
        <h2 className="section-title">Why Choose Beleza</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-leaf"></i>
            <h3>Natural Ingredients</h3>
            <p>All our products are formulated with natural, skin-friendly ingredients</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-certificate"></i>
            <h3>Quality Assured</h3>
            <p>Rigorous testing ensures the highest quality standards</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-truck"></i>
            <h3>Free Shipping</h3>
            <p>Free delivery on orders over R500 anywhere in South Africa</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-heart"></i>
            <h3>Cruelty Free</h3>
            <p>All our products are never tested on animals</p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Categories;