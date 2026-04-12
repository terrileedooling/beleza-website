import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import ProductManagement from "../components/ProductManagement";
import "../styles/admin.css";

const Admin = () => {
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("orders"); // "orders" or "products"

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by newest first
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setLoadingOrders(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = orders;

    if (filter !== "all") {
      result = result.filter(order => order.status === filter);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        if (order.customer?.name?.toLowerCase().includes(query)) return true;
        if (order.id.toLowerCase().includes(query)) return true;
        if (order.customer?.email?.toLowerCase().includes(query)) return true;
        if (order.customer?.phone?.includes(query)) return true;
        if (order.items?.some(item => item.name.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    setFilteredOrders(result);
  }, [orders, filter, searchQuery]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: new Date()
      });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status");
    }
  };

  const statusFilters = ["all", "pending", "processing", "completed", "cancelled"];
  const statusLabels = {
    all: "All Orders",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: "status-pending",
      processing: "status-processing",
      completed: "status-completed",
      cancelled: "status-cancelled"
    };
    return classes[status] || "status-pending";
  };

  if (loadingOrders || productsLoading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user">
          <i className="fas fa-user-shield"></i>
          <span>{user?.email}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <i className="fas fa-shopping-cart"></i>
          Orders Management
          {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
        </button>
        <button 
          className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <i className="fas fa-box"></i>
          Products Management
          {products.length > 0 && <span className="tab-badge">{products.length}</span>}
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <div className="admin-orders-section">
          {/* Search and Filter */}
          <div className="admin-controls">
            <div className="search-container">
              <div className="search-input-wrapper">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, order ID, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="order-search-input"
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="order-filters">
              {statusFilters.map(f => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {statusLabels[f]}
                  {filter === f && (
                    <span className="filter-count">
                      ({orders.filter(o => f === "all" ? true : o.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <div className="empty-search-state">
              <i className="fas fa-search"></i>
              <h3>No orders found</h3>
              <button className="clear-search-full-btn" onClick={() => setSearchQuery("")}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id-date">
                      <span className="order-id">#{order.id.slice(0, 8)}</span>
                      <span className="order-date">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString()
                          : new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="order-body">
                    <div className="order-customer-info">
                      <div className="customer-avatar">
                        {order.customer?.name?.charAt(0) || "C"}
                      </div>
                      <div className="customer-details">
                        <h4>{order.customer?.name}</h4>
                        <p><i className="fas fa-envelope"></i> {order.customer?.email}</p>
                        <p><i className="fas fa-phone"></i> {order.customer?.phone}</p>
                        <p className="customer-address">
                          <i className="fas fa-map-marker-alt"></i> 
                          {order.customer?.address}, {order.customer?.suburb}, {order.customer?.city}
                        </p>
                      </div>
                    </div>

                    <div className="order-items-list">
                      <h4>Items ({order.items?.length || 0})</h4>
                      <div className="items-container">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <span className="item-name">{item.name}</span>
                            <span className="item-qty">x{item.quantity}</span>
                            <span className="item-price">R{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-totals">
                      <div className="total-line">
                        <span>Subtotal:</span>
                        <span>R{order.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="total-line">
                        <span>Delivery:</span>
                        <span>R{order.deliveryFee?.toFixed(2)}</span>
                      </div>
                      <div className="total-line grand-total">
                        <span>Total:</span>
                        <span>R{order.finalTotal?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="order-actions">
                      {order.status === "pending" && (
                        <>
                          <button 
                            className="action-btn processing"
                            onClick={() => handleUpdateStatus(order.id, "processing")}
                          >
                            <i className="fas fa-clock"></i> Mark Processing
                          </button>
                          <button 
                            className="action-btn complete"
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                          >
                            <i className="fas fa-check"></i> Complete
                          </button>
                          <button 
                            className="action-btn cancel"
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </>
                      )}
                      {order.status === "processing" && (
                        <>
                          <button 
                            className="action-btn complete"
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                          >
                            <i className="fas fa-check"></i> Complete
                          </button>
                          <button 
                            className="action-btn cancel"
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </>
                      )}
                      {order.status === "completed" && (
                        <span className="completed-badge">
                          <i className="fas fa-check-circle"></i> Completed
                        </span>
                      )}
                      {order.status === "cancelled" && (
                        <button 
                          className="action-btn reopen"
                          onClick={() => handleUpdateStatus(order.id, "pending")}
                        >
                          <i className="fas fa-undo"></i> Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab Content */}
      {activeTab === "products" && (
        <ProductManagement />
      )}
    </div>
  );
};

export default Admin;