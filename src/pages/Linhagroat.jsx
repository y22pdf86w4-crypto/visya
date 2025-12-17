// src/pages/Linhagroat.jsx
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
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import { AlertCarousel, gerarTodos24Cards } from "../components/AlertCarouselCardsLin";
import "../styles/DualForce.css";
import "../styles/AlertCarousel.css";
import { apiLinhagro } from "../services/api";
import logoImg from "../assets/logo-linhagro.png";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ITENS_POR_PAGINA = 10;

// ==================== FUNÇÕES AUXILIARES ====================
const getMesNome = (mes) => {
  const nomes = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return nomes[mes - 1] || "N/A";
};

const sanitizarValor = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const extrairNome = (item) => {
  if (!item) return "N/A";
  const nome = item.tipo_atividade || item.nome || item.descricao || "N/A";
  return String(nome).trim();
};

const CORES = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Linhagroat() {
  const navigate = useNavigate();
  const usuario = localStorage.getItem("userdualforce") || "Usuário";
  const [fullscreen, setFullscreen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // Mantendo caso use no futuro
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dadosAPI, setDadosAPI] = useState([]);
  
  // CORREÇÃO 1: Inicializar com arrays vazios para bater com a estrutura do seu JSON
  const [filtros, setFiltros] = useState({ 
    vendedores: [], 
    status: [], 
    tiposAtividade: [] 
  });
  
  const [historico, setHistorico] = useState([]);
  const [tiposAtividade, setTiposAtividade] = useState([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState([]);
  const [todos24Cards, setTodos24Cards] = useState([]);

  // Filtros
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  // Paginação e Abas
  const [paginaVendedores, setPaginaVendedores] = useState(1);
  const [paginaTipos, setPaginaTipos] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState("kpis");

  // ==================== DATA PADRÃO ====================
  useEffect(() => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const formatarData = (d) => {
      const dia = String(d.getDate()).padStart(2, "0");
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const ano = d.getFullYear();
      return `${ano}-${mes}-${dia}`;
    };

    setFiltroDataInicio(formatarData(primeiroDiaMes));
    setFiltroDataFim(formatarData(hoje));
  }, []);

  // ==================== CARREGAR FILTROS ====================
  useEffect(() => {
    const carregarFiltros = async () => {
      const token = localStorage.getItem("tokendualforce");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await apiLinhagro.get("/filtros");
        
        // CORREÇÃO 2: O JSON fornecido tem as listas na raiz (response.data)
        // Estrutura: { sucesso: true, vendedores: [...], ... }
        if (response.data && response.data.sucesso) {
          setFiltros({
            vendedores: response.data.vendedores || [],
            status: response.data.status || [],
            tiposAtividade: response.data.tiposAtividade || []
          });
        }
      } catch (err) {
        console.error("Erro ao carregar filtros:", err);
      }
    };
    carregarFiltros();
  }, [navigate]);

  // ==================== GRÁFICO ANUAL ====================
  const dadosGraficoAnual = useMemo(() => {
    if (!historico || historico.length === 0) return [];
    const hoje = new Date();
    const mesesSequencia = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje);
      data.setMonth(data.getMonth() - i);
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;
      const chave = `${ano}-${String(mes).padStart(2, "0")}`;

      mesesSequencia.push({
        chave,
        ano,
        mes,
        mes_nome: getMesNome(mes),
        mes_abrev: getMesNome(mes),
        total: 0,
      });
    }
    const mapa = new Map();
    mesesSequencia.forEach((m) => mapa.set(m.chave, { ...m }));
    historico.forEach((item) => {
      const chave = `${item.ano}-${String(item.mes).padStart(2, "0")}`;
      if (mapa.has(chave)) {
        mapa.get(chave).total += sanitizarValor(item.total);
      }
    });
    return Array.from(mapa.values());
  }, [historico]);

  // ==================== TOP 5 TIPOS ====================
  const top5Tipos = useMemo(
    () =>
      [...tiposAtividade]
        .sort((a, b) => Number(b.qtd || 0) - Number(a.qtd || 0))
        .slice(0, 5),
    [tiposAtividade]
  );

  // ==================== MÉTRICAS ====================
  const metricas = useMemo(() => {
    if (!dadosAPI || dadosAPI.length === 0) {
      return {
        totalAtividades: 0, total30d: 0, total60d: 0,
        perc30dNoTotal: 0, perc30dNos60d: 0, percRestante60d: 0,
        totalClientes: 0, totalClientesRisco: 0, totalClientesVisitados: 0,
        percRisco: 0, percVisitado: 0, totalMeta: 0, percMetaGlobal: 0, ativFaltantes: 0,
      };
    }
    const totalAtividades = dadosAPI.reduce((acc, i) => acc + sanitizarValor(i.qtde_atividades_total), 0);
    const total30d = dadosAPI.reduce((acc, i) => acc + sanitizarValor(i.qtde_atividades_30d), 0);
    const total60d = dadosAPI.reduce((acc, i) => acc + sanitizarValor(i.qtde_atividades_60d), 0);
    const perc30dNoTotal = totalAtividades > 0 ? ((total30d / totalAtividades) * 100).toFixed(1) : 0;
    const perc30dNos60d = total60d > 0 ? ((total30d / total60d) * 100).toFixed(1) : 0;
    const percRestante60d = total60d > 0 ? (((total60d - total30d) / total60d) * 100).toFixed(1) : 0;
    const totalClientes = dadosAPI.reduce((acc, i) => acc + sanitizarValor(i.qtde_clientes_carteira), 0);
    const totalClientesRisco = dadosAPI.reduce((acc, i) => acc + sanitizarValor(i.qtde_clientes_risco), 0);
    const totalClientesVisitados = totalClientes - totalClientesRisco;
    const percRisco = totalClientes > 0 ? ((totalClientesRisco / totalClientes) * 100).toFixed(1) : 0;
    const percVisitado = totalClientes > 0 ? ((totalClientesVisitados / totalClientes) * 100).toFixed(1) : 0;
    const totalMeta = dadosAPI.reduce((acc, i) => acc + sanitizarValor(i.meta_atividades_mes), 0);
    const percMetaGlobal = totalMeta > 0 ? ((totalAtividades / totalMeta) * 100).toFixed(1) : 0;
    const ativFaltantes = Math.max(0, totalMeta - totalAtividades);

    return {
      totalAtividades, total30d, total60d, perc30dNoTotal, perc30dNos60d, percRestante60d,
      totalClientes, totalClientesRisco, totalClientesVisitados, percRisco, percVisitado,
      totalMeta, percMetaGlobal, ativFaltantes,
    };
  }, [dadosAPI]);

  // ==================== PAGINAÇÃO ====================
  const vendedoresPaginados = useMemo(() => {
    const inicio = (paginaVendedores - 1) * ITENS_POR_PAGINA;
    return dadosAPI.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [dadosAPI, paginaVendedores]);
  const totalPaginasVendedores = Math.ceil(dadosAPI.length / ITENS_POR_PAGINA);

  const tiposPaginados = useMemo(() => {
    const inicio = (paginaTipos - 1) * ITENS_POR_PAGINA;
    return tiposAtividade.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [tiposAtividade, paginaTipos]);
  const totalPaginasTipos = Math.ceil(tiposAtividade.length / ITENS_POR_PAGINA);

  // ==================== TELA CHEIA ====================
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

  // ==================== EFEITOS DE DADOS ====================
  useEffect(() => {
    carregarDados();
  }, [filtroVendedor, filtroStatus, filtroTipo, filtroDataInicio, filtroDataFim]);

  useEffect(() => {
    if (dadosAPI.length > 0 && evolucaoMensal.length > 0) {
      const cards = gerarTodos24Cards(metricas, evolucaoMensal, dadosAPI);
      setTodos24Cards(cards);
    }
  }, [evolucaoMensal, dadosAPI, metricas]);

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

  // ==================== CARREGAMENTO DADOS ====================
  async function carregarDados() {
    const token = localStorage.getItem("tokendualforce");
    if (!token) {
      navigate("/");
      return;
    }
    setLoading(true);
    setErro("");
    setPaginaVendedores(1);
    setPaginaTipos(1);
    try {
      const params = new URLSearchParams();
      if (filtroDataInicio) params.append("dtInicio", filtroDataInicio);
      if (filtroDataFim) params.append("dtFim", filtroDataFim);
      if (filtroVendedor) params.append("nmVendedor", filtroVendedor);
      if (filtroStatus) params.append("status", filtroStatus);
      if (filtroTipo) params.append("tipoAtividade", filtroTipo);

      const [resResumo, resHist, resTipos, resEvolucao] = await Promise.all([
        apiLinhagro.get(`/resumo-geral?${params}`),
        apiLinhagro.get(`/historico-global?${params}`),
        apiLinhagro.get(`/distribuicao?${params}`),
        apiLinhagro.get(`/evolucao?periodo=mes&${params}`),
      ]);

      setDadosAPI(resResumo.data.sucesso ? resResumo.data.dados || [] : []);
      setHistorico(resHist.data.sucesso ? resHist.data.dados || [] : []);
      setTiposAtividade(resTipos.data.sucesso ? resTipos.data.dados || [] : []);

      if (resEvolucao.data.sucesso && Array.isArray(resEvolucao.data.dados)) {
        const meses = {};
        resEvolucao.data.dados.forEach((i) => {
          const chave = `${i.ano}-${i.mes}`;
          if (!meses[chave]) meses[chave] = 0;
          meses[chave] += i.qtd;
        });
        const list = Object.entries(meses).map(([m, t]) => ({ mes: m, total: t })).sort().slice(-6);
        setEvolucaoMensal(list);
      } else {
        setEvolucaoMensal([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setErro("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  const AbaButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setAbaAtiva(id)}
      style={{
        padding: "10px 16px",
        background: abaAtiva === id ? "#3b82f6" : "#1e293b",
        color: "#e2e8f0",
        border: "none",
        cursor: "pointer",
        borderRadius: "4px 4px 0 0",
        fontSize: "13px",
        fontWeight: abaAtiva === id ? "600" : "400",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className={`dualforce-page ${fullscreen ? "fullscreen" : ""}`}>
      <header className="header">
        <div className="header-left">
          <img src={logoImg} alt="Logo Linhagro" className="logo-image" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
        </div>
        <div className="header-filters-row">
          <div className="filter-group-selects">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1e293b", padding: "6px 12px", borderRadius: "4px" }}>
              <Calendar size={14} style={{ color: "#64748b" }} />
              <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "4px 8px", borderRadius: "3px", fontSize: "12px", width: "120px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1e293b", padding: "6px 12px", borderRadius: "4px" }}>
              <Calendar size={14} style={{ color: "#64748b" }} />
              <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "4px 8px", borderRadius: "3px", fontSize: "12px", width: "120px" }} />
            </div>

            {/* CORREÇÃO 3: Filtro Vendedores mapeado corretamente */}
            <select
              value={filtroVendedor}
              onChange={(e) => setFiltroVendedor(e.target.value)}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#e2e8f0",
                padding: "6px 8px",
                borderRadius: "3px",
                fontSize: "12px",
                cursor: "pointer",
                minWidth: "150px"
              }}
            >
              <option value="">Todos Consultores</option>
              {filtros.vendedores.map((v, i) => (
                  <option key={`${v.id}-${i}`} value={v.id}>
  {v.nome}
</option>

              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "6px 8px", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
            >
              <option value="">Todos Status</option>
              {filtros.status.map((s, i) => (
                <option key={`${s.id}-${i}`} value={s.id}>{s.nome}</option>
              ))}
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "6px 8px", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
            >
              <option value="">Todos Tipos</option>
              {filtros.tiposAtividade.map((t, i) => (
                <option key={`${t.id}-${i}`} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="header-right">
          <div className="action-buttons">
            <button className="btn-icon" onClick={carregarDados} title="Atualizar dados"><RefreshCw size={16} /></button>
            <button className="btn-icon" onClick={() => {}} title="Download relatório"><Download size={16} /></button>
            <button className="btn-icon" onClick={toggleFullscreen} title={fullscreen ? "Sair tela cheia" : "Tela cheia"}>{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          </div>
          <div className="header-divider-vertical" />
          <div className="user-section">
            <div className="avatar-mini">{usuario.charAt(0)}</div>
            <button className="btn-logout-mini" onClick={() => navigate("/menu")}><LogOut size={14} /> Voltar</button>
          </div>
        </div>
      </header>

      <main className="dualforce-main">
        {loading ? (
          <div className="loading-container"><div className="spinner" /><p>Carregando...</p></div>
        ) : erro ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#ef4444" }}>
            <p>{erro}</p>
            <button onClick={carregarDados} style={{ marginTop: "10px", padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Tentar Novamente</button>
          </div>
        ) : (
          <div className="dualforce-grid">
            <div className="main-column">
              <div style={{ display: "flex", gap: "8px", marginBottom: "0", borderBottom: "1px solid #334155" }}>
                <AbaButton id="kpis" label="Dashboard" icon={TrendingUp} />
                <AbaButton id="vendedores" label={`Vendedores (${dadosAPI.length})`} icon={Users} />
                <AbaButton id="tipos" label={`Tipos (${tiposAtividade.length})`} icon={BarChart3} />
                <AbaButton id="alertas" label="Alertas" icon={AlertCircle} />
              </div>

              {abaAtiva === "kpis" && (
                <>
                  <div className="kpis-row kpis-main">
                    <div className="kpi-card"><div className="kpi-icon icon-blue"><TrendingUp size={24} /></div><div className="kpi-content"><span className="kpi-label">Total</span><div className="kpi-value">{metricas.totalAtividades}</div><div className="kpi-meta">{metricas.perc30dNoTotal}% (30d)</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon icon-green"><TrendingUp size={24} /></div><div className="kpi-content"><span className="kpi-label">30 Dias</span><div className="kpi-value">{metricas.total30d}</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon icon-yellow"><TrendingUp size={24} /></div><div className="kpi-content"><span className="kpi-label">60 Dias</span><div className="kpi-value">{metricas.total60d}</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon icon-red"><AlertCircle size={24} /></div><div className="kpi-content"><span className="kpi-label">Risco</span><div className="kpi-value">{metricas.totalClientesRisco}</div></div></div>
                  </div>
                  <div className="kpis-row kpis-secundarios">
                    <div className="kpi-card"><div className="kpi-icon icon-green"><Users size={20} /></div><div className="kpi-content"><span className="kpi-label">Visitados</span><div className="kpi-value">{metricas.totalClientesVisitados}</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon icon-blue"><Users size={20} /></div><div className="kpi-content"><span className="kpi-label">Carteira</span><div className="kpi-value">{metricas.totalClientes}</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon icon-purple"><TrendingUp size={20} /></div><div className="kpi-content"><span className="kpi-label">Cobertura</span><div className="kpi-value">{metricas.percVisitado}%</div></div></div>
                  </div>
                  <div className="cards-row-horizontal">
                    <div className="card card-carteira">
                      <div className="card-label">Cobertura</div>
                      <div className="carteira-bar">
                        <div className="carteira-segment visita" style={{ width: `${metricas.percVisitado}%` }} />
                        <div className="carteira-segment risco" style={{ width: `${metricas.percRisco}%` }} />
                      </div>
                      <div style={{ fontSize: "9px", color: "#64748b", marginTop: "4px" }}>Visitados: {metricas.totalClientesVisitados} | Risco: {metricas.totalClientesRisco}</div>
                    </div>
                    <div className="card meta-card-horizontal">
                      <div className="card-label">Meta Mês</div>
                      <div className="progress-bar-section">
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(metricas.percMetaGlobal, 100)}%` }} /></div>
                      </div>
                      <div style={{ fontSize: "9px", color: "#64748b", marginTop: "4px" }}>{metricas.totalAtividades}/{metricas.totalMeta} ({metricas.percMetaGlobal}%)</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginTop: "16px" }}>
                    {dadosGraficoAnual.length > 0 && (
                      <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", padding: "20px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><TrendingUp size={18} style={{ color: "#3b82f6" }} />Evolução Últimos 12 Meses</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={dadosGraficoAnual} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs><linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="mes_abrev" stroke="#64748b" interval="preserveStartEnd" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#64748b" domain={[0, (max) => max * 1.15]} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #3b82f6", borderRadius: 6, color: "#e2e8f0", fontSize: 12, padding: "6px 10px" }} formatter={(value) => [`${Number(value).toLocaleString("pt-BR")} atividades`, "Total"]} labelFormatter={(label, payload) => payload && payload[0]?.payload?.mes_nome ? payload[0].payload.mes_nome : label} />
                            <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" dot={{ r: 3, strokeWidth: 1, stroke: "#0f172a", fill: "#3b82f6" }} activeDot={{ r: 5, fill: "#60a5fa" }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {top5Tipos.length > 0 && (
                      <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", padding: "20px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><AlertCircle size={18} style={{ color: "#f59e0b" }} />Top 5 Tipos</div>
                        <div style={{ fontSize: "12px", color: "#e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                          {top5Tipos.map((tipo, idx) => {
                            const total = tiposAtividade.reduce((acc, x) => acc + Number(x.qtd || 0), 0);
                            const perc = total > 0 ? ((Number(tipo.qtd || 0) / total) * 100).toFixed(1) : 0;
                            return (
                              <div key={`top-${idx}`} style={{ display: "flex", flexDirection: "column", gap: "6px", paddingBottom: "12px", borderBottom: "1px solid #334155" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: CORES[idx % CORES.length] }} /><span style={{ fontSize: "11px", color: "#cbd5e1", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{extrairNome(tipo)}</span><span style={{ fontWeight: "700", color: CORES[idx % CORES.length], fontSize: "12px" }}>{tipo.qtd}</span></div>
                                <div style={{ width: "100%", height: "4px", background: "#334155", borderRadius: "2px", overflow: "hidden" }}><div style={{ width: `${perc}%`, height: "100%", background: CORES[idx % CORES.length], transition: "width 0.3s ease" }} /></div>
                                <div style={{ fontSize: "10px", color: "#64748b", textAlign: "right" }}>{perc}% do total</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {abaAtiva === "vendedores" && (
                <div className="consultores-table">
                  <div style={{ padding: "12px", fontSize: "12px", color: "#64748b", background: "#0f172a" }}>Mostrando {vendedoresPaginados.length} de {dadosAPI.length} vendedores</div>
                  <div className="table-scroll-container">
                    <table>
                      <thead><tr><th>Vendedor</th><th>Total</th><th>30d</th><th>60d</th><th>Meta</th><th>%</th><th>Clientes</th><th>Risco</th><th>Cobertura</th></tr></thead>
                      <tbody>
                        {vendedoresPaginados.map((i, idx) => {
                          const cobertura = i.qtde_clientes_carteira > 0 ? ((i.qtde_clientes_visitados / i.qtde_clientes_carteira) * 100).toFixed(1) : 0;
                          return (
                            <tr key={`${i.id_vendedor}-${idx}`}>
                              <td style={{ fontWeight: "600", fontSize: "12px" }}>{i.nmVendedor || i.id_vendedor}</td>
                              <td style={{ color: "#3b82f6" }}>{i.qtde_atividades_total}</td><td>{i.qtde_atividades_30d}</td><td>{i.qtde_atividades_60d}</td><td>{i.meta_atividades_mes}</td>
                              <td>{i.meta_atividades_mes > 0 ? ((i.qtde_atividades_total / i.meta_atividades_mes) * 100).toFixed(0) : 0}%</td>
                              <td>{i.qtde_clientes_carteira}</td><td style={{ color: "#ef4444" }}>{i.qtde_clientes_risco}</td><td>{cobertura}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalPaginasVendedores > 1 && (
                    <div className="pagination-controls">
                      <button disabled={paginaVendedores === 1} onClick={() => setPaginaVendedores((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></button>
                      <span>Página {paginaVendedores} de {totalPaginasVendedores}</span>
                      <button disabled={paginaVendedores === totalPaginasVendedores} onClick={() => setPaginaVendedores((p) => Math.min(totalPaginasVendedores, p + 1))}><ChevronRight size={16} /></button>
                    </div>
                  )}
                </div>
              )}

              {abaAtiva === "tipos" && (
                <div className="consultores-table">
                  <div style={{ padding: "12px", fontSize: "12px", color: "#64748b", background: "#0f172a" }}>Mostrando {tiposPaginados.length} de {tiposAtividade.length} tipos</div>
                  <div className="table-scroll-container">
                    <table>
                      <thead><tr><th>Tipo de Atividade</th><th>Qtd</th><th>% do Total</th></tr></thead>
                      <tbody>
                        {tiposPaginados.map((t, idx) => {
                          const total = tiposAtividade.reduce((acc, x) => acc + Number(x.qtd || 0), 0);
                          const perc = total > 0 ? ((Number(t.qtd || 0) / total) * 100).toFixed(1) : 0;
                          return (
                            <tr key={`${t.nome}-${idx}`}>
                              <td>{extrairNome(t)}</td><td style={{ color: "#3b82f6" }}>{t.qtd}</td>
                              <td><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "60px", height: "6px", background: "#334155", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${perc}%`, height: "100%", background: "#10b981" }} /></div><span>{perc}%</span></div></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalPaginasTipos > 1 && (
                    <div className="pagination-controls">
                      <button disabled={paginaTipos === 1} onClick={() => setPaginaTipos((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></button>
                      <span>Página {paginaTipos} de {totalPaginasTipos}</span>
                      <button disabled={paginaTipos === totalPaginasTipos} onClick={() => setPaginaTipos((p) => Math.min(totalPaginasTipos, p + 1))}><ChevronRight size={16} /></button>
                    </div>
                  )}
                </div>
              )}

              {abaAtiva === "alertas" && (<div style={{ marginTop: "20px" }}><AlertCarousel cards={todos24Cards} /></div>)}
            </div>
            <div className="side-column">
              <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", padding: "16px", height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}><Users size={16} />Atividade Recente</div>
                <div style={{ flex: 1, fontSize: "12px", color: "#64748b", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #334155", borderRadius: "4px" }}>Nenhuma atividade recente</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
