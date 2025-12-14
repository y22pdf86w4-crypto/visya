// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LogIn } from "lucide-react";
import api from "../services/api";
import "../styles/login.css";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Gerar partículas/estrelas aleatórias
  useEffect(() => {
    const container = document.querySelector(".login-page");
    if (!container) return;

    const oldStars = container.querySelectorAll(".star");
    oldStars.forEach((star) => star.remove());

    for (let i = 0; i < 12; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.top = Math.random() * 100 + "%";
      star.style.left = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 3 + "s";
      container.appendChild(star);
    }
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
      const res = await api.post("/visya/login", { usuario, senha });
      const { token, usuario: userNome } = res.data;

      if (!token) {
        setErro("Resposta inválida do servidor.");
        setLoading(false);
        return;
      }

      localStorage.setItem("tokendualforce", token);
      localStorage.setItem("userdualforce", userNome || usuario);

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
      <div className="login-container">
        {/* ========== COLUNA ESQUERDA: EXPLICATIVO + FORM ========== */}
        <div className="login-left">
          <h1 className="visya-title">Visya</h1>

          <p className="login-description">
            <strong>Visya</strong> é a plataforma que conecta análise avançada
            de dados à <strong> visão estratégica</strong> do seu negócio,
            transformando informação em decisões seguras e resultados
            consistentes.
          </p>

          {erro && (
            <div className="error-msg">
              <AlertCircle size={16} />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Usuário</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Seu login"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? (
                "Entrando..."
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ========== COLUNA DIREITA: ASTRONAUTA FLUTUANDO ========== */}
        <div className="login-right">
          <div className="astronaut-container">
            <div className="astronaut-glow"></div>
            <img
              src="https://uiverse.io/astronaut.png"
              alt="Astronauta Visya"
            />
          </div>
        </div>
      </div>
    </div>
  );
}