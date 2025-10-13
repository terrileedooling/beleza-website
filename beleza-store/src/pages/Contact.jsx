import React, { useState } from "react";
import "../styles/contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const contactInfo = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Visit Us",
      details: ["123 Beauty Street", "Cape Town, 8001", "South Africa"]
    },
    {
      icon: "fas fa-phone",
      title: "Call Us",
      details: ["+27 21 123 4567", "Mon-Fri: 9am-6pm", "Sat: 9am-2pm"]
    },
    {
      icon: "fas fa-envelope",
      title: "Email Us",
      details: ["info@belezastore.com", "support@belezastore.com"]
    },
    {
      icon: "fas fa-clock",
      title: "Store Hours",
      details: ["Monday-Friday: 9am-6pm", "Saturday: 9am-4pm", "Sunday: Closed"]
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <div className="contact-container">
        {/* Contact Info */}
        <section className="contact-info-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card">
                <i className={info.icon}></i>
                <h3>{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx}>{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="contact-form-section">
          <div className="contact-form-container">
            <div className="form-column">
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
            
            <div className="map-column">
              <h2>Find Us</h2>
              <div className="map-placeholder">
                <div className="map-content">
                  <i className="fas fa-map-marked-alt"></i>
                  <h3>Beleza Store Location</h3>
                  <p>123 Beauty Street, Cape Town</p>
                  <p>Easy to find with ample parking</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Do you offer international shipping?</h3>
              <p>Currently, we only ship within South Africa. We're working on expanding our shipping options in the future.</p>
            </div>
            <div className="faq-item">
              <h3>What is your return policy?</h3>
              <p>We offer a 30-day return policy for unused products in their original packaging. See our Returns page for details.</p>
            </div>
            <div className="faq-item">
              <h3>Are your products cruelty-free?</h3>
              <p>Yes! All our products are cruelty-free and never tested on animals. We're Leaping Bunny certified.</p>
            </div>
            <div className="faq-item">
              <h3>Do you have physical stores?</h3>
              <p>We currently have one flagship store in Cape Town. We're planning to expand to other cities soon.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;