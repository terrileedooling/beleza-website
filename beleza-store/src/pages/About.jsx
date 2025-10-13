import React from "react";
import "../styles/about.css";

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      description: "With over 10 years in the beauty industry, Sarah started Beleza to bring natural, effective products to everyone."
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Head Formulator",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      description: "Michael is a cosmetic chemist dedicated to creating products that are both effective and gentle on the skin."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Director",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      description: "Emily ensures our message of natural beauty reaches and resonates with our wonderful community."
    }
  ];

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

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
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
            <img src="https://images.unsplash.com/photo-1556228578-7e2c2be6d453?auto=format&fit=crop&w=600&q=80" alt="Our Mission" />
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

      {/* Team Section */}
      <section className="team-section">
        <h2 className="section-title">Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-card">
              <img src={member.image} alt={member.name} className="team-img" />
              <div className="team-info">
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p className="description">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
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