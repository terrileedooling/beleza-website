import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/about.css";

const heroImage = new URL("../assets/site-images/products_header.jpg", import.meta.url).href;
const missionImage = new URL("../assets/site-images/about.jpg", import.meta.url).href;

const About = () => {

  const navigate = useNavigate();

  const values = [
    {
      icon: "fas fa-shield-alt", 
      title: "Quality",
      description: "We work only with verified suppliers and premium brands."
    },
    {
      icon: "fas fa-spa", 
      title: "Wellness",
      description: "Whether you want glowing skin, restored hair, immune support, or weight-loss guidance — we offer products that support your body naturally and holistically."
    },
    {
      icon: "fas fa-eye", 
      title: "Transparency",
      description: "From ingredients to usage, we believe you deserve clear and honest information to make the best choices for your body."
    },
    {
      icon: "fas fa-hand-holding-heart", 
      title: "Community",
      description: "Beleza was built for everyday people who want to feel confident again — and we love supporting your journey through education, wellness guidance, and accessible product options."
    }
  ];

  const handleShopNow = () => {
    navigate("/products");
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section
        className="products-hero"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
            url(${heroImage})
          `
        }}
      >
        <div className="hero-content">
          <h1>Our Story</h1>
          <p>Beleza was born from a passion for real results — inside and out.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
            At Beleza, we believe that beauty and wellness work together.
            That’s why our products are thoughtfully curated — blending nature, science, and self-care into solutions that support real, visible results.

            From wildcrafted Caribbean Sea Moss to professional hair treatments, collagen boosters, body care, and our GLP-1 peptide support range, everything we offer is selected with your health, confidence, and long-term wellness in mind.

            We started as a small business with a focus on natural beauty, and today Beleza has grown into a trusted wellness destination — known for transparency, quality, and products that truly work.


            A Growing Brand Built on Trust & Quality
            </p>
            <p>
              We've grown from a small local business to a trusted name in natural 
              beauty products, all while staying true to our core values of quality, sustainability, 
              and community.
            </p>
            <div className="stats-grid">
              <div className="stat">
                <h3>5000+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="stat">
                <h3>100+</h3>
                <p>Premium Wellness, Beauty & Haircare Products</p>
              </div>
              <div className="stat">
                <h3>10</h3>
                <p>Years of Excellence</p>
              </div>
            </div>
          </div>
          <div className="mission-image">
            <img src={missionImage} alt="Our Mission" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2 className="section-title">Our Values</h2>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <i className={value.icon}></i>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to Experience Beleza?</h2>
        <p>Join thousands of satisfied customers who have discovered the Beleza difference</p>
        <button className="primary-btn" onClick={handleShopNow}>Shop Now</button>
      </section>
    </div>
  );
};

export default About;