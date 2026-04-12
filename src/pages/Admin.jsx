import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import ProductManagement from "../components/ProductManagement";
import "../styles/admin.css";

const Admin = () => {
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("orders");

  // Helper function to get payment status (handles old and new orders)
  const getPaymentStatus = (order) => {
    if (order.paymentStatus) return order.paymentStatus;
    // Convert old status to payment status
    if (order.status === "paid") return "paid";
    if (order.status === "pending") return "unpaid";
    if (order.status === "cancelled") return "unpaid";
    return "unpaid";
  };

  // Helper function to get fulfillment status (handles old and new orders)
  const getFulfillmentStatus = (order) => {
    if (order.fulfillmentStatus) return order.fulfillmentStatus;
    // Convert old status to fulfillment status
    if (order.status === "paid") return "pending";
    if (order.status === "pending") return "pending";
    if (order.status === "processing") return "processing";
    if (order.status === "completed") return "delivered";
    if (order.status === "cancelled") return "cancelled";
    return "pending";
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure both status fields exist for filtering
            paymentStatus: getPaymentStatus(data),
            fulfillmentStatus: getFulfillmentStatus(data)
          };
        });
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

  // Apply filters
  useEffect(() => {
    let result = orders;

    // Filter by payment status
    if (paymentFilter !== "all") {
      result = result.filter(order => order.paymentStatus === paymentFilter);
    }

    // Filter by fulfillment status
    if (fulfillmentFilter !== "all") {
      result = result.filter(order => order.fulfillmentStatus === fulfillmentFilter);
    }

    // Search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        if (order.customer?.name?.toLowerCase().includes(query)) return true;
        if (order.id.toLowerCase().includes(query)) return true;
        if (order.customer?.email?.toLowerCase().includes(query)) return true;
        if (order.customer?.phone?.includes(query)) return true;
        return false;
      });
    }

    setFilteredOrders(result);
  }, [orders, paymentFilter, fulfillmentFilter, searchQuery]);

  // Update fulfillment status only
  const handleUpdateFulfillmentStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        fulfillmentStatus: newStatus,
        updatedAt: new Date()
      });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, fulfillmentStatus: newStatus } : order
        )
      );
      alert(`Order status updated to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status: " + error.message);
    }
  };

  // Update payment status separately
  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        paymentStatus: newStatus,
        updatedAt: new Date()
      });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, paymentStatus: newStatus } : order
        )
      );
      alert(`Payment status updated to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status: " + error.message);
    }
  };

  // Payment status options
  const paymentStatuses = [
    { value: "all", label: "All Payments" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "refunded", label: "Refunded" },
    { value: "failed", label: "Failed" }
  ];

  // Fulfillment status options
  const fulfillmentStatuses = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const getPaymentBadgeClass = (status) => {
    const classes = {
      paid: "payment-paid",
      unpaid: "payment-unpaid",
      refunded: "payment-refunded",
      failed: "payment-failed"
    };
    return classes[status] || "payment-unpaid";
  };

  const getFulfillmentBadgeClass = (status) => {
    const classes = {
      pending: "fulfillment-pending",
      processing: "fulfillment-processing",
      shipped: "fulfillment-shipped",
      delivered: "fulfillment-delivered",
      cancelled: "fulfillment-cancelled"
    };
    return classes[status] || "fulfillment-pending";
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
          <span className="tab-badge">{orders.length}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <i className="fas fa-box"></i>
          Products Management
          <span className="tab-badge">{products.length}</span>
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <div className="admin-orders-section">
          {/* Search and Filters */}
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

            <div className="dual-filters">
              <div className="filter-group">
                <label>Payment Status:</label>
                <div className="filter-buttons">
                  {paymentStatuses.map(status => (
                    <button
                      key={status.value}
                      className={`filter-chip ${paymentFilter === status.value ? "active" : ""}`}
                      onClick={() => setPaymentFilter(status.value)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Order Status:</label>
                <div className="filter-buttons">
                  {fulfillmentStatuses.map(status => (
                    <button
                      key={status.value}
                      className={`filter-chip ${fulfillmentFilter === status.value ? "active" : ""}`}
                      onClick={() => setFulfillmentFilter(status.value)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <div className="empty-search-state">
              <i className="fas fa-search"></i>
              <h3>No orders found</h3>
              <button className="clear-search-full-btn" onClick={() => {
                setSearchQuery("");
                setPaymentFilter("all");
                setFulfillmentFilter("all");
              }}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => {
                // Get the actual payment and fulfillment status for display
                const displayPaymentStatus = order.paymentStatus || getPaymentStatus(order);
                const displayFulfillmentStatus = order.fulfillmentStatus || getFulfillmentStatus(order);
                
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id-date">
                        <span className="order-id">#{order.id.slice(0, 8)}</span>
                        <span className="order-date">
                          {order.createdAt?.toDate
                            ? order.createdAt.toDate().toLocaleString()
                            : new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="order-badges">
                        <span className={`payment-badge ${getPaymentBadgeClass(displayPaymentStatus)}`}>
                          <i className="fas fa-credit-card"></i>
                          {displayPaymentStatus === "paid" ? "Paid" : 
                           displayPaymentStatus === "unpaid" ? "Unpaid" :
                           displayPaymentStatus === "refunded" ? "Refunded" : 
                           displayPaymentStatus === "failed" ? "Failed" : displayPaymentStatus}
                        </span>
                        <span className={`fulfillment-badge ${getFulfillmentBadgeClass(displayFulfillmentStatus)}`}>
                          <i className="fas fa-box"></i>
                          {displayFulfillmentStatus === "pending" ? "Pending" :
                           displayFulfillmentStatus === "processing" ? "Processing" :
                           displayFulfillmentStatus === "shipped" ? "Shipped" :
                           displayFulfillmentStatus === "delivered" ? "Delivered" :
                           displayFulfillmentStatus === "cancelled" ? "Cancelled" : displayFulfillmentStatus}
                        </span>
                      </div>
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
                          <p><i className="fas fa-credit-card"></i> Payment: {order.paymentMethod || "N/A"}</p>
                          <p className="customer-address">
                            <i className="fas fa-map-marker-alt"></i> 
                            {order.customer?.address}, {order.customer?.suburb || ""} {order.customer?.city || ""}
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
                              <span className="item-price">R{item.price?.toFixed?.(2) || item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-totals">
                        <div className="total-line">
                          <span>Subtotal:</span>
                          <span>R{order.subtotal?.toFixed?.(2) || order.subtotal}</span>
                        </div>
                        <div className="total-line">
                          <span>Delivery:</span>
                          <span>R{order.deliveryFee?.toFixed?.(2) || order.deliveryFee}</span>
                        </div>
                        <div className="total-line grand-total">
                          <span>Total:</span>
                          <span>R{order.finalTotal?.toFixed?.(2) || order.finalTotal}</span>
                        </div>
                      </div>

                      {/* Payment Status Actions */}
                      <div className="status-section">
                        <div className="status-header">
                          <strong>Payment Status:</strong>
                          <div className="status-actions">
                            {displayPaymentStatus === "unpaid" && (
                              <>
                                <button 
                                  className="action-btn-small success"
                                  onClick={() => handleUpdatePaymentStatus(order.id, "paid")}
                                >
                                  <i className="fas fa-check"></i> Mark Paid
                                </button>
                                <button 
                                  className="action-btn-small danger"
                                  onClick={() => handleUpdatePaymentStatus(order.id, "failed")}
                                >
                                  <i className="fas fa-times"></i> Mark Failed
                                </button>
                              </>
                            )}
                            {displayPaymentStatus === "paid" && (
                              <>
                                <button 
                                  className="action-btn-small warning"
                                  onClick={() => handleUpdatePaymentStatus(order.id, "refunded")}
                                >
                                  <i className="fas fa-undo"></i> Refund
                                </button>
                              </>
                            )}
                            {displayPaymentStatus === "failed" && (
                              <button 
                                className="action-btn-small primary"
                                onClick={() => handleUpdatePaymentStatus(order.id, "unpaid")}
                              >
                                <i className="fas fa-undo"></i> Reset to Unpaid
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment Status Actions */}
                      <div className="status-section">
                        <div className="status-header">
                          <strong>Order Status:</strong>
                          <div className="status-actions">
                            {displayFulfillmentStatus === "pending" && (
                              <>
                                <button 
                                  className="action-btn-small primary"
                                  onClick={() => handleUpdateFulfillmentStatus(order.id, "processing")}
                                >
                                  <i className="fas fa-cog"></i> Start Processing
                                </button>
                                <button 
                                  className="action-btn-small danger"
                                  onClick={() => handleUpdateFulfillmentStatus(order.id, "cancelled")}
                                >
                                  <i className="fas fa-times"></i> Cancel Order
                                </button>
                              </>
                            )}
                            {displayFulfillmentStatus === "processing" && (
                              <>
                                <button 
                                  className="action-btn-small primary"
                                  onClick={() => handleUpdateFulfillmentStatus(order.id, "shipped")}
                                >
                                  <i className="fas fa-truck"></i> Mark Shipped
                                </button>
                                <button 
                                  className="action-btn-small danger"
                                  onClick={() => handleUpdateFulfillmentStatus(order.id, "cancelled")}
                                >
                                  <i className="fas fa-times"></i> Cancel Order
                                </button>
                              </>
                            )}
                            {displayFulfillmentStatus === "shipped" && (
                              <>
                                <button 
                                  className="action-btn-small success"
                                  onClick={() => handleUpdateFulfillmentStatus(order.id, "delivered")}
                                >
                                  <i className="fas fa-check-double"></i> Mark Delivered
                                </button>
                                <button 
                                  className="action-btn-small warning"
                                  onClick={() => handleUpdateFulfillmentStatus(order.id, "processing")}
                                >
                                  <i className="fas fa-undo"></i> Back to Processing
                                </button>
                              </>
                            )}
                            {displayFulfillmentStatus === "delivered" && (
                              <span className="completed-badge">
                                <i className="fas fa-check-circle"></i> Order Complete
                              </span>
                            )}
                            {displayFulfillmentStatus === "cancelled" && (
                              <button 
                                className="action-btn-small secondary"
                                onClick={() => handleUpdateFulfillmentStatus(order.id, "pending")}
                              >
                                <i className="fas fa-undo"></i> Reopen Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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