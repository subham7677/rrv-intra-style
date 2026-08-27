import React from 'react';
import { X, History, Clock, PackageCheck, MessageCircle, Trash2 } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import { useToast } from './Toast';
import { STORE_PHONE } from '../data/products';

export default function HistoryModal({ isOpen, onClose }) {
  const { history, clearHistory } = useHistory();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleReorder = (item) => {
    const message = `Hello RRV INTRA STYLE,\nI want to re-order:\n• Product: ${item.product}\n• Size: ${item.size}\n• Quantity: ${item.qty}`;
    const url = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    addToast('Opening WhatsApp to re-order item!', 'info');
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <History size={20} className="modal-icon" />
            <h3 className="modal-title">Order History</h3>
            {history.length > 0 && (
              <span className="modal-badge">{history.length} orders</span>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {history.length === 0 ? (
            <div className="empty-history-view">
              <PackageCheck size={48} strokeWidth={1.5} className="empty-history-icon" />
              <h4>No orders yet</h4>
              <p>When you place an order on WhatsApp, it will be listed here for easy tracking!</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((order, idx) => (
                <div key={order.id || idx} className="history-card">
                  <div className="history-card-header">
                    <h4 className="history-product-name">{order.product}</h4>
                    <span className="history-time">
                      <Clock size={12} /> {order.time}
                    </span>
                  </div>

                  <div className="history-details-row">
                    <span className="history-badge">Size: {order.size}</span>
                    <span className="history-badge">Qty: {order.qty}</span>
                    {order.price && (
                      <span className="history-price">₹{order.price}</span>
                    )}
                  </div>

                  <div className="history-actions">
                    <button
                      className="btn-history-reorder"
                      onClick={() => handleReorder(order)}
                    >
                      <MessageCircle size={14} />
                      <span>Re-order on WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {history.length > 0 && (
          <div className="modal-footer modal-footer-row">
            <button className="btn-clear-history" onClick={clearHistory}>
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
