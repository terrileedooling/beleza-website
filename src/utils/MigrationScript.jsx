import { useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { products as localProducts } from "../data/products";

const MigrationScript = () => {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = "info") => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  // Function to convert local image path to actual URL and upload to Firebase Storage
  const uploadImageToStorage = async (imagePath, productId) => {
    try {
      // For local development, we need to fetch the image first
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      // Convert to base64 for storage
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64String = reader.result;
            const imageRef = ref(storage, `products/${productId}/main-image.jpg`);
            await uploadString(imageRef, base64String, 'data_url');
            const downloadURL = await getDownloadURL(imageRef);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Failed to upload image for ${productId}:`, error);
      return null;
    }
  };

  // Alternative: Just use the existing image URLs (if they're already online)
  const migrateProductsSimple = async () => {
    setStatus("running");
    setProgress({ current: 0, total: localProducts.length });
    
    try {
      const productsCollection = collection(db, "products");
      
      for (let i = 0; i < localProducts.length; i++) {
        const product = localProducts[i];
        
        // Check if product already exists
        const existingQuery = query(
          productsCollection, 
          where("name", "==", product.name)
        );
        const existing = await getDocs(existingQuery);
        
        if (!existing.empty) {
          addLog(`⚠️ Product "${product.name}" already exists, skipping...`, "warning");
        } else {
          // Clean up price (convert "R850" to 850)
          const cleanPrice = parseFloat(product.price.replace(/[R,\s]/g, ""));
          
          // Prepare product data for Firestore
          const productData = {
            name: product.name,
            category: product.category,
            price: cleanPrice,
            description: product.description,
            image: product.image, // Keep original URL for now
            featured: [1, 2, 3].includes(product.id), // Mark first 3 as featured
            createdAt: new Date(),
            updatedAt: new Date(),
            stock: 999, // Default stock
            visible: true
          };
          
          // Add to Firestore
          const docRef = await addDoc(productsCollection, productData);
          addLog(`✅ Migrated: ${product.name} (ID: ${docRef.id})`, "success");
        }
        
        setProgress({ current: i + 1, total: localProducts.length });
      }
      
      addLog(`🎉 Migration complete! ${localProducts.length} products processed.`, "success");
      setStatus("complete");
    } catch (error) {
      addLog(`❌ Migration failed: ${error.message}`, "error");
      setStatus("error");
    }
  };

  // Advanced migration with image upload to Storage
  const migrateProductsWithImages = async () => {
    setStatus("running");
    setProgress({ current: 0, total: localProducts.length });
    
    try {
      const productsCollection = collection(db, "products");
      
      for (let i = 0; i < localProducts.length; i++) {
        const product = localProducts[i];
        
        // Check if product exists
        const existingQuery = query(
          productsCollection, 
          where("name", "==", product.name)
        );
        const existing = await getDocs(existingQuery);
        
        if (!existing.empty) {
          addLog(`⚠️ Product "${product.name}" already exists, skipping...`, "warning");
        } else {
          // Clean price
          const cleanPrice = parseFloat(product.price.replace(/[R,\s]/g, ""));
          
          // First create the product to get an ID
          const tempProductData = {
            name: product.name,
            category: product.category,
            price: cleanPrice,
            description: product.description,
            image: "", // Will update after upload
            featured: [1, 2, 3].includes(product.id),
            createdAt: new Date(),
            updatedAt: new Date(),
            stock: 999,
            visible: true
          };
          
          const docRef = await addDoc(productsCollection, tempProductData);
          
          // Upload image to Storage
          let imageUrl = product.image;
          try {
            const uploadedUrl = await uploadImageToStorage(product.image, docRef.id);
            if (uploadedUrl) {
              imageUrl = uploadedUrl;
              // Update product with new image URL
              await updateDoc(doc(db, "products", docRef.id), { image: imageUrl });
              addLog(`📸 Uploaded image for: ${product.name}`, "info");
            }
          } catch (imgError) {
            addLog(`⚠️ Could not upload image for ${product.name}, using original URL`, "warning");
          }
          
          addLog(`✅ Migrated: ${product.name}`, "success");
        }
        
        setProgress({ current: i + 1, total: localProducts.length });
      }
      
      addLog(`🎉 Migration complete!`, "success");
      setStatus("complete");
    } catch (error) {
      addLog(`❌ Migration failed: ${error.message}`, "error");
      setStatus("error");
    }
  };

  const deleteAllProducts = async () => {
    if (!window.confirm("⚠️ WARNING: This will delete ALL products from Firestore! Are you sure?")) {
      return;
    }
    
    setStatus("running");
    try {
      const productsCollection = collection(db, "products");
      const snapshot = await getDocs(productsCollection);
      
      let deleted = 0;
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
        deleted++;
        addLog(`🗑️ Deleted: ${doc.data().name}`, "info");
      }
      
      addLog(`✅ Deleted ${deleted} products`, "success");
      setStatus("complete");
    } catch (error) {
      addLog(`❌ Delete failed: ${error.message}`, "error");
      setStatus("error");
    }
  };

  if (status === "complete" || status === "error") {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 9999,
        padding: "20px",
        overflow: "auto",
        color: "white"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1>Migration {status === "complete" ? "Complete!" : "Failed"}</h1>
          <div style={{
            background: "#1e1e1e",
            padding: "15px",
            borderRadius: "8px",
            maxHeight: "500px",
            overflow: "auto",
            fontFamily: "monospace",
            fontSize: "12px"
          }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{
                color: log.type === "error" ? "#ff6b6b" : 
                       log.type === "warning" ? "#ffd93d" : 
                       log.type === "success" ? "#6bcb77" : "#fff",
                padding: "4px 0",
                borderBottom: "1px solid #333"
              }}>
                [{log.timestamp.toLocaleTimeString()}] {log.message}
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.9)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white"
    }}>
      <div style={{ textAlign: "center", maxWidth: "600px", padding: "20px" }}>
        <h1>Product Migration Tool</h1>
        <p>Migrate your local products to Firebase Firestore</p>
        
        {status === "running" && (
          <div>
            <div style={{
              width: "100%",
              height: "30px",
              background: "#333",
              borderRadius: "15px",
              overflow: "hidden",
              margin: "20px 0"
            }}>
              <div style={{
                width: `${(progress.current / progress.total) * 100}%`,
                height: "100%",
                background: "#4caf50",
                transition: "width 0.3s"
              }} />
            </div>
            <p>Progress: {progress.current} / {progress.total}</p>
            <div style={{
              background: "#1e1e1e",
              padding: "15px",
              borderRadius: "8px",
              maxHeight: "300px",
              overflow: "auto",
              textAlign: "left",
              fontFamily: "monospace",
              fontSize: "12px",
              marginTop: "20px"
            }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{
                  color: log.type === "error" ? "#ff6b6b" : 
                         log.type === "warning" ? "#ffd93d" : 
                         log.type === "success" ? "#6bcb77" : "#fff",
                  padding: "4px 0"
                }}>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {status === "idle" && (
          <div>
            <button 
              onClick={migrateProductsSimple}
              style={{
                padding: "12px 24px",
                margin: "10px",
                background: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              🚀 Migrate Products (Keep Original Images)
            </button>
            
            <button 
              onClick={migrateProductsWithImages}
              style={{
                padding: "12px 24px",
                margin: "10px",
                background: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              📸 Migrate + Upload Images to Storage
            </button>
            
            <hr style={{ margin: "20px 0", borderColor: "#444" }} />
            
            <button 
              onClick={deleteAllProducts}
              style={{
                padding: "12px 24px",
                margin: "10px",
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              🗑️ DELETE ALL PRODUCTS (Dangerous!)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationScript;