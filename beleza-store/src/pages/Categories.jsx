import React from "react";
import { products } from "../data/products.js";
import "../styles/categories.css";

const Categories = () => {
  // Calculate categories dynamically from products
  const categoryData = React.useMemo(() => {
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    // Define category information
    const categoryInfo = {
      "Hair": {
        name: "Hair Care",
        description: "Professional hair treatments, styling tools & hair care products",
        image: new URL("../assets/products/Hair/hair3.jpg", import.meta.url).href,
        productCount: `${categoryCounts["Hair"] || 0} products`
      },
      "Sea Moss": {
        name: "Sea Moss",
        description: "Premium wildcrafted sea moss products, gels, and body care",
        image: new URL("../assets/products/Sea Moss/seamoss.png", import.meta.url).href,
        productCount: `${categoryCounts["Sea Moss"] || 0} products`
      }
    };

    // Convert to array for mapping
    return Object.keys(categoryInfo).map((categoryKey, index) => ({
      id: index + 1,
      key: categoryKey,
      ...categoryInfo[categoryKey]
    }));
  }, []);

  const handleExploreCategory = (categoryKey) => {
    // Navigate to products page with category filter
    // You can implement this based on your routing setup
    console.log(`Exploring category: ${categoryKey}`);
    // Example: navigate(`/products?category=${categoryKey}`);
  };

  return (
    <section className="categories-page">
      <div className="categories-hero">
        <div className="hero-content">
          <h1>Our Categories</h1>
          <p>Discover our premium hair care and sea moss collections</p>
        </div>
      </div>

      <div className="categories-container">
        <h2 className="section-title">Shop By Category</h2>
        <div className="categories-grid">
          {categoryData.map((category) => (
            <div key={category.id} className="category-card-large">
              <img src={category.image} alt={category.name} className="category-img" />
              <div className="category-content">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="product-count">{category.productCount}</span>
                <button 
                  className="explore-btn"
                  onClick={() => handleExploreCategory(category.key)}
                >
                  Explore {category.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="features-section">
        <h2 className="section-title">Why Choose Our Products</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-leaf"></i>
            <h3>Natural Ingredients</h3>
            <p>Our sea moss is wildcrafted and organic, harvested from pristine waters</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-certificate"></i>
            <h3>Professional Quality</h3>
            <p>Hair treatments used by professionals for salon-quality results</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-truck"></i>
            <h3>Nationwide Shipping</h3>
            <p>Free delivery on orders over R500 anywhere in South Africa</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-star"></i>
            <h3>Premium Results</h3>
            <p>Experience the difference with our high-performance formulations</p>
          </div>
        </div>
      </section>

      {/* Additional Info Sections */}
      <section className="category-info-sections">
        <div className="info-section hair-info">
          <div className="info-content">
            <h3>Professional Hair Care</h3>
            <p>Our hair care collection features professional-grade treatments including Brazilian keratin, collagen botox, and cacau treatments. Transform your hair with products used by salon professionals.</p>
            <ul>
              <li>Keratin & Brazilian Treatments</li>
              <li>Collagen Botox for Hair Repair</li>
              <li>Professional Styling Tools</li>
              <li>Long-lasting Smoothing Results</li>
            </ul>
          </div>
          <div className="info-image">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80" alt="Hair Care" />
          </div>
        </div>

        <div className="info-section seamoss-info">
          <div className="info-image">
          <img
            src={new URL("../assets/products/Sea Moss/seamoss.png", import.meta.url).href}
            alt="Sea Moss"
          />
          </div>
          <div className="info-content">
            <h3>Premium Sea Moss Collection</h3>
            <p>Discover the power of wildcrafted sea moss from the Caribbean. Our sea moss products are sustainably harvested and packed with essential minerals and nutrients for overall wellness.</p>
            <ul>
              <li>Wildcrafted Organic Sea Moss</li>
              <li>Flavored Sea Moss Gels</li>
              <li>Sea Moss Body Care Products</li>
              <li>Bubble Bath & Body Washes</li>
            </ul>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Categories;