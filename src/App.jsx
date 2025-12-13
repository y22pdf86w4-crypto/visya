// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import DualForce from "./pages/DualForce";  // ← ADICIONE ESTA LINHA

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/dualforce/:dashboardId" element={<DualForce />} />  {/* ← E ESTA ROTA */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}