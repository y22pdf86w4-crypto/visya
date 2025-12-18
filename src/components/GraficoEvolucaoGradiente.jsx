// ============================================
// ARQUIVO: src/components/GraficoEvolucaoGradiente.jsx
// ============================================

import { useMemo, useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function GraficoEvolucaoGradiente({ historico = [], loading = false }) {
  const chartRef = useRef(null);

  // Sanitizar valores
  const sanitizarValor = (val) => {
    const num = Number(val);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  // Preparar dados para o gráfico
  const histSeries = useMemo(() => {
    if (!historico || historico.length === 0) {
      return [{ name: "Atividades", data: [] }];
    }

    return [
      {
        name: "Atividades",
        data: historico.map((h) => sanitizarValor(h.total)),
      },
    ];
  }, [historico]);

  // Opções do gráfico com Gradiente Animado (Modelo 8)
  const histOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
        sparkline: { enabled: false },
        animations: {
          enabled: true,
          speed: 2000, // 2 segundos de animação
          animateGradually: { enabled: true, delay: 0 },
          dynamicAnimation: { enabled: true, speed: 1000 },
        },
      },

      // ========== GRADIENTE ANIMADO (Modelo 8) ==========
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
        lineJoin: "round",
      },

      // Cores do gradiente: Violeta → Rosa → Cyan
      colors: ["#7e22ce"],

      // Gradiente com múltiplas paradas (animação cromática)
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7, // 70% opacidade no topo
          opacityTo: 0.2, // 20% opacidade na base
          stops: [0, 50, 100], // 3 pontos de parada
          colorStops: [
  {
    offset: 0,
    color: "#7e22ce", // Violeta
    opacity: 0.85,  // Aumentei opacidade
  },
  {
    offset: 50,
    color: "#ec4899", // Rosa
    opacity: 0.6,   // Aumentei um pouco
  },
  {
    offset: 100,
    color: "#06b6d4", // Cyan
    opacity: 0.3,   // Aumentei um pouco
  },
],

        },
      },

      // ========== DATA LABELS ==========
      dataLabels: {
        enabled: true,
        offsetY: -8,
        style: {
          colors: ["#e2e8f0"],
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
        },
        background: {
          enabled: true,
          foreColor: "#0f172a",
          padding: 5,
          borderRadius: 4,
          borderWidth: 0,
          opacity: 0.95,
        },
        formatter: (value) => {
          if (value === null || value === undefined) return "";
          return Math.round(value).toString();
        },
      },

      // ========== EIXO X (Meses) ==========
      xaxis: {
        categories: historico.map((h) => h.rotulo || ""),
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "11px",
            fontFamily: "Inter, sans-serif",
          },
          rotate: 0,
          trim: true,
          maxHeight: 50,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: { show: true, width: 1, position: "back", opacity: 0.3 },
      },

      // ========== EIXO Y ==========
      yaxis: {
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "11px",
            fontFamily: "Inter, sans-serif",
          },
          formatter: (value) => {
            return Math.round(value).toString();
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      // ========== GRID ==========
      grid: {
        borderColor: "#334155",
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: {
          top: 20,
          right: 10,
          bottom: 10,
          left: 10,
        },
      },

      // ========== TOOLTIP CUSTOMIZADO ==========
      tooltip: {
        theme: "dark",
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
        background: "#0f172a",
        borderColor: "#3b82f6",
        enabled: true,
        intersect: false,
        shared: true,
        x: {
          formatter: (value) => {
            if (historico[value]) {
              return `${historico[value].rotulo || ""}`;
            }
            return value;
          },
        },
        y: {
          formatter: (value) => {
            return `${Math.round(value)} atividades`;
          },
          title: {
            formatter: () => "Total:",
          },
        },
      },

      // ========== ESTADOS ==========
      states: {
        normal: { filter: { type: "none" } },
        hover: {
          filter: {
            type: "darken",
            value: 0.15,
          },
        },
        active: {
          filter: {
            type: "darken",
            value: 0.25,
          },
        },
      },

      // ========== RESPONSIVO ==========
      responsive: [
        {
          breakpoint: 1200,
          options: {
            chart: { height: 280 },
            dataLabels: { style: { fontSize: "10px" } },
          },
        },
        {
          breakpoint: 980,
          options: {
            chart: { height: 250 },
            dataLabels: { enabled: false },
          },
        },
      ],
    }),
    [historico]
  );

  // Forçar re-render quando histórico mudar
  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.updateSeries(histSeries, false);
    }
  }, [histSeries]);

  return (
    <div className="grafico-historico-card">
      {/* Header do card */}
      <div className="grafico-header">
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span className="card-label">Evolução ({new Date().getFullYear()})</span>
          <span className="grafico-subtitle">Atividades por mês</span>
        </div>
        
      </div>

      {/* Gráfico ou Loading/Empty */}
      {loading ? (
        <div className="no-data-chart" style={{ minHeight: "180px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "999px",
                border: "3px solid rgba(30, 64, 175, 0.38)",
                borderTopColor: "#3b82f6",
                animation: "df-spin 0.9s linear infinite",
              }}
            />
            <span>Carregando...</span>
          </div>
        </div>
      ) : historico.length > 0 ? (
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "180px",
            flex: 1,
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
        <div className="no-data-chart" style={{ minHeight: "180px" }}>
          Sem dados disponíveis
        </div>
      )}
    </div>
  );
}