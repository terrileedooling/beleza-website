import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "../styles/home.css";
import "../styles/global.css";

export default function Home() {
  const navigate = useNavigate();

  const featuredProducts = [
    {
      id: 1,
      name: "Cosmic Senses Wild Crafted Organic Sea Moss 500g",
      category: "Sea Moss",
      price: "R850",
      image: new URL('../assets/products/Sea Moss/seamossorganic500g.png', import.meta.url).href,
    },
    {
      id: 2,
      name: "Creza Brazilian Cacau Treatment",
      category: "Hair",
      price: "R1,999",
      image: new URL('../assets/products/Hair/crezabrazilliancacautreatment.png', import.meta.url).href,
    },
    {
      id: 3,
      name: "Creza Collagen Botox Hair Treatment",
      category: "Hair",
      price: "R599",
      image: new URL('../assets/products/Hair/crezacollagenbotoxhairtreatment.png', import.meta.url).href,
    },
  ];

  const categories = [
    {
      id: 1,
      name: "Hair Care",
      category: "Hair",
      image: new URL("../assets/products/Hair/hair3.jpg", import.meta.url).href,
      productCount: "6 products"
    },
    {
      id: 2,
      name: "Wellness",
      category: "Wellness", 
      image: new URL("../assets/products/Wellness/wellness.jpg", import.meta.url).href,
      productCount: "5 products"
    },
    {
      id: 3,
      name: "Sea Moss",
      category: "Sea Moss", 
      image: new URL("../assets/products/Sea Moss/seamoss.png", import.meta.url).href,
      productCount: "5 products"
    },
    {
      id: 4,
      name: "GLP-1 Peptides",
      category: "GLP-1 Peptides", 
      image: new URL("../assets/products/Wellness/weightloss.jpg", import.meta.url).href,
      productCount: "5 products"
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
      text: "The hair straightening solution gave me the smoothest, sleekest results I've ever had! My hair stays frizz-free and silky for weeks — truly long-lasting.",
      author: "Jessica Brown",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/26.jpg"
    },
    {
      id: 4,
      text: "I’ve lost 6kg in my first month! The weight-loss products gave me so much energy and helped control my cravings. I finally feel confident again.",
      author: "Lauren Smith",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/15.jpg"
    }
  ];

  const handleCategoryClick = (category) => {
    navigate('/products', { 
      state: { selectedCategory: category } 
    });
  };

  const handleShopNow = () => {
    navigate("/products");
  };

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>Reconnect with your natural radiance</h1>
          <p>Discover premium hair care and sea moss products for your wellness journey</p>
          <button className="primary-btn" onClick={handleShopNow}>Shop Now</button>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
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

      {/* FEATURED PRODUCTS - USING PRODUCTCARD COMPONENT */}
      <section className="featured">
        <h2 className="section-title">Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
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

      {/* CTA SECTION */}
      <section className="cta">
        {/* <h2>Join Our Wellness Community</h2>
        <p>Sign up for exclusive offers, new product launches, and wellness tips delivered to your inbox.</p>
        <button className="secondary-btn">Sign Up Now</button> */}
      </section>
    </div>
  );
}