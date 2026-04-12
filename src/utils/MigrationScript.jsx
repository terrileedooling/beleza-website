import { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { products as localProducts } from "../data/products";

const MigrationScript = () => {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState([]);
  const [productsToMigrate, setProductsToMigrate] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);

  const addLog = (message, type = "info") => {
    setLogs(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date(),
      id: Date.now() + Math.random()
    }]);
  };

  // Check existing products in Firestore
  const checkExistingProducts = async () => {
    addLog("🔍 Checking existing products in Firestore...", "info");
    try {
      const productsCollection = collection(db, "products");
      const snapshot = await getDocs(productsCollection);
      const existing = [];
      snapshot.forEach(doc => {
        existing.push({
          id: doc.id,
          name: doc.data().name,
          featured: doc.data().featured,
          visible: doc.data().visible
        });
      });
      setExistingProducts(existing);
      
      if (existing.length > 0) {
        addLog(`📋 Found ${existing.length} existing products in Firestore`, "warning");
        existing.forEach(p => {
          addLog(`   - ${p.name} (ID: ${p.id})`, "info");
        });
      } else {
        addLog(`✅ No existing products found. Ready to migrate.`, "success");
      }
      
      return existing;
    } catch (error) {
      addLog(`❌ Error checking products: ${error.message}`, "error");
      return [];
    }
  };

  // Prepare products for migration (avoid duplicates)
  const prepareMigration = async () => {
    addLog("📝 Preparing products for migration...", "info");
    
    const existing = await checkExistingProducts();
    const existingNames = existing.map(p => p.name.toLowerCase());
    
    const newProducts = localProducts.filter(p => 
      !existingNames.includes(p.name.toLowerCase())
    );
    
    setProductsToMigrate(newProducts);
    
    if (newProducts.length === 0) {
      addLog("⚠️ No new products to migrate. All products already exist!", "warning");
    } else {
      addLog(`📦 Found ${newProducts.length} new products to migrate`, "success");
      newProducts.forEach(p => {
        addLog(`   - ${p.name} (${p.category})`, "info");
      });
    }
    
    return newProducts;
  };

  // Fetch image and convert to blob
  const fetchImageAsBlob = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.warn(`Failed to fetch image: ${imageUrl}`, error);
      return null;
    }
  };

  // Upload image to Firebase Storage
  const uploadImageToStorage = async (imageUrl, productId, productName) => {
    try {
      // If it's already a Firebase Storage URL, return as is
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        addLog(`   📸 Image already in Firebase Storage`, "info");
        return imageUrl;
      }
      
      // Fetch the image
      const blob = await fetchImageAsBlob(imageUrl);
      if (!blob) {
        addLog(`   ⚠️ Could not fetch image, using placeholder`, "warning");
        return null;
      }
      
      // Upload to Firebase Storage
      const timestamp = Date.now();
      const safeName = productName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const imageRef = ref(storage, `products/${productId}/${timestamp}_${safeName}.jpg`);
      
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      
      addLog(`   📸 Image uploaded successfully`, "success");
      return downloadURL;
    } catch (error) {
      addLog(`   ❌ Image upload failed: ${error.message}`, "error");
      return null;
    }
  };

  // Migrate products one by one
  const migrateProducts = async (uploadImages = false) => {
    if (productsToMigrate.length === 0) {
      addLog("⚠️ No products to migrate. Run preparation first.", "warning");
      return;
    }
    
    setStatus("running");
    setProgress({ current: 0, total: productsToMigrate.length });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < productsToMigrate.length; i++) {
      const product = productsToMigrate[i];
      
      try {
        addLog(`🔄 Migrating: ${product.name}...`, "info");
        
        // Clean up price (convert "R850" to 850)
        let cleanPrice = product.price;
        if (typeof product.price === 'string') {
          cleanPrice = parseFloat(product.price.replace(/[R,\s]/g, ""));
        }
        
        // Prepare product data
        const productData = {
          name: product.name,
          category: product.category,
          price: cleanPrice,
          description: product.description,
          featured: product.id <= 3, // Mark first 3 products as featured
          visible: true,
          stock: 999,
          createdAt: new Date(),
          updatedAt: new Date(),
          originalId: product.id // Keep track of original ID
        };
        
        // Add to Firestore first to get an ID
        const docRef = await addDoc(collection(db, "products"), productData);
        addLog(`   ✅ Added to Firestore with ID: ${docRef.id}`, "success");
        
        // Upload image if requested
        let imageUrl = null;
        if (uploadImages && product.image) {
          imageUrl = await uploadImageToStorage(product.image, docRef.id, product.name);
          if (imageUrl) {
            await updateDoc(doc(db, "products", docRef.id), { image: imageUrl });
            addLog(`   📸 Image saved`, "success");
          }
        } else if (product.image) {
          // Keep original image URL
          await updateDoc(doc(db, "products", docRef.id), { image: product.image });
          addLog(`   📸 Using original image URL`, "info");
        }
        
        successCount++;
        
      } catch (error) {
        addLog(`❌ Failed to migrate ${product.name}: ${error.message}`, "error");
        failCount++;
      }
      
      setProgress({ current: i + 1, total: productsToMigrate.length });
    }
    
    addLog(`\n🎉 Migration Complete!`, "success");
    addLog(`   ✅ Successfully migrated: ${successCount} products`, "success");
    if (failCount > 0) {
      addLog(`   ❌ Failed: ${failCount} products`, "error");
    }
    
    setStatus("complete");
    
    // Refresh the page after 3 seconds
    setTimeout(() => {
      if (window.confirm("Migration complete! Refresh the page to see changes?")) {
        window.location.reload();
      }
    }, 1000);
  };

  // Delete all products (for clean slate)
  const deleteAllProducts = async () => {
    if (!window.confirm("⚠️ WARNING: This will delete ALL products from Firestore! Are you absolutely sure?")) {
      return;
    }
    
    if (!window.confirm("LAST CHANCE: This action cannot be undone. Delete all products?")) {
      return;
    }
    
    setStatus("running");
    addLog("🗑️ Deleting all products from Firestore...", "warning");
    
    try {
      const productsCollection = collection(db, "products");
      const snapshot = await getDocs(productsCollection);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      addLog(`✅ Deleted ${snapshot.docs.length} products`, "success");
      
      setProductsToMigrate(localProducts);
      setExistingProducts([]);
      setStatus("idle");
      
    } catch (error) {
      addLog(`❌ Delete failed: ${error.message}`, "error");
      setStatus("idle");
    }
  };

  // Run preparation on component mount
  useEffect(() => {
    prepareMigration();
  }, []);

  if (status === "complete") {
    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <h1 style={{ color: "#4caf50" }}>✅ Migration Complete!</h1>
          <div style={styles.logContainer}>
            {logs.map(log => (
              <div key={log.id} style={{ ...styles.logLine, color: getLogColor(log.type) }}>
                [{log.timestamp.toLocaleTimeString()}] {log.message}
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={styles.button}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h1>🔄 Product Migration Tool</h1>
        <p>Migrate your local products to Firebase Firestore</p>
        
        {/* Statistics */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <h3>Local Products</h3>
            <p style={styles.statNumber}>{localProducts.length}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Already in Firestore</h3>
            <p style={styles.statNumber}>{existingProducts.length}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Ready to Migrate</h3>
            <p style={styles.statNumber}>{productsToMigrate.length}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        {status === "running" && (
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${(progress.current / progress.total) * 100}%` }} />
            <span style={styles.progressText}>
              {progress.current} / {progress.total} products
            </span>
          </div>
        )}
        
        {/* Logs */}
        <div style={styles.logContainer}>
          {logs.map(log => (
            <div key={log.id} style={{ ...styles.logLine, color: getLogColor(log.type) }}>
              [{log.timestamp.toLocaleTimeString()}] {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div style={styles.logLine}>Ready to migrate. Choose an option below.</div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => migrateProducts(false)}
            disabled={status === "running" || productsToMigrate.length === 0}
            style={{ ...styles.button, background: "#2196f3" }}
          >
            🚀 Quick Migrate (Keep Original Images)
          </button>
          
          <button 
            onClick={() => migrateProducts(true)}
            disabled={status === "running" || productsToMigrate.length === 0}
            style={{ ...styles.button, background: "#4caf50" }}
          >
            📸 Full Migrate (Upload Images to Storage)
          </button>
          
          <button 
            onClick={prepareMigration}
            disabled={status === "running"}
            style={{ ...styles.button, background: "#ff9800" }}
          >
            🔄 Refresh & Check Products
          </button>
          
          <button 
            onClick={deleteAllProducts}
            disabled={status === "running"}
            style={{ ...styles.button, background: "#f44336" }}
          >
            🗑️ Delete All Products (Danger)
          </button>
        </div>
        
        <p style={styles.note}>
          <strong>Note:</strong> "Quick Migrate" keeps original image URLs. 
          "Full Migrate" uploads images to Firebase Storage (recommended for production).
        </p>
      </div>
    </div>
  );
};

// Helper function for log colors
const getLogColor = (type) => {
  switch (type) {
    case "error": return "#f44336";
    case "warning": return "#ff9800";
    case "success": return "#4caf50";
    default: return "#fff";
  }
};

// Styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.95)",
    zIndex: 9999,
    padding: "20px",
    overflow: "auto",
    color: "#fff"
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    margin: "20px 0"
  },
  statCard: {
    background: "#1e1e1e",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center"
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "10px 0 0 0"
  },
  progressContainer: {
    background: "#333",
    borderRadius: "10px",
    height: "30px",
    position: "relative",
    margin: "20px 0",
    overflow: "hidden"
  },
  progressBar: {
    background: "#4caf50",
    height: "100%",
    transition: "width 0.3s"
  },
  progressText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    fontWeight: "bold"
  },
  logContainer: {
    background: "#1e1e1e",
    padding: "15px",
    borderRadius: "8px",
    maxHeight: "300px",
    overflow: "auto",
    fontFamily: "monospace",
    fontSize: "12px",
    margin: "20px 0"
  },
  logLine: {
    padding: "4px 0",
    borderBottom: "1px solid #333",
    fontFamily: "monospace"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    margin: "20px 0"
  },
  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
    transition: "opacity 0.3s"
  },
  note: {
    fontSize: "12px",
    color: "#aaa",
    marginTop: "20px",
    padding: "10px",
    background: "#1e1e1e",
    borderRadius: "6px"
  }
};

export default MigrationScript;