// src/pages/Menu.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Lock } from "lucide-react";
import "../styles/menu.css";
import visyaLogo from "../assets/logovisya.png";
import dualforceLogo from "../assets/logo-dualforce.png";
import linhagroLogo from "../assets/logo-linhagro.png";


export default function Menu() {
  const navigate = useNavigate();
  const usuario = localStorage.getItem("userdualforce") || "Usuário";
  const userRole = localStorage.getItem("userRole") || "vendedor";
  const [profileOpen, setProfileOpen] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);


  const todosOsDashboards = [
    {
      id: 1,
      title: "DualForce",
      description:
        "Análise completa de atividades, prospecção e performance de vendedores em tempo real.",
      icon: "📊",
      category: "Força Dupla - Agendas",
      records: "Acesse para mais informações",
      updated: "Hoje",
      tags: ["Atividades", "Performance", "Vendedores"],
      chave: "dualforce",
      requiredRole: ["admin", "gestor", "vendedor"],
      rota: "/dualforce/1",
    },
    {
      id: 2,
      title: "Linhagro",
      description:
        "Dashboard estratégico com análise de carteira, cobertura de clientes e performance de vendedores.",
      icon: "🌾",
      category: "Atividades Linhagro",
      records: "Acesse para mais informações",
      updated: "Hoje",
      tags: ["Carteira", "Vendedores", "Cobertura"],
      chave: "linhagro",
      requiredRole: ["admin", "gestor", "vendedor"],
      rota: "/linhagro/1",
    },
  ];


  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const dashboardsFiltrados = todosOsDashboards.filter((dash) =>
        dash.requiredRole.includes(userRole)
      );
      setDashboards(dashboardsFiltrados);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [userRole]);


  function handleLogout() {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("tokendualforce");
      localStorage.removeItem("userdualforce");
      localStorage.removeItem("userRole");
      navigate("/");
    }
  }


  function handleOpenDashboard(dashboard) {
    navigate(dashboard.rota);
  }


  function getRoleColor() {
    const colors = {
      admin: "#FF6B6B",
      gestor: "#4ECDC4",
      vendedor: "#22c55e",
    };
    return colors[userRole] || "#22c55e";
  }


  function getRoleLabel() {
    if (userRole === "admin") return "Administrador";
    if (userRole === "gestor") return "Gestor";
    return "";
  }


  function getDashboardLogo(chave) {
    if (chave === "dualforce") return dualforceLogo;
    if (chave === "linhagro") return linhagroLogo;
    return null;
  }

  // Gerar partículas aleatórias
  function generateParticles() {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 20,
      });
    }
    return particles;
  }

  const particles = generateParticles();


  return (
    <div className="home-page">
      {/* FUNDO ANIMADO */}
      <div className="animated-bg"></div>
      
      {/* GRID ANIMADO */}
      <div className="grid-bg"></div>
      
      {/* ORBS BRILHANTES */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      
      {/* PARTÍCULAS FLUTUANTES */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
            }}
          ></div>
        ))}
      </div>

      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          {/* Logo Visya */}
          <div className="logo-section">
            <img
              src={visyaLogo}
              alt="Visya"
              className="logo-visya-img"
            />
            <div className="logo-text-block">
              <span className="logo-text-main">Visya</span>
              <span className="logo-text-sub">Painel de Dashboards</span>
            </div>
          </div>


          {/* Navegação simplificada */}
          <nav className="nav-menu">
            <span className="nav-link active">Dashboards</span>
          </nav>
        </div>


        <div className="header-actions">
          <button className="btn-icon" title="Notificações">
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>


          {/* Bloco usuário / função */}
          <div className="user-profile-header">
            <div
              className="avatar-small"
              style={{ backgroundColor: getRoleColor() }}
            >
              {usuario.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-small">
              <div className="user-name-small">{usuario}</div>
              <div
                className="user-role-pill"
                style={{ backgroundColor: getRoleColor() }}
              >
                {getRoleLabel().toUpperCase()}
              </div>
            </div>
          </div>


          <button
            className="btn-icon"
            onClick={() => setProfileOpen(!profileOpen)}
            title="Configurações"
          >
            ⚙️
          </button>


          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: "4px" }} />
            Sair
          </button>
        </div>
      </header>


      {/* DROPDOWN PERFIL */}
      {profileOpen && (
        <div className="profile-dropdown active">
          <div className="dropdown-header">
            <span className="user-name">{usuario}</span>
            <span
              className="user-email user-role-chip"
              style={{ backgroundColor: getRoleColor() }}
            >
              {getRoleLabel()}
            </span>
          </div>
          <a href="#" className="dropdown-item">
            ⚙️ Configurações
          </a>
          <a href="#" className="dropdown-item">
            🎨 Preferências
          </a>
          <a href="#" className="dropdown-item">
            ❓ Ajuda
          </a>
          <hr className="dropdown-separator" />
          <a
            href="#"
            className="dropdown-item logout"
            onClick={handleLogout}
          >
            🚪 Sair
          </a>
        </div>
      )}


      {/* HERO MAIS ENXUTO */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bem-vindo, <span className="gradient-text">{usuario}</span>
          </h1>
          <p className="hero-subtitle">
            Acesse seus dashboards e métricas em um único lugar intuitivo.
          </p>
        </div>
      </section>


      {/* DASHBOARDS */}
      <section className="dashboards-section">
        <div className="dashboards-header">
          <h2>Meus Dashboards</h2>
          <p>
            Você tem acesso a {dashboards.length} dashboard
            {dashboards.length !== 1 ? "s" : ""}.
          </p>
        </div>


        <div className="dashboards-grid">
          {loading ? (
            <div className="dashboards-loading">
              <div className="spinner" />
              <p>Carregando dashboards...</p>
            </div>
          ) : dashboards.length > 0 ? (
            dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="dashboard-card"
                onClick={() => handleOpenDashboard(dashboard)}
              >
                {/* Logo do Dashboard - Dinâmica */}
                <div className="card-icon">
                  {getDashboardLogo(dashboard.chave) ? (
                    <img
                      src={getDashboardLogo(dashboard.chave)}
                      alt={dashboard.title}
                      className="logo-dashboard-img"
                    />
                  ) : (
                    <span className="card-icon-emoji">
                      {dashboard.icon}
                    </span>
                  )}
                </div>


                <div className="card-header">
                  <h3 className="card-title">{dashboard.title}</h3>
                  <span className="card-category">
                    {dashboard.category}
                  </span>
                </div>


                <p className="card-description">
                  {dashboard.description}
                </p>


                <div className="card-meta">
                  <div className="meta-item">
                    <span className="meta-label">Registros</span>
                    <span className="meta-value">
                      {dashboard.records}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Atualização</span>
                    <span className="meta-value">
                      {dashboard.updated}
                    </span>
                  </div>
                </div>


                <div className="card-tags">
                  {dashboard.tags?.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>


                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDashboard(dashboard);
                    }}
                  >
                    Abrir Dashboard
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="dashboards-empty">
              <Lock size={64} />
              <h3>Sem acesso a dashboards</h3>
              <p>
                Você não tem permissão para acessar nenhum dashboard no
                momento.
              </p>
              <p>Entre em contato com um administrador para solicitar acesso.</p>
            </div>
          )}
        </div>
      </section>


      <footer className="footer">
        <p>© 2025 Visya. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}