import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin check - replace with your admin email
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS
  .split(",")
  .map(email => email.trim());

  const isAdmin = adminEmails.includes(user.email);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}