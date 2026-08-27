import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  MoreVertical,
  LogIn,
  UserPlus,
  LogOut,
  History,
  User,
  SlidersHorizontal,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from './Toast';

export default function Header({ onOpenCart, onOpenAuth, onOpenHistory }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, logout, isAuthenticated, isOwner } = useAuth();
  const { getCartCount } = useCart();
  const { openAdmin } = useProducts();
  const { addToast } = useToast();
  const dropdownRef = useRef(null);

  const cartCount = getCartCount();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      addToast('Logged out successfully', 'info');
    } catch (err) {
      addToast(err.message || 'Logout failed', 'error');
    }
  };

  return (
    <header className="site-header">
      {/* LEFT BRAND SECTION */}
      <div className="header-left">
        <a href="/" className="logo-link">
          <img src="/logo.jpeg" alt="RRV Intra Style Logo" className="header-logo" />
        </a>
        <img src="/logo1.jpg" alt="RRV Intra Style Banner" className="header-banner" />
      </div>

      {/* RIGHT ACTION CONTROLS */}
      <div className="header-right">
        {/* ADMIN MANAGE PRODUCTS BUTTON - ONLY VISIBLE TO OWNER */}
        {isOwner && (
          <button
            className="header-admin-btn"
            onClick={() => openAdmin(null)}
            title="Owner Product Management"
          >
            <ShieldCheck size={16} className="owner-icon-glow" />
            <span className="header-admin-text">Owner Admin</span>
          </button>
        )}

        {/* CART BUTTON */}
        <button className="cart-badge-btn" onClick={onOpenCart} title="Open Shopping Cart">
          <ShoppingBag size={19} className="cart-icon" />
          <span className="cart-text">Cart</span>
          {cartCount > 0 && <span className="cart-count-bubble">{cartCount}</span>}
        </button>

        {/* MENU / USER DROPDOWN */}
        <div className="menu-container" ref={dropdownRef}>
          <button
            className="menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Toggle user menu"
          >
            <MoreVertical size={24} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu animate-fade-in">
              {isAuthenticated && currentUser ? (
                <div className="user-profile-header">
                  <div className="user-avatar-circle">
                    <User size={16} />
                  </div>
                  <div className="user-info-text">
                    <span className="user-status-label">
                      {isOwner ? 'Owner / Admin' : 'Signed in as'}
                    </span>
                    <span className="user-email-text" title={currentUser.email}>
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* ADMIN PRODUCT MANAGEMENT OPTION - ONLY SHOWN TO LOGGED-IN OWNER (subhamrajbholu@gmail.com) */}
              {isOwner && (
                <button
                  className="dropdown-item admin-menu-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    openAdmin(null);
                  }}
                >
                  <SlidersHorizontal size={16} />
                  <span>Manage Products (Owner)</span>
                </button>
              )}

              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenHistory();
                }}
              >
                <History size={16} />
                <span>Order History</span>
              </button>

              {!isAuthenticated ? (
                <>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAuth('login');
                    }}
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAuth('signup');
                    }}
                  >
                    <UserPlus size={16} />
                    <span>Sign Up</span>
                  </button>
                </>
              ) : (
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
