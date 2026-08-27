import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Package,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useToast } from './Toast';

export default function AdminProductModal() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefaultProducts,
    isAdminOpen,
    adminEditingProduct,
    closeAdmin
  } = useProducts();

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState('Cushions');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [brand, setBrand] = useState('RRV Intra Style');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [stock, setStock] = useState('50');
  const [rating, setRating] = useState('4.9');
  const [sizesInput, setSizesInput] = useState('Standard');
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  // When adminEditingProduct changes (e.g. opened directly from ProductDetailModal or header)
  useEffect(() => {
    if (adminEditingProduct) {
      populateFormForEdit(adminEditingProduct);
    } else {
      resetForm();
    }
  }, [adminEditingProduct, isAdminOpen]);

  if (!isAdminOpen) return null;

  function resetForm() {
    setEditingId(null);
    setName('');
    setPrice('');
    setOldPrice('');
    setCategory(categories.find((c) => c !== 'All') || 'Cushions');
    setIsCustomCategory(false);
    setCustomCategory('');
    setBrand('RRV Intra Style');
    setDescription('');
    setImages([]);
    setImageUrlInput('');
    setStock('50');
    setRating('4.9');
    setSizesInput('Standard');
    setErrors({});
    setActiveTab('list');
  }

  function populateFormForEdit(prod) {
    setEditingId(prod.id);
    setName(prod.name || '');
    setPrice(prod.price !== undefined ? String(prod.price) : '');
    setOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
    
    if (categories.includes(prod.category)) {
      setCategory(prod.category);
      setIsCustomCategory(false);
      setCustomCategory('');
    } else {
      setIsCustomCategory(true);
      setCustomCategory(prod.category || '');
    }

    setBrand(prod.brand || 'RRV Intra Style');
    setDescription(prod.description || '');
    setImages(Array.isArray(prod.images) ? [...prod.images] : []);
    setImageUrlInput('');
    setStock(prod.stock !== undefined ? String(prod.stock) : '50');
    setRating(prod.rating !== undefined ? String(prod.rating) : '4.9');
    setSizesInput(Array.isArray(prod.sizes) ? prod.sizes.join(', ') : 'Standard');
    setErrors({});
    setActiveTab('form');
  }

  const handleOpenAddForm = () => {
    resetForm();
    setActiveTab('form');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        addToast(`File "${file.name}" is not an image`, 'error');
        return;
      }

      // Max file size 8MB
      if (file.size > 8 * 1024 * 1024) {
        addToast(`Image "${file.name}" exceeds 8MB limit`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const resultUrl = loadEvt.target.result;
        setImages((prev) => [...prev, resultUrl]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  const validateForm = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = 'Product name is required';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = 'Please enter a valid price greater than 0';
    }

    if (oldPrice && (isNaN(Number(oldPrice)) || Number(oldPrice) <= 0)) {
      errs.oldPrice = 'Old price must be a valid positive number';
    } else if (oldPrice && Number(oldPrice) <= Number(price)) {
      errs.oldPrice = 'Discount / Old price should be higher than the selling price';
    }

    const finalCat = isCustomCategory ? customCategory.trim() : category;
    if (!finalCat) {
      errs.category = 'Please select or enter a category';
    }

    if (images.length === 0) {
      errs.images = 'Please upload or add at least one product image';
    }

    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      errs.stock = 'Please enter a valid stock quantity (0 or more)';
    }

    if (rating === '' || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      errs.rating = 'Rating must be a number between 1.0 and 5.0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Please fix validation errors before saving', 'error');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    const parsedSizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload = {
      name: name.trim(),
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      category: finalCategory,
      brand: brand.trim() || 'RRV Intra Style',
      description: description.trim(),
      images: images.length > 0 ? images : ['/logo.jpeg'],
      sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
      stock: Number(stock),
      rating: Number(rating)
    };

    if (editingId) {
      updateProduct(editingId, productPayload);
      addToast(`"${productPayload.name}" updated successfully!`, 'success');
    } else {
      addProduct(productPayload);
      addToast(`"${productPayload.name}" added to catalog!`, 'success');
    }

    resetForm();
  };

  const handleDelete = (id, prodName) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    addToast(`"${prodName}" deleted from catalog`, 'info');
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset all products to the default 10 catalog items? Custom additions will be replaced.')) {
      resetToDefaultProducts();
      addToast('Product catalog reset to default items', 'info');
      resetForm();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      filterCategory === 'All' || p.category?.toLowerCase() === filterCategory.toLowerCase();
    const matchesQuery =
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="modal-backdrop animate-fade-in" onClick={closeAdmin}>
      <div
        className="modal-admin-dialog animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ADMIN MODAL HEADER */}
        <div className="admin-modal-header">
          <div className="admin-header-title-wrap">
            <div className="admin-title-badge">
              <Layers size={18} />
              <span>Admin Panel</span>
            </div>
            <h3 className="admin-modal-title">Product Management System</h3>
          </div>

          <div className="admin-header-actions">
            {activeTab === 'list' ? (
              <button className="btn-admin-add-new" onClick={handleOpenAddForm}>
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            ) : (
              <button className="btn-admin-back" onClick={() => setActiveTab('list')}>
                <ArrowLeft size={16} />
                <span>Back to Catalog</span>
              </button>
            )}

            <button className="modal-close-btn" onClick={closeAdmin} aria-label="Close admin">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUCT LIST & MANAGEMENT DASHBOARD */}
        {activeTab === 'list' && (
          <div className="admin-body-list">
            {/* TOOLBAR: SEARCH & CATEGORY FILTER */}
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Search products by title, category, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
                {searchTerm && (
                  <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                    ×
                  </button>
                )}
              </div>

              <div className="admin-filter-wrap">
                <SlidersHorizontal size={15} className="admin-filter-icon" />
                <select
                  className="admin-category-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-stats-badge">
                <span>{filteredProducts.length} of {products.length} Products</span>
              </div>
            </div>

            {/* PRODUCT TABLE / CARDS */}
            <div className="admin-table-container">
              {filteredProducts.length === 0 ? (
                <div className="admin-empty-state">
                  <Package size={44} className="admin-empty-icon" />
                  <h4>No products found</h4>
                  <p>Try searching for a different keyword or create a new product.</p>
                  <button className="btn-admin-add-new" onClick={handleOpenAddForm}>
                    <Plus size={16} />
                    <span>Add New Product</span>
                  </button>
                </div>
              ) : (
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Image</th>
                      <th>Product Details</th>
                      <th>Category</th>
                      <th>Price & Discount</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => {
                      const primaryImg =
                        Array.isArray(prod.images) && prod.images.length > 0
                          ? prod.images[0]
                          : '/logo.jpeg';
                      const isConfirmingDelete = deleteConfirmId === prod.id;

                      return (
                        <tr key={prod.id} className="admin-table-row">
                          {/* IMAGE */}
                          <td>
                            <div className="admin-thumb-box">
                              <img src={primaryImg} alt={prod.name} className="admin-thumb-img" />
                              {prod.images?.length > 1 && (
                                <span className="img-count-badge">+{prod.images.length - 1}</span>
                              )}
                            </div>
                          </td>

                          {/* PRODUCT NAME & BRAND */}
                          <td>
                            <div className="admin-prod-info">
                              <span className="admin-prod-name">{prod.name}</span>
                              <span className="admin-prod-brand">
                                {prod.brand || 'RRV Intra Style'} • {prod.sizes?.join(', ') || 'Standard'}
                              </span>
                            </div>
                          </td>

                          {/* CATEGORY */}
                          <td>
                            <span className="admin-category-badge">{prod.category}</span>
                          </td>

                          {/* PRICE */}
                          <td>
                            <div className="admin-price-col">
                              <span className="admin-prod-price">
                                ₹{Number(prod.price).toLocaleString('en-IN')}
                              </span>
                              {prod.oldPrice && prod.oldPrice > prod.price && (
                                <span className="admin-prod-old-price">
                                  ₹{Number(prod.oldPrice).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* STOCK */}
                          <td>
                            <span
                              className={`admin-stock-badge ${
                                (prod.stock ?? 50) <= 5 ? 'low' : 'ok'
                              }`}
                            >
                              {prod.stock ?? 50} in stock
                            </span>
                          </td>

                          {/* RATING */}
                          <td>
                            <div className="admin-rating-cell">
                              <Star size={14} className="star-filled" />
                              <span>{Number(prod.rating ?? 4.9).toFixed(1)}</span>
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td style={{ textAlign: 'right' }}>
                            {isConfirmingDelete ? (
                              <div className="admin-delete-confirm-box">
                                <span className="confirm-text">Delete?</span>
                                <button
                                  className="btn-confirm-yes"
                                  onClick={() => handleDelete(prod.id, prod.name)}
                                  title="Confirm Delete"
                                >
                                  Yes
                                </button>
                                <button
                                  className="btn-confirm-no"
                                  onClick={() => setDeleteConfirmId(null)}
                                  title="Cancel"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="admin-actions-cell">
                                <button
                                  className="btn-action-edit"
                                  onClick={() => populateFormForEdit(prod)}
                                  title="Edit Product"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  className="btn-action-delete"
                                  onClick={() => setDeleteConfirmId(prod.id)}
                                  title="Delete Product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* ADMIN FOOTER */}
            <div className="admin-modal-footer">
              <button className="btn-admin-reset-default" onClick={handleResetCatalog}>
                <RotateCcw size={14} />
                <span>Reset to Default 10 Products</span>
              </button>
              <button className="btn-secondary" onClick={closeAdmin}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT PRODUCT FORM */}
        {activeTab === 'form' && (
          <form className="admin-body-form" onSubmit={handleSubmit}>
            <div className="form-scroll-content">
              <div className="form-section-banner">
                <h4>{editingId ? 'Edit Product Details' : 'Create New Product'}</h4>
                <p>Fill out the required information below. Changes will sync immediately to the product catalog.</p>
              </div>

              <div className="admin-form-grid">
                {/* 1. PRODUCT NAME */}
                <div className="admin-form-group col-span-2">
                  <label className="admin-form-label required">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Personalized Magic Mirror LED Frame"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`admin-form-input ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && <span className="field-error-text">{errors.name}</span>}
                </div>

                {/* 2. CATEGORY */}
                <div className="admin-form-group">
                  <label className="admin-form-label required">Category</label>
                  {!isCustomCategory ? (
                    <div className="select-with-add">
                      <select
                        value={category}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCustomCategory(true);
                          } else {
                            setCategory(e.target.value);
                          }
                        }}
                        className={`admin-form-select ${errors.category ? 'input-error' : ''}`}
                      >
                        {categories
                          .filter((c) => c !== 'All')
                          .map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        <option value="__add_new__">+ Add New Category...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="custom-category-input-wrap">
                      <input
                        type="text"
                        placeholder="Enter new category name..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className={`admin-form-input ${errors.category ? 'input-error' : ''}`}
                      />
                      <button
                        type="button"
                        className="btn-cancel-custom-cat"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCustomCategory('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {errors.category && <span className="field-error-text">{errors.category}</span>}
                </div>

                {/* 3. BRAND */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. RRV Intra Style"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                {/* 4. PRICE */}
                <div className="admin-form-group">
                  <label className="admin-form-label required">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 799"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`admin-form-input ${errors.price ? 'input-error' : ''}`}
                  />
                  {errors.price && <span className="field-error-text">{errors.price}</span>}
                </div>

                {/* 5. OLD / DISCOUNT PRICE */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Original / Old Price (₹) <span className="label-sub">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 999 (shows strikethrough)"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    className={`admin-form-input ${errors.oldPrice ? 'input-error' : ''}`}
                  />
                  {errors.oldPrice && <span className="field-error-text">{errors.oldPrice}</span>}
                </div>

                {/* 6. STOCK */}
                <div className="admin-form-group">
                  <label className="admin-form-label required">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={`admin-form-input ${errors.stock ? 'input-error' : ''}`}
                  />
                  {errors.stock && <span className="field-error-text">{errors.stock}</span>}
                </div>

                {/* 7. RATING */}
                <div className="admin-form-group">
                  <label className="admin-form-label required">Product Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    placeholder="e.g. 4.9"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className={`admin-form-input ${errors.rating ? 'input-error' : ''}`}
                  />
                  {errors.rating && <span className="field-error-text">{errors.rating}</span>}
                </div>

                {/* 8. SIZES / VARIANTS */}
                <div className="admin-form-group col-span-2">
                  <label className="admin-form-label">
                    Sizes / Variants <span className="label-sub">(Comma separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standard, 16x16, 4x6, King Size"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="admin-form-input"
                  />
                </div>

                {/* 9. DESCRIPTION */}
                <div className="admin-form-group col-span-2">
                  <label className="admin-form-label">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide highlights, material details, and personalization features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="admin-form-textarea"
                  />
                </div>

                {/* 10. PRODUCT IMAGES (MULTIPLE IMAGES & UPLOAD) */}
                <div className="admin-form-group col-span-2">
                  <label className="admin-form-label required">
                    Product Images <span className="label-sub">(Upload multiple files or enter image URLs)</span>
                  </label>

                  {/* UPLOAD CONTROLS */}
                  <div className="image-uploader-box">
                    <div
                      className="upload-dropzone"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <UploadCloud size={28} className="upload-icon" />
                      <div className="upload-dropzone-text">
                        <span className="upload-main-text">Click to upload product photos</span>
                        <span className="upload-sub-text">PNG, JPG, JPEG, WEBP up to 8MB each</span>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div className="upload-or-divider">
                      <span>OR</span>
                    </div>

                    <div className="image-url-add-row">
                      <input
                        type="url"
                        placeholder="Paste image URL (e.g. /custom-photo.jpg or https://...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="admin-form-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-add-img-url"
                        onClick={handleAddImageUrl}
                      >
                        <Plus size={16} />
                        <span>Add URL</span>
                      </button>
                    </div>
                  </div>

                  {errors.images && <span className="field-error-text">{errors.images}</span>}

                  {/* IMAGE PREVIEWS */}
                  {images.length > 0 && (
                    <div className="image-previews-grid">
                      {images.map((imgUrl, idx) => (
                        <div key={idx} className="preview-image-card">
                          <img src={imgUrl} alt={`Preview ${idx + 1}`} className="preview-thumb" />
                          <div className="preview-overlay">
                            {idx === 0 ? (
                              <span className="badge-primary-image">Primary</span>
                            ) : (
                              <button
                                type="button"
                                className="btn-set-primary"
                                onClick={() => handleSetPrimaryImage(idx)}
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-remove-preview"
                              onClick={() => handleRemoveImage(idx)}
                              title="Delete image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FORM FOOTER BUTTONS */}
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab('list')}
              >
                Cancel
              </button>
              <button type="submit" className="btn-admin-save">
                <CheckCircle2 size={18} />
                <span>{editingId ? 'Update Product' : 'Save & Publish Product'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
