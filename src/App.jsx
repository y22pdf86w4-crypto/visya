// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import DualForce from "./pages/DualForce";

export default function App() {
  return (
    // Sem basename para Vercel / domínio raiz
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/dualforce/:dashboardId" element={<DualForce />} />
        <Route path="/linhagro/:dashboardId" element={<DualForce />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}