import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  MessageCircle,
  Check,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Package,
  Edit3
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { STORE_PHONE } from '../data/products';

export default function ProductDetailModal({ onRequireAuth }) {
  const { selectedProduct, closeProductDetail, openAdmin } = useProducts();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCart();
  const { addOrder } = useHistory();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setSelectedSize(selectedProduct.sizes?.[0] || 'Standard');
      setQuantity(1);
      setIsAdded(false);
    }
  }, [selectedProduct]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeProductDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeProductDetail]);

  if (!selectedProduct) return null;

  const images = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
    ? selectedProduct.images
    : ['/logo.jpeg'];

  const discountPercent =
    selectedProduct.oldPrice && selectedProduct.oldPrice > selectedProduct.price
      ? Math.round(((selectedProduct.oldPrice - selectedProduct.price) / selectedProduct.oldPrice) * 100)
      : null;

  const rating = selectedProduct.rating || 4.9;
  const stock = selectedProduct.stock !== undefined ? selectedProduct.stock : 50;
  const brand = selectedProduct.brand || 'RRV Intra Style';

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, selectedSize, quantity);
    setIsAdded(true);
    addToast(`${selectedProduct.name} added to cart!`, 'success');
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWhatsAppOrder = () => {
    if (!isAuthenticated) {
      addToast('Please login first to order', 'error');
      if (onRequireAuth) onRequireAuth('login');
      return;
    }

    const qty = parseInt(quantity) || 1;
    const totalPrice = selectedProduct.price * qty;
    const message = `Hello RRV INTRA STYLE,\nI want to order:\n• Product: ${selectedProduct.name}\n• Category: ${selectedProduct.category}\n• Size: ${selectedSize}\n• Quantity: ${qty}\n• Price: ₹${totalPrice}\n\nPlease confirm availability. Thank you!`;

    addOrder({
      product: selectedProduct.name,
      size: selectedSize,
      qty: qty,
      price: totalPrice,
      time: new Date().toLocaleString()
    });

    const url = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    addToast('Opening WhatsApp for your order...', 'info');
  };

  const handleEditProduct = () => {
    closeProductDetail();
    openAdmin(selectedProduct);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={closeProductDetail}>
      <div
        className="modal-detail-dialog animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* CLOSE BUTTON */}
        <button
          className="modal-close-btn detail-close-pos"
          onClick={closeProductDetail}
          aria-label="Close product details"
        >
          <X size={22} />
        </button>

        <div className="detail-modal-grid">
          {/* LEFT: IMAGE GALLERY */}
          <div className="detail-gallery-col">
            <div className="detail-main-image-wrap">
              <img
                src={images[activeImageIndex]}
                alt={`${selectedProduct.name} preview`}
                className="detail-main-image"
              />

              {discountPercent && (
                <span className="detail-discount-badge">
                  {discountPercent}% OFF
                </span>
              )}

              {images.length > 1 && (
                <>
                  <button
                    className="gallery-nav-btn prev"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className="gallery-nav-btn next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="detail-thumbnails-row">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    className={`detail-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* ASSURANCE BADGES */}
            <div className="detail-trust-badges">
              <div className="trust-badge-item">
                <Truck size={16} />
                <span>Doorstep Delivery</span>
              </div>
              <div className="trust-badge-item">
                <ShieldCheck size={16} />
                <span>Premium Quality</span>
              </div>
              <div className="trust-badge-item">
                <RotateCcw size={16} />
                <span>Custom Verification</span>
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & PURCHASE CONTROLS */}
          <div className="detail-info-col">
            {/* BRAND & CATEGORY & ADMIN EDIT */}
            <div className="detail-meta-header">
              <div className="detail-tags-row">
                <span className="brand-tag">{brand}</span>
                <span className="category-tag">
                  <Tag size={12} />
                  {selectedProduct.category}
                </span>
              </div>

              <button
                className="btn-quick-edit"
                onClick={handleEditProduct}
                title="Edit this product in Admin"
              >
                <Edit3 size={14} />
                <span>Edit Product</span>
              </button>
            </div>

            {/* TITLE */}
            <h2 className="detail-title">{selectedProduct.name}</h2>

            {/* RATING */}
            <div className="detail-rating-row">
              <div className="star-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`star-icon ${star <= Math.round(rating) ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <span className="rating-score">{Number(rating).toFixed(1)}</span>
              <span className="rating-count">
                ({selectedProduct.reviewsCount || 24} reviews)
              </span>

              {/* STOCK BADGE */}
              <div className="stock-indicator-badge">
                <Package size={14} />
                {stock > 5 ? (
                  <span className="in-stock">In Stock ({stock} available)</span>
                ) : stock > 0 ? (
                  <span className="low-stock">Only {stock} left in stock!</span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </div>
            </div>

            {/* PRICE ROW */}
            <div className="detail-price-box">
              <div className="price-display-wrap">
                <span className="detail-current-price">
                  ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                </span>
                {selectedProduct.oldPrice && selectedProduct.oldPrice > selectedProduct.price && (
                  <span className="detail-old-price">
                    ₹{Number(selectedProduct.oldPrice).toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="detail-save-pill">Save {discountPercent}%</span>
                )}
              </div>
              <span className="price-tax-note">Inclusive of all taxes & customization</span>
            </div>

            {/* DESCRIPTION */}
            <div className="detail-desc-box">
              <h4 className="detail-section-heading">Description</h4>
              <p className="detail-description-text">
                {selectedProduct.description || 'Customized photo gift handcrafted with highest quality materials and premium print finishing.'}
              </p>
            </div>

            {/* SIZE / VARIANT SELECTOR */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="detail-options-group">
                <label className="detail-label">Select Size / Variant:</label>
                <div className="size-chips-wrap">
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`size-chip-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div className="detail-qty-group">
              <label className="detail-label">Quantity:</label>
              <div className="detail-qty-stepper">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, stock)}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(stock || 99, parseInt(e.target.value) || 1)))
                  }
                  className="qty-input"
                />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="detail-actions-row">
              <button
                className={`btn-detail-add-cart ${isAdded ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={stock <= 0}
              >
                {isAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add To Cart</span>
                  </>
                )}
              </button>

              <button
                className="btn-detail-wa-order"
                onClick={handleWhatsAppOrder}
                disabled={stock <= 0}
              >
                <MessageCircle size={18} />
                <span>Order on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
