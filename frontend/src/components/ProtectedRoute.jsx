import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const token = localStorage.getItem("dt_token");
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
