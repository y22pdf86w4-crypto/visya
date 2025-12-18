// src/components/AlertCarouselCards.jsx
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

import '../styles/AlertCarousel.css'; // Importando o CSS ajustado

export function AlertCard({
  icon: Icon,
  titulo,
  valor,
  status,
  mensagem,
  cor,
  tipo,
  isCritico = false,
}) {
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
    // Usando gradientes sutis para bater com o novo CSS
    const fundos = {
      verde: "linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, #1e293b 100%)",
      vermelho: "linear-gradient(180deg, rgba(239, 68, 68, 0.1) 0%, #1e293b 100%)",
      amarelo: "linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, #1e293b 100%)",
      azul: "linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, #1e293b 100%)",
      roxo: "linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, #1e293b 100%)",
      ciano: "linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, #1e293b 100%)",
    };
    // Fallback para azul se não encontrar
    return fundos[cor] || fundos.azul;
  };

  const coreColor = getCoreColor(cor);
  
  // Mapeamento de classes CSS baseadas na cor para animações
  const getClassByColor = (cor) => {
      if (cor === 'vermelho') return 'critico';
      if (cor === 'amarelo') return 'atencao';
      if (cor === 'verde') return 'sucesso';
      return '';
  };

  return (
    <div
      className={`alert-card-carousel ${getClassByColor(cor)} ${isCritico ? "critico" : ""}`}
      style={{
        // A cor da borda lateral é definida via style inline para flexibilidade, 
        // mas o CSS classe já trata background e animações.
        // O ::before do CSS cuida da cor, mas podemos reforçar ou remover se o CSS já tiver.
        // Vamos manter o style inline para garantir cores dinâmicas se necessário, 
        // mas o background já vem das classes CSS ou da função acima.
        background: getBackgroundColor(cor),
        borderColor: `${coreColor}40` // 40 hex = ~25% opacity
      }}
    >
        {/* Pseudo-elemento via CSS cuida da barra lateral, mas podemos forçar cor aqui se precisar */}
        <style jsx="true">{`
            .alert-card-carousel.${getClassByColor(cor)}::before {
                background-color: ${coreColor} !important;
            }
        `}</style>

      <div className="alert-card-header-carousel">
        <div className="alert-header-left">
           {/* Subtítulo ou Tipo acima do título principal */}
           <span className="alert-subtitle" style={{ color: coreColor }}>
              {status}
           </span>
           <span className="alert-title-main">{titulo}</span>
        </div>
        
        {/* Badge de Status/Ícone na direita */}
        <div className="alert-status-badge" style={{ color: coreColor, borderColor: coreColor }}>
           <Icon size={14} />
        </div>
      </div>

      <div className="alert-card-content-carousel">
        <div className="alert-value">{valor}</div>
        <p className="alert-message">{mensagem}</p>
      </div>

      {tipo && (
        <div className="alert-footer">
          <span className="alert-tag">{tipo}</span>
        </div>
      )}
    </div>
  );
}

export function AlertCarousel({
  todos24Cards,
  evolucaoSemanal,
  calcularCorSemana,
  calcularStatusSemana,
}) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);

  const CARDS_POR_VEZ = 3;

  useEffect(() => {
    if (!todos24Cards.length) return;
    const interval = setInterval(() => {
      setIndiceAtual((prev) => (prev + CARDS_POR_VEZ) % todos24Cards.length);
      setProgresso(0);
    }, 15000);

    return () => clearInterval(interval);
  }, [todos24Cards.length]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgresso((prev) =>
        prev >= 100 ? 0 : prev + (100 / (15000 / 100))
      );
    }, 100);
    return () => clearInterval(progressInterval);
  }, []);

  const cardsAtuais = [];
  for (let i = 0; i < CARDS_POR_VEZ; i++) {
    cardsAtuais.push(
      todos24Cards[(indiceAtual + i) % todos24Cards.length]
    );
  }

  const maxSemana =
    evolucaoSemanal && evolucaoSemanal.length > 0
      ? Math.max(...evolucaoSemanal.map((s) => s.total))
      : 1;

  return (
    <div className="alert-carousel-container">
      <div className="carousel-header">
        <span className="carousel-title">Destaques & Alertas</span>
        <div className="carousel-timer">
          <div className="timer-bar" style={{ width: `${progresso}%` }} />
        </div>
      </div>

      <div className="alert-carousel-grid">
        {cardsAtuais.map((card, idx) =>
          card ? (
            <AlertCard
              key={`${indiceAtual}-${idx}`}
              {...card}
              isCritico={
                card.status?.includes("🔴") || card.cor === "vermelho"
              }
            />
          ) : null
        )}
      </div>

      {evolucaoSemanal && evolucaoSemanal.length > 0 && (
        <div className="carousel-mini-chart">
          <span className="mini-chart-label">Tendência (4 Semanas)</span>
          <div className="mini-chart-bars">
            {evolucaoSemanal.map((item, idx) => {
              const corHex = calcularCorSemana ? calcularCorSemana(evolucaoSemanal, idx) : '#334155';
              const altura = Math.max(15, (item.total / maxSemana) * 100);
              return (
                <div
                  key={idx}
                  className="mini-bar-col"
                  title={`Semana ${item.semana}: ${item.total}`}
                >
                  <div
                    className="mini-bar"
                    style={{
                      height: `${altura}%`,
                      backgroundColor: corHex,
                    }}
                  />
                  <span className="mini-label">S{item.semana}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ HELPER: Sanitizar valores para evitar NaN, undefined, Infinity
const sanitizarValor = (val) => {
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

export function gerarCardsGlobais(metricas, evolucaoSemanal) {
  const diasRestantes = 8;
  const dataAtual = new Date();
  const diaDoMes = dataAtual.getDate();

  // ✅ CORRIGIDO: Usa o nome correto do campo
  const percVisitado = Number(metricas.percVisitado ?? 0);
  const totalAtividades = sanitizarValor(metricas.totalAtividades);
  const total30d = sanitizarValor(metricas.total30d);
  const total60d = sanitizarValor(metricas.total60d);
  const totalClientes = sanitizarValor(metricas.totalClientes);
  const totalClientesRisco = sanitizarValor(
    metricas.totalClientesRisco
  );
  const totalMeta = sanitizarValor(metricas.totalMeta);

  // ✅ CORRIGIDO: Proteção contra divisão por zero e Infinity
  let variacao30vs60 = 0;
  if (total60d > 0) {
    const base = total60d - total30d;
    if (base !== 0 && isFinite(base)) {
      const calc = (((total30d - base) / base) * 100);
      variacao30vs60 = isFinite(calc) ? calc.toFixed(1) : 0;
    } else {
      variacao30vs60 = 0;
    }
  }

  // ✅ CORRIGIDO: Crescimento semanal com proteção
  let crescimentoSemanal = 0;
  if (evolucaoSemanal && evolucaoSemanal.length >= 2) {
    const ultima = sanitizarValor(
      evolucaoSemanal[evolucaoSemanal.length - 1].total
    );
    const penultima = sanitizarValor(
      evolucaoSemanal[evolucaoSemanal.length - 2].total
    );
    if (penultima > 0) {
      const calc = (((ultima - penultima) / penultima) * 100);
      crescimentoSemanal = isFinite(calc) ? calc.toFixed(1) : 0;
    } else {
      crescimentoSemanal = 0;
    }
  }

  // ✅ CORRIGIDO: Média diária REAL (diaDoMes, não 22)
  const mediaDiariaAtual =
    diaDoMes > 0 ? (totalAtividades / diaDoMes).toFixed(1) : 0;
  // Média necessária (meta / 22 dias úteis)
  const mediaDiariaGerada =
    totalMeta > 0 ? (totalMeta / 22).toFixed(1) : 0;
  const diferenciaMedia = (mediaDiariaGerada - mediaDiariaAtual).toFixed(1);

  // ✅ CORRIGIDO: Percentual de meta com proteção
  const percMetaGlobal =
    totalMeta > 0 ? sanitizarValor(metricas.percMetaGlobal) : 0;
  const ativFaltantes = Math.max(0, totalMeta - totalAtividades);

  // ✅ CORRIGIDO: Percentual de risco com proteção
  const percRisco =
    totalClientes > 0 ? sanitizarValor(metricas.percRisco) : 0;

  return [
    {
      icon: Target,
      titulo: "Meta Mensal Global",
      valor: `${percMetaGlobal}%`,
      status:
        percMetaGlobal >= 100
          ? "✅ ATINGIDA"
          : percMetaGlobal >= 80
          ? "⚠️ ATENÇÃO"
          : "🔴 CRÍTICO",
      mensagem: `Você está em ${totalAtividades}/${totalMeta} atividades. ${
        ativFaltantes > 0
          ? `Faltam ${ativFaltantes} atividades. Acelere nos próximos ${diasRestantes} dias!`
          : `Parabéns! Meta superada!`
      }`,
      cor:
        percMetaGlobal >= 100
          ? "verde"
          : percMetaGlobal >= 80
          ? "amarelo"
          : "vermelho",
      tipo: "📊 METAS",
    },
    {
      icon: AlertTriangle,
      titulo: "Atividades Faltantes",
      valor: ativFaltantes,
      status:
        ativFaltantes <= 0
          ? "✅ ZERADA"
          : ativFaltantes > 100
          ? "🔴 CRÍTICO"
          : "⚠️ ATENÇÃO",
      // ✅ CORRIGIDO: Mensagem inteligente quando = 0
      mensagem:
        ativFaltantes <= 0
          ? "Meta atingida! Não há atividades faltantes. Foque agora na qualidade das visitas e follow-up."
          : `Faltam ${ativFaltantes} atividades em ${diasRestantes} dias. ${(
              ativFaltantes / diasRestantes
            ).toFixed(1)} por dia. Você consegue!`,
      cor:
        ativFaltantes <= 0
          ? "verde"
          : ativFaltantes > 100
          ? "vermelho"
          : "amarelo",
      tipo: "📊 METAS",
    },
    {
      icon: Zap,
      titulo: "Média Diária",
      valor: `${mediaDiariaAtual}/dia`,
      status:
        diferenciaMedia > 0
          ? "⚠️ AUMENTAR"
          : diferenciaMedia < 0
          ? "✅ ACIMA"
          : "✅ NO ALVO",
      mensagem: `Você vem fazendo ${mediaDiariaAtual}/dia. Meta: ${mediaDiariaGerada}/dia. ${
        diferenciaMedia > 0
          ? `Precisa de +${diferenciaMedia}/dia para bater a meta.`
          : diferenciaMedia < 0
          ? `Está ${Math.abs(diferenciaMedia)}/dia acima! Mantenha esse ritmo.`
          : `Perfeito! Exatamente no alvo.`
      }`,
      cor:
        diferenciaMedia > 0
          ? "amarelo"
          : diferenciaMedia < 0
          ? "verde"
          : "ciano",
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
        evolucaoSemanal && evolucaoSemanal.length >= 2
          ? `Semana ${
              evolucaoSemanal[evolucaoSemanal.length - 1].semana
            }: ${sanitizarValor(
              evolucaoSemanal[evolucaoSemanal.length - 1].total
            )} ativ. ${crescimentoSemanal > 0 ? "Acelerando!" : "Queda detectada."}`
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
      valor: totalClientesRisco,
      status:
        percRisco > 40
          ? "🔴 CRÍTICO"
          : percRisco > 25
          ? "⚠️ ATENÇÃO"
          : "✅ BOM",
      mensagem: `${totalClientesRisco} clientes (${percRisco}%) não visitados. Priorize contatos imediatos!`,
      cor:
        percRisco > 40
          ? "vermelho"
          : percRisco > 25
          ? "amarelo"
          : "verde",
      tipo: "👥 CLIENTES",
    },
    {
      icon: UserCheck,
      titulo: "Clientes Visitados",
      valor: sanitizarValor(metricas.totalClientesVisitado),
      status:
        percVisitado >= 75
          ? "✅ EXCELENTE"
          : percVisitado >= 60
          ? "✅ BOM"
          : "⚠️ INSUFICIENTE",
      mensagem: `${sanitizarValor(
        metricas.totalClientesVisitado
      )} (${percVisitado.toFixed(1)}%) visitados. ${
        percVisitado >= 75
          ? "Excelente cobertura!"
          : "Aumente as visitas!"
      }`,
      cor:
        percVisitado >= 75
          ? "verde"
          : percVisitado >= 60
          ? "ciano"
          : "amarelo",
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
      mensagem: `${
        variacao30vs60 > 0
          ? "Tendência positiva!"
          : variacao30vs60 > -5
          ? "Estável."
          : "Queda detectada."
      }`,
      cor:
        variacao30vs60 > 5
          ? "verde"
          : variacao30vs60 > -5
          ? "amarelo"
          : "vermelho",
      tipo: "📈 PERFORMANCE",
    },
    {
      icon: Clock,
      titulo: "Dias para Meta",
      valor: `${diasRestantes} dias`,
      status:
        diasRestantes <= 5
          ? "🔴 URGENTE"
          : diasRestantes <= 10
          ? "⚠️ ATENÇÃO"
          : "ℹ️ PLANEJADO",
      mensagem: `${diasRestantes} dias úteis restantes. Organize a agenda e dê o máximo!`,
      cor:
        diasRestantes <= 5
          ? "vermelho"
          : diasRestantes <= 10
          ? "amarelo"
          : "azul",
      tipo: "⏰ URGÊNCIA",
    },
  ];
}

export function gerarCardsPorConsultor(dadosAPI) {
  if (!Array.isArray(dadosAPI) || dadosAPI.length === 0) return [];

  const cards = [];
  const ordenado = [...dadosAPI].sort(
    (a, b) =>
      (b.pct_meta_atividades_mes || 0) - (a.pct_meta_atividades_mes || 0)
  );

  // TOP 3 MELHORES
  for (let i = 0; i < Math.min(3, ordenado.length); i++) {
    const consultor = ordenado[i];
    const emojis = ["🥇", "🥈", "🥉"];

    const qtdeAtiv = sanitizarValor(consultor.qtde_atividades_mes);
    const meta = sanitizarValor(consultor.meta_atividades_mes);
    const pctMeta = sanitizarValor(consultor.pct_meta_atividades_mes);

    cards.push({
      icon: Award,
      titulo: `${emojis[i]} ${consultor.consultor || "N/A"}`,
      valor: `${pctMeta.toFixed(1)}%`,
      status: "✅ DESTAQUE",
      mensagem: `${consultor.consultor} é TOP com ${qtdeAtiv}/${meta} atividades. Parabéns! 🎉 Compartilhe suas estratégias com a equipe.`,
      cor: "verde",
      tipo: "🏆 TOP CONSULTORES",
    });
  }

  // PIORES 3 - CRÍTICOS
  for (let i = 0; i < Math.min(3, ordenado.length); i++) {
    const consultor = ordenado[ordenado.length - 1 - i];
    const pctMeta = sanitizarValor(consultor.pct_meta_atividades_mes);

    if (pctMeta < 100) {
      const qtdeAtiv = sanitizarValor(consultor.qtde_atividades_mes);
      const meta = sanitizarValor(consultor.meta_atividades_mes);
      const faltam = Math.max(0, meta - qtdeAtiv);

      cards.push({
        icon: UserX,
        titulo: `${consultor.consultor || "N/A"}`,
        valor: `${pctMeta.toFixed(1)}%`,
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
    .sort(
      (a, b) =>
        (b.qtde_clientes_carteira || 0) - (a.qtde_clientes_carteira || 0)
    );

  for (let i = 0; i < Math.min(3, topCarteira.length); i++) {
    const consultor = topCarteira[i];

    const carteira = sanitizarValor(consultor.qtde_clientes_carteira);
    const risco = sanitizarValor(consultor.qtde_clientes_risco);

    cards.push({
      icon: UserCheck,
      titulo: `${consultor.consultor} - Carteira`,
      valor: `${carteira}`,
      status: "✅ SÓLIDA",
      mensagem: `${consultor.consultor} tem ${carteira} clientes. ${
        risco === 0 ? `Nenhum em risco!` : `${risco} em risco.`
      }`,
      cor: "verde",
      tipo: "💼 CARTEIRA DE CLIENTES",
    });
  }

  // TOP 3 COM MAIOR RISCO
  const maiorRisco = [...ordenado]
    .filter((c) => c.qtde_clientes_carteira > 0)
    .sort((a, b) => {
      const riscoA = sanitizarValor(a.qtde_clientes_risco);
      const carteiraA = sanitizarValor(a.qtde_clientes_carteira);
      const riscoB = sanitizarValor(b.qtde_clientes_risco);
      const carteiraB = sanitizarValor(b.qtde_clientes_carteira);

      return (
        (riscoB / (carteiraB || 1)) - (riscoA / (carteiraA || 1))
      );
    });

  for (let i = 0; i < Math.min(3, maiorRisco.length); i++) {
    const consultor = maiorRisco[i];

    const risco = sanitizarValor(consultor.qtde_clientes_risco);
    const carteira = sanitizarValor(consultor.qtde_clientes_carteira);
    const percRisco =
      carteira > 0 ? ((risco / carteira) * 100).toFixed(1) : 0;

    cards.push({
      icon: AlertTriangle,
      titulo: `${consultor.consultor} - Risco`,
      valor: `${percRisco}%`,
      status:
        percRisco > 40 ? "🔴 CRÍTICO" : "⚠️ ATENÇÃO",
      mensagem: `${consultor.consultor} tem ${percRisco}% em risco (${risco}/${carteira}). Priorize visitas urgentes!`,
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
