import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LearningStyle from "./pages/LearningStyle.jsx";
import Subjects from "./pages/Subjects.jsx";
import Quiz from "./pages/Quiz.jsx";
import StudyPlanner from "./pages/StudyPlanner.jsx";
import DigitalTwin from "./pages/DigitalTwin.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/learning-style" element={<ProtectedRoute><LearningStyle /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
      <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwin /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
