import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Lock } from "lucide-react";
import "../styles/menu.css";

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
      description: "Análise completa de atividades, prospecção e performance de vendedores. Acesso ao painel principal com todas as métricas e KPIs.",
      icon: "📊",
      category: "Principal",
      records: "454",
      updated: "Hoje",
      tags: ["Atividades", "Performance", "Vendedores"],
      chave: "dualforce",
      requiredRole: ["admin", "gestor", "vendedor"],
      rota: "/dualforce/1",
    },
    {
      id: 2,
      title: "Relatórios",
      description: "Relatórios detalhados de vendas, prospecção e funil de conversão com análise temporal.",
      icon: "📈",
      category: "Análise",
      records: "892",
      updated: "Ontem",
      tags: ["Vendas", "Conversão", "Funil"],
      chave: "relatorios",
      requiredRole: ["admin", "gestor"],
      rota: "/relatorios/2",
    },
    {
      id: 3,
      title: "Integrações",
      description: "Gerenciamento de integrações com sistemas externos, APIs e webhooks configurados.",
      icon: "🔗",
      category: "Configuração",
      records: "12",
      updated: "Semana passada",
      tags: ["APIs", "Webhooks", "Sincronização"],
      chave: "integraccoes",
      requiredRole: ["admin"],
      rota: "/integraccoes/3",
    },
    {
      id: 4,
      title: "Gerenciamento de Usuários",
      description: "Controle completo de usuários, roles, permissões e acessos do sistema.",
      icon: "👥",
      category: "Administração",
      records: "28",
      updated: "Hoje",
      tags: ["Permissões", "Roles", "Acesso"],
      chave: "usuarios",
      requiredRole: ["admin"],
      rota: "/usuarios/4",
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
    }, 500);

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
      vendedor: "#95E1D3",
    };
    return colors[userRole] || "#95E1D3";
  }

  return (
    <div className="home-page">
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
            <div className="avatar-small" style={{ backgroundColor: getRoleColor() }}>
              {usuario.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-small">
              <div className="user-name-small">{usuario}</div>
              <div className="user-email-small" style={{ fontSize: "11px", color: getRoleColor() }}>
                {userRole.toUpperCase()}
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

      {profileOpen && (
        <div className="profile-dropdown active">
          <div className="dropdown-header">
            <span className="user-name">{usuario}</span>
            <span
              className="user-email"
              style={{
                fontSize: "12px",
                backgroundColor: getRoleColor(),
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              {userRole.toUpperCase()}
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
          <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #eee" }} />
          <a href="#" className="dropdown-item logout" onClick={handleLogout}>
            🚪 Sair
          </a>
        </div>
      )}

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bem-vindo, <span className="gradient-text">{usuario}</span>
          </h1>
          <p className="hero-subtitle">
            Monitore em tempo real todos os seus dashboards, relatórios e métricas em um único lugar seguro e intuitivo.
          </p>
          <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
            <strong>Perfil:</strong>{" "}
            <span
              style={{
                backgroundColor: getRoleColor(),
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: "600",
              }}
            >
              {userRole === "admin"
                ? "Administrador"
                : userRole === "gestor"
                ? "Gestor"
                : "Vendedor"}
            </span>
          </div>
        </div>
      </section>

      <section className="dashboards-section">
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
            Meus Dashboards
          </h2>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Você tem acesso a {dashboards.length} dashboard{dashboards.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="dashboards-grid">
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f0f0f0",
                  borderTop: "4px solid #4ECDC4",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ marginTop: "16px", color: "#666" }}>Carregando dashboards...</p>
            </div>
          ) : dashboards.length > 0 ? (
            dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="dashboard-card"
                style={{ cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div className="card-icon" style={{ fontSize: "48px", marginBottom: "12px" }}>
                  {dashboard.icon}
                </div>

                <div className="card-header" style={{ marginBottom: "12px" }}>
                  <h3 className="card-title" style={{ marginBottom: "4px" }}>
                    {dashboard.title}
                  </h3>
                  <span
                    className="card-category"
                    style={{
                      backgroundColor: getRoleColor(),
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {dashboard.category}
                  </span>
                </div>

                <p className="card-description" style={{ marginBottom: "16px", minHeight: "48px" }}>
                  {dashboard.description}
                </p>

                <div className="card-meta" style={{ marginBottom: "12px" }}>
                  <div className="meta-item">
                    <span className="meta-label">Registros</span>
                    <span className="meta-value">{dashboard.records}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Atualização</span>
                    <span className="meta-value">{dashboard.updated}</span>
                  </div>
                </div>

                <div className="card-tags" style={{ marginBottom: "16px" }}>
                  {dashboard.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="tag"
                      style={{
                        backgroundColor: "#f0f0f0",
                        color: "#333",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        marginRight: "4px",
                        marginBottom: "4px",
                        display: "inline-block",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      backgroundColor: getRoleColor(),
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                    onClick={() => handleOpenDashboard(dashboard)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Abrir Dashboard
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
              <Lock size={64} style={{ marginBottom: "16px", opacity: 0.3 }} />
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                Sem Acesso a Dashboards
              </h3>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                Você não tem permissão para acessar nenhum dashboard no momento.
              </p>
              <p style={{ fontSize: "13px", color: "#999" }}>
                Entre em contato com um administrador para solicitar acesso.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="footer" style={{ marginTop: "60px", textAlign: "center", padding: "24px", color: "#999", borderTop: "1px solid #eee" }}>
        <p>© 2025 Visya. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}