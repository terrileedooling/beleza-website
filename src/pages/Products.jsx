import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ProductCard";
import "../styles/products.css";

const heroImage = new URL("../../public/banner1.png", import.meta.url).href;
const categoryDescriptions = {
  Hair: "Professional hair treatments and styling tools.",
  Body: "Premium wildcrafted sea moss products and body care.",
  Wellness: "Wellness essentials designed to boost immunity, increase energy levels, and improve overall health from the inside out.",
  Peptides: "GLP-1 peptide support designed to help regulate appetite. These products assist the body’s natural processes to improve metabolism, enhance satiety, and support long-term, healthy fat reduction with guided usage.",

};

const Products = () => {
  const location = useLocation();
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedCategory]);

  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location.state]);

  // Filter ONLY visible products (and not hidden)
  const visibleProducts = useMemo(() => {
    return products.filter(product => product.visible !== false);
  }, [products]);

  const categories = useMemo(() => {
    if (!visibleProducts.length) return ["All"];
    const uniqueCategories = [...new Set(visibleProducts.map(product => product.category))];
    return ["All", ...uniqueCategories];
  }, [visibleProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!visibleProducts.length) return [];
    
    let filtered = visibleProducts;
    
    if (selectedCategory !== "All") {
      filtered = visibleProducts.filter(product => {
        if (selectedCategory === "Wellness" && product.category === "Sea Moss") {
          return true;
        }
        return product.category === selectedCategory;
      });
    }
    
    switch (sortOption) {
      case "price-low-high":
        return [...filtered].sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price.replace(/[^0-9]/g, ''));
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price.replace(/[^0-9]/g, ''));
          return priceA - priceB;
        });
      case "price-high-low":
        return [...filtered].sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price.replace(/[^0-9]/g, ''));
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price.replace(/[^0-9]/g, ''));
          return priceB - priceA;
        });
      case "name-asc":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [visibleProducts, selectedCategory, sortOption]);

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

  if (loading) {
    return (
      <section className="products-page">
        <div className="products-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="products-page">
      <div
        className="products-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImage})`
        }}
      >
        <div className="hero-content">
          <h1>Our Products</h1>
          <p>Discover our premium collection of hair care and sea moss products</p>
        </div>
      </div>

      <div className="products-container">
        <div className="products-header">
          <div className="products-meta">
            <span className="products-count">
              {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} 
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

        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try selecting a different category.</p>
          </div>
        ) : selectedCategory === "All" ? (
          <div className="products-by-category">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="category-section">
                <h2 className="category-title">{category}</h2>
                <p className="category-description">
                  {categoryDescriptions[category] || "Explore our premium product range"}
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
          <div className="products-grid">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;