import { db, storage } from "../firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const PRODUCTS_COLLECTION = "products";

// Get all products
export const getProducts = async () => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Get single product
export const getProductById = async (id) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Upload image to Firebase Storage
export const uploadProductImage = async (file, productId) => {
    try {
      // Ensure we have a valid file
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file provided");
      }
      
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      // Use a simpler path structure to avoid folder issues
      const imageRef = ref(storage, `products/${productId}_${timestamp}_${safeFileName}`);
      
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

// Delete image from storage
export const deleteProductImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract path from URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
    if (pathMatch && pathMatch[1]) {
      const imagePath = pathMatch[1];
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    // Don't throw - we can still delete the product even if image deletion fails
  }
};

// Add new product
export const addProduct = async (productData, imageFile) => {
  try {
    // Create product without image first
    const productToAdd = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: productData.stock || 999,
      visible: productData.visible !== false
    };
    
    // Remove image field if it exists (we'll add it after upload)
    delete productToAdd.image;
    
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productToAdd);
    
    let imageUrl = null;
    
    // Upload image if provided
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile, docRef.id);
      // Update product with image URL
      await updateDoc(doc(db, PRODUCTS_COLLECTION, docRef.id), {
        image: imageUrl
      });
    }
    
    return { id: docRef.id, ...productToAdd, image: imageUrl };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData, newImageFile = null) => {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, id);
      
      // Get current product
      const currentProduct = await getProductById(id);
      
      // Prepare update data - start with product data
      let updateData = {
        ...productData,
        updatedAt: new Date()
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      // Remove image from updateData if it exists (we'll handle separately)
      delete updateData.image;
      
      // Handle image
      if (newImageFile && newImageFile instanceof File) {
        // Delete old image if exists
        if (currentProduct?.image) {
          await deleteProductImage(currentProduct.image);
        }
        // Upload new image
        const imageUrl = await uploadProductImage(newImageFile, id);
        updateData.image = imageUrl;
      }
      // If no new image, don't touch the image field - keep existing
      
      await updateDoc(productRef, updateData);
      
      // Return updated product info
      return { 
        id, 
        ...productData, 
        image: updateData.image || currentProduct?.image 
      };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

// Delete product
export const deleteProduct = async (id, imageUrl) => {
  try {
    // Delete image from storage if exists
    if (imageUrl) {
      await deleteProductImage(imageUrl);
    }
    // Delete product from Firestore
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Check if product exists by name
export const productExistsByName = async (name, excludeId = null) => {
  try {
    let q = query(collection(db, PRODUCTS_COLLECTION), where("name", "==", name));
    const snapshot = await getDocs(q);
    
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking product existence:", error);
    return false;
  }
};