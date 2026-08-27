import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '../data/products';

const ProductContext = createContext();

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

const STORAGE_KEY = 'rrv_products_v1';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load products from localStorage:', e);
    }
    return DEFAULT_PRODUCTS;
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminEditingProduct, setAdminEditingProduct] = useState(null);

  // Sync to localStorage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  }, [products]);

  // Keep selectedProduct in sync if it is updated/edited
  useEffect(() => {
    if (selectedProduct) {
      const current = products.find((p) => p.id === selectedProduct.id);
      if (current) {
        setSelectedProduct(current);
      }
    }
  }, [products]);

  // Dynamically compute all categories from products and default list
  const categories = useMemo(() => {
    const set = new Set(['All', ...DEFAULT_CATEGORIES]);
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [products]);

  const addProduct = (productData) => {
    const newProduct = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: productData.name?.trim() || 'Untitled Product',
      price: Number(productData.price) || 0,
      oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
      category: productData.category?.trim() || 'Custom Gifts',
      brand: productData.brand?.trim() || 'RRV Intra Style',
      description: productData.description?.trim() || '',
      images: Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : ['/logo.jpeg'],
      sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0
        ? productData.sizes
        : ['Standard'],
      stock: productData.stock !== undefined && productData.stock !== '' ? Number(productData.stock) : 50,
      rating: productData.rating !== undefined && productData.rating !== '' ? Number(productData.rating) : 4.9,
      reviewsCount: productData.reviewsCount || Math.floor(Math.random() * 20 + 5),
      createdAt: new Date().toISOString()
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedData,
            name: updatedData.name !== undefined ? updatedData.name.trim() : item.name,
            price: updatedData.price !== undefined ? Number(updatedData.price) : item.price,
            oldPrice: updatedData.oldPrice !== undefined ? (updatedData.oldPrice ? Number(updatedData.oldPrice) : null) : item.oldPrice,
            category: updatedData.category !== undefined ? updatedData.category.trim() : item.category,
            brand: updatedData.brand !== undefined ? updatedData.brand.trim() : (item.brand || 'RRV Intra Style'),
            description: updatedData.description !== undefined ? updatedData.description.trim() : item.description,
            images: Array.isArray(updatedData.images) && updatedData.images.length > 0 ? updatedData.images : item.images,
            sizes: Array.isArray(updatedData.sizes) && updatedData.sizes.length > 0 ? updatedData.sizes : item.sizes,
            stock: updatedData.stock !== undefined ? Number(updatedData.stock) : (item.stock ?? 50),
            rating: updatedData.rating !== undefined ? Number(updatedData.rating) : (item.rating ?? 4.9),
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
  };

  const resetToDefaultProducts = () => {
    setProducts(DEFAULT_PRODUCTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const openAdmin = (productToEdit = null) => {
    setAdminEditingProduct(productToEdit);
    setIsAdminOpen(true);
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    setAdminEditingProduct(null);
  };

  const value = {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefaultProducts,
    selectedProduct,
    openProductDetail,
    closeProductDetail,
    isAdminOpen,
    adminEditingProduct,
    openAdmin,
    closeAdmin
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
