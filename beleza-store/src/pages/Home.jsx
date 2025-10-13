import React from "react";
import ProductCard from "../components/ProductCard";
import "../styles/home.css";

export default function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: "Hydrating Shampoo",
      category: "Hair Care",
      description: "Gentle, moisture-rich shampoo for all hair types.",
      price: "R150",
      image: "https://via.placeholder.com/300x350.png?text=Hydrating+Shampoo",
    },
    {
      id: 2,
      name: "Curl Defining Cream",
      category: "Styling",
      description: "Defines curls without weighing them down.",
      price: "R180",
      image: "https://via.placeholder.com/300x350.png?text=Curl+Cream",
    },
    {
      id: 3,
      name: "Hair Growth Serum",
      category: "Treatment",
      description: "Promotes growth and strengthens roots.",
      price: "R220",
      image: "https://via.placeholder.com/300x350.png?text=Growth+Serum",
    },
  ];

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Beleza Store</h1>
          <p>Your destination for premium hair & beauty products.</p>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <h2>Join the Beleza Family</h2>
        <p>Sign up for exclusive offers, product drops, and beauty tips.</p>
        <button className="signup-btn">Sign Up</button>
      </section>
    </div>
  );
}