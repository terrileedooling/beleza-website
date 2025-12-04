import React from "react";
import "../styles/contact.css";

const heroImage = new URL("../assets/site-images/products_header.jpg", import.meta.url).href;

const Contact = () => {
  const contactInfo = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Hair Services Location",
      details: ["Shop 5 Ottery Road, Ottery", "Opposite Engen Garage Ottery Road", "Cape Town, South Africa"],
      note: "This location is exclusively for hair services. For product inquiries, please use WhatsApp below."
    },
    {
      icon: "fab fa-whatsapp",
      title: "Contact via WhatsApp",
      details: ["+27 72 114 3123"],
      note: "For quickest response, message us on WhatsApp for product information and orders"
    },
    {
      icon: "fas fa-phone",
      title: "Phone (Hair Salon)",
      details: ["021 705 3341"],
      note: "For hair service appointments only"
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      details: ["info@belezapro.co.za"],
      note: "For general inquiries"
    }
  ];

  return (
    <div className="contact-page">
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
          <h1>Get In Touch</h1>
          <p>For hair services, visit our salon. For product inquiries and orders, contact us via WhatsApp.</p>
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
                {info.note && <p className="contact-note">{info.note}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* WhatsApp Emphasis Section
        <section className="whatsapp-section">
          <div className="whatsapp-content">
            <i className="fab fa-whatsapp whatsapp-icon"></i>
            <div className="whatsapp-text">
              <h2>Prefer WhatsApp?</h2>
              <p>
                Get quick responses for product information, orders, and customer support via WhatsApp.
                We're here to help with all your product needs!
              </p>
              <a 
                href="https://wa.me/27721143123" 
                className="whatsapp-btn"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp"></i>
                Message Us on WhatsApp
              </a>
            </div>
          </div>
        </section> */}

        {/* Map Section */}
        <section className="map-section">
          <h2 className="section-title">Find Our Salon</h2>
          <p className="map-note">
                Visit our salon at the location above for professional hair services. 
                Please note that this is a hair salon location - our products (which are not hair-related) 
                are not available for purchase at this store. For product inquiries and orders, 
                please contact us via WhatsApp.
          </p>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.1761568919705!2d18.498630475921765!3d-34.01368897317157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc439fa849ce93%3A0xd0a32f60cbe840f2!2sDesired%20Images%20Hair%20%26%20Beauty%20Salon!5e0!3m2!1sen!2sza!4v1760467440687!5m2!1sen!2sza"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hair Salon Location"
            ></iframe>
          </div>
        </section>

        {/* FAQ Section (Updated) */}
        <section className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Where can I get hair services?</h3>
              <p>
                Hair services are available at our salon location in Ottery, Cape Town. 
                Please call or visit for appointments and hair service inquiries.
              </p>
            </div>
            <div className="faq-item">
              <h3>Are products available at the salon?</h3>
              <p>
                No, our products are not hair-related and are not available at the salon location. 
                All products must be ordered via WhatsApp or our online channels.
              </p>
            </div>
            <div className="faq-item">
              <h3>How do I order products?</h3>
              <p>
                For product orders and inquiries, please contact us via WhatsApp for the fastest response. 
                We'll guide you through our product range and ordering process.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;