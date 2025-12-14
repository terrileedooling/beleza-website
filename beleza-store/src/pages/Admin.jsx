import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "../styles/admin.css";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Apply both filter and search
  useEffect(() => {
    let result = orders;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter(order => order.status === filter);
    }

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        // Search in customer name
        if (order.customer?.name?.toLowerCase().includes(query)) return true;
        
        // Search in order ID
        if (order.id.toLowerCase().includes(query)) return true;
        
        // Search in customer email
        if (order.customer?.email?.toLowerCase().includes(query)) return true;
        
        // Search in customer phone
        if (order.customer?.phone?.includes(query)) return true;
        
        // Search in product names
        if (order.items?.some(item => 
          item.name.toLowerCase().includes(query)
        )) return true;

        return false;
      });
    }

    setFilteredOrders(result);
  }, [orders, filter, searchQuery]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // All available statuses
  const statusFilters = ["all", "pending", "processing", "completed", "cancelled"];

  // Status labels for display
  const statusLabels = {
    all: "All Orders",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  // Status colors for actions
  const statusActions = {
    pending: ["processing", "completed", "cancelled"],
    processing: ["completed", "cancelled"],
    completed: [], // No actions for completed
    cancelled: []  // No actions for cancelled
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner"></i>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return <div className="empty-state-admin">No orders yet.</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Orders</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="admin-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search orders by name, order ID, email, or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="order-search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn" 
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="search-results-info">
              Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Status Filters - INCLUDES PROCESSING */}
        <div className="order-filters">
          {statusFilters.map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {statusLabels[f]}
              {filter === f && orders.length > 0 && (
                <span className="filter-count">
                  ({orders.filter(o => f === "all" ? true : o.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order Count */}
      <div className="order-summary">
        <p>
          Showing {filteredOrders.length} of {orders.length} orders
          {filter !== "all" && ` (${statusLabels[filter]} only)`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="empty-search-state">
          <i className="fas fa-search"></i>
          <h3>No orders found</h3>
          <p>Try a different search term or clear the search to see all orders.</p>
          <button className="clear-search-full-btn" onClick={clearSearch}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              {/* Order Header */}
              <div className="order-header">
                <div>
                  <span className="order-id">Order ID: {order.id}</span>
                  <br />
                  <span className="order-time">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString()
                      : order.createdAt}
                  </span>
                </div>
                <span className={`order-status status-${order.status}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Order Body */}
              <div className="order-body">
                {/* Customer Info */}
                <div className="order-customer">
                  <div className="customer-avatar">
                    {order.customer?.name?.charAt(0) || "C"}
                  </div>
                  <div className="customer-info">
                    <h4>{order.customer?.name}</h4>
                    <p>{order.customer?.email}</p>
                    <p>{order.customer?.phone}</p>
                    <div className="customer-address">
                      <p>{order.customer?.address}</p>
                      <p>
                        {order.customer?.suburb}, {order.customer?.city},{" "}
                        {order.customer?.postal}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="order-items">
                  <h4>Items</h4>
                  {order.items?.map(item => (
                    <div key={item.id} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">× {item.quantity}</span>
                      <span className="item-price">R{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="order-total">
                  <div>
                    <span className="order-total-label">Subtotal: </span>
                    <span className="order-total-amount">R{order.subtotal}</span>
                  </div>
                  <div>
                    <span className="order-total-label">Delivery: </span>
                    <span className="order-total-amount">R{order.deliveryFee}</span>
                  </div>
                  <div className="grand-total">
                    <span>Final Total: </span>
                    <span>R{order.finalTotal}</span>
                  </div>
                </div>

                {/* Actions - More refined with processing status */}
                <div className="order-actions">
                  {/* Show Mark as Processing for pending orders */}
                  {order.status === "pending" && (
                    <button
                      className="action-btn-primary"
                      onClick={() => handleUpdateStatus(order.id, "processing")}
                    >
                      Mark as Processing
                    </button>
                  )}
                  
                  {/* Show Mark Completed for pending or processing orders */}
                  {order.status !== "completed" && order.status !== "cancelled" && (
                    <button
                      className="action-btn-primary"
                      onClick={() => handleUpdateStatus(order.id, "completed")}
                    >
                      Mark as Completed
                    </button>
                  )}
                  
                  {/* Show Cancel for pending or processing orders */}
                  {order.status !== "cancelled" && order.status !== "completed" && (
                    <button
                      className="action-btn-danger"
                      onClick={() => handleUpdateStatus(order.id, "cancelled")}
                    >
                      Cancel Order
                    </button>
                  )}
                  
                  {/* Show Reopen for cancelled orders */}
                  {order.status === "cancelled" && (
                    <button
                      className="action-btn-secondary"
                      onClick={() => handleUpdateStatus(order.id, "pending")}
                    >
                      Reopen Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;