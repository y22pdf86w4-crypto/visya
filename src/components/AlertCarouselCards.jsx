import { useState, useEffect } from "react";
import {
  Target,
  AlertTriangle,
  Zap,
  BarChart3,
  AlertCircle,
  UserCheck,
  TrendingUp,
  Clock,
  Award,
  UserX,
} from "lucide-react";

export function AlertCard({ icon: Icon, titulo, valor, status, mensagem, cor, tipo, isCritico = false }) {
  const getCoreColor = (cor) => {
    const cores = {
      verde: "#10b981", vermelho: "#ef4444", amarelo: "#f59e0b",
      azul: "#3b82f6", roxo: "#8b5cf6", ciano: "#06b6d4",
    };
    return cores[cor] || cor;
  };

  const getBackgroundColor = (cor) => {
    const fundos = {
      verde: "rgba(16, 185, 129, 0.08)", vermelho: "rgba(239, 68, 68, 0.08)",
      amarelo: "rgba(245, 158, 11, 0.08)", azul: "rgba(59, 130, 246, 0.08)",
      roxo: "rgba(139, 92, 246, 0.08)", ciano: "rgba(6, 182, 212, 0.08)",
    };
    return fundos[cor] || fundos.azul;
  };

  const coreColor = getCoreColor(cor);

  return (
    <div
      className={`alert-card-carousel ${isCritico ? "critico" : ""}`}
      style={{
        borderLeft: `3px solid ${coreColor}`,
        backgroundColor: getBackgroundColor(cor),
      }}
    >
      <div className="alert-card-header-carousel">
        <div className="alert-header-top">
           <Icon size={18} style={{ color: coreColor }} className="alert-icon" />
           <span className="alert-status" style={{ color: coreColor }}>{status}</span>
        </div>
        <span className="alert-title">{titulo}</span>
      </div>

      <div className="alert-card-content-carousel">
        <div className="alert-value">{valor}</div>
        <p className="alert-message">{mensagem}</p>
      </div>

      {tipo && <div className="alert-footer"><span className="alert-tipo">{tipo}</span></div>}
    </div>
  );
}

export function AlertCarousel({ todos24Cards, evolucaoSemanal, calcularCorSemana, calcularStatusSemana }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);

  // Ajuste: Mostrar 3 cards por vez para caber melhor na tela sem scroll
  const CARDS_POR_VEZ = 3; 

  useEffect(() => {
    if (!todos24Cards.length) return;
    const interval = setInterval(() => {
      setIndiceAtual((prev) => (prev + CARDS_POR_VEZ) % todos24Cards.length);
      setProgresso(0);
    }, 15000); // 15 segundos

    return () => clearInterval(interval);
  }, [todos24Cards.length]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgresso((prev) => (prev >= 100 ? 0 : prev + (100 / (15000 / 100)))); 
    }, 100);
    return () => clearInterval(progressInterval);
  }, []);

  const cardsAtuais = [];
  for (let i = 0; i < CARDS_POR_VEZ; i++) {
      cardsAtuais.push(todos24Cards[(indiceAtual + i) % todos24Cards.length]);
  }

  const maxSemana = evolucaoSemanal.length > 0 ? Math.max(...evolucaoSemanal.map((s) => s.total)) : 1;

  return (
    <div className="alert-carousel-container">
      <div className="carousel-header">
         <span className="carousel-title">Destaques & Alertas</span>
         <div className="carousel-timer">
            <div className="timer-bar" style={{ width: `${progresso}%` }} />
         </div>
      </div>

      <div className="alert-carousel-grid">
        {cardsAtuais.map((card, idx) => card && (
            <AlertCard
              key={`${indiceAtual}-${idx}`}
              {...card}
              isCritico={card.status?.includes("🔴") || card.cor === "vermelho"}
            />
        ))}
      </div>

      {evolucaoSemanal && evolucaoSemanal.length > 0 && (
        <div className="carousel-mini-chart">
           <span className="mini-chart-label">Tendência (4 Semanas)</span>
           <div className="mini-chart-bars">
              {evolucaoSemanal.map((item, idx) => {
                 const cor = calcularCorSemana(evolucaoSemanal, idx);
                 const altura = Math.max(15, (item.total / maxSemana) * 100); 
                 return (
                    <div key={idx} className="mini-bar-col" title={`Semana ${item.semana}: ${item.total}`}>
                       <div className="mini-bar" style={{ height: `${altura}%`, backgroundColor: cor }}></div>
                       <span className="mini-label">S{item.semana}</span>
                    </div>
                 )
              })}
           </div>
        </div>
      )}
    </div>
  );
}

export function gerarCardsGlobais(metricas, evolucaoSemanal) {
  const diasRestantes = 8;
  const dataAtual = new Date();
  const diaDoMes = dataAtual.getDate();

  // CORREÇÃO: Garante que percVisitados seja um número válido para evitar "undefined%"
  const percVisitados = Number(metricas.percVisitados ?? 0);

  const variacao30vs60 =
    metricas.total60d > 0
      ? (((metricas.total30d - (metricas.total60d - metricas.total30d)) /
          (metricas.total60d - metricas.total30d)) *
          100).toFixed(1)
      : 0;

  let crescimentoSemanal = 0;
  if (evolucaoSemanal.length >= 2) {
    const ultima = evolucaoSemanal[evolucaoSemanal.length - 1].total;
    const penultima = evolucaoSemanal[evolucaoSemanal.length - 2].total;
    crescimentoSemanal = penultima > 0 ? (((ultima - penultima) / penultima) * 100).toFixed(1) : 0;
  }

  const mediaDiariaAtual = metricas.totalAtividades / Math.max(diaDoMes, 1);
  const mediaDiariaGerada = (metricas.totalMeta / 22).toFixed(1);
  const diferenciaMedia = (mediaDiariaGerada - mediaDiariaAtual).toFixed(1);

  return [
    {
      icon: Target,
      titulo: "Meta Mensal Global",
      valor: `${metricas.percMetaGlobal}%`,
      status:
        metricas.percMetaGlobal >= 100
          ? "✅ ATINGIDA"
          : metricas.percMetaGlobal >= 80
          ? "⚠️ ATENÇÃO"
          : "🔴 CRÍTICO",
      mensagem: `Você está em ${metricas.totalAtividades}/${metricas.totalMeta} atividades. ${
        metricas.ativFaltantes > 0
          ? `Faltam ${metricas.ativFaltantes} atividades. Acelere nos próximos ${diasRestantes} dias!`
          : `Parabéns! Meta superada!`
      }`,
      cor:
        metricas.percMetaGlobal >= 100
          ? "verde"
          : metricas.percMetaGlobal >= 80
          ? "amarelo"
          : "vermelho",
      tipo: "📊 METAS",
    },
    {
      icon: AlertTriangle,
      titulo: "Atividades Faltantes",
      valor: metricas.ativFaltantes,
      status:
        metricas.ativFaltantes <= 0
          ? "✅ ZERADA"
          : metricas.ativFaltantes > 100
          ? "🔴 CRÍTICO"
          : "⚠️ ATENÇÃO",
      mensagem: `Faltam ${metricas.ativFaltantes} atividades em ${diasRestantes} dias. ${(
        metricas.ativFaltantes / diasRestantes
      ).toFixed(1)} por dia. Você consegue!`,
      cor: metricas.ativFaltantes <= 0 ? "verde" : metricas.ativFaltantes > 100 ? "vermelho" : "amarelo",
      tipo: "📊 METAS",
    },
    {
      icon: Zap,
      titulo: "Média Diária (Necessário)",
      valor: `${mediaDiariaGerada}/dia`,
      status: diferenciaMedia > 0 ? "⚠️ AUMENTAR" : "✅ NO ALVO",
      mensagem: `Você vem fazendo ${mediaDiariaAtual.toFixed(1)} por dia. ${
        diferenciaMedia > 0
          ? `Precisa de +${diferenciaMedia} diárias.`
          : `Está acima da meta! Mantenha.`
      }`,
      cor: diferenciaMedia > 0 ? "amarelo" : "verde",
      tipo: "📈 PERFORMANCE",
    },
    {
      icon: BarChart3,
      titulo: "Crescimento Semanal",
      valor: `${crescimentoSemanal > 0 ? "+" : ""}${crescimentoSemanal}%`,
      status:
        crescimentoSemanal > 10
          ? "✅ ÓTIMO"
          : crescimentoSemanal > 0
          ? "✅ BOM"
          : crescimentoSemanal > -10
          ? "⚠️ ESTÁVEL"
          : "🔴 QUEDA",
      mensagem: `${
        evolucaoSemanal.length >= 2
          ? `Semana ${evolucaoSemanal[evolucaoSemanal.length - 1].semana}: ${
              evolucaoSemanal[evolucaoSemanal.length - 1].total
            } ativ. ${crescimentoSemanal > 0 ? "Acelerando!" : "Queda detectada."}`
          : "Dados insuficientes."
      }`,
      cor:
        crescimentoSemanal > 10
          ? "verde"
          : crescimentoSemanal > 0
          ? "ciano"
          : crescimentoSemanal > -10
          ? "amarelo"
          : "vermelho",
      tipo: "📈 PERFORMANCE",
    },
    {
      icon: AlertCircle,
      titulo: "Clientes em Risco",
      valor: metricas.totalClientesRisco,
      status:
        metricas.percRisco > 40
          ? "🔴 CRÍTICO"
          : metricas.percRisco > 25
          ? "⚠️ ATENÇÃO"
          : "✅ BOM",
      mensagem: `${metricas.totalClientesRisco} clientes (${metricas.percRisco}%) não visitados. Priorize contatos imediatos!`,
      cor: metricas.percRisco > 40 ? "vermelho" : metricas.percRisco > 25 ? "amarelo" : "verde",
      tipo: "👥 CLIENTES",
    },
    {
      icon: UserCheck,
      titulo: "Clientes Visitados",
      valor: metricas.totalClientesVisitados,
      // Usando a variável tratada percVisitados aqui
      status:
        percVisitados >= 75
          ? "✅ EXCELENTE"
          : percVisitados >= 60
          ? "✅ BOM"
          : "⚠️ INSUFICIENTE",
      mensagem: `${metricas.totalClientesVisitados} (${percVisitados.toFixed(1)}%) visitados. ${
        percVisitados >= 75 ? "Excelente cobertura!" : "Aumente as visitas!"
      }`,
      cor: percVisitados >= 75 ? "verde" : percVisitados >= 60 ? "ciano" : "amarelo",
      tipo: "👥 CLIENTES",
    },
    {
      icon: TrendingUp,
      titulo: "Variação 30 vs 60 Dias",
      valor: `${variacao30vs60 > 0 ? "+" : ""}${variacao30vs60}%`,
      status:
        variacao30vs60 > 5
          ? "✅ CRESCIMENTO"
          : variacao30vs60 > -5
          ? "⚠️ ESTÁVEL"
          : "🔴 QUEDA",
      mensagem: `${variacao30vs60 > 0 ? "Tendência positiva!" : variacao30vs60 > -5 ? "Estável." : "Queda detectada."}`,
      cor: variacao30vs60 > 5 ? "verde" : variacao30vs60 > -5 ? "amarelo" : "vermelho",
      tipo: "📈 PERFORMANCE",
    },
    {
      icon: Clock,
      titulo: "Dias para Meta",
      valor: `${diasRestantes} dias`,
      status: diasRestantes <= 5 ? "🔴 URGENTE" : diasRestantes <= 10 ? "⚠️ ATENÇÃO" : "ℹ️ PLANEJADO",
      mensagem: `${diasRestantes} dias úteis restantes. Organize a agenda e dê o máximo!`,
      cor: diasRestantes <= 5 ? "vermelho" : diasRestantes <= 10 ? "amarelo" : "azul",
      tipo: "⏰ URGÊNCIA",
    },
  ];
}

export function gerarCardsPorConsultor(dadosAPI) {
  if (!Array.isArray(dadosAPI) || dadosAPI.length === 0) return [];

  const cards = [];
  const ordenado = [...dadosAPI].sort((a, b) => (b.pct_meta_atividades_mes || 0) - (a.pct_meta_atividades_mes || 0));

  // TOP 3 MELHORES
  for (let i = 0; i < Math.min(3, ordenado.length); i++) {
    const consultor = ordenado[i];
    const emojis = ["🥇", "🥈", "🥉"];

    cards.push({
      icon: Award,
      titulo: `${emojis[i]} ${consultor.consultor || "N/A"}`,
      valor: `${(consultor.pct_meta_atividades_mes || 0).toFixed(1)}%`,
      status: "✅ DESTAQUE",
      mensagem: `${consultor.consultor} é TOP com ${consultor.qtde_atividades_mes || 0}/${
        consultor.meta_atividades_mes || 0
      } atividades. Parabéns! 🎉 Compartilhe suas estratégias com a equipe.`,
      cor: "verde",
      tipo: "🏆 TOP CONSULTORES",
    });
  }

  // PIORES 3 - CRÍTICOS
  for (let i = 0; i < Math.min(3, ordenado.length); i++) {
    const consultor = ordenado[ordenado.length - 1 - i];
    if ((consultor.pct_meta_atividades_mes || 0) < 100) {
      const faltam = Math.max(0, (consultor.meta_atividades_mes || 0) - (consultor.qtde_atividades_mes || 0));

      cards.push({
        icon: UserX,
        titulo: `⚠️ ${consultor.consultor || "N/A"}`,
        valor: `${(consultor.pct_meta_atividades_mes || 0).toFixed(1)}%`,
        status: "🔴 CRÍTICO",
        mensagem: `${consultor.consultor} está abaixo. Faltam ${faltam} atividades. Ofereça suporte imediato nos últimos dias!`,
        cor: "vermelho",
        tipo: "⚠️ CONSULTORES CRÍTICOS",
      });
    }
  }

  // TOP 3 CARTEIRA FORTE
  const topCarteira = [...ordenado]
    .filter((c) => c.qtde_clientes_carteira > 0)
    .sort((a, b) => (b.qtde_clientes_carteira || 0) - (a.qtde_clientes_carteira || 0));

  for (let i = 0; i < Math.min(3, topCarteira.length); i++) {
    const consultor = topCarteira[i];

    cards.push({
      icon: UserCheck,
      titulo: `${consultor.consultor} - Carteira`,
      valor: `${consultor.qtde_clientes_carteira || 0}`,
      status: "✅ SÓLIDA",
      mensagem: `${consultor.consultor} tem ${consultor.qtde_clientes_carteira || 0} clientes. ${
        (consultor.qtde_clientes_risco || 0) === 0
          ? `Nenhum em risco!`
          : `${consultor.qtde_clientes_risco || 0} em risco.`
      }`,
      cor: "verde",
      tipo: "💼 CARTEIRA DE CLIENTES",
    });
  }

  // TOP 3 COM MAIOR RISCO
  const maiorRisco = [...ordenado]
    .filter((c) => c.qtde_clientes_carteira > 0)
    .sort((a, b) => (b.qtde_clientes_risco || 0) / (b.qtde_clientes_carteira || 1) - (a.qtde_clientes_risco || 0) / (a.qtde_clientes_carteira || 1));

  for (let i = 0; i < Math.min(3, maiorRisco.length); i++) {
    const consultor = maiorRisco[i];
    const percRisco = (((consultor.qtde_clientes_risco || 0) / (consultor.qtde_clientes_carteira || 1)) * 100).toFixed(1);

    cards.push({
      icon: AlertTriangle,
      titulo: `${consultor.consultor} - Risco`,
      valor: `${percRisco}%`,
      status: percRisco > 40 ? "🔴 CRÍTICO" : "⚠️ ATENÇÃO",
      mensagem: `${consultor.consultor} tem ${percRisco}% em risco (${consultor.qtde_clientes_risco || 0}/${
        consultor.qtde_clientes_carteira || 0
      }). Priorize visitas urgentes!`,
      cor: percRisco > 40 ? "vermelho" : "amarelo",
      tipo: "⚠️ ANÁLISE DE RISCO",
    });
  }

  return cards;
}

export function gerarTodos24Cards(metricas, evolucaoSemanal, dadosAPI) {
  const globais = gerarCardsGlobais(metricas, evolucaoSemanal);
  const porConsultor = gerarCardsPorConsultor(dadosAPI);
  return [...globais, ...porConsultor];
}
