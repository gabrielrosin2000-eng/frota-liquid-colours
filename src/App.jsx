import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOTORISTAS = [
  { id: 1, nome: "Caio" },
  { id: 2, nome: "Gabriel" },
  { id: 3, nome: "Heliton" },
  { id: 4, nome: "João" },
  { id: 5, nome: "Lucas Polim" },
  { id: 6, nome: "Moises" },
  { id: 7, nome: "Thiago" },
  { id: 8, nome: "Varlei" },
  { id: 9, nome: "Victor" },
];

const VEICULOS = [
  { placa: "RAM-001",  modelo: "RAM - Rampage" },
  { placa: "VW-002",   modelo: "Volkswagen - Saveiro" },
  { placa: "FORD-003", modelo: "Ford - Ranger" },
  { placa: "VW-004",   modelo: "Volkswagen - Jetta" },
  { placa: "EFFA-005", modelo: "Effa - Caminhão" },
];

const TIPOS_GASTO = ["Combustível", "Pedágio", "Alimentação", "Outros"];

const INITIAL_VIAGENS = [
  {
    id: 1, motorista: "Heliton", passageiro: "",
    veiculo: "RAM - Rampage", placa: "RAM-001",
    motivo: "Entrega de equipamentos", destino_cidade_uf: "Campinas/SP",
    data_hora_saida: "2025-05-10T08:00", data_hora_chegada: "2025-05-10T14:30",
    status: "Concluída",
  },
  {
    id: 2, motorista: "Gabriel", passageiro: "",
    veiculo: "Volkswagen - Saveiro", placa: "VW-002",
    motivo: "Visita ao cliente Alfa", destino_cidade_uf: "Santos/SP",
    data_hora_saida: "2025-05-15T07:30", data_hora_chegada: "2025-05-15T16:00",
    status: "Concluída",
  },
  {
    id: 3, motorista: "Thiago", passageiro: "",
    veiculo: "Effa - Caminhão", placa: "EFFA-005",
    motivo: "Coleta de materiais", destino_cidade_uf: "Ribeirão Preto/SP",
    data_hora_saida: "2025-06-02T06:00", data_hora_chegada: null,
    status: "Em andamento",
  },
  {
    id: 4, motorista: "Lucas Polim", passageiro: "",
    veiculo: "Ford - Ranger", placa: "FORD-003",
    motivo: "Auditoria de campo", destino_cidade_uf: "Sorocaba/SP",
    data_hora_saida: "2025-06-01T09:00", data_hora_chegada: "2025-06-01T18:00",
    status: "Concluída",
  },
  {
    id: 5, motorista: "Victor", passageiro: "",
    veiculo: "Volkswagen - Jetta", placa: "VW-004",
    motivo: "Reunião com fornecedor", destino_cidade_uf: "SP Capital/SP",
    data_hora_saida: "2025-04-20T10:00", data_hora_chegada: "2025-04-20T13:00",
    status: "Concluída",
  },
];

const INITIAL_DESPESAS = [
  { id: 1, viagem_id: 1, tipo_gasto: "Combustível", estabelecimento: "Posto Shell Anhanguera", valor: 180.50, url_foto: null },
  { id: 2, viagem_id: 1, tipo_gasto: "Pedágio", estabelecimento: "Rodovia Anhanguera KM 90", valor: 32.80, url_foto: null },
  { id: 3, viagem_id: 1, tipo_gasto: "Alimentação", estabelecimento: "Restaurante Sabor & Arte", valor: 65.00, url_foto: null },
  { id: 4, viagem_id: 2, tipo_gasto: "Combustível", estabelecimento: "Posto Ipiranga Litoral", valor: 220.00, url_foto: null },
  { id: 5, viagem_id: 2, tipo_gasto: "Pedágio", estabelecimento: "Via Anchieta KM 55", valor: 45.60, url_foto: null },
  { id: 6, viagem_id: 2, tipo_gasto: "Alimentação", estabelecimento: "McDonald's Cubatão", valor: 42.90, url_foto: null },
  { id: 7, viagem_id: 3, tipo_gasto: "Combustível", estabelecimento: "Posto BR Ribeirão", valor: 195.00, url_foto: null },
  { id: 8, viagem_id: 4, tipo_gasto: "Combustível", estabelecimento: "Posto Texaco Sorocaba", valor: 160.00, url_foto: null },
  { id: 9, viagem_id: 4, tipo_gasto: "Pedágio", estabelecimento: "Castelo Branco KM 70", valor: 28.40, url_foto: null },
  { id: 10, viagem_id: 4, tipo_gasto: "Alimentação", estabelecimento: "Padaria Central Sorocaba", valor: 78.00, url_foto: null },
  { id: 11, viagem_id: 4, tipo_gasto: "Outros", estabelecimento: "Estacionamento Auditoria", valor: 35.00, url_foto: null },
  { id: 12, viagem_id: 5, tipo_gasto: "Combustível", estabelecimento: "Posto Shell Marginal", valor: 145.00, url_foto: null },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (s) => s ? new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const getMes = (s) => s ? new Date(s).toLocaleString("pt-BR", { month: "short", year: "2-digit" }) : "";
const getMesNum = (s) => s ? `${new Date(s).getFullYear()}-${String(new Date(s).getMonth() + 1).padStart(2, "0")}` : "";

const PIE_COLORS = ["#EAB308", "#1a1a1a", "#FFFFFF", "#ca8a04"];

// ─── ICONS (SVG inline) ───────────────────────────────────────────────────────
const Icon = ({ name, cls = "w-5 h-5" }) => {
  const icons = {
    truck: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m7-1H6m7 0l2 1m-2-1v-2m4 2V9.5a1 1 0 00-.293-.707L17 6.086A1 1 0 0016.293 6H14v10h5z"/></svg>,
    chart: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    plus: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
    check: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    camera: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    flag: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0l9 3 9-3v13l-9 3-9-3z"/></svg>,
    wallet: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
    download: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
    x: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
    map: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    fuel: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h7a1 1 0 011 1v16H4a1 1 0 01-1-1V4zm11 0h1.5a2.5 2.5 0 012.5 2.5v4a1.5 1.5 0 003 0V7l-2-3"/></svg>,
    user: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
    arrow: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>,
    list: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  };
  return icons[name] || null;
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const cls = status === "Em andamento"
    ? "bg-yellow-400 text-black border border-yellow-500"
    : "bg-black text-yellow-400 border border-black";
  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full leading-none ${cls}`}>
      {status}
    </span>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-black">
        <h3 className="font-bold text-yellow-400 text-lg">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <Icon name="x" cls="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto max-h-[80vh]">{children}</div>
    </div>
  </div>
);

// ─── LABEL / INPUT helpers ────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition bg-white";
const selectCls = inputCls;

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = "yellow" }) => {
  const colors = {
    yellow: "from-yellow-400 to-yellow-500",
    dark:   "from-gray-800 to-black",
    white:  "from-white to-gray-100",
  };
  const textColor = color === "white" ? "text-black" : "text-black";
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0 border border-yellow-300`}>
        <Icon name={icon} cls={`w-6 h-6 ${textColor}`} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ÁREA DO MOTORISTA
// ════════════════════════════════════════════════════════════════════
const AreaMotorista = ({ viagens, setViagens, despesas, setDespesas, goHome }) => {
  const [view, setView] = useState("menu"); // menu | novaViagem | emAndamento | historico
  const [viagemAtiva, setViagemAtiva] = useState(null);
  const [showDespesaModal, setShowDespesaModal] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [fotoSimulada, setFotoSimulada] = useState(null);

  // Volta ao menu quando a logo é clicada
  useEffect(() => {
    if (goHome > 0) {
      setView("menu");
      setViagemAtiva(null);
      setShowDespesaModal(false);
      setShowFinalizarModal(false);
    }
  }, [goHome]);

  const [novaViagem, setNovaViagem] = useState({
    motorista: "", passageiro: "", veiculo: "", motivo: "", destino_cidade_uf: "",
  });
  const [novaDespesa, setNovaDespesa] = useState({
    tipo_gasto: "Combustível", estabelecimento: "", valor: "",
  });

  const emAndamento = viagens.filter(v => v.status === "Em andamento");

  const iniciarViagem = () => {
    if (!novaViagem.motorista || !novaViagem.veiculo || !novaViagem.motivo || !novaViagem.destino_cidade_uf) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const veiculo = VEICULOS.find(v => v.placa === novaViagem.veiculo);
    const nova = {
      id: Date.now(),
      ...novaViagem,
      placa: novaViagem.veiculo,
      veiculo: veiculo?.modelo || novaViagem.veiculo,
      data_hora_saida: new Date().toISOString(),
      data_hora_chegada: null,
      status: "Em andamento",
    };
    setViagens(prev => [nova, ...prev]);
    setViagemAtiva(nova);
    setNovaViagem({ motorista: "", passageiro: "", veiculo: "", motivo: "", destino_cidade_uf: "" });
    setView("emAndamento");
  };

  const adicionarDespesa = () => {
    if (!novaDespesa.estabelecimento || !novaDespesa.valor) {
      alert("Preencha estabelecimento e valor.");
      return;
    }
    const desp = {
      id: Date.now(),
      viagem_id: viagemAtiva.id,
      ...novaDespesa,
      valor: parseFloat(novaDespesa.valor),
      url_foto: fotoSimulada,
    };
    setDespesas(prev => [...prev, desp]);
    setNovaDespesa({ tipo_gasto: "Combustível", estabelecimento: "", valor: "" });
    setFotoSimulada(null);
    setShowDespesaModal(false);
  };

  const finalizarViagem = () => {
    const updated = { ...viagemAtiva, data_hora_chegada: new Date().toISOString(), status: "Concluída" };
    setViagens(prev => prev.map(v => v.id === viagemAtiva.id ? updated : v));
    setViagemAtiva(null);
    setShowFinalizarModal(false);
    setView("menu");
  };

  const despesasDaViagem = viagemAtiva ? despesas.filter(d => d.viagem_id === viagemAtiva.id) : [];
  const totalDaViagem = despesasDaViagem.reduce((s, d) => s + d.valor, 0);

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFotoSimulada(ev.target.result); // base64 data URL
    reader.readAsDataURL(file);
  };

  // ── MENU ──
  if (view === "menu") return (
    <div className="min-h-screen bg-black flex flex-col px-5 pt-8 pb-6">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <ColorWheelLogo size={52} />
          <div>
            <p className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">Frota Liquid Colours</p>
            <h1 className="text-white text-3xl font-extrabold leading-tight">Área do<br />Motorista</h1>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setView("novaViagem")}
          className="w-full bg-yellow-400 text-black rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center"><Icon name="plus" cls="w-7 h-7" /></div>
          <div className="text-left">
            <p className="font-bold text-lg leading-tight">Nova Viagem</p>
            <p className="text-black/60 text-sm">Registrar saída agora</p>
          </div>
          <Icon name="arrow" cls="w-5 h-5 ml-auto" />
        </button>

        {emAndamento.length > 0 && (
          <button
            onClick={() => { setViagemAtiva(emAndamento[0]); setView("emAndamento"); }}
            className="w-full bg-white border-2 border-yellow-400 text-black rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center"><Icon name="truck" cls="w-7 h-7 text-black" /></div>
            <div className="text-left">
              <p className="font-bold text-lg leading-tight">Viagem em Andamento</p>
              <p className="text-gray-500 text-sm">{emAndamento[0].destino_cidade_uf}</p>
            </div>
            <span className="ml-auto bg-yellow-400 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{emAndamento.length}</span>
          </button>
        )}

        <button
          onClick={() => setView("historico")}
          className="w-full bg-white/10 border border-white/20 text-white rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Icon name="list" cls="w-7 h-7" /></div>
          <div className="text-left">
            <p className="font-bold text-lg leading-tight">Histórico</p>
            <p className="text-gray-400 text-sm">Suas viagens concluídas</p>
          </div>
          <Icon name="arrow" cls="w-5 h-5 ml-auto text-gray-400" />
        </button>
      </div>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-1">Viagens esse mês</p>
          <p className="text-white text-2xl font-extrabold">
            {viagens.filter(v => getMesNum(v.data_hora_saida) === getMesNum(new Date().toISOString())).length}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-1">Em andamento</p>
          <p className="text-yellow-400 text-2xl font-extrabold">{emAndamento.length}</p>
        </div>
      </div>
    </div>
  );

  // ── NOVA VIAGEM ──
  if (view === "novaViagem") return (
    <div className="min-h-screen bg-white">
      <div className="bg-black px-5 pt-10 pb-6">
        <button onClick={() => setView("menu")} className="text-yellow-400 text-sm flex items-center gap-1 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Voltar
        </button>
        <h2 className="text-white text-2xl font-extrabold">Nova Viagem</h2>
        <p className="text-gray-400 text-sm">A hora de saída será registrada automaticamente</p>
      </div>
      <div className="px-5 py-6 space-y-1">
        <Field label="Motorista *">
          <select className={selectCls} value={novaViagem.motorista} onChange={e => setNovaViagem(p => ({ ...p, motorista: e.target.value }))}>
            <option value="">Selecione...</option>
            {MOTORISTAS.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
          </select>
        </Field>
        <Field label="Veículo *">
          <select className={selectCls} value={novaViagem.veiculo} onChange={e => setNovaViagem(p => ({ ...p, veiculo: e.target.value }))}>
            <option value="">Selecione...</option>
            {VEICULOS.map(v => <option key={v.placa} value={v.placa}>{v.modelo} – {v.placa}</option>)}
          </select>
        </Field>
        <Field label="Passageiro (opcional)">
          <input className={inputCls} placeholder="Nome do passageiro" value={novaViagem.passageiro}
            onChange={e => setNovaViagem(p => ({ ...p, passageiro: e.target.value }))} />
        </Field>
        <Field label="Motivo da Viagem *">
          <input className={inputCls} placeholder="Ex: Entrega de materiais" value={novaViagem.motivo}
            onChange={e => setNovaViagem(p => ({ ...p, motivo: e.target.value }))} />
        </Field>
        <Field label="Destino (Cidade/UF) *">
          <input className={inputCls} placeholder="Ex: São Paulo/SP" value={novaViagem.destino_cidade_uf}
            onChange={e => setNovaViagem(p => ({ ...p, destino_cidade_uf: e.target.value }))} />
        </Field>
        <div className="pt-4">
          <button onClick={iniciarViagem}
            className="w-full bg-yellow-400 text-black font-bold py-4 rounded-2xl shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform text-base">
            🚀 Iniciar Viagem Agora
          </button>
        </div>
      </div>
    </div>
  );

  // ── EM ANDAMENTO ──
  if (view === "emAndamento" && viagemAtiva) return (
    <div className="min-h-screen bg-white">
      <div className="bg-black px-5 pt-10 pb-6">
        <button onClick={() => setView("menu")} className="text-yellow-400 text-sm flex items-center gap-1 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Menu
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">● AO VIVO</span>
        </div>
        <h2 className="text-white text-2xl font-extrabold leading-tight">{viagemAtiva.destino_cidade_uf}</h2>
        <p className="text-gray-400 text-sm mt-1">{viagemAtiva.motivo}</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Detalhes da viagem */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs">Motorista</p><p className="font-semibold text-gray-900">{viagemAtiva.motorista}</p></div>
            <div><p className="text-gray-400 text-xs">Veículo</p><p className="font-semibold text-gray-900">{viagemAtiva.veiculo}</p></div>
            <div><p className="text-gray-400 text-xs">Saída</p><p className="font-semibold text-gray-900">{fmtDate(viagemAtiva.data_hora_saida)}</p></div>
            <div><p className="text-gray-400 text-xs">Total gasto</p><p className="font-bold text-yellow-500">{fmt(totalDaViagem)}</p></div>
          </div>
        </div>

        {/* Despesas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Despesas ({despesasDaViagem.length})</h3>
            <span className="text-yellow-500 font-bold text-sm">{fmt(totalDaViagem)}</span>
          </div>

          {despesasDaViagem.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm border border-dashed border-gray-300">
              Nenhuma despesa registrada ainda
            </div>
          ) : (
            <div className="space-y-2">
              {despesasDaViagem.map(d => (
                <div key={d.id} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-200">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{d.tipo_gasto === "Combustível" ? "⛽" : d.tipo_gasto === "Pedágio" ? "🛣️" : d.tipo_gasto === "Alimentação" ? "🍽️" : "📦"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{d.estabelecimento}</p>
                    <p className="text-xs text-gray-400">{d.tipo_gasto}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.url_foto && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📎</span>}
                    <p className="font-bold text-gray-900">{fmt(d.valor)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-3 pt-2">
          <button onClick={() => setShowDespesaModal(true)}
            className="w-full bg-white border-2 border-black text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-gray-50">
            <Icon name="plus" cls="w-5 h-5" /> Adicionar Despesa
          </button>
          <button onClick={() => setShowFinalizarModal(true)}
            className="w-full bg-yellow-400 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform">
            <Icon name="flag" cls="w-5 h-5" /> Finalizar Viagem
          </button>
        </div>
      </div>

      {/* Modal Despesa */}
      {showDespesaModal && (
        <Modal title="Nova Despesa" onClose={() => setShowDespesaModal(false)}>
          <Field label="Tipo de Gasto">
            <select className={selectCls} value={novaDespesa.tipo_gasto}
              onChange={e => setNovaDespesa(p => ({ ...p, tipo_gasto: e.target.value }))}>
              {TIPOS_GASTO.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Estabelecimento *">
            <input className={inputCls} placeholder="Ex: Posto Shell Anhanguera"
              value={novaDespesa.estabelecimento}
              onChange={e => setNovaDespesa(p => ({ ...p, estabelecimento: e.target.value }))} />
          </Field>
          <Field label="Valor (R$) *">
            <input className={inputCls} type="number" step="0.01" placeholder="0,00"
              value={novaDespesa.valor}
              onChange={e => setNovaDespesa(p => ({ ...p, valor: e.target.value }))} />
          </Field>
          <Field label="Foto do Comprovante">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              {fotoSimulada ? (
                <img src={fotoSimulada} alt="preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <Icon name="camera" cls="w-8 h-8" />
                  <span className="text-xs">Toque para tirar/enviar foto</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
            </label>
          </Field>
          <button onClick={adicionarDespesa}
            className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-xl mt-2 active:scale-95 transition-transform">
            Salvar Despesa
          </button>
        </Modal>
      )}

      {/* Modal Finalizar */}
      {showFinalizarModal && (
        <Modal title="Finalizar Viagem" onClose={() => setShowFinalizarModal(false)}>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-400">
              <Icon name="flag" cls="w-8 h-8 text-black" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Concluir viagem para</h3>
            <p className="text-gray-600 font-medium">{viagemAtiva.destino_cidade_uf}</p>
            <p className="text-sm text-gray-400 mt-1">{despesasDaViagem.length} despesa(s) · {fmt(totalDaViagem)} total</p>
          </div>
          <div className="space-y-3 mt-2">
            <button onClick={finalizarViagem}
              className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-xl active:scale-95 transition-transform">
              ✓ Confirmar chegada agora
            </button>
            <button onClick={() => setShowFinalizarModal(false)}
              className="w-full border border-gray-300 text-gray-600 font-medium py-3.5 rounded-xl hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );

  // ── HISTÓRICO ──
  if (view === "historico") {
    const concluidas = viagens.filter(v => v.status === "Concluída");
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-black px-5 pt-10 pb-6">
          <button onClick={() => setView("menu")} className="text-yellow-400 text-sm flex items-center gap-1 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Menu
          </button>
          <h2 className="text-white text-2xl font-extrabold">Histórico</h2>
          <p className="text-gray-400 text-sm">{concluidas.length} viagens concluídas</p>
        </div>
        <div className="px-5 py-5 space-y-3">
          {concluidas.map(v => {
            const desp = despesas.filter(d => d.viagem_id === v.id);
            const total = desp.reduce((s, d) => s + d.valor, 0);
            return (
              <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{v.destino_cidade_uf}</p>
                    <p className="text-xs text-gray-400">{v.motivo}</p>
                  </div>
                  <Badge status={v.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-2 mt-2">
                  <span>{v.veiculo}</span>
                  <span className="font-bold text-gray-900">{fmt(total)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{fmtDate(v.data_hora_saida)}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

// ════════════════════════════════════════════════════════════════════
// DASHBOARD DO GESTOR
// ════════════════════════════════════════════════════════════════════
const Dashboard = ({ viagens, despesas }) => {
  const [tab, setTab] = useState("visao");
  const [filtroMes, setFiltroMes] = useState("todos");
  const printRef = useRef(null);

  // Gera lista de meses presentes
  const meses = useMemo(() => {
    const set = new Set(viagens.map(v => getMesNum(v.data_hora_saida)).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [viagens]);

  // Filtra viagens
  const viagensFiltradas = useMemo(() => {
    if (filtroMes === "todos") return viagens;
    return viagens.filter(v => getMesNum(v.data_hora_saida) === filtroMes);
  }, [viagens, filtroMes]);

  const idsViagens = new Set(viagensFiltradas.map(v => v.id));
  const despesasFiltradas = despesas.filter(d => idsViagens.has(d.viagem_id));

  // KPIs
  const totalGasto = despesasFiltradas.reduce((s, d) => s + d.valor, 0);
  const totalViagens = viagensFiltradas.length;
  const ticketMedio = totalViagens > 0 ? totalGasto / totalViagens : 0;

  // Gráfico: gastos por mês
  const gastosPorMes = useMemo(() => {
    const map = {};
    viagens.forEach(v => {
      const mes = getMes(v.data_hora_saida);
      if (!mes) return;
      if (!map[mes]) map[mes] = 0;
      const desp = despesas.filter(d => d.viagem_id === v.id);
      map[mes] += desp.reduce((s, d) => s + d.valor, 0);
    });
    return Object.entries(map).map(([mes, total]) => ({ mes, total: parseFloat(total.toFixed(2)) }));
  }, [viagens, despesas]);

  // Gráfico: gastos por motorista (filtrado)
  const gastosPorMotorista = useMemo(() => {
    const map = {};
    viagensFiltradas.forEach(v => {
      if (!map[v.motorista]) map[v.motorista] = 0;
      const desp = despesas.filter(d => d.viagem_id === v.id);
      map[v.motorista] += desp.reduce((s, d) => s + d.valor, 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  }, [viagensFiltradas, despesas]);

  // Gráfico: gastos por tipo (filtrado)
  const gastosPorTipo = useMemo(() => {
    const map = {};
    despesasFiltradas.forEach(d => {
      if (!map[d.tipo_gasto]) map[d.tipo_gasto] = 0;
      map[d.tipo_gasto] += d.valor;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  }, [despesasFiltradas]);

  const [exporting, setExporting] = useState(false);

  const handlePrint = () => {
    setExporting(true);

    const periodoLabel = filtroMes === "todos"
      ? "Todos os períodos"
      : new Date(filtroMes + "-01").toLocaleString("pt-BR", { month: "long", year: "numeric" });

    const concluidas  = viagensFiltradas.filter(v => v.status === "Concluída").length;
    const emAndamento = viagensFiltradas.filter(v => v.status === "Em andamento").length;

    const porTipo = {};
    despesasFiltradas.forEach(d => { porTipo[d.tipo_gasto] = (porTipo[d.tipo_gasto]||0) + d.valor; });

    const porMot = {};
    viagensFiltradas.forEach(v => {
      const t = despesas.filter(d => d.viagem_id === v.id).reduce((s,d)=>s+d.valor,0);
      porMot[v.motorista] = (porMot[v.motorista]||0) + t;
    });
    const rankMot = Object.entries(porMot).sort((a,b)=>b[1]-a[1]);

    const tipoMeta = {
      "Combustível": { cor:"#F97316", emoji:"⛽" },
      "Pedágio":     { cor:"#6366F1", emoji:"🛣️" },
      "Alimentação": { cor:"#10B981", emoji:"🍽️" },
      "Outros":      { cor:"#8B5CF6", emoji:"📦" },
    };
    const driverCols = ["#6366F1","#F97316","#10B981","#EAB308","#EF4444","#8B5CF6","#06B6D4","#EC4899","#84CC16"];

    // ── Linhas de viagens ─────────────────────────────────────────
    let viagensHTML = "";
    viagensFiltradas.forEach((v, idx) => {
      const desp  = despesas.filter(d => d.viagem_id === v.id);
      const total = desp.reduce((s,d)=>s+d.valor,0);
      const dc    = driverCols[MOTORISTAS.findIndex(m=>m.nome===v.motorista) % driverCols.length] || "#6366F1";
      const sBg   = v.status === "Concluída" ? "#d1fae5" : "#fef3c7";
      const sCol  = v.status === "Concluída" ? "#065f46" : "#92400e";

      let subDesp = "";
      desp.forEach(d => {
        const m = tipoMeta[d.tipo_gasto]||{cor:"#8B5CF6",emoji:"📦"};
        subDesp += `<tr style="background:#fafbff">
          <td style="padding:5px 8px 5px 24px;border-bottom:1px solid #f0f0f0;font-size:11px" colspan="2">
            <span style="background:${m.cor}22;color:${m.cor};border:1px solid ${m.cor}55;
              border-radius:99px;padding:2px 8px;font-weight:600;font-size:10px;margin-right:6px">
              ${m.emoji} ${d.tipo_gasto}
            </span>${d.estabelecimento}
            ${d.url_foto?`<span style="background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;
              border-radius:99px;padding:2px 8px;font-weight:700;font-size:10px;margin-left:6px">📎 Comprovante</span>`:""}
          </td>
          <td colspan="3" style="border-bottom:1px solid #f0f0f0"></td>
          <td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;
            font-weight:700;color:${m.cor};font-size:11px">${fmt(d.valor)}</td>
        </tr>`;
      });

      viagensHTML += `
        <tr style="background:${idx%2===0?"#fff":"#f8faff"};page-break-inside:avoid">
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">
            <div style="width:24px;height:24px;border-radius:50%;background:#eef2ff;color:#6366f1;
              font-weight:900;font-size:11px;display:inline-flex;align-items:center;justify-content:center">${idx+1}</div>
          </td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb">
            <div style="display:flex;align-items:center;gap:7px">
              <div style="width:28px;height:28px;border-radius:50%;background:${dc};color:#fff;
                font-weight:900;font-size:12px;display:inline-flex;align-items:center;
                justify-content:center;flex-shrink:0">${v.motorista.charAt(0)}</div>
              <strong style="color:#111;font-size:12px">${v.motorista}</strong>
            </div>
          </td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb">
            <div style="font-weight:600;color:#111;font-size:12px">${v.destino_cidade_uf}</div>
            <div style="color:#888;font-size:10px">${v.motivo}</div>
          </td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:11px">
            <div style="font-weight:600;color:#333">${v.veiculo}</div>
            <div style="font-family:monospace;color:#999;font-size:10px">${v.placa}</div>
          </td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#555">
            ${fmtDate(v.data_hora_saida)}
          </td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#555">
            ${v.data_hora_chegada ? fmtDate(v.data_hora_chegada) : "—"}
          </td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb">
            <span style="background:${sBg};color:${sCol};border-radius:99px;
              padding:3px 10px;font-size:10px;font-weight:700">${v.status}</span>
          </td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;
            font-weight:900;font-size:13px;color:#111">${fmt(total)}</td>
        </tr>
        ${subDesp}
        <tr><td colspan="8" style="height:3px;background:#f3f4f6"></td></tr>`;
    });

    // ── Comprovantes ──────────────────────────────────────────────
    const comFoto = despesasFiltradas.filter(d => d.url_foto);
    let fotosSection = "";
    if (comFoto.length > 0) {
      const grupos = {};
      comFoto.forEach(d => {
        const v = viagensFiltradas.find(v2=>v2.id===d.viagem_id);
        if (!v) return;
        if (!grupos[v.id]) grupos[v.id] = { viagem:v, desps:[] };
        grupos[v.id].desps.push(d);
      });

      let gruposHTML = "";
      Object.values(grupos).forEach(({ viagem:v, desps }) => {
        const dc2 = driverCols[MOTORISTAS.findIndex(m=>m.nome===v.motorista) % driverCols.length] || "#6366F1";
        let fotosGrid = desps.map(d => {
          const m = tipoMeta[d.tipo_gasto]||{cor:"#8B5CF6",emoji:"📦"};
          return `<div style="border-radius:12px;overflow:hidden;border:2px solid ${m.cor}44;
            box-shadow:0 2px 8px rgba(0,0,0,.08);page-break-inside:avoid">
            <div style="position:relative;line-height:0">
              <img src="${d.url_foto}" style="width:100%;height:140px;object-fit:cover;display:block"/>
              <div style="position:absolute;top:7px;left:7px;background:${m.cor};color:#fff;
                border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700">
                ${m.emoji} ${d.tipo_gasto}
              </div>
            </div>
            <div style="padding:10px 12px;background:#fff">
              <div style="font-weight:700;font-size:12px;color:#111;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${d.estabelecimento}
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:4px">
                <span style="font-size:10px;color:#888">${v.motorista}</span>
                <span style="font-weight:900;font-size:14px;color:${m.cor}">${fmt(d.valor)}</span>
              </div>
            </div>
          </div>`;
        }).join("");

        gruposHTML += `
          <div style="margin:16px 0 8px;padding:10px 14px;background:#f8faff;
            border-radius:10px;border-left:4px solid ${dc2};display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:50%;background:${dc2};color:#fff;
              font-weight:900;font-size:13px;display:inline-flex;align-items:center;
              justify-content:center;flex-shrink:0">${v.motorista.charAt(0)}</div>
            <div>
              <div style="font-weight:800;font-size:13px;color:#111">
                ${v.motorista} → ${v.destino_cidade_uf}
              </div>
              <div style="font-size:11px;color:#888">${v.veiculo} · ${fmtDate(v.data_hora_saida)}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:8px">
            ${fotosGrid}
          </div>`;
      });

      fotosSection = `
        <div style="page-break-before:always">
          <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;
            padding:18px 24px;border-radius:12px;margin-bottom:16px">
            <div style="font-size:15px;font-weight:900">📎 Comprovantes Anexados</div>
            <div style="font-size:11px;color:#a5b4fc;margin-top:2px">
              ${comFoto.length} comprovante(s) de despesas
            </div>
          </div>
          ${gruposHTML}
        </div>`;
    }

    // ── HTML final ────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Frota Liquid Colours — Relatório ${periodoLabel}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;font-size:12px}
  table{width:100%;border-collapse:collapse}
  @page{size:A4;margin:12mm}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .no-print{display:none!important}
  }
</style>
</head>
<body style="padding:16px">

<div class="no-print" style="position:fixed;top:12px;right:12px;z-index:999;
  display:flex;gap:8px;background:#fff;padding:8px;border-radius:12px;
  box-shadow:0 4px 20px rgba(0,0,0,.15)">
  <button onclick="window.print()" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
    color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;
    font-weight:700;cursor:pointer">⬇️ Baixar PDF</button>
  <button onclick="window.close()" style="background:#f3f4f6;color:#555;border:none;
    padding:10px 16px;border-radius:8px;font-size:13px;cursor:pointer">✕</button>
</div>

<!-- CABEÇALHO -->
<div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e40af 100%);
  border-radius:14px;padding:24px 28px;margin-bottom:20px;color:#fff;
  display:flex;justify-content:space-between;align-items:flex-start">
  <div>
    <div style="font-size:22px;font-weight:900">🎨 Frota Liquid Colours</div>
    <div style="font-size:13px;color:#a5b4fc;margin-top:4px">Relatório Executivo de Viagens e Despesas</div>
    <div style="font-size:11px;color:#818cf8;margin-top:6px">
      Período: ${periodoLabel} · Gerado em: ${new Date().toLocaleString("pt-BR")}
    </div>
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;color:#a5b4fc;text-transform:uppercase;letter-spacing:1px">Total</div>
    <div style="font-size:28px;font-weight:900;color:#facc15">${fmt(totalGasto)}</div>
    <div style="font-size:11px;color:#a5b4fc">${totalViagens} viagens · ${despesasFiltradas.length} despesas</div>
  </div>
</div>

<!-- KPIs -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
${[
  {label:"Total Gasto",  value:fmt(totalGasto), icon:"💰", g:"#f97316,#ef4444"},
  {label:"Viagens",      value:totalViagens,     icon:"🚗", g:"#6366f1,#8b5cf6"},
  {label:"Concluídas",   value:concluidas,        icon:"✅", g:"#10b981,#059669"},
  {label:"Em andamento", value:emAndamento,       icon:"⏱️", g:"#eab308,#f97316"},
].map(k=>`
  <div style="background:linear-gradient(135deg,${k.g});border-radius:12px;
    padding:14px 16px;color:#fff;overflow:hidden;position:relative">
    <div style="position:absolute;top:-10px;right:-10px;width:50px;height:50px;
      border-radius:50%;background:rgba(255,255,255,.12)"></div>
    <div style="font-size:20px;margin-bottom:4px">${k.icon}</div>
    <div style="font-size:20px;font-weight:900">${k.value}</div>
    <div style="font-size:10px;opacity:.8;font-weight:600;text-transform:uppercase;
      letter-spacing:.5px;margin-top:2px">${k.label}</div>
  </div>`).join("")}
</div>

<!-- ANÁLISES -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px">
  <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <div style="width:4px;height:20px;background:linear-gradient(#f97316,#8b5cf6);border-radius:2px"></div>
      <strong style="font-size:13px">Despesas por Categoria</strong>
    </div>
    ${TIPOS_GASTO.map(tipo => {
      const val = porTipo[tipo]||0;
      const pct = totalGasto>0?(val/totalGasto*100).toFixed(1):"0.0";
      const m   = tipoMeta[tipo]||{cor:"#8B5CF6",emoji:"📦"};
      return `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:11px;font-weight:600">${m.emoji} ${tipo}</span>
          <span style="font-size:11px;font-weight:700;color:${m.cor}">${fmt(val)} <span style="color:#aaa;font-weight:400">(${pct}%)</span></span>
        </div>
        <div style="background:#f1f5f9;border-radius:4px;height:7px">
          <div style="background:${m.cor};width:${pct}%;height:7px;border-radius:4px"></div>
        </div>
      </div>`;}).join("")}
  </div>
  <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <div style="width:4px;height:20px;background:linear-gradient(#6366f1,#06b6d4);border-radius:2px"></div>
      <strong style="font-size:13px">Ranking por Motorista</strong>
    </div>
    ${rankMot.slice(0,6).map(([nome,val],i)=>{
      const cor = driverCols[i%driverCols.length];
      const pct = (val/(rankMot[0]?.[1]||1)*100).toFixed(1);
      return `<div style="margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:18px;height:18px;border-radius:50%;background:${cor};color:#fff;
              font-size:9px;font-weight:900;display:inline-flex;align-items:center;
              justify-content:center">${i+1}</div>
            <span style="font-size:11px;font-weight:600">${nome}</span>
          </div>
          <span style="font-size:11px;font-weight:700;color:${cor}">${fmt(val)}</span>
        </div>
        <div style="background:#f1f5f9;border-radius:4px;height:7px">
          <div style="background:${cor};width:${pct}%;height:7px;border-radius:4px"></div>
        </div>
      </div>`;}).join("")}
  </div>
</div>

<!-- TABELA -->
<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px">
  <div style="background:linear-gradient(90deg,#1e1b4b,#312e81);padding:14px 16px">
    <strong style="font-size:14px;color:#fff">Detalhamento de Viagens</strong>
    <div style="font-size:10px;color:#a5b4fc;margin-top:2px">${viagensFiltradas.length} viagem(ns)</div>
  </div>
  <table>
    <thead>
      <tr style="background:#f8faff;border-bottom:2px solid #e5e7eb">
        ${["#","Motorista","Destino / Motivo","Veículo","Saída","Chegada","Status","Total"].map(h=>
          `<th style="padding:9px 8px;color:#64748b;font-size:10px;text-transform:uppercase;
            text-align:${h==="Total"?"right":"left"}">${h}</th>`).join("")}
      </tr>
    </thead>
    <tbody>${viagensHTML}</tbody>
    <tfoot>
      <tr style="background:linear-gradient(90deg,#1e1b4b,#312e81)">
        <td colspan="7" style="padding:12px 16px;text-align:right;color:#a5b4fc;
          font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:.5px">
          Total Geral do Período
        </td>
        <td style="padding:12px 16px;text-align:right;font-weight:900;
          font-size:16px;color:#facc15">${fmt(totalGasto)}</td>
      </tr>
    </tfoot>
  </table>
</div>

${fotosSection}

<!-- RODAPÉ -->
<div style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px;
  display:flex;justify-content:space-between;font-size:10px;color:#888">
  <span>🎨 <strong>Frota Liquid Colours</strong> · Documento confidencial · uso interno</span>
  <span>Gerado em ${new Date().toLocaleString("pt-BR")}</span>
</div>

<script>
  window.addEventListener('load', function() {
    setTimeout(function(){ window.print(); }, 600);
  });
<\/script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("⚠️ Permita pop-ups nesta página e tente novamente.\n\nNo Chrome: clique no ícone de pop-up bloqueado na barra de endereços.");
      setExporting(false);
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setExporting(false);
  };


      const PW = 210; // largura A4
      const PH = 297; // altura A4
      const ML = 12, MR = 12, MT = 12;
      const CW = PW - ML - MR; // largura útil
      let y = MT;

      const periodoLabel = filtroMes === "todos"
        ? "Todos os períodos"
        : new Date(filtroMes + "-01").toLocaleString("pt-BR", { month: "long", year: "numeric" });


  const tabCls = (t) =>
    `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t
      ? "bg-yellow-400 text-black shadow-md"
      : "text-gray-500 hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <ColorWheelLogo size={36} />
          <div>
            <h1 className="text-xl font-extrabold text-white">Dashboard de Gestão</h1>
            <p className="text-xs text-gray-400">Frota Liquid Colours · Controle de Frota e Despesas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl">
          <button onClick={() => setTab("visao")} className={tabCls("visao")}>
            <span className="hidden sm:inline">📊 </span>Visão Geral
          </button>
          <button onClick={() => setTab("relatorio")} className={tabCls("relatorio")}>
            <span className="hidden sm:inline">📋 </span>Relatório
          </button>
        </div>
      </div>

      {/* Filtro de mês */}
      <div className="px-6 pt-5 print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm font-semibold text-gray-600">Período:</p>
          <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
            <option value="todos">Todos os períodos</option>
            {meses.map(m => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleString("pt-BR", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── VISÃO GERAL ── */}
      {tab === "visao" && (
        <div className="px-6 py-5 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon="wallet" label="Total Gasto"   value={fmt(totalGasto)}   sub="período selecionado" color="yellow" />
            <StatCard icon="truck"  label="Viagens"       value={totalViagens}       sub="no período"          color="dark"   />
            <StatCard icon="chart"  label="Ticket Médio"  value={fmt(ticketMedio)}   sub="por viagem"          color="white"  />
          </div>

          {/* Gastos por mês */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Gastos por Mês</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gastosPorMes} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="total" name="Total" fill="#EAB308" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dois gráficos lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Por motorista */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Gastos por Motorista</h3>
              {gastosPorMotorista.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={gastosPorMotorista} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="value" name="Total" fill="#1a1a1a" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Por tipo */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Gastos por Tipo</h3>
              {gastosPorTipo.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={gastosPorTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} paddingAngle={3}>
                      {gastosPorTipo.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                    <Legend formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top viagens */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Viagens Recentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Motorista</th>
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Destino</th>
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Veículo</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</th>
                    <th className="text-center py-2 px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider w-36">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viagensFiltradas.slice(0, 6).map(v => {
                    const total = despesas.filter(d => d.viagem_id === v.id).reduce((s, d) => s + d.valor, 0);
                    return (
                      <tr key={v.id} className="border-b border-gray-100 hover:bg-yellow-50 transition-colors">
                        <td className="py-3 px-3 font-medium text-gray-900">{v.motorista}</td>
                        <td className="py-3 px-3 text-gray-600">{v.destino_cidade_uf}</td>
                        <td className="py-3 px-3 text-gray-500 text-xs">{v.veiculo}</td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900">{fmt(total)}</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap w-36"><Badge status={v.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── RELATÓRIO PROFISSIONAL ── */}
      {tab === "relatorio" && (() => {
        // ── dados extras para o relatório ──
        const tipoConfig = {
          "Combustível": { cor: "#F97316", bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600", emoji: "⛽" },
          "Pedágio":     { cor: "#6366F1", bg: "bg-indigo-500", light: "bg-indigo-50",  text: "text-indigo-600", emoji: "🛣️" },
          "Alimentação": { cor: "#10B981", bg: "bg-emerald-500",light: "bg-emerald-50", text: "text-emerald-600",emoji: "🍽️" },
          "Outros":      { cor: "#8B5CF6", bg: "bg-violet-500", light: "bg-violet-50",  text: "text-violet-600", emoji: "📦" },
        };
        const porTipo = {};
        despesasFiltradas.forEach(d => { porTipo[d.tipo_gasto] = (porTipo[d.tipo_gasto] || 0) + d.valor; });
        const maxTipo = Math.max(...Object.values(porTipo), 1);

        const porMotorista = {};
        viagensFiltradas.forEach(v => {
          const t = despesas.filter(d => d.viagem_id === v.id).reduce((s, d) => s + d.valor, 0);
          porMotorista[v.motorista] = (porMotorista[v.motorista] || 0) + t;
        });
        const rankMotoristas = Object.entries(porMotorista).sort((a, b) => b[1] - a[1]);
        const maxMotorista = rankMotoristas[0]?.[1] || 1;

        const concluidas = viagensFiltradas.filter(v => v.status === "Concluída").length;
        const andamento  = viagensFiltradas.filter(v => v.status === "Em andamento").length;
        const periodoLabel = filtroMes === "todos" ? "Todos os períodos"
          : new Date(filtroMes + "-01").toLocaleString("pt-BR", { month: "long", year: "numeric" });

        const DRIVER_COLORS = ["#6366F1","#F97316","#10B981","#EAB308","#EF4444","#8B5CF6","#06B6D4","#EC4899","#84CC16"];

        return (
        <div className="py-4">
          {/* ── Barra de ação ── */}
          <div className="flex items-center justify-between mb-6 px-6 print:hidden">
            <div>
              <h2 className="font-black text-gray-900 text-xl">Relatório Executivo</h2>
              <p className="text-sm text-gray-400">{periodoLabel} · gerado em {new Date().toLocaleDateString("pt-BR")}</p>
            </div>
            <button onClick={handlePrint} disabled={exporting}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-300/40 hover:opacity-90 transition-opacity text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {exporting
                ? <><span className="animate-spin-btn">⏳</span> Gerando PDF...</>
                : <><Icon name="download" cls="w-4 h-4" /> Exportar PDF</>
              }
            </button>
          </div>

          <div ref={printRef} className="print-area space-y-6 px-6">

            {/* ══ CABEÇALHO DO DOCUMENTO (visível sempre) ══ */}
            <div style={{background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#1e40af 70%,#0f172a 100%)"}}
              className="rounded-2xl p-6 text-white relative overflow-hidden">
              {/* Círculos decorativos */}
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{background:"#818cf8"}} />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10" style={{background:"#38bdf8"}} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <ColorWheelLogo size={44} />
                    <div>
                      <p className="text-indigo-200 text-xs font-bold tracking-widest uppercase">Frota Liquid Colours</p>
                      <h1 className="text-2xl font-black leading-tight">Relatório Executivo</h1>
                    </div>
                  </div>
                  <p className="text-indigo-200 text-sm">Controle de Viagens e Despesas · {periodoLabel}</p>
                  <p className="text-indigo-300 text-xs mt-1">Gerado em {new Date().toLocaleString("pt-BR")}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-indigo-200 text-xs uppercase tracking-wider">Total do período</p>
                  <p className="text-3xl font-black text-yellow-400">{fmt(totalGasto)}</p>
                  <p className="text-indigo-200 text-xs">{totalViagens} viagens · {despesasFiltradas.length} despesas</p>
                </div>
              </div>
            </div>

            {/* ══ KPI CARDS ══ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label:"Total Gasto",    value: fmt(totalGasto),             icon:"💰", from:"#F97316", to:"#EF4444" },
                { label:"Viagens",        value: totalViagens,                icon:"🚗", from:"#6366F1", to:"#8B5CF6" },
                { label:"Concluídas",     value: concluidas,                  icon:"✅", from:"#10B981", to:"#059669" },
                { label:"Em andamento",   value: andamento,                   icon:"⏱️", from:"#EAB308", to:"#F97316" },
              ].map((k,i) => (
                <div key={i} className="rounded-2xl p-4 text-white relative overflow-hidden shadow-md"
                  style={{background:`linear-gradient(135deg,${k.from},${k.to})`}}>
                  <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
                  <p className="text-2xl mb-1">{k.icon}</p>
                  <p className="text-xl font-black leading-none">{k.value}</p>
                  <p className="text-white/70 text-xs mt-1 font-medium">{k.label}</p>
                </div>
              ))}
            </div>

            {/* ══ BREAKDOWN POR TIPO ══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Categorias de despesa */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-black text-gray-800 text-base mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-500 to-purple-500 inline-block"></span>
                  Despesas por Categoria
                </h3>
                <div className="space-y-3">
                  {TIPOS_GASTO.map(tipo => {
                    const val  = porTipo[tipo] || 0;
                    const pct  = totalGasto > 0 ? (val / totalGasto) * 100 : 0;
                    const cfg  = tipoConfig[tipo];
                    return (
                      <div key={tipo}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <span>{cfg.emoji}</span>{tipo}
                          </span>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${cfg.text}`}>{fmt(val)}</span>
                            <span className="text-xs text-gray-400 ml-1">({pct.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cfg.bg} transition-all`}
                            style={{width:`${pct}%`}} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ranking de motoristas */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-black text-gray-800 text-base mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-500 inline-block"></span>
                  Ranking por Motorista
                </h3>
                <div className="space-y-3">
                  {rankMotoristas.slice(0,6).map(([nome, val], i) => {
                    const pct = (val / maxMotorista) * 100;
                    const cor = DRIVER_COLORS[i % DRIVER_COLORS.length];
                    return (
                      <div key={nome}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                              style={{background: cor}}>
                              {i+1}
                            </span>
                            {nome}
                          </span>
                          <span className="text-sm font-bold text-gray-800">{fmt(val)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{width:`${pct}%`, background: cor}} />
                        </div>
                      </div>
                    );
                  })}
                  {rankMotoristas.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">Nenhum dado no período</p>
                  )}
                </div>
              </div>
            </div>

            {/* ══ TABELA PRINCIPAL DE VIAGENS ══ */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2"
                style={{background:"linear-gradient(90deg,#f8fafc,#f1f5f9)"}}>
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-blue-400 inline-block"></span>
                <h3 className="font-black text-gray-800 text-base">Detalhamento de Viagens</h3>
                <span className="ml-auto text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                  {viagensFiltradas.length} viagens
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{background:"linear-gradient(90deg,#1e1b4b,#312e81)"}}>
                      {["#","Motorista","Destino","Veículo","Saída","Chegada","Status","Total"].map((h,i) => (
                        <th key={i} className={`py-3 px-3 text-xs font-bold text-indigo-200 uppercase tracking-wider ${i === 7 ? "text-right" : i === 6 ? "text-center" : "text-left"}`}
                          style={i === 6 ? {minWidth:"130px"} : i === 7 ? {minWidth:"80px"} : {}}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {viagensFiltradas.map((v, idx) => {
                      const desp = despesas.filter(d => d.viagem_id === v.id);
                      const total = desp.reduce((s, d) => s + d.valor, 0);
                      const isEven = idx % 2 === 0;
                      return (
                        <>
                          {/* Linha da viagem */}
                          <tr key={v.id} className={`border-b border-gray-100 hover:bg-indigo-50/40 transition-colors ${isEven ? "bg-white" : "bg-slate-50/60"}`}>
                            <td className="py-3 px-3 text-center">
                              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mx-auto">{idx+1}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                  style={{background: DRIVER_COLORS[MOTORISTAS.findIndex(m=>m.nome===v.motorista) % DRIVER_COLORS.length] || "#6366F1"}}>
                                  {v.motorista.charAt(0)}
                                </div>
                                <span className="font-semibold text-gray-800">{v.motorista}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-gray-800">{v.destino_cidade_uf}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[120px]">{v.motivo}</p>
                            </td>
                            <td className="py-3 px-3 text-xs text-gray-500">
                              <p className="font-medium text-gray-700">{v.veiculo}</p>
                              <p className="font-mono text-gray-400">{v.placa}</p>
                            </td>
                            <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(v.data_hora_saida)}</td>
                            <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(v.data_hora_chegada)}</td>
                            <td className="py-3 px-3 text-center whitespace-nowrap" style={{minWidth:"130px"}}><Badge status={v.status} /></td>
                            <td className="py-3 px-3 text-right">
                              <span className="font-black text-gray-900 text-sm">{fmt(total)}</span>
                            </td>
                          </tr>
                          {/* Sub-linhas de despesas */}
                          {desp.map(d => {
                            const cfg = tipoConfig[d.tipo_gasto] || tipoConfig["Outros"];
                            return (
                              <tr key={`d-${d.id}`} className="border-b border-gray-50" style={{background:"#fafbff"}}>
                                <td className="py-2 px-3" />
                                <td className="py-2 px-3 pl-6" colSpan={2}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.light} ${cfg.text} border`}
                                      style={{borderColor: cfg.cor + "40"}}>
                                      {cfg.emoji} {d.tipo_gasto}
                                    </span>
                                    <span className="text-xs text-gray-500">{d.estabelecimento}</span>
                                    {d.url_foto && (
                                      <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-semibold">📎 comprovante</span>
                                    )}
                                  </div>
                                </td>
                                <td colSpan={3} />
                                <td className="py-2 px-3 text-center" />
                                <td className="py-2 px-3 text-right">
                                  <span className={`text-xs font-bold ${cfg.text}`}>{fmt(d.valor)}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{background:"linear-gradient(90deg,#1e1b4b,#312e81)"}}>
                      <td colSpan={7} className="py-4 px-3 text-right font-black text-indigo-200 text-sm uppercase tracking-widest">
                        Total Geral do Período
                      </td>
                      <td className="py-4 px-3 text-right font-black text-yellow-400 text-lg">
                        {fmt(totalGasto)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ══ GALERIA DE COMPROVANTES ══ */}
            {(() => {
              const despesasComFoto = despesasFiltradas.filter(d => d.url_foto);
              if (despesasComFoto.length === 0) return null;

              // Agrupa comprovantes por viagem
              const porViagem = {};
              despesasComFoto.forEach(d => {
                const v = viagensFiltradas.find(v => v.id === d.viagem_id);
                if (!v) return;
                if (!porViagem[v.id]) porViagem[v.id] = { viagem: v, despesas: [] };
                porViagem[v.id].despesas.push(d);
              });

              const tipoConfig2 = {
                "Combustível": { cor: "#F97316", emoji: "⛽" },
                "Pedágio":     { cor: "#6366F1", emoji: "🛣️" },
                "Alimentação": { cor: "#10B981", emoji: "🍽️" },
                "Outros":      { cor: "#8B5CF6", emoji: "📦" },
              };

              return (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2"
                    style={{background:"linear-gradient(90deg,#f8fafc,#f1f5f9)"}}>
                    <span className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400 inline-block"></span>
                    <h3 className="font-black text-gray-800 text-base">Comprovantes Anexados</h3>
                    <span className="ml-auto text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                      {despesasComFoto.length} foto{despesasComFoto.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="p-5 space-y-8">
                    {Object.values(porViagem).map(({ viagem: v, despesas: desps }) => (
                      <div key={v.id}>
                        {/* Header da viagem */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                            style={{background: DRIVER_COLORS[MOTORISTAS.findIndex(m=>m.nome===v.motorista) % DRIVER_COLORS.length] || "#6366F1"}}>
                            {v.motorista.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-sm">{v.motorista} → {v.destino_cidade_uf}</p>
                            <p className="text-xs text-gray-400">{v.veiculo} · {fmtDate(v.data_hora_saida)}</p>
                          </div>
                          <span className="ml-auto text-xs text-gray-400">{desps.length} comprovante{desps.length > 1 ? "s" : ""}</span>
                        </div>

                        {/* Grid de fotos */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {desps.map(d => {
                            const cfg = tipoConfig2[d.tipo_gasto] || tipoConfig2["Outros"];
                            return (
                              <div key={d.id} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                {/* Foto */}
                                <div className="relative bg-gray-100" style={{aspectRatio:"4/3"}}>
                                  <img
                                    src={d.url_foto}
                                    alt={`Comprovante - ${d.estabelecimento}`}
                                    className="w-full h-full object-cover"
                                    style={{display:"block"}}
                                  />
                                  {/* Badge de tipo sobre a foto */}
                                  <div className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow"
                                    style={{background: cfg.cor}}>
                                    {cfg.emoji} {d.tipo_gasto}
                                  </div>
                                </div>
                                {/* Info abaixo da foto */}
                                <div className="p-2.5 bg-white">
                                  <p className="text-xs font-bold text-gray-800 truncate">{d.estabelecimento}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-400">{v.motorista}</p>
                                    <p className="text-sm font-black" style={{color: cfg.cor}}>{fmt(d.valor)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ══ FOOTER DO DOCUMENTO ══ */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-1.5 w-full" style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f97316,#eab308,#10b981,#06b6d4)"}} />
              <div className="px-5 py-4 bg-white flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <ColorWheelLogo size={28} />
                  <div>
                    <p className="text-xs font-black text-gray-700">Frota Liquid Colours</p>
                    <p className="text-xs text-gray-400">Documento confidencial · uso interno</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>📅 {new Date().toLocaleDateString("pt-BR")}</span>
                  <span>📊 {totalViagens} viagens · {despesasFiltradas.length} despesas</span>
                  <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold">v1.0</span>
                </div>
              </div>
            </div>

          </div>{/* /print-area */}
        </div>
        );
      })()}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// COLOR WHEEL LOGO — replica fiel da imagem enviada
// ════════════════════════════════════════════════════════════════════
const ColorWheelLogo = ({ size = 40 }) => {
  // 12 segmentos, cada um com 30° de arco. Raio externo e interno.
  // Cores no sentido horário a partir do topo: verde-claro, verde-lima,
  // amarelo-lima, amarelo, laranja, laranja-vermelho, vermelho, rosa-vermelho,
  // rosa, violeta, roxo, azul-violeta, azul, azul-escuro, azul-ciano, ciano,
  // verde-teal, verde. Usamos 12 fatias para fidelidade máxima.
  const cx = size / 2, cy = size / 2;
  const R = size / 2 - 1;   // raio externo
  const r = size * 0.31;     // raio interno (buraco central)
  const gap = 2.5;           // espaço em graus entre fatias

  const segments = [
    { startDeg: -90,  color: "#5dc832" }, // verde
    { startDeg: -60,  color: "#8ed019" }, // verde-lima
    { startDeg: -30,  color: "#c8d919" }, // lima-amarelo
    { startDeg:   0,  color: "#f5d800" }, // amarelo
    { startDeg:  30,  color: "#f5a623" }, // laranja
    { startDeg:  60,  color: "#f07a10" }, // laranja-quente
    { startDeg:  90,  color: "#e84b20" }, // laranja-vermelho
    { startDeg: 120,  color: "#d93030" }, // vermelho
    { startDeg: 150,  color: "#cc1f5f" }, // rosa-vermelho
    { startDeg: 180,  color: "#c0218c" }, // pink
    { startDeg: 210,  color: "#8b22b5" }, // violeta
    { startDeg: 240,  color: "#4b2fbb" }, // roxo-azul
    { startDeg: 270,  color: "#2655c8" }, // azul-médio
    { startDeg: 300,  color: "#1a7ac0" }, // azul-ciano
    { startDeg: 330,  color: "#178db0" }, // ciano
  ];
  // 15 segmentos de 24° cada
  const arcDeg = 360 / segments.length;

  const polarToXY = (deg, radius) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const makeArc = (startDeg, arcD) => {
    const s = startDeg + gap / 2;
    const e = startDeg + arcD - gap / 2;
    const p1 = polarToXY(s, R);
    const p2 = polarToXY(e, R);
    const p3 = polarToXY(e, r);
    const p4 = polarToXY(s, r);
    const largeArc = arcD - gap > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r} ${r} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {/* fundo claro circular */}
      <circle cx={cx} cy={cy} r={R} fill="#e8e8e8" />
      {segments.map((seg, i) => (
        <path key={i} d={makeArc(seg.startDeg, arcDeg)} fill={seg.color} />
      ))}
      {/* buraco branco central */}
      <circle cx={cx} cy={cy} r={r} fill="white" />
    </svg>
  );
};

// ════════════════════════════════════════════════════════════════════
// VERSÃO DO SCHEMA — altere para forçar reset do localStorage
// ════════════════════════════════════════════════════════════════════
const SCHEMA_VERSION = "v3"; // ← foto agora persiste em base64

(function checkSchema() {
  try {
    if (localStorage.getItem("flc_schema") !== SCHEMA_VERSION) {
      localStorage.removeItem("flc_viagens");
      localStorage.removeItem("flc_despesas");
      localStorage.setItem("flc_schema", SCHEMA_VERSION);
    }
  } catch {}
})();

// ════════════════════════════════════════════════════════════════════
// HOOK — persistência automática no localStorage
// ════════════════════════════════════════════════════════════════════
function usePersistedState(key, fallback) {
  const [state, setStateRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });

  const setState = useCallback((valueOrFn) => {
    setStateRaw(prev => {
      const next = typeof valueOrFn === "function" ? valueOrFn(prev) : valueOrFn;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  return [state, setState];
}

// ════════════════════════════════════════════════════════════════════
// TOAST de confirmação de salvamento
// ════════════════════════════════════════════════════════════════════
const SaveToast = ({ show }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-xl border border-yellow-400/30 transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
    <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    Salvo automaticamente
  </div>
);

// ════════════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════════════
export default function App() {
  const [area, setArea] = useState("motorista");
  const [goHome, setGoHome] = useState(0); // incrementar força AreaMotorista a voltar ao menu

  // ── Estado persistido ──────────────────────────────────────────
  const [viagens, setViagensRaw]   = usePersistedState("flc_viagens",  INITIAL_VIAGENS);
  const [despesas, setDespesasRaw] = usePersistedState("flc_despesas", INITIAL_DESPESAS);

  // ── Toast de salvamento ────────────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  const showToast = useCallback(() => {
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  // Wrappers que disparam o toast após salvar
  const setViagens = useCallback((v) => { setViagensRaw(v);  showToast(); }, [setViagensRaw,  showToast]);
  const setDespesas= useCallback((v) => { setDespesasRaw(v); showToast(); }, [setDespesasRaw, showToast]);

  // ── Reset de dados (volta ao mock original) ────────────────────
  const [showReset, setShowReset] = useState(false);
  const handleReset = () => {
    setViagensRaw(INITIAL_VIAGENS);
    setDespesasRaw(INITIAL_DESPESAS);
    setShowReset(false);
    showToast();
  };

  return (
    <>
      {/* Estilos globais */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
          .hidden.print\\:block { display: block !important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .logo-spin { transition: transform 0.3s ease; cursor: pointer; }
        .logo-spin:hover { animation: spinSlow 3s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin-btn { animation: spin 0.8s linear infinite; display:inline-block; }
      `}</style>

      <div className="max-w-5xl mx-auto min-h-screen flex flex-col bg-gray-50">

        {/* ── Nav bar ── */}
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2.5 flex items-center justify-between print:hidden shadow-sm">

          {/* Logo + nome — clique volta ao menu inicial */}
          <button
            onClick={() => { setArea("motorista"); setGoHome(h => h + 1); }}
            className="flex items-center gap-3 hover:opacity-80 active:scale-95 transition-all"
          >
            <div className="logo-spin flex-shrink-0" style={{width:40,height:40}}>
              <ColorWheelLogo size={40} />
            </div>
            <div className="hidden sm:flex flex-col leading-none gap-0.5">
              <span className="font-black text-sm tracking-tight text-gray-800">
                Frota{" "}
                <span style={{background:"linear-gradient(90deg,#4ade80,#facc15,#f97316,#ef4444,#ec4899,#8b5cf6,#3b82f6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                  Liquid Colours
                </span>
              </span>
              <span className="text-gray-400 text-[10px] tracking-widest uppercase font-medium">Fleet Control</span>
            </div>
          </button>

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button onClick={() => setArea("motorista")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${area === "motorista" ? "bg-white shadow text-orange-500" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon name="truck" cls="w-4 h-4" /><span>Motorista</span>
            </button>
            <button onClick={() => setArea("gestor")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${area === "gestor" ? "bg-white shadow text-orange-500" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon name="chart" cls="w-4 h-4" /><span>Gestão</span>
            </button>
          </div>

          {/* Indicador de armazenamento + reset */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
              Auto-salvo
            </div>
            <button onClick={() => setShowReset(true)}
              title="Redefinir dados"
              className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </nav>

        {/* ── Conteúdo ── */}
        <main className="flex-1">
          {area === "motorista" ? (
            <AreaMotorista
              viagens={viagens}   setViagens={setViagens}
              despesas={despesas} setDespesas={setDespesas}
              goHome={goHome}
            />
          ) : (
            <Dashboard viagens={viagens} despesas={despesas} />
          )}
        </main>
      </div>

      {/* ── Toast ── */}
      <SaveToast show={toastVisible} />

      {/* ── Modal de reset ── */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-gray-200">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-400">
              <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Redefinir todos os dados?</h3>
            <p className="text-sm text-gray-500 mb-6">Isso apagará todos os registros salvos e voltará aos dados de demonstração. Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(false)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleReset}
                className="flex-1 bg-black text-yellow-400 font-semibold py-3 rounded-xl hover:bg-gray-900 transition-colors">
                Sim, redefinir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
