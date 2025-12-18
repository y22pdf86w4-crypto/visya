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

// Se certifique que o CSS está importado corretamente no seu projeto
// import '../styles/AlertCarousel.css'; 

const sanitizarValor = (val) => {
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

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
        borderRight: "1px solid rgba(255,255,255,0.05)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
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

export function AlertCarousel({ 
  todos24Cards, 
  evolucaoSemanal, 
  calcularCorSemana, 
  calcularStatusSemana,
  isExpanded = false // <--- PROP NOVA
}) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);

  // Lógica dinâmica: 6 se expandido, 3 se normal
  const CARDS_POR_VEZ = isExpanded ? 6 : 3; 

  useEffect(() => {
    if (!todos24Cards || !todos24Cards.length) return;
    const interval = setInterval(() => {
      setIndiceAtual((prev) => (prev + CARDS_POR_VEZ) % todos24Cards.length);
      setProgresso(0);
    }, 15000);

    return () => clearInterval(interval);
  }, [todos24Cards, CARDS_POR_VEZ]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgresso((prev) => (prev >= 100 ? 0 : prev + (100 / (15000 / 100)))); 
    }, 100);
    return () => clearInterval(progressInterval);
  }, []);

  const cardsAtuais = [];
  if (todos24Cards && todos24Cards.length > 0) {
      for (let i = 0; i < CARDS_POR_VEZ; i++) {
          cardsAtuais.push(todos24Cards[(indiceAtual + i) % todos24Cards.length]);
      }
  }

  const maxSemana = evolucaoSemanal && evolucaoSemanal.length > 0 
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
                 const cor = calcularCorSemana ? calcularCorSemana(evolucaoSemanal, idx) : '#334155';
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

// ... (Mantenha as funções auxiliares gerarCardsGlobais, gerarCardsPorConsultor e gerarTodos24Cards iguais às que te mandei no AlertCarouselCardsv2.jsx, pois elas já tem a proteção de dados. Se precisar que eu repita aqui, me avise!)
// Vou incluir apenas a exportação final para garantir compatibilidade
export function gerarCardsGlobais(metricas, evolucaoSemanal) {
  /* ... use a versão com sanitizarValor que passei antes ... */
  const diasRestantes = 8;
  const dataAtual = new Date();
  const diaDoMes = dataAtual.getDate();
  const percVisitados = Number(metricas.percVisitado ?? metricas.percVisitados ?? 0);
  const totalAtividades = sanitizarValor(metricas.totalAtividades);
  const totalMeta = sanitizarValor(metricas.totalMeta);
  const ativFaltantes = sanitizarValor(metricas.ativFaltantes);
  const percMetaGlobal = sanitizarValor(metricas.percMetaGlobal);
  
  // ... resto da lógica simplificada para caber ...
  return [
    { icon: Target, titulo: "Meta Mensal", valor: `${percMetaGlobal}%`, status: percMetaGlobal >= 100 ? "✅ ATINGIDA" : "⚠️ EM ANDAMENTO", mensagem: `Total: ${totalAtividades}/${totalMeta}`, cor: percMetaGlobal >= 100 ? "verde" : "amarelo", tipo: "METAS" },
    // ... adicione os outros cards ...
  ];
}

export function gerarTodos24Cards(metricas, evolucaoSemanal, dadosAPI) {
   // Se você não tiver as funções completas aqui, o código vai quebrar. 
   // Recomendo fortemente copiar as funções `gerarCardsGlobais` e `gerarCardsPorConsultor` do código v2 que enviei na resposta anterior.
   return []; // Placeholder para não quebrar se copiar e colar direto sem as funções
}
