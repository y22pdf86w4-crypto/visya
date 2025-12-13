// src/pages/Menu.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import "../styles/menu.css";

export default function Menu() {
  const navigate = useNavigate();
  const usuario = localStorage.getItem("userdualforce") || "Usuário";
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Fechar dropdown ao clicar fora
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-dropdown") && !e.target.closest(".btn-icon")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function handleLogout() {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("tokendualforce");
      localStorage.removeItem("userdualforce");
      navigate("/");
    }
  }

  const dashboard = {
    id: 1,
    title: "DualForce",
    description: "Análise completa de atividades, prospecção e performance de vendedores. Acesso ao painel principal com todas as métricas e KPIs.",
    icon: "📊",
    category: "Principal",
    records: "454",
    updated: "Hoje",
    tags: ["Atividades", "Performance", "Vendedores"],
    active: true,
  };

  return (
    <div className="home-page">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">V</div>
            <span className="logo-text">Visya</span>
          </div>

          <nav className="nav-menu">
            <a href="#" className="nav-link active">
              Início
            </a>
            <a href="#" className="nav-link">
              Dashboards
            </a>
            <a href="#" className="nav-link">
              Relatórios
            </a>
            <a href="#" className="nav-link">
              Integrações
            </a>
          </nav>
        </div>

        <div className="header-actions">
          <button className="btn-icon">
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>

          <div className="user-profile-header">
            <div className="avatar-small">{usuario.charAt(0).toUpperCase()}</div>
            <div className="user-info-small">
              <div className="user-name-small">{usuario}</div>
              <div className="user-email-small">Conectado</div>
            </div>
          </div>

          <button className="btn-icon" onClick={() => setProfileOpen(!profileOpen)}>
            ⚙️
          </button>

          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: "4px" }} />
            Sair
          </button>
        </div>
      </header>

      {/* PROFILE DROPDOWN */}
      {profileOpen && (
        <div className="profile-dropdown active">
          <div className="dropdown-header">
            <span className="user-name">{usuario}</span>
            <span className="user-email">Usuário</span>
          </div>
          <a href="#" className="dropdown-item">
            Configurações
          </a>
          <a href="#" className="dropdown-item">
            Preferências
          </a>
          <a href="#" className="dropdown-item">
            Ajuda
          </a>
          <a href="#" className="dropdown-item logout" onClick={handleLogout}>
            Sair
          </a>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bem-vindo, <span className="gradient-text">{usuario}</span>
          </h1>
          <p className="hero-subtitle">
            Monitore em tempo real todos os seus dashboards, relatórios e métricas em um único lugar seguro e intuitivo.
          </p>
        </div>
      </section>

      {/* DASHBOARDS SECTION */}
      <section className="dashboards-section">
        <h2 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "700" }}>
          Dashboard Principal
        </h2>

        <div className="dashboards-grid">
          <div
            className={`dashboard-card ${!dashboard.active ? "disabled" : ""}`}
            onClick={() => dashboard.active && navigate(`/dashboards/${dashboard.id}`)}
          >
            <div className="card-icon" style={{ fontSize: "48px" }}>
              {dashboard.icon}
            </div>

            <div className="card-header">
              <h3 className="card-title">{dashboard.title}</h3>
              <span className="card-category">{dashboard.category}</span>
            </div>

            <p className="card-description">{dashboard.description}</p>

            {dashboard.active && (
              <>
                <div className="card-meta">
                  <div className="meta-item">
                    <span className="meta-label">Registros</span>
                    <span className="meta-value">{dashboard.records}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Atualização</span>
                    <span className="meta-value">{dashboard.updated}</span>
                  </div>
                </div>

                <div className="card-tags">
                  {dashboard.tags?.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="card-actions">
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  dashboard.active && navigate(`/dualforce/${dashboard.id}`);
                }}
              >
                {dashboard.active ? "Abrir Dashboard" : "Bloqueado"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 Visya. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
