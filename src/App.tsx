import React, { useState } from 'react';
import { Trash2, Plus, X, ChevronDown, Calendar, Search, ArrowLeft, BarChart2, History, Trophy, Radio, Check } from 'lucide-react';

// --- CONFIGURAZIONE CATEGORIE STATISTICHE ---
const STAT_CATEGORIES = [
  { id: 'goals', label: 'Gol', lines: [0.5, 1.5, 2.5, 3.5, 4.5] },
  { id: 'corners', label: 'Corner', lines: [7.5, 8.5, 9.5, 10.5, 11.5, 12.5] },
  { id: 'yellow_cards', label: 'Cartellini', lines: [2.5, 3.5, 4.5, 5.5] },
  { id: 'shots', label: 'Tiri Totali', lines: [18.5, 19.5, 20.5, 21.5, 22.5] },
  { id: 'fouls', label: 'Falli', lines: [20.5, 21.5, 22.5, 23.5, 24.5] },
];

// --- DATI SIMULATI ---
const leaguesData = [
  {
    name: "SERIE A",
    matches: [
      { 
        id: 501, teams: "Inter - Milan", time: "20:45", status: "LIVE", minute: "'82", score: "1-0",
        stats: { goals: [1, 0], corners: [7, 4], yellow_cards: [2, 3], shots: [12, 8], fouls: [10, 12] } 
      },
      { 
        id: 502, teams: "Napoli - Juventus", time: "18:00", status: "NS", minute: "-", score: "0-0",
        stats: null 
      },
    ]
  },
  {
    name: "PREMIER LEAGUE",
    matches: [
      { id: 504, teams: "Arsenal - Liverpool", time: "16:00", status: "FT", minute: "FIN", score: "2-2",
         stats: { goals: [2, 2], corners: [5, 5], yellow_cards: [1, 1], shots: [15, 14], fouls: [8, 9] }
      },
    ]
  }
];

const initialTickets = [
  {
    id: 1,
    name: "Multipla Sabato",
    matches: [
      {
        id: 101, teams: "Inter - Milan", score: "1-0", minute: "'82",
        stats: [{ label: "Over 8.5 Corner (Totale)", current: 11, target: 9, status: "won" }]
      }
    ]
  }
];

export default function App() {
  // --- STATI ---
  const [activeTab, setActiveTab] = useState("tutte");
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  const [tickets, setTickets] = useState(initialTickets);
  
  // Stato per l'espansione Inline (quale riga è aperta?)
  const [expandedStatId, setExpandedStatId] = useState(null); // es: 'corners'
  const [activeContext, setActiveContext] = useState({ side: 'Totale', val: 0 }); // es: side='Casa', val=7

  // --- NAVIGAZIONE ---
  const openMatchDetail = (match) => setSelectedMatchDetail(match);
  const closeMatchDetail = () => { setSelectedMatchDetail(null); setExpandedStatId(null); };

  // --- GESTIONE ESPANSIONE ---
  const toggleStatExpand = (statId, side, val) => {
    if (expandedStatId === statId && activeContext.side === side) {
        setExpandedStatId(null); // Chiudi se clicco lo stesso
    } else {
        setActiveContext({ side, val });
        setExpandedStatId(statId); // Apri
    }
  };

  // --- LOGICA AGGIUNTA TICKET ---
  const handleInlineAdd = (statLabel, type, line, ticketName) => {
    // Es: "Corner Casa - Over 8.5"
    const fullBetLabel = `${statLabel} (${activeContext.side}) ${type} ${line}`;
    const targetNumber = parseFloat(line);

    let updatedTickets = [...tickets];
    const existingTicketIndex = updatedTickets.findIndex(t => t.name === ticketName);

    // Valore corrente per la barra (se sto scommettendo su Casa prendo solo Casa, altrimenti Totale)
    let currentVal = 0;
    // (Qui semplifichiamo: nel mondo reale prenderemmo il dato esatto dall'oggetto stats)
    
    const newMatchEntry = {
      id: Date.now(),
      teams: selectedMatchDetail.teams,
      score: selectedMatchDetail.score,
      minute: selectedMatchDetail.minute !== '-' ? selectedMatchDetail.minute : selectedMatchDetail.time,
      stats: [{ label: fullBetLabel, current: activeContext.val, target: Math.ceil(targetNumber), status: "pending" }]
    };

    if (existingTicketIndex >= 0) {
      updatedTickets[existingTicketIndex].matches.push(newMatchEntry);
    } else {
      updatedTickets.push({ id: Date.now(), name: ticketName, matches: [newMatchEntry] });
    }

    setTickets(updatedTickets);
    setExpandedStatId(null); // Chiudi dopo aver aggiunto
    // Opzionale: Mostra un toast di conferma o vibrazione
  };

  const deleteTicket = (id) => setTickets(tickets.filter(t => t.id !== id));
  const getStatusColor = (status) => {
    if (status === 'won') return 'bg-green-500';
    if (status === 'lost') return 'bg-red-500';
    return 'bg-yellow-400 animate-pulse';
  };

  // --- COMPONENTI ---

  // 1. WIDGET SCOMMESSA INLINE (Il cuore della tua richiesta)
  const InlineBettingWidget = ({ statDef, defaultTicketName }) => {
    const [betType, setBetType] = useState("Over"); // Under o Over
    const [selectedLine, setSelectedLine] = useState(statDef.lines[1]); // Default alla seconda opzione
    const [selectedTicket, setSelectedTicket] = useState(defaultTicketName);

    return (
      <div className="bg-[#1f1f23] p-4 rounded-b-lg mb-4 border-t border-[#333] animate-in slide-in-from-top-2">
         
         <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-green-500 font-mono uppercase">
                Stai scommettendo su: {activeContext.side}
            </span>
            {/* Selezione Rapida Schedina */}
            <select 
                className="bg-[#121212] text-xs text-gray-400 border border-[#333] rounded px-2 py-1 focus:outline-none"
                value={selectedTicket}
                onChange={(e) => setSelectedTicket(e.target.value)}
            >
                {tickets.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                <option value="Nuova Schedina">Nuova Schedina...</option>
            </select>
         </div>

         {/* RIGA COMANDI: |UNDER| |OVER| |LINEA| */}
         <div className="flex gap-2 mb-3 h-10">
            {/* Tasti Toggle */}
            <button 
                onClick={() => setBetType("Under")}
                className={`flex-1 rounded font-bold text-xs uppercase transition-colors ${betType === 'Under' ? 'bg-white text-black' : 'bg-[#121212] text-gray-500 border border-[#333]'}`}
            >
                Under
            </button>
            <button 
                onClick={() => setBetType("Over")}
                className={`flex-1 rounded font-bold text-xs uppercase transition-colors ${betType === 'Over' ? 'bg-white text-black' : 'bg-[#121212] text-gray-500 border border-[#333]'}`}
            >
                Over
            </button>

            {/* Dropdown Linea (Stile Bottone) */}
            <div className="relative w-20">
                <select 
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(e.target.value)}
                    className="w-full h-full bg-[#27272a] text-green-400 font-bold text-sm text-center appearance-none rounded focus:outline-none border border-green-900"
                >
                    {statDef.lines.map(line => <option key={line} value={line}>{line}</option>)}
                </select>
                <div className="absolute top-0 right-0 h-full flex items-center pr-1 pointer-events-none">
                     <ChevronDown size={12} className="text-green-600"/>
                </div>
            </div>
         </div>

         {/* TASTO CONFERMA */}
         <button 
            onClick={() => handleInlineAdd(statDef.label, betType, selectedLine, selectedTicket)}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
         >
            <Plus size={16} strokeWidth={3} /> AGGIUNGI AL MONITOR
         </button>
      </div>
    );
  };

  // 2. RIGA STATISTICA (Cliccabile)
  const StatRow = ({ statDef, matchData }) => {
    const valHome = matchData && matchData[statDef.id] ? matchData[statDef.id][0] : 0;
    const valAway = matchData && matchData[statDef.id] ? matchData[statDef.id][1] : 0;
    const total = valHome + valAway;
    
    const totalVis = total === 0 ? 1 : total; 
    const pctHome = (valHome / totalVis) * 100;
    const pctAway = (valAway / totalVis) * 100;

    const isExpanded = expandedStatId === statDef.id;

    return (
      <div className="mb-1"> {/* Ridotto margine bottom perché il widget si apre sotto */}
        {/* Header Riga */}
        <div className={`flex justify-between items-center py-1 transition-colors rounded px-1 ${isExpanded ? 'bg-[#1f1f23]' : ''}`}>
            {/* Tasto CASA */}
            <div 
                onClick={() => toggleStatExpand(statDef.id, "Casa", valHome)}
                className={`w-16 p-1 text-center rounded cursor-pointer transition-all border ${isExpanded && activeContext.side === 'Casa' ? 'bg-green-900 border-green-500 text-white' : 'bg-[#27272a] border-transparent text-gray-300'}`}
            >
                <span className="text-sm font-bold">{valHome}</span>
            </div>

            {/* Label Totale */}
            <div 
                onClick={() => toggleStatExpand(statDef.id, "Totale", total)}
                className={`text-xs uppercase tracking-widest cursor-pointer px-2 py-1 rounded ${isExpanded && activeContext.side === 'Totale' ? 'text-green-400 font-bold' : 'text-gray-500'}`}
            >
                {statDef.label}
            </div>

            {/* Tasto OSPITE */}
            <div 
                onClick={() => toggleStatExpand(statDef.id, "Ospite", valAway)}
                className={`w-16 p-1 text-center rounded cursor-pointer transition-all border ${isExpanded && activeContext.side === 'Ospite' ? 'bg-green-900 border-green-500 text-white' : 'bg-[#27272a] border-transparent text-gray-300'}`}
            >
                 <span className="text-sm font-bold">{valAway}</span>
            </div>
        </div>

        {/* Barre Grafiche (Visibili solo se chiuso o per riferimento) */}
        {!isExpanded && (
             <div className="flex gap-1 h-1 mb-3 px-1">
                <div className="flex-1 bg-[#1a1a1a] rounded-l-full flex justify-end overflow-hidden">
                    <div className="bg-gray-600 h-full" style={{ width: total === 0 ? '0%' : `${pctHome}%` }}></div>
                </div>
                <div className="flex-1 bg-[#1a1a1a] rounded-r-full flex justify-start overflow-hidden">
                    <div className="bg-gray-600 h-full" style={{ width: total === 0 ? '0%' : `${pctAway}%` }}></div>
                </div>
            </div>
        )}

        {/* --- IL WIDGET CHE SI APRE SOTTO --- */}
        {isExpanded && (
            <InlineBettingWidget 
                statDef={statDef} 
                defaultTicketName={tickets[0]?.name || "Nuova Schedina"}
            />
        )}
      </div>
    );
  };

  // 3. VISTA DETTAGLIO
  const MatchDetailView = ({ match }) => (
    <div className="pb-24 bg-[#121212] min-h-screen relative z-20">
      <div className="bg-[#18181b] p-4 sticky top-0 border-b border-gray-800 flex items-center shadow-md z-30">
        <ArrowLeft className="text-gray-400 mr-4 cursor-pointer" onClick={closeMatchDetail} />
        <div className="flex-1 text-center">
            <div className="text-xs text-green-500 font-bold mb-1">{match.minute !== '-' ? match.minute : 'PRE-MATCH'}</div>
            <div className="text-lg font-bold text-white">{match.teams}</div>
            <div className="text-2xl font-bold text-white mt-1">{match.score}</div>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="p-4 mt-2">
        <div className="text-center text-[10px] text-gray-500 uppercase mb-6">Clicca sui numeri per aprire le quote</div>
        {STAT_CATEGORIES.map(stat => (
            <StatRow key={stat.id} statDef={stat} matchData={match.stats} />
        ))}
      </div>
    </div>
  );

  // 4. VISTA MONITOR (Resta uguale, pulita)
  const MonitorView = () => (
    <div className="p-2 space-y-4 pb-24 mt-4">
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar size={48} className="mb-4 opacity-20"/>
            <p className="text-sm">Nessuna giocata attiva.</p>
        </div>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket.id} className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-[#27272a] px-3 py-2 rounded-t-md">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{ticket.name}</span>
              <Trash2 size={14} className="text-gray-500 cursor-pointer hover:text-red-500" onClick={() => deleteTicket(ticket.id)} />
            </div>
            <div className="bg-black border border-[#27272a] rounded-b-md overflow-hidden">
              {ticket.matches.map((match, index) => (
                <div key={match.id} className={`${index !== ticket.matches.length - 1 ? 'border-b border-[#27272a]' : ''}`}>
                  <div className="flex items-center justify-between px-3 py-2 bg-[#09090b]">
                     <div className="flex items-center gap-3">
                        <span className="text-green-500 text-xs font-mono w-8 text-center">{match.minute}</span>
                        <span className="text-sm font-medium text-white">{match.teams}</span>
                     </div>
                     <span className="text-sm font-bold text-white">{match.score}</span>
                  </div>
                  <div className="bg-[#0f0f11]">
                    {match.stats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 pl-12 border-t border-[#1a1a1a]">
                        <div className="flex flex-col w-full mr-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] uppercase text-gray-400">{stat.label}</span>
                            <span className="text-[10px] text-white font-mono">{stat.current}/{stat.target}</span>
                          </div>
                          <div className="h-1 w-full bg-[#333] rounded-full overflow-hidden">
                            <div className="h-full bg-white opacity-40" style={{ width: `${(stat.current / stat.target) * 100}%` }}></div>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(stat.status)}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  // 5. VISTA LISTA PARTITE (Resta uguale)
  const AllMatchesView = () => (
    <div className="pb-24">
       <div className="p-4 bg-[#18181b] sticky top-0 z-10 border-b border-gray-800">
        <div className="bg-[#09090b] flex items-center p-3 rounded-lg border border-gray-700">
            <Search size={16} className="text-gray-500 mr-3"/>
            <input type="text" placeholder="Cerca squadra..." className="bg-transparent text-sm text-white focus:outline-none w-full"/>
        </div>
      </div>
      <div className="p-2 space-y-4">
        {leaguesData.map((league, idx) => (
            <div key={idx}>
                <div className="px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{league.name}</div>
                <div className="bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a]">
                    {league.matches.map((match, mIdx) => (
                        <div key={match.id} onClick={() => openMatchDetail(match)} 
                            className={`p-4 flex justify-between items-center active:bg-[#27272a] cursor-pointer transition-colors ${mIdx !== league.matches.length -1 ? 'border-b border-[#27272a]' : ''}`}>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-mono w-8 text-center ${match.status === 'LIVE' ? 'text-green-500' : 'text-gray-500'}`}>{match.minute !== '-' ? match.minute : match.time}</span>
                                <span className="text-white text-sm font-medium">{match.teams}</span>
                            </div>
                            <span className="text-white font-bold text-sm">{match.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans relative overflow-hidden">
      
      {selectedMatchDetail ? (
        <MatchDetailView match={selectedMatchDetail} />
      ) : (
        <>
            {activeTab === 'monitor' && (
                <div className="flex justify-between items-center p-4 bg-[#18181b] border-b border-gray-800 sticky top-0 z-10">
                    <span className="text-gray-500 text-sm">Ieri</span><span className="text-white font-bold">OGGI</span><span className="text-gray-500 text-sm">Domani</span>
                </div>
            )}
            {activeTab === 'tutte' && <AllMatchesView />}
            {activeTab === 'monitor' && <MonitorView />}
            
            <div className="fixed bottom-0 w-full bg-[#18181b] border-t border-gray-800 flex justify-around py-4 z-50">
                <div onClick={() => setActiveTab('tutte')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'tutte' ? 'opacity-100' : 'opacity-40'}`}>
                    <Calendar size={18} />
                    <span className="text-[9px] uppercase font-bold">Tutte</span>
                </div>
                <div onClick={() => setActiveTab('live')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'live' ? 'opacity-100 text-red-500' : 'opacity-40'}`}>
                    <Radio size={18} />
                    <span className="text-[9px] uppercase font-bold">Live</span>
                </div>
                <div onClick={() => setActiveTab('monitor')} className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className={`p-2 -mt-6 rounded-full border-4 border-[#121212] ${activeTab === 'monitor' ? 'bg-green-500 text-black' : 'bg-[#27272a] text-gray-400'}`}>
                         <BarChart2 size={24} />
                    </div>
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${activeTab === 'monitor' ? 'text-green-400' : 'text-gray-500'}`}>Monitor</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer opacity-40">
                    <History size={18} />
                    <span className="text-[9px] uppercase font-bold">Storico</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer opacity-40">
                    <Trophy size={18} />
                    <span className="text-[9px] uppercase font-bold">Classifica</span>
                </div>
            </div>
        </>
      )}
    </div>
  );
}