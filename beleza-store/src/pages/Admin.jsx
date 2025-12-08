import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const Admin = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOrders(data);
  };

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "orders", id), { status: newStatus });
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Orders</h1>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h3>Order ID: {order.id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: R {order.finalTotal}</p>
          <p>Customer: {order.customer?.name} | {order.customer?.email}</p>
          <h4>Items:</h4>
          {Array.isArray(order.items) && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <p key={index}>{item.name} × {item.quantity}</p>
            ))
          ) : (
            <p>No items in this order.</p>
          )}
          <button onClick={() => updateStatus(order.id, "completed")}>
            Mark as Completed
          </button>
        </div>
      ))}
    </div>
  );
};

export default Admin;