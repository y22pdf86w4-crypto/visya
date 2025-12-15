// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import DualForce from "./pages/DualForce";
import Linhagroat from "./pages/Linhagroat"; // <--- 1. IMPORTE O COMPONENTE NOVO

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        
        {/* Rota do DualForce */}
        <Route path="/dualforce/:dashboardId" element={<DualForce />} />
        
        {/* Rota do Linhagro - CORRIGIDA */}
        <Route path="/linhagro/:dashboardId" element={<Linhagroat />} /> {/* <--- 2. USE O COMPONENTE CERTO AQUI */}
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
