"use client";
import React, { useState } from 'react';
import './footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3>About Us</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
          </p>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/shipping">Shipping Info</a></li>
            <li><a href="/returns">Returns</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Contact Us</h3>
          <ul className="contact-list">
            <li>
              <strong>Email:</strong> contact@bookshop.com
            </li>
            <li>
              <strong>Phone:</strong> +421 123 456 789
            </li>
            <li>
              <strong>Address:</strong> Attard, Malta · +356 2258 4408
            </li>
            <li>
              <strong>Hours:</strong> Mon-Fri: 9AM - 6PM
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
          <div className="newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe to get special offers and updates</p>
            <div className="newsletter-input">
              <input 
                type="email" 
                placeholder="Your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={handleSubscribe}>Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BookShop. All rights reserved.</p>
      </div>
    </footer>
  );
}