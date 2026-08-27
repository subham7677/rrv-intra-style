import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/products';

export default function ProductList({ onRequireAuth }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="product-section">
      {/* SECTION HEADER & SEARCH */}
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2 className="section-title">
            <Sparkles size={22} className="sparkle-icon" />
            <span>Personalized Gifts & Decor</span>
          </h2>
          <p className="section-subtitle">
            Custom-made photo products crafted with love and precision
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search custom gifts, lamps, cushions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="category-chips-container">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRequireAuth={onRequireAuth}
            />
          ))}
        </div>
      ) : (
        <div className="empty-search-state">
          <p className="empty-text">No products found matching "{searchQuery}"</p>
          <button
            className="btn-reset-filter"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            View All Products
          </button>
        </div>
      )}
    </main>
  );
}
