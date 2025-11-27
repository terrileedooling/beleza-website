import React from "react";
import "../styles/about.css";
import Slider from "react-slick";

const heroImage = new URL("../assets/site-images/products_header.jpg", import.meta.url).href;

const About = () => {

  const values = [
    {
      icon: "fas fa-leaf",
      title: "Natural Ingredients",
      description: "We source the finest natural ingredients from sustainable suppliers around the world."
    },
    {
      icon: "fas fa-recycle",
      title: "Sustainability",
      description: "Our packaging is eco-friendly and we're committed to reducing our environmental impact."
    },
    {
      icon: "fas fa-heart",
      title: "Cruelty Free",
      description: "We never test on animals and are proud to be Leaping Bunny certified."
    },
    {
      icon: "fas fa-users",
      title: "Community",
      description: "We support local communities and give back through various initiatives."
    }
  ];

  const facebookPosts = [
    {
      id: 1,
      embedUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fbelezaprofessional%2Fvideos%2F836695471217997%2F&show_text=true&width=357&t=0"
    },
    {
      id: 2,
      embedUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fbelezaprofessional%2Fvideos%2F836695471217997%2F&show_text=true&width=357&t=0"
    },
    {
      id: 3,
      embedUrl: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fbelezaprofessional%2Fvideos%2F836695471217997%2F&show_text=true&width=357&t=0"
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    adaptiveHeight: true,
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
          <p>Beleza was born from a passion for natural beauty and a commitment to quality</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
              At Beleza, we believe that beauty should be simple, natural, and accessible to everyone. 
              We're committed to creating products that enhance your natural beauty while being kind 
              to your skin and the environment.
            </p>
            <p>
              Founded in 2018, we've grown from a small local business to a trusted name in natural 
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
                <p>Products</p>
              </div>
              <div className="stat">
                <h3>3</h3>
                <p>Years of Excellence</p>
              </div>
            </div>
          </div>
          <div className="mission-image">
            <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80" alt="Our Mission" />
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

      {/* Facebook Carousel Section */}
      <section className="facebook-carousel">
        <h2 className="section-title">From Our Facebook</h2>
        <Slider {...sliderSettings} className="fb-slider">
          {facebookPosts.map((post) => (
            <div key={post.id} className="fb-slide">
              <iframe
                src={post.embedUrl}
                width="500"
                height="600"
                style={{ border: "none", overflow: "hidden", margin: "0 auto", display: "block" }}
                scrolling="no"
                frameBorder="0"
                allow="encrypted-media"
                title={`Facebook post ${post.id}`}
              ></iframe>
            </div>
          ))}
        </Slider>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to Experience Beleza?</h2>
        <p>Join thousands of satisfied customers who have discovered the Beleza difference</p>
        <button className="primary-btn">Shop Now</button>
      </section>
    </div>
  );
};

export default About;