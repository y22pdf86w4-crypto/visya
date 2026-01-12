// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import api from "../services/api";
import logoVisya from "../assets/logovisya.png";
import "../styles/login.css";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Gerar partículas flutuantes
  useEffect(() => {
    const container = document.querySelector(".particles-container");
    if (!container) return;

    const oldParticles = container.querySelectorAll(".particle");
    oldParticles.forEach((p) => p.remove());

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 20 + "s";
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      container.appendChild(particle);
    }

    // Carregar email salvo
    const savedEmail = localStorage.getItem("visya_email");
    if (savedEmail) setUsuario(savedEmail);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    if (!usuario || !senha) {
      setErro("Preencha usuário e senha.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post(
        "https://api.salesplan.com.br/api/login",
        { usuario, senha }
      );
      const { token, usuario: userNome } = res.data;

      if (!token) {
        setErro("Resposta inválida do servidor.");
        setLoading(false);
        return;
      }

      localStorage.setItem("tokendualforce", token);
      localStorage.setItem("userdualforce", userNome || usuario);
      localStorage.setItem("visya_email", usuario);

      navigate("/menu");
    } catch (err) {
      const msg =
        err?.response?.data?.erro ||
        "Usuário ou senha inválidos. Tente novamente.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Background Container */}
      <div className="bg-container">
        <div className="animated-bg"></div>
        <div className="grid-bg"></div>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="wave-container">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <div className="particles-container"></div>
        <div className="plant-decoration plant-1">🌱</div>
        <div className="plant-decoration plant-2">🌿</div>
      </div>

      {/* Main Container */}
      <div className="container">
        {/* Left Section - Conteúdo */}
        <div className="left-section">
          <div className="header-brand">
            <div className="logo-container">
              <img src={logoVisya} alt="Visya Logo" className="logo-image" />
            </div>
            <div className="brand-text">
              <h1>Visya</h1>
              <p>Dashboard de Plantas & Agricultura</p>
            </div>
          </div>

          <div className="hero-section">
            <h2 className="hero-title">
              Gerencie sua <span>equipe</span> com inteligência
              <span className="typing-cursor"></span>
            </h2>
            <p className="hero-description">
              Visya é a plataforma que conecta análise avançada de dados à
              visão estratégica do seu negócio, transformando informação em
              decisões seguras e resultados consistentes.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-title">Dashboards Personalizados</div>
              <div className="feature-desc">
                Crie visualizações customizadas para seus dados
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <div className="feature-title">Análise com IA</div>
              <div className="feature-desc">
                Predições inteligentes de crescimento
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <div className="feature-title">Acesso Mobile</div>
              <div className="feature-desc">
                Monitore seus números de qualquer lugar
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">Automação Inteligente</div>
              <div className="feature-desc">Processos otimizados e eficientes</div>
            </div>
          </div>

          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-number">2K+</div>
              <div className="stat-label">Usuários Ativos</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500M+</div>
              <div className="stat-label">Dados Processados</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Card */}
        <div className="right-section">
          <div className="login-wrapper">
            <div className="login-card">
              <div className="card-header">
                <h2>Bem-vindo ao Visya</h2>
                <p>Acesse sua conta para gerenciar sua operação</p>
              </div>

              <form onSubmit={handleLogin}>
                {erro && (
                  <div className="error-msg">
                    <AlertCircle size={16} />
                    <span>{erro}</span>
                  </div>
                )}

                {/* Usuário */}
                <div className="form-group">
                  <label htmlFor="usuario" className="form-label">
                    Usuário
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="usuario"
                      className="form-input"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder="Seu usuário"
                      autoComplete="username"
                      required
                    />
                    <span className="input-icon">🌱</span>
                  </div>
                </div>

                {/* Senha */}
                <div className="form-group">
                  <label htmlFor="senha" className="form-label">
                    Senha
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="senha"
                      className="form-input"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <span
                      className="input-icon input-toggle-pwd"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer", pointerEvents: "all" }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                </div>

                {/* Botão Login */}
                <button
                  type="submit"
                  className={`login-btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  <span className="btn-loading-spinner"></span>
                  {loading ? "Entrando..." : "Fazer Login"}
                </button>

                {/* Security Badge */}
                <div className="security-badge">
                  <div className="security-icon">✓</div>
                  <span>Conexão segura e criptografada (SSL 256-bit)</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}