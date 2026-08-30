import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
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
const COLLECTION = 'catalog_products';

function toFirestoreProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price) || 0,
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    category: product.category || 'Custom Gifts',
    brand: product.brand || 'RRV Intra Style',
    description: product.description || '',
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/logo.jpeg'],
    sizes: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['Standard'],
    stock: product.stock !== undefined && product.stock !== '' ? Number(product.stock) : 50,
    rating: product.rating !== undefined && product.rating !== '' ? Number(product.rating) : 4.9,
    reviewsCount: product.reviewsCount || 0,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || null
  };
}

function hasInlineImages(products) {
  return products.some((p) =>
    (p.images || []).some((img) => typeof img === 'string' && img.startsWith('data:'))
  );
}

async function persistImages(productId, images) {
  const next = [];
  for (let i = 0; i < images.length; i += 1) {
    const img = images[i];
    if (typeof img === 'string' && img.startsWith('data:')) {
      const storageRef = ref(storage, `products/${productId}/${i}-${Date.now()}`);
      await uploadString(storageRef, img, 'data_url');
      next.push(await getDownloadURL(storageRef));
    } else {
      next.push(img);
    }
  }
  return next;
}

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
  const [catalogReady, setCatalogReady] = useState(false);
  const localSeedRef = React.useRef(products);

  useEffect(() => {
    let didSeed = false;
    const colRef = collection(db, COLLECTION);

    const unsub = onSnapshot(
      colRef,
      async (snap) => {
        if (snap.empty) {
          if (didSeed) {
            setCatalogReady(true);
            return;
          }
          didSeed = true;
          try {
            const extras = (localSeedRef.current || []).filter(
              (p) => !DEFAULT_PRODUCTS.some((d) => d.id === p.id)
            );
            const toSeed = [...DEFAULT_PRODUCTS, ...extras];
            const batch = writeBatch(db);
            for (const p of toSeed) {
              const images = await persistImages(p.id, p.images || ['/logo.jpeg']);
              batch.set(doc(db, COLLECTION, p.id), toFirestoreProduct({ ...p, images }));
            }
            await batch.commit();
          } catch (e) {
            console.error('Failed to seed product catalog:', e);
            setCatalogReady(true);
          }
          return;
        }

        const list = snap.docs.map((d) => {
          const data = d.data();
          return toFirestoreProduct({ ...data, id: d.id });
        });
        list.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        setProducts(list);
        setCatalogReady(true);
      },
      (err) => {
        console.error('Failed to sync product catalog:', err);
        setCatalogReady(true);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (hasInlineImages(products)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  }, [products]);

  useEffect(() => {
    if (selectedProduct) {
      const current = products.find((p) => p.id === selectedProduct.id);
      if (current) {
        setSelectedProduct(current);
      }
    }
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(['All', ...DEFAULT_CATEGORIES]);
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [products]);

  const addProduct = async (productData) => {
    const newProduct = toFirestoreProduct({
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: productData.name?.trim() || 'Untitled Product',
      price: Number(productData.price) || 0,
      oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
      category: productData.category?.trim() || 'Custom Gifts',
      brand: productData.brand?.trim() || 'RRV Intra Style',
      description: productData.description?.trim() || '',
      images:
        Array.isArray(productData.images) && productData.images.length > 0
          ? productData.images
          : ['/logo.jpeg'],
      sizes:
        Array.isArray(productData.sizes) && productData.sizes.length > 0
          ? productData.sizes
          : ['Standard'],
      stock: productData.stock !== undefined && productData.stock !== '' ? Number(productData.stock) : 50,
      rating: productData.rating !== undefined && productData.rating !== '' ? Number(productData.rating) : 4.9,
      reviewsCount: productData.reviewsCount || Math.floor(Math.random() * 20 + 5),
      createdAt: new Date().toISOString()
    });

    setProducts((prev) => [newProduct, ...prev]);

    try {
      const images = await persistImages(newProduct.id, newProduct.images);
      const published = { ...newProduct, images };
      await setDoc(doc(db, COLLECTION, newProduct.id), published);
      setProducts((prev) => prev.map((p) => (p.id === newProduct.id ? published : p)));
      return published;
    } catch (e) {
      console.error('Failed to publish product:', e);
      throw new Error(
        'Product saved on this device only. Enable Cloud Firestore and Storage (test mode) in Firebase so customers can see it.'
      );
    }
  };

  const updateProduct = async (id, updatedData) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;

    const merged = toFirestoreProduct({
      ...current,
      ...updatedData,
      id,
      name: updatedData.name !== undefined ? updatedData.name.trim() : current.name,
      price: updatedData.price !== undefined ? Number(updatedData.price) : current.price,
      oldPrice:
        updatedData.oldPrice !== undefined
          ? updatedData.oldPrice
            ? Number(updatedData.oldPrice)
            : null
          : current.oldPrice,
      category: updatedData.category !== undefined ? updatedData.category.trim() : current.category,
      brand:
        updatedData.brand !== undefined
          ? updatedData.brand.trim()
          : current.brand || 'RRV Intra Style',
      description:
        updatedData.description !== undefined ? updatedData.description.trim() : current.description,
      images:
        Array.isArray(updatedData.images) && updatedData.images.length > 0
          ? updatedData.images
          : current.images,
      sizes:
        Array.isArray(updatedData.sizes) && updatedData.sizes.length > 0
          ? updatedData.sizes
          : current.sizes,
      stock: updatedData.stock !== undefined ? Number(updatedData.stock) : current.stock ?? 50,
      rating: updatedData.rating !== undefined ? Number(updatedData.rating) : current.rating ?? 4.9,
      updatedAt: new Date().toISOString()
    });

    setProducts((prev) => prev.map((item) => (item.id === id ? merged : item)));

    try {
      const images = await persistImages(id, merged.images);
      const published = { ...merged, images };
      await setDoc(doc(db, COLLECTION, id), published);
      setProducts((prev) => prev.map((item) => (item.id === id ? published : item)));
    } catch (e) {
      console.error('Failed to update product:', e);
      throw new Error(
        'Update saved on this device only. Enable Cloud Firestore and Storage in Firebase so customers see the change.'
      );
    }
  };

  const deleteProduct = async (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (e) {
      console.error('Failed to delete product in cloud:', e);
      throw new Error('Could not delete this product for all customers. Check Firebase permissions.');
    }
  };

  const resetToDefaultProducts = async () => {
    setProducts(DEFAULT_PRODUCTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }

    try {
      const batch = writeBatch(db);
      products.forEach((p) => {
        batch.delete(doc(db, COLLECTION, p.id));
      });
      DEFAULT_PRODUCTS.forEach((p) => {
        batch.set(doc(db, COLLECTION, p.id), toFirestoreProduct(p));
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed to reset cloud catalog:', e);
      throw new Error('Could not reset the catalog for all customers. Check Firebase permissions.');
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
    catalogReady,
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
