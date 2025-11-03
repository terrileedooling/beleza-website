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
      details: ["Shop 5 Ottery Road , Ottery (opposite the Engen Garage Ottery Road, Cape Town, South Africa"]
    },
    {
      icon: "fas fa-phone",
      title: "Call Us",
      details: ["021 705 3341"]
    },
    {
      icon: "fas fa-envelope",
      title: "Email Us",
      details: ["sales@belezapro.co.za", "info@belezapro.co.za"]
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
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.1761568919705!2d18.498630475921765!3d-34.01368897317157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc439fa849ce93%3A0xd0a32f60cbe840f2!2sDesired%20Images%20Hair%20%26%20Beauty%20Salon!5e0!3m2!1sen!2sza!4v1760467440687!5m2!1sen!2sza"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Beleza Store Location"
                ></iframe>
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