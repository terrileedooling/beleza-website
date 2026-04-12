import React, { useState, useRef } from "react";
import { useProducts } from "../context/ProductContext";
import { compressImage, validateImage, getImageDimensions } from "../utils/CompressImage";
import "../styles/product-management.css";

// Configuration Constants
const MAX_PRODUCTS = 200; // Maximum products allowed in store
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 5000;
const MIN_PRICE = 0;
const MAX_PRICE = 50000;
const ALLOWED_CATEGORIES = ["Hair", "Sea Moss", "Wellness", "GLP-1 Peptides", "Body"];

const ProductManagement = () => {
  const { products, createProduct, editProduct, removeProduct, loading } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    featured: false,
    stock: 999,
    visible: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [imageError, setImageError] = useState("");

  const categories = ALLOWED_CATEGORIES;

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      description: "",
      featured: false,
      stock: 999,
      visible: true
    });
    setImageFile(null);
    setImagePreview("");
    setEditingProduct(null);
    setFormErrors({});
    setImageError("");
    setCompressionProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description,
      featured: product.featured || false,
      stock: product.stock || 999,
      visible: product.visible !== false
    });
    setImagePreview(product.image);
    setShowForm(true);
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.length > MAX_NAME_LENGTH) {
      errors.name = `Product name must be less than ${MAX_NAME_LENGTH} characters`;
    }
    
    // Category validation
    if (!formData.category) {
      errors.category = "Category is required";
    } else if (!ALLOWED_CATEGORIES.includes(formData.category)) {
      errors.category = "Invalid category selected";
    }
    
    // Price validation
    if (!formData.price) {
      errors.price = "Price is required";
    } else if (isNaN(parseFloat(formData.price))) {
      errors.price = "Price must be a number";
    } else if (parseFloat(formData.price) < MIN_PRICE) {
      errors.price = `Price cannot be less than R${MIN_PRICE}`;
    } else if (parseFloat(formData.price) > MAX_PRICE) {
      errors.price = `Price cannot exceed R${MAX_PRICE.toLocaleString()}`;
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }
    
    // Stock validation
    if (formData.stock && (isNaN(formData.stock) || formData.stock < 0)) {
      errors.stock = "Stock must be a positive number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle image selection with validation and compression
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageError("");
    setCompressionProgress(0);
    
    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      setImageError(validation.error);
      return;
    }
    
    try {
      // Get original dimensions
      const dimensions = await getImageDimensions(file);
      console.log(`Original image: ${dimensions.width}x${dimensions.height}, ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      setCompressionProgress(25);
      
      // Compress image
      const compressedBlob = await compressImage(file, {
        maxSizeMB: 1, // Target 1MB max
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      });
      
      setCompressionProgress(75);
      
      // Create new File from compressed blob
      const compressedFile = new File(
        [compressedBlob], 
        file.name.replace(/\.[^/.]+$/, '.jpg'), 
        { type: 'image/jpeg' }
      );
      
      const compressedSizeMB = compressedFile.size / 1024 / 1024;
      console.log(`Compressed: ${compressedSizeMB.toFixed(2)}MB (${((1 - compressedFile.size/file.size) * 100).toFixed(1)}% reduction)`);
      
      // Check if compression was effective
      if (compressedSizeMB > 2) {
        setImageError(`Image still too large after compression (${compressedSizeMB.toFixed(2)}MB). Please choose a smaller image.`);
        return;
      }
      
      setImageFile(compressedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCompressionProgress(100);
        setTimeout(() => setCompressionProgress(0), 1000);
      };
      reader.readAsDataURL(compressedBlob);
      
    } catch (error) {
      console.error("Image compression failed:", error);
      setImageError(`Failed to process image: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check product limit when adding new product
    if (!editingProduct && products.length >= MAX_PRODUCTS) {
      alert(`Maximum product limit of ${MAX_PRODUCTS} reached. Cannot add more products.`);
      return;
    }
    
    // Check if image is required for new products
    if (!editingProduct && !imageFile && !imagePreview) {
      setImageError("Product image is required for new products");
      return;
    }
    
    setIsSubmitting(true);
    
    const productData = {
      name: formData.name.trim(),
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      featured: formData.featured,
      stock: parseInt(formData.stock) || 999,
      visible: formData.visible,
      updatedAt: new Date()
    };

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, productData, imageFile);
        alert("Product updated successfully!");
      } else {
        await createProduct(productData, imageFile);
        alert("Product added successfully!");
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Save error:", error);
      alert(`Failed to save product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    // Additional safety checks
    if (product.name.toLowerCase().includes("test") && window.confirm("This appears to be a test product. Delete anyway?")) {
      // Allow deletion
    } else if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await removeProduct(product.id, product.image);
      alert("Product deleted successfully!");
    } catch (error) {
      alert(`Failed to delete product: ${error.message}`);
    }
  };

  // Get remaining product slots
  const remainingSlots = MAX_PRODUCTS - products.length;
  const isNearLimit = remainingSlots <= 10;

  if (loading) {
    return (
      <div className="product-management-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="pm-header">
        <div>
          <h2>Product Management</h2>
          <div className="product-stats">
            <span className={`product-count ${isNearLimit ? 'warning' : ''}`}>
              {products.length} / {MAX_PRODUCTS} products
              {remainingSlots <= 5 && (
                <span className="limit-warning"> ⚠️ Only {remainingSlots} slots left!</span>
              )}
            </span>
          </div>
        </div>
        <button 
          className="add-product-btn" 
          onClick={() => { 
            if (products.length >= MAX_PRODUCTS) {
              alert(`Maximum product limit of ${MAX_PRODUCTS} reached. Cannot add more products.`);
              return;
            }
            resetForm(); 
            setShowForm(true); 
          }}
          disabled={products.length >= MAX_PRODUCTS}
        >
          <i className="fas fa-plus"></i> Add New Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="pm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button className="close-modal" onClick={() => setShowForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="pm-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, MAX_NAME_LENGTH) })}
                    className={formErrors.name ? "error" : ""}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder={`Max ${MAX_NAME_LENGTH} characters`}
                  />
                  <small className="character-count">
                    {formData.name.length}/{MAX_NAME_LENGTH}
                  </small>
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={formErrors.category ? "error" : ""}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && <span className="error-text">{formErrors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (R) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={formErrors.price ? "error" : ""}
                  />
                  <small>Min: R{MIN_PRICE}, Max: R{MAX_PRICE.toLocaleString()}</small>
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className={formErrors.stock ? "error" : ""}
                  />
                  {formErrors.stock && <span className="error-text">{formErrors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Product Image {!editingProduct && "*"}</label>
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className={imageError ? "error" : ""}
                />
                <small>
                  Max size: 5MB before compression. Supported: JPG, PNG, WEBP
                  <br />
                  Images are automatically compressed to ~1MB and resized to max 1200x1200px
                </small>
                
                {compressionProgress > 0 && (
                  <div className="compression-progress">
                    <div 
                      className="compression-bar" 
                      style={{ width: `${compressionProgress}%` }}
                    />
                    <span>Compressing image... {compressionProgress}%</span>
                  </div>
                )}
                
                {imageError && <span className="error-text">{imageError}</span>}
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setImageError("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <i className="fas fa-times"></i> Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, MAX_DESCRIPTION_LENGTH) })}
                  className={formErrors.description ? "error" : ""}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  placeholder="Full product description..."
                />
                <small className="character-count">
                  {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                </small>
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Featured Product (show on homepage)
                  </label>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                    />
                    Visible in store (hide temporarily if unchecked)
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        <div className="table-controls">
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="product-search"
              // Add search functionality as needed
            />
            <select className="category-filter">
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-products-cell">
                  <i className="fas fa-box-open"></i>
                  <p>No products yet. Click "Add New Product" to get started.</p>
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className={!product.visible ? "inactive-product" : ""}>
                  <td className="product-image-cell">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="product-thumb" />
                    ) : (
                      <div className="no-image-placeholder">
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                  </td>
                  <td className="product-name-cell">
                    {product.name}
                    {product.featured && <span className="featured-badge">Featured</span>}
                  </td>
                  <td><span className="category-badge">{product.category}</span></td>
                  <td className="product-price-cell">R{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</td>
                  <td className={`stock-cell ${product.stock <= 10 ? 'low-stock' : ''}`}>
                    {product.stock || 999}
                    {product.stock <= 10 && product.stock > 0 && <span className="low-stock-warning"> Low stock!</span>}
                    {product.stock === 0 && <span className="out-of-stock"> Out of stock</span>}
                  </td>
                  <td>
                    <span className={`status-badge ${product.visible !== false ? 'active' : 'inactive'}`}>
                      {product.visible !== false ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="product-actions-cell">
                    <button className="edit-btn" onClick={() => handleEdit(product)} title="Edit product">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(product)} title="Delete product">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;