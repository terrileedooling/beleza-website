import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - Loading:", loading);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

//   // Admin check - replace with your admin email
//   const adminEmails = ["admin@example.com", "your-email@gmail.com"];
//   const isAdmin = adminEmails.includes(user.email);
  
//   console.log("Is admin?", isAdmin, "User email:", user.email);

//   if (!isAdmin) {
//     console.log("Not admin, redirecting to home");
//     return <Navigate to="/" replace />;
//   }

  return children;
}