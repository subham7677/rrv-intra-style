import React from 'react';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { STORE_PHONE, STORE_EMAIL, STORE_INSTAGRAM, STORE_FACEBOOK, STORE_LOCATION } from '../data/products';

// SVG Icons for Socials
function InstagramIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer({ onScrollToTop }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* BRAND & TAGLINE */}
        <div className="footer-brand-section">
          <h2 className="footer-brand-title">RRV INTRA STYLE</h2>
          <p className="footer-tagline">
            Custom Photo Products | Made with Rithik Rajveer <Heart size={14} className="heart-inline" />
          </p>
        </div>

        {/* 3-COLUMN GRID */}
        <div className="footer-grid">
          {/* COLUMN 1: QUICK LINKS */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#products" onClick={(e) => { e.preventDefault(); onScrollToTop && onScrollToTop(); }}>
                  Home
                </a>
              </li>
              <li>
                <a href="#products" onClick={(e) => { e.preventDefault(); onScrollToTop && onScrollToTop(); }}>
                  Our Products
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${STORE_PHONE}?text=Hello%20RRV%20INTRA%20STYLE`} target="_blank" rel="noreferrer">
                  Custom Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: SOCIAL */}
          <div className="footer-col">
            <h4 className="footer-col-title">Follow Us</h4>
            <ul className="footer-links-list">
              <li>
                <a href={`mailto:${STORE_EMAIL}`} className="footer-social-link">
                  <Mail size={16} /> <span>{STORE_EMAIL}</span>
                </a>
              </li>
              <li>
                <a href={STORE_INSTAGRAM} target="_blank" rel="noreferrer" className="footer-social-link">
                  <InstagramIcon size={16} /> <span>@rrv_intrastyle</span>
                </a>
              </li>
              <li>
                <a href={STORE_FACEBOOK} target="_blank" rel="noreferrer" className="footer-social-link">
                  <FacebookIcon size={16} /> <span>Facebook Page</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: CONTACT */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-contact-list">
              <li>
                <Phone size={16} />
                <span>+91 {STORE_PHONE}</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>{STORE_LOCATION}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          <p>© 2026 RRV INTRA STYLE | Designed with SUVM💖</p>
        </div>
      </div>
    </footer>
  );
}
