import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { HistoryProvider } from './context/HistoryContext';
import { ProductProvider } from './context/ProductContext';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetailModal from './components/ProductDetailModal';
import AdminProductModal from './components/AdminProductModal';
import CartModal from './components/CartModal';
import HistoryModal from './components/HistoryModal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { Sparkles, ShieldCheck, Truck, Headphones } from 'lucide-react';
import './App.css';

function MainApp() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const handleOpenAuth = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      {/* HEADER */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* HERO / PROMO STRIP */}
      <section className="promo-banner-strip">
        <div className="promo-container">
          <div className="promo-item">
            <Sparkles size={18} className="promo-icon" />
            <span>100% Customized Photo Gifts</span>
          </div>
          <div className="promo-item">
            <Truck size={18} className="promo-icon" />
            <span>Fast & Safe Doorstep Delivery</span>
          </div>
          <div className="promo-item">
            <ShieldCheck size={18} className="promo-icon" />
            <span>Premium Print Quality</span>
          </div>
          <div className="promo-item">
            <Headphones size={18} className="promo-icon" />
            <span>Direct WhatsApp Support</span>
          </div>
        </div>
      </section>

      {/* PRODUCTS GALLERY */}
      <ProductList onRequireAuth={handleOpenAuth} />

      {/* FOOTER */}
      <Footer onScrollToTop={scrollToTop} />

      {/* MODALS */}
      <ProductDetailModal onRequireAuth={handleOpenAuth} />

      <AdminProductModal />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRequireAuth={handleOpenAuth}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={handleCloseAuth}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <HistoryProvider>
            <ToastProvider>
              <MainApp />
            </ToastProvider>
          </HistoryProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
