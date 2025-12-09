import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "../styles/admin.css";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    if (filter === "pending") return order.status === "pending";
    if (filter === "processing") return order.status === "processing";
    if (filter === "completed") return order.status === "completed";
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getCustomerInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner"></i>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="primary-btn" onClick={fetchOrders}>
          <i className="fas fa-sync-alt"></i>
          Refresh Orders
        </button>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-sub">Awaiting processing</div>
        </div>
        <div className="stat-card">
          <h3>Processing</h3>
          <div className="stat-number">{stats.processing}</div>
          <div className="stat-sub">In progress</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-sub">Delivered</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="order-filters">
        <button 
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Orders ({orders.length})
        </button>
        <button 
          className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`filter-tab ${filter === "processing" ? "active" : ""}`}
          onClick={() => setFilter("processing")}
        >
          Processing ({stats.processing})
        </button>
        <button 
          className={`filter-tab ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state-admin">
          <i className="fas fa-clipboard-list"></i>
          <h3>No Orders Found</h3>
          <p>{filter === "all" 
            ? "There are no orders in the system yet." 
            : `There are no ${filter} orders at the moment.`}
          </p>
          <button className="secondary-btn" onClick={() => setFilter("all")}>
            View All Orders
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-id">ID: {order.id.substring(0, 8)}...</div>
                  <div className="order-time">{formatDate(order.timestamp)}</div>
                </div>
                <div className={`order-status ${getStatusBadge(order.status)}`}>
                  <i className="fas fa-circle"></i>
                  {order.status || "pending"}
                </div>
              </div>

              <div className="order-body">
                {/* Customer Info */}
                <div className="order-customer">
                  <div className="customer-avatar">
                    {getCustomerInitial(order.customer?.name)}
                  </div>
                  <div className="customer-info">
                    <h4>{order.customer?.name || "No Name"}</h4>
                    <p>{order.customer?.email || "No Email"}</p>
                    <p>{order.customer?.phone || "No Phone"}</p>
                  </div>
                </div>

                {/* Order Total */}
                <div className="order-total">
                  <div className="order-total-label">Total Amount</div>
                  <div className="order-total-amount">
                    R {parseFloat(order.finalTotal || 0).toFixed(2)}
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items">
                  <h4>Order Items</h4>
                  <div className="items-list">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index} className="item-row">
                          <span className="item-name">{item.name || "Unnamed Item"}</span>
                          <span className="item-quantity">× {item.quantity || 1}</span>
                        </div>
                      ))
                    ) : (
                      <p>No items in this order.</p>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="order-actions">
                  {order.status !== "completed" && (
                    <button
                      className="action-btn action-btn-primary"
                      onClick={() => updateStatus(order.id, "completed")}
                    >
                      <i className="fas fa-check"></i>
                      Mark as Completed
                    </button>
                  )}
                  {order.status !== "processing" && order.status !== "completed" && (
                    <button
                      className="action-btn action-btn-secondary"
                      onClick={() => updateStatus(order.id, "processing")}
                    >
                      <i className="fas fa-cog"></i>
                      Start Processing
                    </button>
                  )}
                  {order.status !== "cancelled" && (
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => updateStatus(order.id, "cancelled")}
                    >
                      <i className="fas fa-times"></i>
                      Cancel Order
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