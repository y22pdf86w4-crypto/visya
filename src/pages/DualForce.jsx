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
import GraficoEvolucaoGradiente from "../components/GraficoEvolucaoGradiente";
import api from "../services/api";
import logoImg from "../assets/logo-dualforce.png";
export default function DualForce() {
  const navigate = useNavigate();

  // Detectar tenant da URL
  const isDualForce = window.location.pathname.includes("/dualforce/");
  const apiPrefix = isDualForce ? "/dualforce" : "/linhagro";
  const storagePrefix = isDualForce ? "dualforce" : "linhagro";

  const usuario = localStorage.getItem(`user${storagePrefix}`) || "Usuário";
  const tokenKey = `token${storagePrefix}`;

  const [profileOpen, setProfileOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  
  // States de Dados
  const [dadosAPI, setDadosAPI] = useState([]); // Tabela (Filtro User)
  const [dadosKPI, setDadosKPI] = useState([]); // KPIs (60 dias fixos)
  const [historico, setHistorico] = useState([]); // ✅ Gráfico (Ano Atual Fixo)
  
  const [filtros, setFiltros] = useState(null);
  const [tiposAtividade, setTiposAtividade] = useState([]);
  const [evolucaoSemanal, setEvolucaoSemanal] = useState([]);

  // Filtros Visuais
  const [filtroConsultor, setFiltroConsultor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [dtInicio, setDtInicio] = useState("");
  const [dtFim, setDtFim] = useState("");

  const sanitizarValor = (val) => {
    const num = Number(val);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  const extrairNome = (item) => {
    if (!item) return "N/A";
    const nome = item.tipo_atividade || item.nome || item.descricao || "N/A";
    return String(nome).trim();
  };

  // 1. Datas Iniciais (Para o Filtro Visual do Calendário)
  const obterDatasDoMesAtual = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return { 
      inicio: primeiroDia.toISOString().split("T")[0], 
      fim: hoje.toISOString().split("T")[0] 
    };
  };

  // 2. Datas para KPIs (Oculto: últimos 60 dias reais)
  const getDatasKPI = () => {
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(fim.getDate() - 60);
    return {
      dtInicioKPI: inicio.toISOString().split('T')[0],
      dtFimKPI: fim.toISOString().split('T')[0]
    };
  };

  // 3. ✅ NOVO: Datas para Gráfico (Oculto: Ano Completo Jan-Dez)
  const getDatasAnoAtual = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear(); // Pega 2025, 2026, etc.
    return {
      dtInicioAno: `${ano}-01-01`,
      dtFimAno: `${ano}-12-31`
    };
  };

  // ==================== MÉTRICAS ====================
  const metricas = useMemo(() => {
    // Fonte 1: Dados Filtrados (Tabela/Total)
    const listaFiltrada = dadosAPI || [];
    // Fonte 2: Dados KPI 60 Dias (Cards 30/60)
    const listaKPI = (dadosKPI && dadosKPI.length > 0) ? dadosKPI : listaFiltrada;

    const totalAtividades = listaFiltrada.reduce((acc, i) => acc + sanitizarValor(i.qtde_atividades_mes), 0);
    const totalClientes = listaFiltrada.reduce((acc, i) => acc + sanitizarValor(i.qtde_clientes_carteira), 0);
    const totalClientesRisco = listaFiltrada.reduce((acc, i) => acc + sanitizarValor(i.qtde_clientes_risco), 0);
    const totalClientesVisitado = totalClientes - totalClientesRisco;
    const totalMeta = listaFiltrada.reduce((acc, i) => acc + sanitizarValor(i.meta_atividades_mes), 0);

    const total30d = listaKPI.reduce((acc, i) => acc + sanitizarValor(i.qtde_atividades_30d), 0);
    const total60d = listaKPI.reduce((acc, i) => acc + sanitizarValor(i.qtde_atividades_60d), 0);

    const perc30dNos60d = total60d > 0 ? ((total30d / total60d) * 100).toFixed(1) : 0;
    const percRestante60d = total60d > 0 ? (((total60d - total30d) / total60d) * 100).toFixed(1) : 0;
    const perc30dNoTotal = totalAtividades > 0 ? ((total30d / totalAtividades) * 100).toFixed(1) : 0;

    const percRisco = totalClientes > 0 ? ((totalClientesRisco / totalClientes) * 100).toFixed(1) : 0;
    const percVisitado = totalClientes > 0 ? ((totalClientesVisitado / totalClientes) * 100).toFixed(1) : 0;
    const percMetaGlobal = totalMeta > 0 ? ((totalAtividades / totalMeta) * 100).toFixed(1) : 0;
    const ativFaltantes = Math.max(0, totalMeta - totalAtividades);

    return {
      totalAtividades, total30d, total60d, perc30dNoTotal, perc30dNos60d, percRestante60d,
      totalClientes, totalClientesRisco, totalClientesVisitado, percRisco, percVisitado,
      totalMeta, percMetaGlobal, ativFaltantes,
    };
  }, [dadosAPI, dadosKPI]);

  // Média Dia (Baseado no Filtro Visual)
  const mediaDia = useMemo(() => {
    const total = sanitizarValor(metricas.totalAtividades);
    if (!dtInicio || !dtFim) return 0;
    const start = new Date(dtInicio);
    const end = new Date(dtFim);
    const hoje = new Date();
    const dataFinalConsiderada = end > hoje ? hoje : end;
    const diffTime = Math.abs(dataFinalConsiderada - start);
    const diasCorridos = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const diasBase = Math.max(diasCorridos, 1);
    return (total / diasBase).toFixed(1);
  }, [metricas.totalAtividades, dtInicio, dtFim]);

  const todos24Cards = useMemo(() => {
    if (dadosAPI.length > 0 && evolucaoSemanal.length > 0) {
      return gerarTodos24Cards(metricas, evolucaoSemanal, dadosAPI);
    }
    return [];
  }, [metricas, evolucaoSemanal, dadosAPI]);

  // Helpers Visuais
  const calcularStatusSemana = (semanas) => {
    if (semanas.length < 2) return "→";
    const ultima = semanas[semanas.length - 1].total;
    const penultima = semanas[semanas.length - 2].total;
    return ultima > penultima ? "↑" : ultima < penultima ? "↓" : "→";
  };

  const calcularCorSemana = (semanas, index) => {
    if (semanas.length === 0) return "#6b7280";
    const total = semanas[index].total;
    const media = semanas.reduce((acc, s) => acc + s.total, 0) / semanas.length;
    if (total >= media * 1.1) return "#10b981";
    if (total <= media * 0.9) return "#ef4444";
    return "#f59e0b";
  };

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.() || document.documentElement.webkitRequestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      setFullscreen(false);
    }
  }

  // Efeitos
  useEffect(() => {
    const carregarFiltros = async () => {
      const token = localStorage.getItem(tokenKey);
      if (!token) return navigate("/");
      try {
        const response = await api.get(`${apiPrefix}/filtros`);
        if (response.data.sucesso) setFiltros(response.data);
        const { inicio, fim } = obterDatasDoMesAtual();
        setDtInicio(inicio);
        setDtFim(fim);
      } catch (err) {
        setErro("Erro ao carregar filtros");
      }
    };
    carregarFiltros();
  }, [navigate, apiPrefix, tokenKey]);

  useEffect(() => {
    if (dtInicio && dtFim) carregarDados();
  }, [dtInicio, dtFim, filtroConsultor, filtroStatus, filtroTipo]);

  useEffect(() => {
    const handleFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest(".profile-dropdown") && !e.target.closest(".btn-settings")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  // ==================== CARREGAMENTO (AJUSTADO) ====================
  async function carregarDados() {
    const token = localStorage.getItem(tokenKey);
    if (!token) return navigate("/");

    setLoading(true);
    setErro("");

    try {
      // 1. Params da Tabela (Filtro do Usuário)
      const paramsTabela = new URLSearchParams({ dtInicio, dtFim });
      if (filtroConsultor) paramsTabela.append("nmVendedor", filtroConsultor);
      if (filtroStatus) paramsTabela.append("status", filtroStatus);
      if (filtroTipo) paramsTabela.append("tipoAtividade", filtroTipo);

      // 2. Params dos KPIs (60 dias fixos)
      const { dtInicioKPI, dtFimKPI } = getDatasKPI();
      const paramsKPI = new URLSearchParams({ dtInicio: dtInicioKPI, dtFim: dtFimKPI });
      if (filtroConsultor) paramsKPI.append("nmVendedor", filtroConsultor);
      if (filtroStatus) paramsKPI.append("status", filtroStatus);
      if (filtroTipo) paramsKPI.append("tipoAtividade", filtroTipo);

      // 3. ✅ NOVO: Params do Gráfico (Ano Completo: 01/01 a 31/12)
      const { dtInicioAno, dtFimAno } = getDatasAnoAtual();
      const paramsChart = new URLSearchParams({ dtInicio: dtInicioAno, dtFim: dtFimAno });
      if (filtroConsultor) paramsChart.append("nmVendedor", filtroConsultor);
      if (filtroStatus) paramsChart.append("status", filtroStatus);
      if (filtroTipo) paramsChart.append("tipoAtividade", filtroTipo);

      // 4. Request Paralelo
      const [resTabela, resKPI, resHist, resTipos, resEvolucao] = await Promise.all([
        api.get(`${apiPrefix}/resumo-geral?${paramsTabela}`), // Tabela/Total
        api.get(`${apiPrefix}/resumo-geral?${paramsKPI}`),    // KPIs Reais
        api.get(`${apiPrefix}/historico-global?${paramsChart}`), // ✅ Gráfico Ano Completo
        api.get(`${apiPrefix}/distribuicao?${paramsTabela}`),
        
        // Evolução Semanal (Mantivemos separado pois usa endpoint diferente)
        api.get(`${apiPrefix}/evolucao?periodo=mes&${filtroConsultor ? `nmVendedor=${filtroConsultor}` : ''}${filtroStatus ? `&status=${filtroStatus}` : ''}${filtroTipo ? `&tipoAtividade=${filtroTipo}` : ''}`) 
      ]);

      // 5. Setar Estados
      setDadosAPI(resTabela.data.sucesso ? resTabela.data.dados || [] : []);
      setDadosKPI(resKPI.data.sucesso ? resKPI.data.dados || [] : []);
      setHistorico(resHist.data.sucesso ? resHist.data.dados || [] : []); // Agora contém o ano todo
      setTiposAtividade(resTipos.data.sucesso ? resTipos.data.dados || [] : []);

      if (resEvolucao.data.sucesso && Array.isArray(resEvolucao.data.dados)) {
        const meses = {};
        resEvolucao.data.dados.forEach((i) => {
          if (!meses[i.mes]) meses[i.mes] = { mes: i.mes, total: 0, rotulo: i.rotulo };
          meses[i.mes].total += i.qtd;
        });
        setEvolucaoSemanal(Object.values(meses).sort((a, b) => a.mes - b.mes));
      } else {
        setEvolucaoSemanal([]);
      }

    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  // Configuração Gráfico Histórico
  const histSeries = useMemo(() => [{
    name: "Atividades",
    data: historico.map((h) => sanitizarValor(h.total)),
  }], [historico]);

  const histOptions = useMemo(() => ({
    chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false }, background: "transparent" },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#3b82f6"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } },
    dataLabels: {
      enabled: true,
      offsetY: -6,
      style: { colors: ["#e2e8f0"], fontSize: "10px", fontWeight: 700 },
      background: { enabled: true, foreColor: "#0f172a", padding: 4, borderRadius: 2, borderWidth: 0, opacity: 0.9 },
    },
    xaxis: {
      categories: historico.map((h) => h.rotulo || ""),
      labels: { style: { colors: "#9ca3af", fontSize: "10px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "10px" } } },
    grid: { borderColor: "#334155", strokeDashArray: 3, padding: { top: 20, right: 10, bottom: 0, left: 10 } },
    tooltip: { theme: "dark" },
  }), [historico]);

  // (Restante dos gráficos e Render igual ao anterior...)
  // Vou abreviar a parte visual dos tipos e renderização pois é idêntica ao que já funcionava
  // O foco aqui é a lógica do carregarDados acima.
  
  const tiposSeries = useMemo(() => [{ name: "Qtd", data: tiposAtividade.map((t) => sanitizarValor(t.qtd)) }], [tiposAtividade]);
  const tiposOptions = useMemo(() => ({ /* ... opções do gráfico de barras mantidas ... */ 
      chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
      plotOptions: { bar: { borderRadius: 3, horizontal: false, distributed: true, columnWidth: "60%", dataLabels: { position: "top" } } },
      dataLabels: { enabled: true, offsetY: -20, style: { colors: ["#e2e8f0"], fontSize: "10px", fontWeight: 700 } },
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"],
      xaxis: { categories: tiposAtividade.map((t) => extrairNome(t)), labels: { style: { colors: "#9ca3af", fontSize: "9px" }, rotate: 0, trim: true, maxHeight: 60 }, axisBorder: { show: false } },
      yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "10px" } } },
      grid: { borderColor: "#334155", strokeDashArray: 3, padding: { top: 20, right: 0, bottom: 0, left: 5 } },
      tooltip: { theme: "dark" }, legend: { show: false },
  }), [tiposAtividade]);

  return (
    <div className={`dualforce-page ${fullscreen ? "fullscreen" : ""}`}>
      <header className="header">
        {/* ... Header igual ... */}
        <div className="header-left">
          <img src={logoImg} alt="Logo" className="logo-image" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
          <span className="page-title">{isDualForce ? "DualForce" : "Linhagro"}</span>
        </div>
        <div className="header-filters-row">
          <div className="filter-group-date">
            <div className="input-with-icon">
              <Calendar size={14} className="input-icon" />
              <input type="date" value={dtInicio} onChange={(e) => setDtInicio(e.target.value)} title="Selecione a data inicial" />
            </div>
            <span className="date-separator">até</span>
            <div className="input-with-icon">
              <Calendar size={14} className="input-icon" />
              <input type="date" value={dtFim} onChange={(e) => setDtFim(e.target.value)} title="Selecione a data final" />
            </div>
          </div>
          <div className="filter-divider" />
          <div className="filter-group-selects">
            <select value={filtroConsultor} onChange={(e) => setFiltroConsultor(e.target.value)}>
              <option value="">Todos Consultores</option>
              {filtros?.consultores?.map((c) => <option key={c.idPrincipal} value={c.nome}>{c.nome}</option>)}
            </select>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="">Todos Status</option>
              {filtros?.status?.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos Tipos</option>
              {filtros?.tiposAtividade?.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
        </div>
        <div className="header-right">
           <div className="action-buttons">
            <button className="btn-icon" onClick={carregarDados} title="Atualizar"><RefreshCw size={16} /></button>
            <button className="btn-icon" onClick={() => {}} title="Exportar"><Download size={16} /></button>
            <button className="btn-icon" onClick={toggleFullscreen} title="Tela Cheia">{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          </div>
          <div className="header-divider-vertical" />
          <div className="user-section">
            <div className="avatar-mini">{usuario.charAt(0)}</div>
            <div className="user-text"><span className="u-name">{usuario}</span><span className="u-role">Conectado</span></div>
            <button className="btn-settings" onClick={() => setProfileOpen(!profileOpen)}>⚙️</button>
            <button className="btn-logout-mini" onClick={() => navigate("/menu")}><LogOut size={14} /> Voltar</button>
          </div>
        </div>
      </header>

      {profileOpen && (
        <div className="profile-dropdown active" style={{ top: "65px", right: "20px" }}>
          <div className="dropdown-header"><span className="user-name">{usuario}</span></div>
          <a className="dropdown-item logout" onClick={() => navigate("/")}>Sair</a>
        </div>
      )}

      <main className="dualforce-main">
        {loading ? (
          <div className="loading-container"><div className="spinner" /><p>Carregando...</p></div>
        ) : erro ? (
          <div className="error-container"><AlertCircle size={32} /><p>{erro}</p><button onClick={carregarDados}>Tentar novamente</button></div>
        ) : (
          <div className="dualforce-grid">
            <div className="main-column">
              {/* KPIs Principais */}
              <div className="kpis-row kpis-main">
                <div className="kpi-card">
                  <div className="kpi-icon icon-blue"><TrendingUp size={24} /></div>
                  <div className="kpi-content"><span className="kpi-label">Total</span><div className="kpi-value">{metricas.totalAtividades}</div><div className="kpi-meta">{metricas.perc30dNoTotal}% dos últimos 30 dias</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-green"><TrendingUp size={24} /></div>
                  <div className="kpi-content"><span className="kpi-label">30 Dias</span><div className="kpi-value">{metricas.total30d}</div><div className="kpi-meta">Atividades recentes (Real)</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-yellow"><TrendingUp size={24} /></div>
                  <div className="kpi-content"><span className="kpi-label">60 Dias</span><div className="kpi-value">{metricas.total60d}</div><div className="kpi-meta" style={{ fontSize: "9px" }}>{metricas.perc30dNos60d}% (30d) | {metricas.percRestante60d}% (Anterior)</div></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon icon-red"><AlertCircle size={24} /></div>
                  <div className="kpi-content"><span className="kpi-label">Risco</span><div className="kpi-value">{metricas.totalClientesRisco}</div><div className="kpi-meta">Clientes não visitados no período</div></div>
                </div>
              </div>

              {/* KPIs Secundários */}
              <div className="kpis-row kpis-secundarios">
                <div className="kpi-card">
                   <div className="kpi-icon icon-green"><Users size={20} /></div>
                   <div className="kpi-content"><span className="kpi-label">Visitados</span><div className="kpi-value">{metricas.totalClientesVisitado}</div><div className="kpi-meta">Clientes com agenda realizada</div></div>
                </div>
                <div className="kpi-card">
                   <div className="kpi-icon icon-blue"><Users size={20} /></div>
                   <div className="kpi-content"><span className="kpi-label">Carteira</span><div className="kpi-value">{metricas.totalClientes}</div><div className="kpi-meta">Total de clientes na carteira</div></div>
                </div>
                <div className="kpi-card">
                   <div className="kpi-icon icon-purple"><TrendingUp size={20} /></div>
                   <div className="kpi-content"><span className="kpi-label">Média/Dia</span><div className="kpi-value">{mediaDia}</div><div className="kpi-meta">Média de atividades por dia</div></div>
                </div>
              </div>

              {/* Linha 3: Barras */}
              <div className="cards-row-horizontal">
                <div className="card card-carteira">
                  <div className="card-label" style={{ display: "flex", justifyContent: "space-between" }}><span>Cobertura</span><span>{metricas.totalClientesVisitado}/{metricas.totalClientes} ({metricas.percVisitado}%)</span></div>
                  <div className="carteira-bar">
                    <div className="carteira-segment visita" style={{ width: `${metricas.percVisitado}%` }} />
                    <div className="carteira-segment risco" style={{ width: `${metricas.percRisco}%` }} />
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", display: "flex", justifyContent: "space-between" }}><span>Visitados: {metricas.totalClientesVisitado}</span><span>Risco: {metricas.totalClientesRisco}</span></div>
                </div>
                <div className="card meta-card-horizontal">
                  <div className="card-label" style={{ display: "flex", justifyContent: "space-between" }}><span>Meta Global</span><span>{metricas.totalAtividades}/{metricas.totalMeta} ({metricas.percMetaGlobal}%)</span></div>
                  <div className="progress-bar-section"><div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(metricas.percMetaGlobal, 100)}%` }} /></div></div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", display: "flex", justifyContent: "space-between" }}><span>Realizado: {metricas.totalAtividades}</span><span>Faltam: {metricas.ativFaltantes}</span></div>
                </div>
              </div>

              {/* GRÁFICOS */}
              <div className="graphs-row">
  <GraficoEvolucaoGradiente 
    historico={historico} 
    loading={loading} 
  />
  <div className="card grafico-tipos-card">
    <div className="grafico-header"><span className="card-label">Tipos</span></div>
    {tiposAtividade.length > 0 ? (
      <div style={{ width: "100%", height: "100%", minHeight: "150px" }}>
        <ReactApexChart options={tiposOptions} series={tiposSeries} type="bar" height="100%" width="100%" />
      </div>
    ) : <div className="no-data-chart">Sem dados</div>}
  </div>
</div>


              {/* Tabela */}
              <div className="consultores-table">
                <div className="table-scroll-container">
                  <table>
                    <thead><tr><th>{isDualForce ? "Consultor" : "Vendedor"}</th><th>Ativ.</th><th>Meta</th><th>%</th><th>Risco</th></tr></thead>
                    <tbody>
                      {dadosAPI.length > 0 ? dadosAPI.map((i, idx) => (
                          <tr key={idx}><td>{isDualForce ? i.consultor : i.nmVendedor}</td><td>{i.qtde_atividades_mes}</td><td>{i.meta_atividades_mes}</td><td>{(i.pct_meta_atividades_mes || 0).toFixed(1)}%</td><td>{i.qtde_clientes_risco}</td></tr>
                        )) : <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Sem dados</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Alertas */}
            <aside className="alerts-column">
              {todos24Cards.length > 0 && (
                <AlertCarousel todos24Cards={todos24Cards} evolucaoSemanal={evolucaoSemanal} calcularCorSemana={calcularCorSemana} calcularStatusSemana={calcularStatusSemana} />
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
