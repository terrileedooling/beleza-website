import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { products } from "../data/products.js";
import ProductCard from "../components/ProductCard";
import "../styles/products.css";

const heroImage = new URL("../assets/site-images/products_header.jpg", import.meta.url).href;
const categoryDescriptions = {
  Hair: "Professional hair treatments and styling tools.",
  Body: "Premium wildcrafted sea moss products and body care.",
  Wellness: "Wllness essentials designed to support weight management, boost immunity, increase energy levels, and improve overall health from the inside out."
};

const Products = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  // Scroll to top when component mounts or category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedCategory]);

  // Get the category from navigation state when component mounts
  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location.state]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return ["All", ...uniqueCategories];
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = products.filter(product => product.category === selectedCategory);
    }
    
    // Sort products
    switch (sortOption) {
      case "price-low-high":
        return [...filtered].sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
          const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
          return priceA - priceB;
        });
      case "price-high-low":
        return [...filtered].sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
          const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
          return priceB - priceA;
        });
      case "name-asc":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [selectedCategory, sortOption]);

  // Group products by category for the categorized view
  const productsByCategory = useMemo(() => {
    const grouped = {};
    filteredAndSortedProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [filteredAndSortedProducts]);

  const totalProducts = filteredAndSortedProducts.length;

  return (
    <section className="products-page">
      <div
        className="products-hero"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
            url(${heroImage})
          `
        }}
      >
        <div className="hero-content">
          <h1>Our Products</h1>
          <p>Discover our premium collection of hair care and sea moss products</p>
        </div>
      </div>

      <div className="products-container">
        {/* Filters and Controls */}
        <div className="products-header">
          <div className="products-meta">
            <span className="products-count">
              {totalProducts} product{totalProducts !== 1 ? 's' : ''} 
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </span>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select 
                id="category-filter"
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sort-filter">Sort by:</label>
              <select 
                id="sort-filter"
                className="filter-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-low-high">Price (Low to High)</option>
                <option value="price-high-low">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs for quick filtering */}
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
              {category !== "All" && (
                <span className="tab-count">
                  ({products.filter(p => p.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Products Grid - Organized by Category when "All" is selected */}
        {selectedCategory === "All" ? (
          // Show products grouped by category
          <div className="products-by-category">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="category-section">
                <h2 className="category-title">{category}</h2>
                <p className="category-description">
                  { categoryDescriptions[category] || "Explore our premium product range" }
                </p>
                <div className="products-grid">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show filtered products in a single grid
          <div className="products-grid">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* No products message */}
        {totalProducts === 0 && (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try selecting a different category or adjusting your filters.</p>
            <button 
              className="reset-filters"
              onClick={() => {
                setSelectedCategory("All");
                setSortOption("default");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;