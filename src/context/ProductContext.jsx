import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from "../services/productService";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single product by ID
  const getProduct = async (id) => {
    try {
      return await getProductById(id);
    } catch (err) {
      console.error("Failed to get product:", err);
      throw err;
    }
  };

  // Add new product
  const createProduct = async (productData, imageFile) => {
    try {
      const newProduct = await addProduct(productData, imageFile);
      await loadProducts(); // Refresh list
      return newProduct;
    } catch (err) {
      console.error("Failed to create product:", err);
      throw err;
    }
  };

// Edit product
const editProduct = async (id, productData, imageFile) => {
    try {
      // Make sure imageFile is null if not provided (not undefined)
      const updated = await updateProduct(id, productData, imageFile || null);
      await loadProducts(); // Refresh list
      return updated;
    } catch (err) {
      console.error("Failed to update product:", err);
      throw err;
    }
  };

  // Remove product
  const removeProduct = async (id, imageUrl) => {
    try {
      await deleteProduct(id, imageUrl);
      await loadProducts(); // Refresh list
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      loadProducts,
      getProduct,
      createProduct,
      editProduct,
      removeProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);