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

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "status-paid";
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

  const getCustomerInitial = (name) =>
    name ? name.charAt(0).toUpperCase() : "C";

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === "paid").length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
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
          <i className="fas fa-sync-alt"></i> Refresh Orders
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-number">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Paid</h3>
          <div className="stat-number">{stats.paid}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-number">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>Processing</h3>
          <div className="stat-number">{stats.processing}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-number">{stats.completed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="order-filters">
        {["all", "paid", "pending", "processing", "completed"].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} (
            {f === "all" ? orders.length : stats[f]})
          </button>
        ))}
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state-admin">
          <i className="fas fa-clipboard-list"></i>
          <h3>No Orders Found</h3>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              {/* Header */}
              <div className="order-header">
                <div>
                  <div className="order-id">ID: {order.id.slice(0, 8)}...</div>
                  <div className="order-time">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className={`order-status ${getStatusBadge(order.status)}`}>
                  <i className="fas fa-circle"></i>
                  {order.status || "pending"}
                </div>
              </div>

              <div className="order-body">
                {/* Customer */}
                <div className="order-customer">
                  <div className="customer-avatar">
                    {getCustomerInitial(order.customer?.name)}
                  </div>
                  <div className="customer-info">
                    <h4>{order.customer?.name || "No Name"}</h4>
                    <p>{order.customer?.email || "No Email"}</p>
                    <p>{order.customer?.phone || "No Phone"}</p>

                    {/* Address */}
                    {order.customer?.address && (
                      <div className="customer-address">
                        <strong>Address:</strong>
                        <p>{order.customer.address}</p>
                        <p>{order.customer.city}</p>
                        <p>{order.customer.province}</p>
                        <p>{order.customer.zip}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="order-total">
                  <div className="order-total-label">Subtotal</div>
                  <div className="order-total-amount">
                    R {parseFloat(order.subtotal || 0).toFixed(2)}
                  </div>
                  <div className="order-total-label">Delivery</div>
                  <div className="order-total-amount">
                    R {parseFloat(order.deliveryFee || 0).toFixed(2)}
                  </div>
                  <div className="order-total-label grand-total">
                    Final Total
                  </div>
                  <div className="order-total-amount grand-total">
                    R {parseFloat(order.finalTotal || 0).toFixed(2)}
                  </div>
                </div>

                {/* Items */}
                <div className="order-items">
                  <h4>Order Items</h4>
                  {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <span>{item.name}</span>
                        <span>× {item.quantity}</span>
                      </div>
                    ))
                  ) : (
                    <p>No items.</p>
                  )}
                </div>

                {/* Actions */}
                <div className="order-actions">
                  {order.status !== "completed" && (
                    <button
                      className="action-btn action-btn-primary"
                      onClick={() => updateStatus(order.id, "completed")}
                    >
                      <i className="fas fa-check"></i> Complete
                    </button>
                  )}

                  {order.status === "pending" && (
                    <button
                      className="action-btn action-btn-secondary"
                      onClick={() => updateStatus(order.id, "processing")}
                    >
                      <i className="fas fa-cog"></i> Process
                    </button>
                  )}

                  {order.status !== "cancelled" && (
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => updateStatus(order.id, "cancelled")}
                    >
                      <i className="fas fa-times"></i> Cancel
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