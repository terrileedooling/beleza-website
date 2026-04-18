import React from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ProductCard";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();

  // ONLY show products that are BOTH featured AND visible
  const featuredProducts = products
    .filter(p => p.featured === true && p.visible !== false)
    .slice(0, 6); // Show up to 6 featured products

  const categories = [
    {
      id: 1,
      name: "Hair Care",
      category: "Hair",
      image: new URL("../assets/products/Hair/hair3.jpg", import.meta.url).href,
    },
    {
      id: 2,
      name: "Wellness",
      category: "Wellness", 
      image: new URL("../assets/products/Wellness/wellness.jpg", import.meta.url).href,
    },
    {
      id: 3,
      name: "Sea Moss",
      category: "Sea Moss", 
      image: new URL("../assets/products/Sea Moss/seamoss.png", import.meta.url).href,
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: "The Creza Brazilian Cacau Treatment transformed my dry, damaged hair. I've never received so many compliments!",
      author: "Sarah Johnson",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      text: "Cosmic Senses Sea Moss has improved my overall wellness. The quality is exceptional and the results are noticeable!",
      author: "Maya Williams",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: 3,
      text: "The hair straightening solution gave me the smoothest, sleekest results I've ever had!",
      author: "Jessica Brown",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/26.jpg"
    },
  ];

  const handleCategoryClick = (category) => {
    navigate('/products', { state: { selectedCategory: category } });
  };

  const handleShopNow = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <div className="home-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-container">

      <section className="hero banner-hero">
        <div className="hero-container-inner">

    <div className="hero-grid">

      {/* LEFT CONTENT */}
      <div className="hero-text">
        <span className="hero-subtitle">NATURAL • QUALITY • EFFECTIVE</span>

        <h1>
          Reconnect with your <br/>
          <span> Natural Radiance</span>
        </h1>

        <p>
          Premium hair care and wellness products crafted to nourish your body 
          and enhance your everyday confidence.
        </p>

        <div className="hero-actions">
          <button className="primary-btn" onClick={handleShopNow}>
            Shop Now
          </button>
          <button className="secondary-btn" onClick={() => navigate("/products")}>
            Explore Products
          </button>
        </div>

      </div>

    </div>
        </div>
      </section>

      
      {/* <section className="hero">
        <div className="hero-content">
          <h1>Reconnect with your natural radiance</h1>
          <p>Discover premium hair care and sea moss products for your wellness journey</p>
          <button className="primary-btn" onClick={handleShopNow}>Shop Now</button>
        </div>
      </section> */}

      <section className="categories">
        <h2 className="section-title">Shop By Category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => handleCategoryClick(category.category)}
            >
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <h3>{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ONLY show featured products section if there ARE featured products */}
      {featuredProducts.length > 0 && (
        <section className="featured">
          <h2 className="section-title">Featured Products</h2>
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="testimonials">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <img src={testimonial.image} alt={testimonial.author} className="author-img" />
                <div className="author-info">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}