// src/pages/DualForce.jsx - VERSÃO CORRIGIDA
// Remova todo o bloco antigo de alertas e use apenas isto

import { useState, useEffect } from "react";
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
} from "lucide-react";
import ReactApexChart from "react-apexcharts";
import { AlertCarousel, gerarTodos24Cards } from "../components/AlertCarouselCards";
import "../styles/DualForce.css";
import "../styles/AlertCarousel.css";
import api from "../services/api";

export default function DualForce() {
  const navigate = useNavigate();
  const usuario = localStorage.getItem("userdualforce") || "Usuário";

  const [profileOpen, setProfileOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dadosAPI, setDadosAPI] = useState(null);
  const [filtros, setFiltros] = useState(null);

  const [historico, setHistorico] = useState([]);
  const [tiposAtividade, setTiposAtividade] = useState([]);
  const [evolucaoSemanal, setEvolucaoSemanal] = useState([]);
  const [todos24Cards, setTodos24Cards] = useState([]);

  // filtros selecionados
  const [filtroConsultor, setFiltroConsultor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [dtInicio, setDtInicio] = useState("");
  const [dtFim, setDtFim] = useState("");

  // ===================== MÉTRICAS (DEFINIDA ANTES DO RETURN) =====================
  const calcularMetricas = () => {
    if (!dadosAPI || !Array.isArray(dadosAPI) || dadosAPI.length === 0) {
      return {
        totalAtividades: 0,
        total30d: 0,
        total60d: 0,
        perc30dNoTotal: 0,
        perc30dNos60d: 0,
        totalClientes: 0,
        totalClientesRisco: 0,
        totalClientesVisitados: 0,
        percRisco: 0,
        percVisitados: 0,
        totalMeta: 0,
        percMetaGlobal: 0,
        ativFaltantes: 0,
      };
    }

    const totalAtividades = dadosAPI.reduce(
      (acc, item) => acc + (item.qtde_atividades_mes || 0),
      0
    );

    const total30d = dadosAPI.reduce(
      (acc, item) => acc + (item.qtde_atividades_30d || 0),
      0
    );

    const total60d = dadosAPI.reduce(
      (acc, item) => acc + (item.qtde_atividades_60d || 0),
      0
    );

    const perc30dNoTotal =
      totalAtividades > 0 ? (total30d / totalAtividades) * 100 : 0;

    const perc30dNos60d = total60d > 0 ? (total30d / total60d) * 100 : 0;

    const totalClientes = dadosAPI.reduce(
      (acc, item) => acc + (item.qtde_clientes_carteira || 0),
      0
    );

    const totalClientesRisco = dadosAPI.reduce(
      (acc, item) => acc + (item.qtde_clientes_risco || 0),
      0
    );

    const totalClientesVisitados = totalClientes - totalClientesRisco;

    const percRisco =
      totalClientes > 0 ? (totalClientesRisco / totalClientes) * 100 : 0;

    const percVisitados =
      totalClientes > 0 ? (totalClientesVisitados / totalClientes) * 100 : 0;

    const totalMeta = dadosAPI.reduce(
      (acc, item) => acc + (item.meta_atividades_mes || 0),
      0
    );

    const percMetaGlobal =
      totalMeta > 0 ? (totalAtividades / totalMeta) * 100 : 0;

    const ativFaltantes = Math.max(0, totalMeta - totalAtividades);

    return {
      totalAtividades,
      total30d,
      total60d,
      perc30dNoTotal: Number(perc30dNoTotal.toFixed(1)),
      perc30dNos60d: Number(perc30dNos60d.toFixed(1)),
      totalClientes,
      totalClientesRisco,
      totalClientesVisitados,
      percRisco: Number(percRisco.toFixed(1)),
      percVisitados: Number(percVisitados.toFixed(1)),
      totalMeta,
      percMetaGlobal: Number(percMetaGlobal.toFixed(1)),
      ativFaltantes,
    };
  };

  // CALCULAR MÉTRICAS AQUI
  const metricas = calcularMetricas();

  // ===================== FUNÇÕES AUXILIARES =====================
  const calcularStatusSemana = (semanas) => {
    if (semanas.length < 2) return "=";
    const ultima = semanas[semanas.length - 1].total;
    const penultima = semanas[semanas.length - 2].total;
    if (ultima > penultima) return "↑";
    if (ultima < penultima) return "↓";
    return "=";
  };

  const calcularCorSemana = (semanas, index) => {
    if (semanas.length === 0) return "#6b7280";
    const total = semanas[index].total;
    const media =
      semanas.reduce((acc, s) => acc + s.total, 0) / semanas.length;
    if (total >= media * 1.1) return "#10b981";
    if (total >= media * 0.9) return "#f59e0b";
    return "#ef4444";
  };

  // ===================== USEEFFECTS =====================
  // carregar filtros
  useEffect(() => {
    carregarFiltros();
  }, []);

  // definir datas padrão
  useEffect(() => {
    if (filtros?.dataPadrao) {
      const hoje = new Date();
      setDtInicio(filtros.dataPadrao);
      setDtFim(hoje.toISOString().split("T")[0]);
    }
  }, [filtros]);

  // recarregar dados ao mudar filtros
  useEffect(() => {
    if (dtInicio && dtFim) {
      carregarDados();
    }
  }, [dtInicio, dtFim, filtroConsultor, filtroStatus, filtroTipo]);

  // gerar cards quando dados mudam
  useEffect(() => {
    if (dadosAPI && evolucaoSemanal.length > 0) {
      const cards = gerarTodos24Cards(metricas, evolucaoSemanal, dadosAPI);
      setTodos24Cards(cards);
    }
  }, [metricas, evolucaoSemanal, dadosAPI]);

  // fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".profile-dropdown") &&
        !e.target.closest(".btn-icon")
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ===================== FUNÇÕES ASYNC =====================
  async function carregarFiltros() {
    try {
      const response = await api.get("/filtros");
      if (response.data.sucesso) setFiltros(response.data);
    } catch (err) {
      console.error("Erro ao carregar filtros:", err);
    }
  }

  async function carregarDados() {
    try {
      setLoading(true);
      setErro("");

      const token = localStorage.getItem("tokendualforce");
      const params = new URLSearchParams({
        dtInicio,
        dtFim,
      });

      if (filtroConsultor) params.append("nmVendedor", filtroConsultor);
      if (filtroStatus) params.append("status", filtroStatus);
      if (filtroTipo) params.append("tipoAtividade", filtroTipo);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [resResumo, resHist, resTipos, resEvolucao] = await Promise.all([
        api.get(`/resumo-geral?${params.toString()}`, config),
        api.get(`/historico-global?${params.toString()}`, config),
        api.get(`/distribuicao?${params.toString()}`, config),
        api.get(`/evolucao?${params.toString()}`, config),
      ]);

      if (resResumo.data.sucesso) {
        setDadosAPI(resResumo.data.dados);
      } else {
        setErro("Erro ao carregar dados do dashboard");
      }

      if (resHist.data.sucesso && Array.isArray(resHist.data.dados)) {
        setHistorico(resHist.data.dados);
      } else {
        setHistorico([]);
      }

      if (resTipos.data.sucesso && Array.isArray(resTipos.data.dados)) {
        setTiposAtividade(resTipos.data.dados);
      } else {
        setTiposAtividade([]);
      }

      if (resEvolucao.data.sucesso && Array.isArray(resEvolucao.data.dados)) {
        const semanas = {};
        resEvolucao.data.dados.forEach((item) => {
          if (!semanas[item.semana]) {
            semanas[item.semana] = 0;
          }
          semanas[item.semana] += item.qtd;
        });

        const semanasList = Object.entries(semanas)
          .map(([semana, total]) => ({
            semana: parseInt(semana),
            total,
          }))
          .sort((a, b) => a.semana - b.semana)
          .slice(-4);

        setEvolucaoSemanal(semanasList);
      } else {
        setEvolucaoSemanal([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setErro("Falha ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  // ===================== GRÁFICO EVOLUÇÃO MENSAL =====================
  const chartHistorico = {
    series: [
      {
        name: "Atividades / mês",
        data: historico.map((h) => h.total || 0),
      },
    ],
    options: {
      chart: {
        type: "line",
        background: "transparent",
        toolbar: { show: false },
        zoom: { enabled: false },
        sparkline: { enabled: false },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      colors: ["#3b82f6"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.8,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -8,
        style: {
          colors: ["#e5e7eb"],
          fontSize: "12px",
          fontWeight: 600,
        },
        background: {
          enabled: true,
          borderRadius: 4,
          borderWidth: 0,
          foreColor: "#020617",
          padding: 4,
          opacity: 0.95,
        },
        formatter: (val) => Math.round(val),
      },
      markers: {
        size: 6,
        strokeWidth: 2,
        strokeColors: "#020617",
        colors: ["#38bdf8"],
        hover: { size: 8 },
      },
      xaxis: {
        categories: historico.map((h) => h.rotulo || ""),
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "11px",
            fontWeight: 500,
          },
        },
        axisBorder: { color: "#1f2937" },
        axisTicks: { color: "#1f2937" },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "11px",
          },
        },
      },
      grid: {
        borderColor: "#1f2937",
        strokeDashArray: 3,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) => `${Math.round(val)} atividades`,
        },
      },
      legend: { show: false },
    },
  };

  // ===================== GRÁFICO TIPOS DE ATIVIDADE =====================
  const chartTipos = {
    series: [
      {
        name: "Qtd",
        data: tiposAtividade.map((t) => t.qtd || 0),
      },
    ],
    options: {
      chart: {
        type: "bar",
        background: "transparent",
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          columnWidth: "82%",
          distributed: true,
        },
      },
      colors: [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#f97316",
        "#ec4899",
        "#22c55e",
        "#a855f7",
        "#e11d48",
        "#0ea5e9",
        "#22c55e",
        "#facc15",
        "#64748b",
      ],
      dataLabels: {
        enabled: true,
        position: "top",
        offsetY: -20,
        style: {
          colors: ["#f9fafb"],
          fontSize: "13px",
          fontWeight: 700,
        },
        formatter: (val) => (val ? Math.round(val) : ""),
      },
      xaxis: {
        categories: tiposAtividade.map((t) => {
          const txt = (t.tipo_atividade || "").trim();
          const words = txt.split(" ");

          const lines = [];
          for (let i = 0; i < words.length; i += 2) {
            lines.push(words.slice(i, i + 2).join(" "));
          }

          return lines.join("\n");
        }),
        labels: {
          rotate: 0,
          trim: true,
          maxHeight: 140,
          style: {
            colors: "#9ca3af",
            fontSize: "10px",
            fontWeight: 500,
          },
        },
        axisBorder: { color: "#1f2937" },
        axisTicks: { color: "#1f2937" },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "11px",
          },
        },
      },
      grid: {
        borderColor: "#1f2937",
        strokeDashArray: 3,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) => `${Math.round(val)} atividades`,
        },
      },
      legend: { show: false },
    },
  };

  // ===================== FUNÇÕES DE AÇÃO =====================
  function handleLogout() {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("tokendualforce");
      localStorage.removeItem("userdualforce");
      navigate("/");
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  function exportarDados() {
    if (!dadosAPI || dadosAPI.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    let csv =
      "CONSULTOR,ATIVIDADES,30 DIAS,60 DIAS,META,% META,CLIENTES,EM RISCO\n";

    dadosAPI.forEach((item) => {
      csv += `${item.consultor || "N/A"},${
        item.qtde_atividades_mes || 0
      },${item.qtde_atividades_30d || 0},${
        item.qtde_atividades_60d || 0
      },${item.meta_atividades_mes || 0},${(
        item.pct_meta_atividades_mes || 0
      ).toFixed(1)},${item.qtde_clientes_carteira || 0},${
        item.qtde_clientes_risco || 0
      }\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `dualforce-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ===================== RENDER =====================
  return (
    <div className={`dualforce-page ${fullscreen ? "fullscreen" : ""}`}>
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">V</div>
            <span className="page-title">DualForce Dashboard</span>
          </div>
        </div>

        <div className="header-right">
          <button
            className="btn-icon"
            onClick={carregarDados}
            title="Atualizar dados"
            disabled={loading}
          >
            <RefreshCw
              size={18}
              style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
            />
          </button>

          <button
            className="btn-icon"
            onClick={exportarDados}
            title="Exportar CSV"
          >
            <Download size={18} />
          </button>

          <button
            className="btn-icon"
            onClick={toggleFullscreen}
            title="Tela cheia"
          >
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <div className="user-profile-header">
            <div className="avatar-small">
              {usuario.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-small">
              <div className="user-name-small">{usuario}</div>
              <div className="user-email-small">Conectado</div>
            </div>
          </div>

          <button
            className="btn-icon"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            ⚙️
          </button>

          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </header>

      {/* DROPDOWN PERFIL */}
      {profileOpen && (
        <div className="profile-dropdown active">
          <div className="dropdown-header">
            <span className="user-name">{usuario}</span>
            <span className="user-email">Usuário</span>
          </div>
          <a href="/menu" className="dropdown-item">
            Menu
          </a>
          <a href="#" className="dropdown-item logout" onClick={handleLogout}>
            Sair
          </a>
        </div>
      )}

      {/* FILTROS */}
      <div className="filters-bar">
        <div className="filter-item">
          <label>Data Início</label>
          <input
            type="date"
            value={dtInicio}
            onChange={(e) => setDtInicio(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>Data Fim</label>
          <input
            type="date"
            value={dtFim}
            onChange={(e) => setDtFim(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>Consultor</label>
          <select
            value={filtroConsultor}
            onChange={(e) => setFiltroConsultor(e.target.value)}
          >
            <option value="">Todos</option>
            {filtros?.consultores?.map((c) => (
              <option key={c.idPrincipal} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos</option>
            {filtros?.status?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Tipo de Atividade</label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos</option>
            {filtros?.tiposAtividade?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="dualforce-main">
        {erro && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Carregando dashboard...</p>
          </div>
        ) : (
          <div className="dualforce-grid">
            {/* COLUNA ESQUERDA */}
            <div className="main-column">
              {/* LINHA 1: ATIVIDADES + RISCO */}
              <div className="kpis-row kpis-main">
                <div className="kpi-card">
                  <div className="kpi-icon icon-blue">
                    <TrendingUp size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Total de Atividades</span>
                    <div className="kpi-value">{metricas.totalAtividades}</div>
                    <div className="kpi-meta">
                      {metricas.perc30dNoTotal}% foram nos últimos 30 dias
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon icon-green">
                    <TrendingUp size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Atividades - 30 dias</span>
                    <div className="kpi-value">{metricas.total30d}</div>
                    <div className="kpi-meta">
                      Representa {metricas.perc30dNoTotal}% do total
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon icon-yellow">
                    <TrendingUp size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Atividades - 60 dias</span>
                    <div className="kpi-value">{metricas.total60d}</div>
                    <div className="kpi-meta">
                      {metricas.perc30dNos60d}% foram nos últimos 30 dias
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon icon-red">
                    <AlertCircle size={24} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Clientes em Risco</span>
                    <div className="kpi-value">
                      {metricas.totalClientesRisco}
                    </div>
                    <div className="kpi-meta">
                      {metricas.percRisco}% da carteira
                    </div>
                  </div>
                </div>
              </div>

              {/* LINHA 2: CLIENTES / CARTEIRA */}
              <div className="kpis-row kpis-secundarios">
                <div className="kpi-card">
                  <div className="kpi-icon icon-green">
                    <TrendingUp size={20} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Clientes Visitados</span>
                    <div className="kpi-value">
                      {metricas.totalClientesVisitados}
                    </div>
                    <div className="kpi-meta">
                      {metricas.percVisitados}% da carteira
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon icon-yellow">
                    <AlertCircle size={20} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Não Visitados</span>
                    <div className="kpi-value">
                      {metricas.totalClientesRisco}
                    </div>
                    <div className="kpi-meta">
                      {metricas.percRisco}% da carteira
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon icon-blue">
                    <Users size={20} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Carteira Ativa</span>
                    <div className="kpi-value">{metricas.totalClientes}</div>
                    <div className="kpi-meta">
                      Base total de clientes
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon icon-purple">
                    <TrendingUp size={20} />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Eficiência / Dia</span>
                    <div className="kpi-value">
                      {metricas.totalAtividades > 0
                        ? (metricas.totalAtividades / 22).toFixed(2)
                        : "0.00"}
                    </div>
                    <div className="kpi-meta">
                      Atividades por dia útil (aprox.)
                    </div>
                  </div>
                </div>
              </div>

              {/* LINHA 3: CARTEIRA + META */}
              <div className="cards-row-horizontal">
                <div className="card card-carteira">
                  <div className="card-carteira-header">
                    <span className="card-label">Carteira de Clientes</span>
                    <span className="card-carteira-total">
                      {metricas.totalClientes} clientes
                    </span>
                  </div>

                  <div className="carteira-bar">
                    <div
                      className="carteira-segment visita"
                      style={{ width: `${metricas.percVisitados}%` }}
                    >
                      <span className="segment-label">
                        Visitados: {metricas.totalClientesVisitados} (
                        {metricas.percVisitados}%)
                      </span>
                    </div>
                    <div
                      className="carteira-segment risco"
                      style={{ width: `${metricas.percRisco}%` }}
                    >
                      <span className="segment-label">
                        Não visitados: {metricas.totalClientesRisco} (
                        {metricas.percRisco}%)
                      </span>
                    </div>
                  </div>

                  <div className="carteira-legend">
                    <span className="dot visita-dot" /> Visitados
                    <span className="dot risco-dot" /> Risco de perda
                  </div>
                </div>

                <div className="card meta-card-horizontal">
                  <div className="meta-header-row">
                    <span className="card-label">
                      Meta Mensal de Atividades
                    </span>
                    <span className="meta-percent">
                      {metricas.percMetaGlobal}% da meta
                    </span>
                  </div>

                  <div className="meta-numbers-row">
                    <div className="meta-number-block">
                      <span className="meta-number-label">Meta</span>
                      <span className="meta-number-value">
                        {metricas.totalMeta}
                      </span>
                    </div>
                    <div className="meta-number-block">
                      <span className="meta-number-label">Realizado</span>
                      <span className="meta-number-value">
                        {metricas.totalAtividades}
                      </span>
                    </div>
                    <div className="meta-number-block">
                      <span className="meta-number-label">Faltam</span>
                      <span className="meta-number-value">
                        {metricas.ativFaltantes}
                      </span>
                    </div>
                  </div>

                  <div className="progress-bar-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            metricas.percMetaGlobal,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LINHA 4: GRÁFICOS (HISTÓRICO + TIPOS) */}
              {(historico && historico.length > 0) ||
              (tiposAtividade && tiposAtividade.length > 0) ? (
                <div className="graphs-row">
                  {historico && historico.length > 0 && (
                    <div className="card grafico-historico-card">
                      <div className="grafico-header">
                        <span className="card-label">
                          Evolução Mensal de Atividades
                        </span>
                        <span className="grafico-sub">
                          Total de atividades por mês no período filtrado
                        </span>
                      </div>
                      <ReactApexChart
                        options={chartHistorico.options}
                        series={chartHistorico.series}
                        type="line"
                        height={260}
                      />
                    </div>
                  )}

                  {tiposAtividade && tiposAtividade.length > 0 && (
                    <div className="card grafico-tipos-card">
                      <div className="grafico-header">
                        <span className="card-label">Atividades por Tipo</span>
                        <span className="grafico-sub">
                          Distribuição de atividades por tipo no período
                        </span>
                      </div>
                      <ReactApexChart
                        options={chartTipos.options}
                        series={chartTipos.series}
                        type="bar"
                        height={300}
                      />
                    </div>
                  )}
                </div>
              ) : null}

              {/* LINHA 5: TABELA CONSULTORES */}
              {Array.isArray(dadosAPI) && dadosAPI.length > 0 && (
                <div className="consultores-table">
                  <h3>Consultores</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Consultor</th>
                        <th>Atividades</th>
                        <th>30d</th>
                        <th>60d</th>
                        <th>Meta</th>
                        <th>% Meta</th>
                        <th>Clientes</th>
                        <th>Em Risco</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosAPI.map((item, idx) => (
                        <tr key={idx}>
                          <td className="consultant-name">
                            {item.consultor || "N/A"}
                          </td>
                          <td>{item.qtde_atividades_mes || 0}</td>
                          <td>{item.qtde_atividades_30d || 0}</td>
                          <td>{item.qtde_atividades_60d || 0}</td>
                          <td>{item.meta_atividades_mes || 0}</td>
                          <td>
                            <span
                              className={`badge ${
                                (item.pct_meta_atividades_mes || 0) >= 100
                                  ? "success"
                                  : "warning"
                              }`}
                            >
                              {(item.pct_meta_atividades_mes || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td>{item.qtde_clientes_carteira || 0}</td>
                          <td>
                            <span className="badge danger">
                              {item.qtde_clientes_risco || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* COLUNA DIREITA: CAROUSEL DE ALERTAS */}
            <aside className="alerts-column-carousel">
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