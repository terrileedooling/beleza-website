import React from "react";
import ProductCard from "../components/ProductCard";
import "../styles/home.css";
import "../styles/global.css";

export default function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: "Hydrating Shampoo",
      category: "Hair Care",
      description: "Gentle, moisture-rich shampoo for all hair types.",
      price: "R150",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Curl Defining Cream",
      category: "Styling",
      description: "Defines curls without weighing them down.",
      price: "R180",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Hair Growth Serum",
      category: "Treatment",
      description: "Promotes growth and strengthens roots.",
      price: "R220",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const categories = [
    {
      id: 1,
      name: "Hair Care",
      image: new URL("../assets/products/Hair/hair3.jpg", import.meta.url).href
    },
    {
      id: 2,
      name: "Sea Moss",
      image: new URL("../assets/products/Sea Moss/seamoss.png", import.meta.url).href
    },
    {
      id: 3,
      name: "Hair Tools",
      image: new URL("../assets/products/Hair/hairtools.jpg", import.meta.url).href
    },
    // {
    //   id: 4,
    //   name: "Fragrance",
    //   image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
    // }
  ];

  const testimonials = [
    {
      id: 1,
      text: "The hydrating shampoo transformed my dry, brittle hair. I've never received so many compliments!",
      author: "Sarah Johnson",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      text: "As someone with curly hair, finding the right products has always been a challenge. Beleza's curl cream is a game-changer!",
      author: "Maya Williams",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: 3,
      text: "The hair growth serum actually works! I've noticed significant improvement in just two months of use.",
      author: "Jessica Brown",
      role: "Verified Customer",
      image: "https://randomuser.me/api/portraits/women/26.jpg"
    }
  ];

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>Reconnect with your natural radiance</h1>
          <p>Discover a world of beauty, balance, and care.</p>
          <button className="primary-btn">Shop Now</button>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured">
        <h2 className="section-title">Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories">
        <h2 className="section-title">Shop By Category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">{category.name}</div>
            </div>
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
        <h2>Join the Beleza Family</h2>
        <p>Sign up for exclusive offers, new product launches, and beauty tips delivered to your inbox.</p>
        <button className="secondary-btn">Sign Up Now</button>
      </section>
    </div>
  );
}