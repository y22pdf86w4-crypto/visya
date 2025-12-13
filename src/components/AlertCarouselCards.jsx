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
      verde: "#10b981",
      vermelho: "#ef4444",
      amarelo: "#f59e0b",
      azul: "#3b82f6",
      roxo: "#8b5cf6",
      ciano: "#06b6d4",
    };
    return cores[cor] || cor;
  };


  const getBackgroundColor = (cor) => {
    const fundos = {
      verde: "rgba(16, 185, 129, 0.08)",
      vermelho: "rgba(239, 68, 68, 0.08)",
      amarelo: "rgba(245, 158, 11, 0.08)",
      azul: "rgba(59, 130, 246, 0.08)",
      roxo: "rgba(139, 92, 246, 0.08)",
      ciano: "rgba(6, 182, 212, 0.08)",
    };
    return fundos[cor] || fundos.azul;
  };


  return (
    <div
      className={`alert-card-carousel ${isCritico ? "critico" : ""}`}
      style={{
        borderLeftColor: getCoreColor(cor),
        backgroundColor: getBackgroundColor(cor),
      }}
    >
      {/* ════════════════════════════════════════════════════════════════
          SEÇÃO TOPO - ÍCONE + NOME + STATUS
          ════════════════════════════════════════════════════════════════ */}
      <div className="alert-card-header-carousel">
        <Icon size={24} style={{ color: getCoreColor(cor), flexShrink: 0 }} className="alert-card-icon-carousel" />
        <div className="alert-card-title-section-carousel">
          <span className="alert-card-title-carousel">{titulo}</span>
          <span className="alert-card-status-carousel" style={{ color: getCoreColor(cor) }}>
            {status}
          </span>
        </div>
      </div>


      {/* ════════════════════════════════════════════════════════════════
          SEÇÃO MEIO - VALOR GRANDE + MENSAGEM (PRINCIPAL)
          ════════════════════════════════════════════════════════════════ */}
      <div className="alert-card-content-carousel">
        <div className="alert-card-value-carousel">{valor}</div>
        <p className="alert-card-mensagem-carousel">{mensagem}</p>
      </div>


      {/* ════════════════════════════════════════════════════════════════
          SEÇÃO CANTO INFERIOR DIREITO - BADGE PEQUENO (tipo)
          ════════════════════════════════════════════════════════════════ */}
      {tipo && <span className="alert-card-tipo-carousel">{tipo}</span>}
    </div>
  );
}


// ===================== COMPONENTE CAROUSEL PRINCIPAL =====================
export function AlertCarousel({ todos24Cards, evolucaoSemanal, calcularCorSemana, calcularStatusSemana }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);


  // Rotaciona a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIndiceAtual((prev) => (prev + 4) % todos24Cards.length);
      setProgresso(0);
    }, 30000);


    return () => clearInterval(interval);
  }, [todos24Cards.length]);


  // Anima a barra de progresso
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgresso((prev) => (prev >= 100 ? 0 : prev + 100 / 150)); // 150 frames em 30s
    }, 200);


    return () => clearInterval(progressInterval);
  }, []);


  // Pegar 4 cards atuais
  const cardsAtuais = [
    todos24Cards[indiceAtual % todos24Cards.length],
    todos24Cards[(indiceAtual + 1) % todos24Cards.length],
    todos24Cards[(indiceAtual + 2) % todos24Cards.length],
    todos24Cards[(indiceAtual + 3) % todos24Cards.length],
  ];


  const maxSemana = Math.max(...evolucaoSemanal.map((s) => s.total));


  return (
    <div className="alert-carousel-container">
      {/* GRID DE 4 CARDS HORIZONTAIS */}
      <div className="alert-carousel-grid">
        {cardsAtuais.map((card, idx) => {
          // Determinar se é crítico (baseado no status ou cor)
          const isCritico = card.status?.includes("🔴") || card.cor === "vermelho";


          return (
            <div
              key={idx}
              className="alert-carousel-item"
            >
              <AlertCard
                icon={card.icon}
                titulo={card.titulo}
                valor={card.valor}
                status={card.status}
                mensagem={card.mensagem}
                cor={card.cor}
                tipo={card.tipo}
                isCritico={isCritico}
              />
            </div>
          );
        })}
      </div>


      {/* BARRA DE PROGRESSO E SEMANAS COMPACTA EM BAIXO */}
      <div className="carousel-footer">
        {/* BARRA DE PROGRESSO DO CARROSSEL */}
        <div className="carousel-progress-section">
          <span className="carousel-progress-label">Próximo em {30 - Math.floor(progresso / 3.33)}s</span>
          <div className="carousel-progress-bar">
            <div
              className="carousel-progress-fill"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>


        {/* SEMANAS MINIATURIZADAS */}
        {evolucaoSemanal && evolucaoSemanal.length > 0 && (
          <div className="carousel-semanas-mini">
            {evolucaoSemanal.map((item, idx) => {
              const corFundo = calcularCorSemana(evolucaoSemanal, idx);


              return (
                <div
                  key={idx}
                  className="carousel-semana-mini"
                  style={{
                    borderLeftColor: corFundo,
                    backgroundColor:
                      corFundo === "#10b981"
                        ? "rgba(16, 185, 129, 0.12)"
                        : corFundo === "#f59e0b"
                        ? "rgba(245, 158, 11, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                  }}
                >
                  <div className="carousel-semana-header-mini">
                    <span className="carousel-semana-label-mini">S{item.semana}</span>
                    <span className="carousel-semana-status-mini" style={{ color: corFundo }}>
                      {calcularStatusSemana(evolucaoSemanal.slice(0, idx + 1))}
                    </span>
                  </div>


                  <div className="carousel-semana-valor-mini">{item.total}</div>


                  <div className="carousel-semana-barra-mini">
                    <div
                      className="carousel-semana-progresso-mini"
                      style={{
                        width: `${(item.total / maxSemana) * 100}%`,
                        backgroundColor: corFundo,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// ===================== GERADORES DOS 8 CARDS GLOBAIS =====================
export function gerarCardsGlobais(metricas, evolucaoSemanal) {
  const diasRestantes = 8;
  const dataAtual = new Date();
  const diaDoMes = dataAtual.getDate();


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
      status:
        metricas.percVisitados >= 75
          ? "✅ EXCELENTE"
          : metricas.percVisitados >= 60
          ? "✅ BOM"
          : "⚠️ INSUFICIENTE",
      mensagem: `${metricas.totalClientesVisitados} (${metricas.percVisitados}%) visitados. ${
        metricas.percVisitados >= 75 ? "Excelente cobertura!" : "Aumente as visitas!"
      }`,
      cor: metricas.percVisitados >= 75 ? "verde" : metricas.percVisitados >= 60 ? "ciano" : "amarelo",
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


// ===================== GERADORES DOS 16 CARDS POR CONSULTOR =====================
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


// ===== EXPORTAR FUNÇÃO UNIFICADA =====
export function gerarTodos24Cards(metricas, evolucaoSemanal, dadosAPI) {
  const globais = gerarCardsGlobais(metricas, evolucaoSemanal);
  const porConsultor = gerarCardsPorConsultor(dadosAPI);
  return [...globais, ...porConsultor];
}