import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, MessageCircle, Check, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from './Toast';
import { STORE_PHONE } from '../data/products';

export default function ProductCard({ product, onRequireAuth }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['Standard'];
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCart();
  const { addOrder } = useHistory();
  const { isAuthenticated } = useAuth();
  const { openProductDetail } = useProducts();
  const { addToast } = useToast();

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/logo.jpeg'];
  const totalSlides = images.length;

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const rating = product.rating !== undefined ? product.rating : 4.9;
  const stock = product.stock !== undefined ? product.stock : 50;

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleCardClick = () => {
    openProductDetail(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    addToast(`${product.name} added to cart!`, 'success');
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWhatsAppOrder = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please login first to order', 'error');
      if (onRequireAuth) onRequireAuth('login');
      return;
    }

    const qty = parseInt(quantity) || 1;
    const message = `Hello RRV INTRA STYLE,\nI want to order:\n• Product: ${product.name}\n• Size: ${selectedSize}\n• Quantity: ${qty}\n• Price: ₹${product.price * qty}`;

    // Add to history
    addOrder({
      product: product.name,
      size: selectedSize,
      qty: qty,
      price: product.price * qty,
      time: new Date().toLocaleString()
    });

    const url = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    addToast('Opening WhatsApp for your order...', 'info');
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* IMAGE SLIDER */}
      <div className="slider-wrapper">
        <div className="slider-image-box">
          <img
            src={images[currentSlide]}
            alt={`${product.name} image ${currentSlide + 1}`}
            className="slider-image"
            loading="lazy"
          />
        </div>

        {/* DISCOUNT BADGE */}
        {discountPercent && (
          <span className="card-discount-badge">{discountPercent}% OFF</span>
        )}

        {/* QUICK VIEW HOVER BUTTON */}
        <button
          className="card-quick-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            openProductDetail(product);
          }}
          title="View product details"
        >
          <Eye size={15} />
          <span>Quick View</span>
        </button>

        {totalSlides > 1 && (
          <>
            <button className="slider-arrow prev" onClick={prevSlide} aria-label="Previous image">
              <ChevronLeft size={18} />
            </button>
            <button className="slider-arrow next" onClick={nextSlide} aria-label="Next image">
              <ChevronRight size={18} />
            </button>
            <div className="slider-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === currentSlide ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* PRODUCT DETAILS */}
      <div className="product-details">
        {/* RATING & STOCK ROW */}
        <div className="card-meta-row">
          <div className="card-rating-wrap">
            <Star size={13} className="star-filled" />
            <span className="card-rating-text">{Number(rating).toFixed(1)}</span>
          </div>
          {stock <= 5 && stock > 0 && (
            <span className="card-stock-warning">Only {stock} left!</span>
          )}
        </div>

        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        {/* PRICE DISPLAY */}
        <div className="card-price-row">
          <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="product-old-price">
              ₹{Number(product.oldPrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* CONTROLS (SIZE & QUANTITY) */}
        <div className="product-controls" onClick={(e) => e.stopPropagation()}>
          <div className="control-group">
            <label className="control-label">Size</label>
            <select
              className="product-select"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Qty</label>
            <input
              type="number"
              min="1"
              max={Math.max(1, stock)}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="product-qty-input"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="product-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`btn-add-cart ${isAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={stock <= 0}
          >
            {isAdded ? (
              <>
                <Check size={16} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add To Cart</span>
              </>
            )}
          </button>

          <button
            className="btn-order-wa"
            onClick={handleWhatsAppOrder}
            disabled={stock <= 0}
          >
            <MessageCircle size={16} />
            <span>Order on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
