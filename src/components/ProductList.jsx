import React, { useState } from 'react';
import { Search, Sparkles, Plus, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';

export default function ProductList({ onRequireAuth }) {
  const { products, categories, openAdmin } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="product-section">
      {/* SECTION HEADER & SEARCH */}
      <div className="section-header-row">
        <div className="section-title-wrap">
          <div className="section-title-flex">
            <h2 className="section-title">
              <Sparkles size={22} className="sparkle-icon" />
              <span>Personalized Gifts & Decor</span>
            </h2>
            <button
              className="btn-header-add-product"
              onClick={() => openAdmin(null)}
              title="Add a new product to catalog"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
          <p className="section-subtitle">
            Custom-made photo products crafted with love and precision • {products.length} products available
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
        {categories.map((category) => (
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
          <div className="empty-state-actions">
            <button
              className="btn-reset-filter"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              View All Products
            </button>
            <button className="btn-empty-add-prod" onClick={() => openAdmin(null)}>
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
