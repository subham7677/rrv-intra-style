import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { STORE_PHONE } from '../data/products';

export default function CartModal({ isOpen, onClose, onRequireAuth }) {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { addMultipleOrders } = useHistory();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const total = getCartTotal();

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    if (!isAuthenticated) {
      addToast('Please login first to place an order', 'error');
      if (onRequireAuth) onRequireAuth('login');
      return;
    }

    // Build message
    let message = "Hello RRV INTRA STYLE,\nI want to place an order for the following items:\n\n";
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.product}*\n   Size: ${item.size}\n   Qty: ${item.qty}\n   Price: ₹${item.price * item.qty}\n\n`;
    });
    message += `*Total Amount:* ₹${total}\n\nPlease confirm my order. Thank you!`;

    // Save to history
    addMultipleOrders(cart);

    // Fire Confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore if canvas-confetti is not loaded
    }

    // Open WhatsApp
    const url = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    addToast('Opening WhatsApp to complete your order!', 'success');
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-drawer animate-slide-left" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <ShoppingBag size={20} className="modal-icon" />
            <h3 className="modal-title">Shopping Cart</h3>
            <span className="modal-badge">{cart.length} items</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <div className="empty-cart-icon">
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
              <h4>Your cart is empty</h4>
              <p>Add some personalized products to make your loved ones smile!</p>
              <button className="btn-continue-shopping" onClick={onClose}>
                Explore Products <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item, index) => (
                <div key={item.id || index} className="cart-item-card">
                  {item.image && (
                    <img src={item.image} alt={item.product} className="cart-item-image" />
                  )}
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.product}</h4>
                    <p className="cart-item-size">Size: <span>{item.size}</span></p>
                    <p className="cart-item-price">₹{item.price} each</p>

                    <div className="cart-item-qty-row">
                      <div className="qty-stepper">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(index, item.qty - 1)}
                          disabled={item.qty <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-number">{item.qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(index, item.qty + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="cart-item-total">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    className="cart-item-remove-btn"
                    onClick={() => removeFromCart(index)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        {cart.length > 0 && (
          <div className="modal-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Subtotal:</span>
              <span className="cart-total-amount">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <div className="cart-checkout-actions">
              <button className="btn-wa-checkout" onClick={handleWhatsAppCheckout}>
                <MessageCircle size={18} />
                <span>Order via WhatsApp (₹{total.toLocaleString('en-IN')})</span>
              </button>

              <button className="btn-clear-cart" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
