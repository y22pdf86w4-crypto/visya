// src/pages/DualForce.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  RefreshCw,
  TrendingUp,
  Users,
  AlertCircle,
  Download,
  Maximize2,
  Minimize2,
  Calendar,
} from "lucide-react";
import ReactApexChart from "react-apexcharts";
import { AlertCarousel, gerarTodos24Cards } from "../components/AlertCarouselCards";
import "../styles/DualForce.css";
import "../styles/AlertCarousel.css";
import api from "../services/api";
import logoImg from "../assets/logo-dualforce.png";

export default function DualForce() {
  const navigate = useNavigate();
  
  // Detectar se é DualForce ou Linhagro baseado na URL
  const isDualForce = window.location.pathname.includes("/dualforce/");
  const apiPrefix = isDualForce ? "/dualforce" : "/linhagro";
  
  const usuario = localStorage.getItem("userdualforce") || "Usuário";
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dadosAPI, setDadosAPI] = useState([]);
  const [filtros, setFiltros] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [tiposAtividade, setTiposAtividade] = useState([]);
  const [evolucaoSemanal, setEvolucaoSemanal] = useState([]);
  const [todos24Cards, setTodos24Cards] = useState([]);

  // Filtros
  const [filtroConsultor, setFiltroConsultor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [dtInicio, setDtInicio] = useState("");
  const [dtFim, setDtFim] = useState("");

  const sanitizarValor = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const extrairNome = (item) => {
    if (!item) return "N/A";
    const nome = item.tipo_atividade || item.nome || item.descricao || "N/A";
    return String(nome).trim();
  };

  // ==================== MÉTRICAS ====================
  const metricas = useMemo(() => {
    if (!dadosAPI || dadosAPI.length === 0) {
      return {
        totalAtividades: 0,
        total30d: 0,
        total60d: 0,
        perc30dNoTotal: 0,
        perc30dNos60d: 0,
        percRestante60d: 0,
        totalClientes: 0,
        totalClientesRisco: 0,
        totalClientesVisitados: 0,
        percRisco: 0,
        percVisitado: 0,
        totalMeta: 0,
        percMetaGlobal: 0,
        ativFaltantes: 0,
      };
    }

    const totalAtividades = dadosAPI.reduce(
      (acc, i) => acc + sanitizarValor(i.qtde_atividades_total),
      0
    );
    const total30d = dadosAPI.reduce(
      (acc, i) => acc + sanitizarValor(i.qtde_atividades_30d),
      0
    );
    const total60d = dadosAPI.reduce(
      (acc, i) => acc + sanitizarValor(i.qtde_atividades_60d),
      0
    );

    const perc30dNoTotal =
      totalAtividades > 0 ? ((total30d / totalAtividades) * 100).toFixed(1) : 0;
    const perc30dNos60d =
      total60d > 0 ? ((total30d / total60d) * 100).toFixed(1) : 0;
    const percRestante60d =
      total60d > 0
        ? (((total60d - total30d) / total60d) * 100).toFixed(1)
        : 0;

    const totalClientes = dadosAPI.reduce(
      (acc, i) => acc + sanitizarValor(i.qtde_clientes_carteira),
      0
    );
    const totalClientesRisco = dadosAPI.reduce(
      (acc, i) => acc + sanitizarValor(i.qtde_clientes_risco),
      0
    );
    const totalClientesVisitados = totalClientes - totalClientesRisco;

    const percRisco =
      totalClientes > 0
        ? ((totalClientesRisco / totalClientes) * 100).toFixed(1)
        : 0;
    const percVisitado =
      totalClientes > 0
        ? ((totalClientesVisitados / totalClientes) * 100).toFixed(1)
        : 0;

    const totalMeta = dadosAPI.reduce(
      (acc, i) => acc + sanitizarValor(i.meta_atividades_mes),
      0
    );
    const percMetaGlobal =
      totalMeta > 0 ? ((totalAtividades / totalMeta) * 100).toFixed(1) : 0;
    const ativFaltantes = Math.max(0, totalMeta - totalAtividades);

    return {
      totalAtividades,
      total30d,
      total60d,
      perc30dNoTotal,
      perc30dNos60d,
      percRestante60d,
      totalClientes,
      totalClientesRisco,
      totalClientesVisitados,
      percRisco,
      percVisitado,
      totalMeta,
      percMetaGlobal,
      ativFaltantes,
    };
  }, [dadosAPI]);

  // ==================== HELPERS VISUAIS ====================
  const calcularStatusSemana = (semanas) => {
    if (semanas.length < 2) return "→";
    const ultima = semanas[semanas.length - 1].total;
    const penultima = semanas[semanas.length - 2].total;
    return ultima > penultima ? "↑" : ultima < penultima ? "↓" : "→";
  };

  const calcularCorSemana = (semanas, index) => {
    if (semanas.length === 0) return "#6b7280";
    const total = semanas[index].total;
    const media =
      semanas.reduce((acc, s) => acc + s.total, 0) / semanas.length;
    if (total >= media * 1.1) return "#10b981";
    if (total <= media * 0.9) return "#ef4444";
    return "#f59e0b";
  };

  // ==================== FUNÇÃO TELA CHEIA ====================
  function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      setFullscreen(false);
    }
  }

  // ==================== EFEITOS ====================
  useEffect(() => {
    const carregarFiltros = async () => {
      const token = localStorage.getItem("tokendualforce");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await api.get(`${apiPrefix}/filtros`);
        if (response.data.sucesso) setFiltros(response.data);
      } catch (err) {
        console.error(`[ERRO] Carregando filtros de ${apiPrefix}:`, err);
      }
    };
    carregarFiltros();
  }, [navigate, apiPrefix]);

  useEffect(() => {
    if (filtros?.dataPadrao) {
      setDtInicio(filtros.dataPadrao);
      setDtFim(new Date().toISOString().split("T")[0]);
    }
  }, [filtros]);

  useEffect(() => {
    if (dtInicio && dtFim) carregarDados();
  }, [dtInicio, dtFim, filtroConsultor, filtroStatus, filtroTipo]);

  useEffect(() => {
    if (dadosAPI.length > 0 && evolucaoSemanal.length > 0) {
      setTodos24Cards(gerarTodos24Cards(metricas, evolucaoSemanal, dadosAPI));
    }
  }, [evolucaoSemanal, dadosAPI, metricas]);

  useEffect(() => {
    const handleFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    const closeMenu = (e) => {
      if (
        !e.target.closest(".profile-dropdown") &&
        !e.target.closest(".btn-settings")
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  // ==================== CARREGAMENTO ====================
  async function carregarDados() {
    const token = localStorage.getItem("tokendualforce");
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const params = new URLSearchParams({ dtInicio, dtFim });
      if (filtroConsultor) params.append("nmVendedor", filtroConsultor);
      if (filtroStatus) params.append("status", filtroStatus);
      if (filtroTipo) params.append("tipoAtividade", filtroTipo);

      const [resResumo, resHist, resTipos, resEvolucao] = await Promise.all([
        api.get(`${apiPrefix}/resumo-geral?${params}`),
        api.get(`${apiPrefix}/historico-global?${params}`),
        api.get(`${apiPrefix}/distribuicao?${params}`),
        api.get(`${apiPrefix}/evolucao?${params}`),
      ]);

      setDadosAPI(
        resResumo.data.sucesso ? resResumo.data.dados || [] : []
      );
      setHistorico(resHist.data.sucesso ? resHist.data.dados || [] : []);
      setTiposAtividade(
        resTipos.data.sucesso ? resTipos.data.dados || [] : []
      );

      if (
        resEvolucao.data.sucesso &&
        Array.isArray(resEvolucao.data.dados)
      ) {
        const semanas = {};
        resEvolucao.data.dados.forEach((i) => {
          if (!semanas[i.semana]) semanas[i.semana] = 0;
          semanas[i.semana] += i.qtd;
        });
        const list = Object.entries(semanas)
          .map(([s, t]) => ({ semana: parseInt(s), total: t }))
          .sort((a, b) => a.semana - b.semana)
          .slice(-4);
        setEvolucaoSemanal(list);
      } else {
        setEvolucaoSemanal([]);
      }
    } catch (err) {
      console.error(`[ERRO] Carregando dados de ${apiPrefix}:`, err);
      setErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  // ==================== GRÁFICOS ====================
  const histSeries = useMemo(
    () => [
      { name: "Atividades", data: historico.map((h) => sanitizarValor(h.total)) },
    ],
    [historico]
  );

  const histOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
      },
      stroke: { curve: "smooth", width: 3 },
      colors: ["#3b82f6"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -6,
        style: { colors: ["#e2e8f0"], fontSize: "10px", fontWeight: 700 },
        background: {
          enabled: true,
          foreColor: "#0f172a",
          padding: 4,
          borderRadius: 2,
          borderWidth: 0,
          opacity: 0.9,
        },
      },
      xaxis: {
        categories: historico.map((h) => h.rotulo || ""),
        labels: { style: { colors: "#9ca3af", fontSize: "10px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "10px" } } },
      grid: {
        borderColor: "#334155",
        strokeDashArray: 3,
        padding: { top: 20, right: 10, bottom: 0, left: 10 },
      },
      tooltip: { theme: "dark" },
    }),
    [historico]
  );

  const tiposSeries = useMemo(
    () => [{ name: "Qtd", data: tiposAtividade.map((t) => sanitizarValor(t.qtd)) }],
    [tiposAtividade]
  );

  const tiposOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        background: "transparent",
      },
      plotOptions: {
        bar: {
          borderRadius: 3,
          horizontal: false,
          distributed: true,
          columnWidth: "60%",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: { colors: ["#e2e8f0"], fontSize: "10px", fontWeight: 700 },
      },
      colors: [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
      ],
      xaxis: {
        categories: tiposAtividade.map((t) => extrairNome(t)),
        labels: {
          style: { colors: "#9ca3af", fontSize: "9px" },
          rotate: 0,
          trim: true,
          maxHeight: 60,
        },
        axisBorder: { show: false },
      },
      yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "10px" } } },
      grid: {
        borderColor: "#334155",
        strokeDashArray: 3,
        padding: { top: 20, right: 0, bottom: 0, left: 5 },
      },
      tooltip: { theme: "dark" },
      legend: { show: false },
    }),
    [tiposAtividade]
  );

  // ==================== RENDER ====================
  return (
    <div className={`dualforce-page ${fullscreen ? "fullscreen" : ""}`}>
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <img
            src={logoImg}
            alt="Logo"
            className="logo-image"
            style={{ height: "40px", width: "auto", objectFit: "contain" }}
          />
          <span className="page-title"></span>
        </div>

        <div className="header-filters-row">
          <div className="filter-group-date">
            <div className="input-with-icon">
              <Calendar size={14} className="input-icon" />
              <input
                type="date"
                value={dtInicio}
                onChange={(e) => setDtInicio(e.target.value)}
              />
            </div>
            <span className="date-separator">até</span>
            <div className="input-with-icon">
              <Calendar size={14} className="input-icon" />
              <input
                type="date"
                value={dtFim}
                onChange={(e) => setDtFim(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-divider" />
          <div className="filter-group-selects">
            <select
              value={filtroConsultor}
              onChange={(e) => setFiltroConsultor(e.target.value)}
            >
              <option value="">Todos Consultores</option>
              {filtros?.consultores?.map((c) => (
                <option key={c.idPrincipal} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos Status</option>
              {filtros?.status?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos Tipos</option>
              {filtros?.tiposAtividade?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="header-right">
          <div className="action-buttons">
            <button
              className="btn-icon"
              onClick={carregarDados}
              title="Atualizar"
            >
              <RefreshCw size={16} />
            </button>
            <button className="btn-icon" onClick={() => {}} title="Exportar">
              <Download size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={toggleFullscreen}
              title="Tela Cheia"
            >
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
          <div className="header-divider-vertical" />
          <div className="user-section">
            <div className="avatar-mini">{usuario.charAt(0)}</div>
            <div className="user-text">
              <span className="u-name">{usuario}</span>
              <span className="u-role">Conectado</span>
            </div>
            <button
              className="btn-settings"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              ⚙️
            </button>
            <button className="btn-logout-mini" onClick={() => navigate("/menu")}>
              <LogOut size={14} /> Voltar
            </button>
          </div>
        </div>
      </header>

      {profileOpen && (
        <div
          className="profile-dropdown active"
          style={{ top: "65px", right: "20px" }}
        >
          <div className="dropdown-header">
            <span className="user-name">{usuario}</span>
          </div>
          <a className="dropdown-item logout" onClick={() => navigate("/")}>
            Sair
          </a>
        </div>
      )}

      <main className="dualforce-main">
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Carregando...</p>
          </div>
        ) : (
          <div className="dualforce-grid">
            <div className="main-column">
              {/* Linha 1: KPIs */}
              <div className="kpis-row kpis-main">
                <div className="kpi-card">
                  <div className="kpi-icon icon-blue">
                    <TrendingUp size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Total</span>
                    <div className="kpi-value">{metricas.totalAtividades}</div>
                    <div className="kpi-meta">
                      {metricas.perc30dNoTotal}% dos últimos 30 dias
                    </div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-green">
                    <TrendingUp size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">30 Dias</span>
                    <div className="kpi-value">{metricas.total30d}</div>
                    <div className="kpi-meta">Atividades recentes</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-yellow">
                    <TrendingUp size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">60 Dias</span>
                    <div className="kpi-value">{metricas.total60d}</div>
                    <div className="kpi-meta" style={{ fontSize: "9px" }}>
                      {metricas.perc30dNos60d}% (30d) |{" "}
                      {metricas.percRestante60d}% (Anterior)
                    </div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-red">
                    <AlertCircle size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Risco</span>
                    <div className="kpi-value">
                      {metricas.totalClientesRisco}
                    </div>
                    <div className="kpi-meta">
                      Clientes não visitados no período
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha 2: Secundários */}
              <div className="kpis-row kpis-secundarios">
                <div className="kpi-card">
                  <div className="kpi-icon icon-green">
                    <Users size={20} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Visitados</span>
                    <div className="kpi-value">
                      {metricas.totalClientesVisitados}
                    </div>
                    <div className="kpi-meta">
                      Clientes com agenda realizada
                    </div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-blue">
                    <Users size={20} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Carteira</span>
                    <div className="kpi-value">{metricas.totalClientes}</div>
                    <div className="kpi-meta">Total de clientes na carteira</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-purple">
                    <TrendingUp size={20} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Média/Dia</span>
                    <div className="kpi-value">
                      {(metricas.totalAtividades / 22).toFixed(1)}
                    </div>
                    <div className="kpi-meta">
                      Média de atividades por dia
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha 3: Barras */}
              <div className="cards-row-horizontal">
                <div className="card card-carteira">
                  <div
                    className="card-label"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Cobertura</span>
                    <span>
                      {metricas.totalClientesVisitados}/
                      {metricas.totalClientes} ({metricas.percVisitado}%)
                    </span>
                  </div>
                  <div className="carteira-bar">
                    <div
                      className="carteira-segment visita"
                      style={{ width: `${metricas.percVisitado}%` }}
                    />
                    <div
                      className="carteira-segment risco"
                      style={{ width: `${metricas.percRisco}%` }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      marginTop: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Visitados: {metricas.totalClientesVisitados}</span>
                    <span>Risco: {metricas.totalClientesRisco}</span>
                  </div>
                </div>
                <div className="card meta-card-horizontal">
                  <div
                    className="card-label"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Meta Global</span>
                    <span>
                      {metricas.totalAtividades}/{metricas.totalMeta} (
                      {metricas.percMetaGlobal}%)
                    </span>
                  </div>
                  <div className="progress-bar-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(metricas.percMetaGlobal, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      marginTop: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Realizado: {metricas.totalAtividades}</span>
                    <span>Faltam: {metricas.ativFaltantes}</span>
                  </div>
                </div>
              </div>

              {/* GRÁFICOS */}
              <div className="graphs-row">
                <div className="card grafico-historico-card">
                  <div className="grafico-header">
                    <span className="card-label">Evolução</span>
                  </div>
                  {historico.length > 0 ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "150px",
                      }}
                    >
                      <ReactApexChart
                        options={histOptions}
                        series={histSeries}
                        type="line"
                        height="100%"
                        width="100%"
                      />
                    </div>
                  ) : (
                    <div className="no-data-chart">Sem dados</div>
                  )}
                </div>
                <div className="card grafico-tipos-card">
                  <div className="grafico-header">
                    <span className="card-label">Tipos</span>
                  </div>
                  {tiposAtividade.length > 0 ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "150px",
                      }}
                    >
                      <ReactApexChart
                        options={tiposOptions}
                        series={tiposSeries}
                        type="bar"
                        height="100%"
                        width="100%"
                      />
                    </div>
                  ) : (
                    <div className="no-data-chart">Sem dados</div>
                  )}
                </div>
              </div>

              {/* Tabela */}
              <div className="consultores-table">
                <div className="table-scroll-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Consultor</th>
                        <th>Ativ.</th>
                        <th>Meta</th>
                        <th>%</th>
                        <th>Risco</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosAPI.length > 0 ? (
                        dadosAPI.map((i, idx) => (
                          <tr key={idx}>
                            <td>{i.consultor}</td>
                            <td>{i.qtde_atividades_total}</td>
                            <td>{i.meta_atividades_mes}</td>
                            <td>
                              {i.pct_meta_atividades_mes?.toFixed(1)}%
                            </td>
                            <td>{i.qtde_clientes_risco}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            style={{
                              textAlign: "center",
                              padding: "20px",
                            }}
                          >
                            Sem dados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Alertas */}
            <aside className="alerts-column">
              {todos24Cards.length > 0 && (
                <AlertCarousel
                  todos24Cards={todos24Cards}
                  evolucaoSemanal={evolucaoSemanal}
                  calcularCorSemana={calcularCorSemana}
                  calcularStatusSemana={calcularStatusSemana}
                />
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}