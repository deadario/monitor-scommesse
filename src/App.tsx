import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, X, ChevronDown, Calendar, Search, ArrowLeft, BarChart2, History, Trophy, Radio, User, CircleDashed, Star, Bell, MonitorPlay, Check, Ticket, Save, AlertCircle, Edit2 } from 'lucide-react';

// --- STILI CSS GLOBALI (VERSIONE 9.0 - NO TEXT SELECTION) ---
const globalStyles = `
  * { 
    -ms-overflow-style: none; 
    scrollbar-width: none; 
    -webkit-tap-highlight-color: transparent !important; 
    box-sizing: border-box;
    touch-action: manipulation; /* Dice al browser di non aspettare il doppio tocco per lo zoom */
  }
  
  *::-webkit-scrollbar { display: none !important; }
  .no-scrollbar::-webkit-scrollbar { display: none !important; }
  .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
  
  body { 
    background-color: #0f172a; 
    color: white; 
    margin: 0; 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
    cursor: default;
    -webkit-user-select: none; /* Impedisce la selezione testo su Safari Mobile */
    user-select: none;
  }
  
  /* Feedback visivo immediato solo alla pressione */
  .row-active:active { background-color: #334155 !important; }
  .btn-active:active { opacity: 0.7; transform: scale(0.98); }
`;

// --- ICONA PALLONE CUSTOM ---
const SoccerBallIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16l-4-4 4-4 4 4-4 4" />
    <path d="M12 8V4" />
    <path d="M12 16v4" />
    <path d="M8 12H4" />
    <path d="M16 12h4" />
  </svg>
);

// --- DATI & CONFIGURAZIONE ---
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = -7; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = i === 0 ? "OGGI" : d.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase().replace('.', '');
    const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    dates.push({ id: i, label: dayName, date: dateStr });
  }
  return dates;
};
const dateList = generateDates();

const STAT_CATEGORIES = [
  { id: 'goals', label: 'GOL', lines: [0.5, 1.5, 2.5, 3.5, 4.5] },
  { id: 'corners', label: 'CORNER', lines: [7.5, 8.5, 9.5, 10.5, 11.5, 12.5] },
  { id: 'yellow_cards', label: 'CARTELLINI', lines: [2.5, 3.5, 4.5, 5.5] },
  { id: 'red_cards', label: 'ROSSI', lines: [0.5] },
  { id: 'shots', label: 'TIRI', lines: [18.5, 19.5, 20.5, 21.5, 22.5] },
  { id: 'shots_og', label: 'TIRI PORTA', lines: [6.5, 7.5, 8.5, 9.5] },
];

const initialLeaguesData = [
  {
    id: "L1", name: "SERIE A", country: "it", isPinned: true,
    matches: [
      { id: 501, dateOffset: 0, teams: ["Inter", "Milan"], time: "20:45", status: "LIVE", minute: "82'", score: [1, 0], round: "GIORNATA 23", colors: ['#3b82f6', '#ef4444'], stats: { corners: 8, yellow_cards: 4, shots: 15 } },
      { id: 502, dateOffset: 0, teams: ["Napoli", "Juventus"], time: "21:00", status: "NS", minute: "-", score: [0, 0], round: "GIORNATA 23", colors: ['#0ea5e9', '#ffffff'], stats: { corners: 0, yellow_cards: 0, shots: 0 } },
    ]
  },
  {
    id: "L2", name: "PREMIER LEAGUE", country: "gb-eng", isPinned: true,
    matches: [
      { id: 504, dateOffset: 0, teams: ["Arsenal", "Liverpool"], time: "16:00", status: "FT", minute: "FIN", score: [2, 2], round: "GIORNATA 21", colors: ['#ef4444', '#dc2626'], stats: { corners: 5, yellow_cards: 3, shots: 12 } },
      { id: 505, dateOffset: 0, teams: ["Man City", "Chelsea"], time: "18:30", status: "LIVE", minute: "45'", score: [1, 1], round: "GIORNATA 21", colors: ['#60a5fa', '#1d4ed8'], stats: { corners: 3, yellow_cards: 1, shots: 8 } },
      { id: 506, dateOffset: 0, teams: ["Man Utd", "Tottenham"], time: "21:00", status: "NS", minute: "-", score: [0, 0], round: "GIORNATA 21", colors: ['#ef4444', '#ffffff'], stats: { corners: 0, yellow_cards: 0, shots: 0 } },
      { id: 507, dateOffset: 0, teams: ["Aston Villa", "Everton"], time: "13:30", status: "FT", minute: "FIN", score: [0, 1], round: "GIORNATA 21", colors: ['#7f1d1d', '#1e3a8a'], stats: { corners: 10, yellow_cards: 5, shots: 9 } },
    ]
  },
  {
    id: "L3", name: "LIGA", country: "es", isPinned: false, 
    matches: [
      { id: 605, dateOffset: 0, teams: ["Real Madrid", "Betis"], time: "21:00", status: "NS", minute: "-", score: [0, 0], round: "GIORNATA 19", colors: ['#ffffff', '#16a34a'], stats: { corners: 0, yellow_cards: 0, shots: 0 } },
      { id: 606, dateOffset: 0, teams: ["Girona", "Sevilla"], time: "14:00", status: "FT", minute: "FIN", score: [3, 1], round: "GIORNATA 19", colors: ['#ef4444', '#ffffff'], stats: { corners: 6, yellow_cards: 2, shots: 14 } },
      { id: 607, dateOffset: 0, teams: ["Barcelona", "Valencia"], time: "16:15", status: "FT", minute: "FIN", score: [2, 2], round: "GIORNATA 19", colors: ['#1e3a8a', '#ffffff'], stats: { corners: 7, yellow_cards: 4, shots: 11 } }
    ]
  },
  {
    id: "L4", name: "BUNDESLIGA", country: "de", isPinned: false, 
    matches: [
      { id: 601, dateOffset: 1, teams: ["Bayern", "Dortmund"], time: "15:30", status: "NS", minute: "-", score: [0, 0], round: "GIORNATA 20", colors: ['#dc2626', '#eab308'], stats: { corners: 0, yellow_cards: 0, shots: 0 } } 
    ]
  }
];

// --- COMPONENTI UI BASE ---

const ToastNotification = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) { 
            const timer = setTimeout(() => {
                onClose();
            }, 2000); 
            return () => clearTimeout(timer); 
        }
    }, [show, onClose]);
    
    if (!show) return null;
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-cyan-500 text-black px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-5 pointer-events-none select-none">
            <Check size={16} strokeWidth={3} />
            <span className="text-xs font-bold">{message}</span>
        </div>
    );
};

const HomeHeader = () => (
  <div className="bg-[#1e293b] px-4 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-[#334155] select-none">
      <div className="flex items-center gap-1">
          <div className="p-1.5"><SoccerBallIcon size={20} className="text-white" /></div>
          <span className="text-white font-bold text-sm ml-1">Calcio</span>
          <ChevronDown size={14} className="text-gray-400" />
      </div>
      <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" /><div className="relative"><User size={20} className="text-gray-400" /></div>
      </div>
  </div>
);

const DateBar = ({ selectedDateId, onDateClick }) => {
  const scrollContainerRef = useRef(null);
  const itemsRef = useRef(new Map());
  const centerItem = (id) => {
    const container = scrollContainerRef.current;
    const item = itemsRef.current.get(id);
    if (container && item) {
       const scrollPos = item.offsetLeft - (container.clientWidth / 2) + (item.clientWidth / 2);
       container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  };
  useEffect(() => { setTimeout(() => centerItem(0), 100); }, []);
  const handleClick = (id) => { onDateClick(id); centerItem(id); };
  return (
    <div className="bg-[#0f172a] border-b border-[#1e293b] h-[55px] flex items-center sticky top-[57px] z-40 shadow-lg select-none">
        <div ref={scrollContainerRef} className="flex w-full overflow-x-auto no-scrollbar items-center px-2 gap-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {dateList.map((d) => {
                const isSelected = selectedDateId === d.id;
                return (
                    <div key={d.id} ref={(node) => { if (node) itemsRef.current.set(d.id, node); else itemsRef.current.delete(d.id); }}
                        onClick={() => handleClick(d.id)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[50px] h-[40px] cursor-pointer rounded-none border-b-2 row-active ${isSelected ? 'bg-[#1e293b] border-cyan-400' : 'bg-transparent border-transparent text-gray-500'}`}>
                        <span className={`text-[10px] font-bold uppercase leading-none mb-1 ${isSelected ? 'text-white' : ''}`}>{d.label}</span>
                        <span className={`text-[9px] font-mono leading-none ${isSelected ? 'text-cyan-400' : ''}`}>{d.date}</span>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

const MatchRow = ({ match, onClick }) => {
    const isLive = match.status === 'LIVE';
    const isPre = match.status === 'NS';
    const isPost = match.status === 'FT';

    return (
        // FIX: select-none per impedire che iOS pensi che vuoi selezionare il testo
        <div onClick={onClick} className="flex items-center py-3 px-3 cursor-pointer border-t border-[#334155] bg-[#1e293b] row-active select-none">
            <div className="flex-1 flex flex-col justify-center gap-1.5">
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold border border-gray-600 mr-2" style={{ backgroundColor: match.colors ? match.colors[0] : '#333' }}>{match.teams[0].substring(0,1)}</div>
                    <span className={`text-sm ${isPost && match.score[0] > match.score[1] ? 'font-bold text-white' : 'text-gray-300'}`}>{match.teams[0]}</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold border border-gray-600 mr-2" style={{ backgroundColor: match.colors ? match.colors[1] : '#333' }}>{match.teams[1].substring(0,1)}</div>
                    <span className={`text-sm ${isPost && match.score[1] > match.score[0] ? 'font-bold text-white' : 'text-gray-300'}`}>{match.teams[1]}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
                {isLive && <span className="text-xs font-bold text-cyan-400 animate-pulse">{match.minute}</span>}
                {isPre && <span className="text-xs font-bold text-gray-400">{match.time}</span>}
                {isPost && <span className="text-xs font-bold text-gray-500">FIN</span>}
                {!isPre && (
                    <div className="flex flex-col items-center justify-center gap-1.5 w-6">
                        <span className={`text-sm leading-none ${isLive ? 'text-cyan-400 font-bold' : (isPost && match.score[0] > match.score[1] ? 'font-bold text-white' : 'text-gray-400')}`}>{match.score[0]}</span>
                        <span className={`text-sm leading-none ${isLive ? 'text-cyan-400 font-bold' : (isPost && match.score[1] > match.score[0] ? 'font-bold text-white' : 'text-gray-400')}`}>{match.score[1]}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const MainBettingWidget = ({ onAdd, ticketGroups, onAddGroup }) => {
    const [selectedGroup, setSelectedGroup] = useState("MONITOR STATS");
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const handleGroupChange = (e) => { const val = e.target.value; if (val === "___NEW___") { setIsCreatingGroup(true); setNewGroupName(""); } else { setSelectedGroup(val); } };
    const saveNewGroup = () => { if (newGroupName.trim() !== "") { onAddGroup(newGroupName); setSelectedGroup(newGroupName); setIsCreatingGroup(false); } else { setIsCreatingGroup(false); }};

    return (
        <div className="bg-[#1e293b] p-4 border-b border-[#334155] animate-in fade-in slide-in-from-top-2 select-none">
            <div className="flex justify-end items-center mb-3">
               <div className="flex items-center gap-2">
                  <Ticket size={14} className="text-white"/>
                  {isCreatingGroup ? (
                      <div className="flex items-center border-b border-cyan-500 w-[100px]"><input autoFocus type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onBlur={saveNewGroup} onKeyDown={(e) => e.key === 'Enter' && saveNewGroup()} placeholder="Nome..." className="w-full bg-transparent text-[10px] text-white font-bold focus:outline-none placeholder-gray-500"/><Save size={10} className="text-cyan-500 cursor-pointer ml-1" onClick={saveNewGroup}/></div>
                  ) : (
                      <div className="relative group cursor-pointer flex items-center">
                          <select value={selectedGroup} onChange={handleGroupChange} className="appearance-none bg-transparent text-white font-bold text-[10px] uppercase tracking-wider focus:outline-none pr-4 cursor-pointer">
                              <option value="MONITOR STATS" className="text-black">MONITOR STATS</option>
                              <option value="___NEW___" className="text-black font-bold">+ NUOVO MONITOR</option>
                              {ticketGroups.filter(g => g !== "MONITOR GENERALE" && g !== "MONITOR STATS").map(g => <option key={g} value={g} className="text-black">{g}</option>)}
                          </select>
                          <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-white pointer-events-none"/>
                      </div>
                  )}
              </div>
            </div>
            <div className="space-y-2">
               <div className="flex gap-2">
                   {["1", "X", "2"].map(sign => (
                       <button key={sign} onClick={() => onAdd("ESITO", sign, null, "Finale", selectedGroup)} className="flex-1 bg-[#0f172a] border border-[#334155] text-white font-bold py-3 rounded text-xs row-active">{sign}</button>
                   ))}
               </div>
               <div className="flex gap-2">
                   {["1X", "12", "X2"].map(sign => (
                       <button key={sign} onClick={() => onAdd("DOPPIA CHANCE", sign, null, "Finale", selectedGroup)} className="flex-1 bg-[#0f172a] border border-[#334155] text-gray-300 font-bold py-2 rounded text-[10px] row-active">{sign}</button>
                   ))}
               </div>
           </div>
        </div>
    );
};

const InlineBettingWidget = ({ statDef, activeContext, onAdd, ticketGroups, onAddGroup }) => {
  const [betType, setBetType] = useState("Over");
  const [selectedLine, setSelectedLine] = useState(statDef.lines[0]);
  const [selectedGroup, setSelectedGroup] = useState("MONITOR STATS");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const handleGroupChange = (e) => { const val = e.target.value; if (val === "___NEW___") { setIsCreatingGroup(true); setNewGroupName(""); } else { setSelectedGroup(val); } };
  const saveNewGroup = () => { if (newGroupName.trim() !== "") { onAddGroup(newGroupName); setSelectedGroup(newGroupName); setIsCreatingGroup(false); } else { setIsCreatingGroup(false); }};
  
  return (
    <div className="bg-[#1e293b] py-3 px-4 border-t border-[#334155] shadow-inner animate-in slide-in-from-top-1 select-none">
       <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
             <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
             <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">{statDef.label} <span className="text-gray-500">•</span> <span className="text-white">{activeContext.side}</span></span>
          </div>
          
          <div className="flex items-center gap-2">
              <Ticket size={14} className="text-white" />
              {isCreatingGroup ? (
                  <div className="flex items-center border-b border-cyan-500 w-[100px]"><input autoFocus type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onBlur={saveNewGroup} onKeyDown={(e) => e.key === 'Enter' && saveNewGroup()} placeholder="Nome..." className="w-full bg-transparent text-[10px] text-white font-bold focus:outline-none placeholder-gray-500"/><Save size={10} className="text-cyan-500 cursor-pointer ml-1" onClick={saveNewGroup}/></div>
              ) : (
                  <div className="relative group cursor-pointer flex items-center">
                      <select value={selectedGroup} onChange={handleGroupChange} className="appearance-none bg-transparent text-white font-bold text-[10px] uppercase tracking-wider focus:outline-none pr-4 cursor-pointer">
                          <option value="MONITOR STATS" className="text-black">MONITOR STATS</option>
                          <option value="___NEW___" className="text-black font-bold">+ NUOVO</option>
                          {ticketGroups.filter(g => g !== "MONITOR GENERALE" && g !== "MONITOR STATS").map(g => <option key={g} value={g} className="text-black">{g}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                  </div>
              )}
          </div>
       </div>

       <div className="flex items-center justify-between gap-3 h-10">
          <div className="flex flex-1 gap-2 h-full">
              <button onClick={() => setBetType("Under")} className={`flex-1 rounded-md flex items-center justify-center font-bold text-[10px] uppercase border ${betType === 'Under' ? 'bg-cyan-500 text-black border-cyan-500 shadow-sm' : 'bg-[#0f172a] text-gray-400 border-[#334155]'}`}>UNDER</button>
              <button onClick={() => setBetType("Over")} className={`flex-1 rounded-md flex items-center justify-center font-bold text-[10px] uppercase border ${betType === 'Over' ? 'bg-cyan-500 text-black border-cyan-500 shadow-sm' : 'bg-[#0f172a] text-gray-400 border-[#334155]'}`}>OVER</button>
          </div>
          <div className="relative h-full w-20">
              <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} className="w-full h-full bg-[#0f172a] text-white font-bold text-lg text-center appearance-none rounded-md border border-[#334155] focus:border-cyan-500 focus:outline-none">{statDef.lines.map(line => <option key={line} value={line}>{line}</option>)}</select>
              <ChevronDown size={14} className="absolute top-0 right-1 h-full pointer-events-none text-gray-500 flex items-center"/>
          </div>
          <button onClick={() => onAdd(statDef.label, betType, selectedLine, activeContext.side, selectedGroup)} className="h-full aspect-square bg-cyan-500 hover:bg-cyan-400 text-black rounded-md flex items-center justify-center shadow-lg btn-active">
              <Plus size={24} strokeWidth={3} />
          </button>
       </div>

       {statDef.id === 'goals' && activeContext.side === 'Totale' && (
           <div className="mt-3 pt-3 border-t border-[#334155] flex gap-2">
               <button onClick={() => onAdd("GOL/NOGOL", "GG", null, "Entrambe", selectedGroup)} className="flex-1 bg-[#0f172a] border border-[#334155] text-white font-bold py-2 rounded text-[10px] row-active">GOAL</button>
               <button onClick={() => onAdd("GOL/NOGOL", "NG", null, "Entrambe", selectedGroup)} className="flex-1 bg-[#0f172a] border border-[#334155] text-white font-bold py-2 rounded text-[10px] row-active">NO GOAL</button>
           </div>
       )}
    </div>
  );
};

const StatRow = ({ statDef, homeVal, awayVal, onExpand, isExpanded, activeContext, colors, ticketGroups, onAddGroup }) => {
  const total = homeVal + awayVal;
  const pctHome = total === 0 ? 50 : (homeVal / total) * 100;
  const pctAway = total === 0 ? 50 : (awayVal / total) * 100;
  
  let homeBarClass = "bg-white";
  let awayBarClass = "bg-white";

  if (homeVal > awayVal) {
      homeBarClass = "bg-cyan-500";
      awayBarClass = "bg-white";
  } else if (awayVal > homeVal) {
      homeBarClass = "bg-white";
      awayBarClass = "bg-cyan-500";
  } 

  return (
    <div className="bg-[#020617] last:border-0">
      <div className={`py-4 px-4 ${isExpanded ? 'bg-[#1e293b]' : 'row-active'} select-none`}>
          <div className="flex justify-between items-center mb-2 text-sm font-medium">
              <div onClick={() => onExpand(statDef.id, "Casa", homeVal)} className={`w-12 text-center py-1 rounded cursor-pointer ${isExpanded && activeContext.side === 'Casa' ? 'bg-cyan-900 text-white border border-cyan-600' : 'text-white font-bold'}`}>{homeVal}</div>
              <div onClick={() => onExpand(statDef.id, "Totale", total)} className={`flex-1 text-center text-[10px] uppercase tracking-widest font-bold cursor-pointer py-1 rounded ${isExpanded && activeContext.side === 'Totale' ? 'text-cyan-400' : 'text-gray-400'}`}>{statDef.label}</div>
              <div onClick={() => onExpand(statDef.id, "Ospite", awayVal)} className={`w-12 text-center py-1 rounded cursor-pointer ${isExpanded && activeContext.side === 'Ospite' ? 'bg-cyan-900 text-white border border-cyan-600' : 'text-white font-bold'}`}>{awayVal}</div>
          </div>
          <div className="flex gap-1 h-1 mt-1 opacity-80">
              <div className="flex-1 flex justify-end bg-[#334155] rounded-l-full overflow-hidden">
                  <div style={{ width: `${pctHome}%` }} className={`h-full ${homeBarClass}`}></div>
              </div>
              <div className="flex-1 flex justify-start bg-[#334155] rounded-r-full overflow-hidden">
                  <div style={{ width: `${pctAway}%` }} className={`h-full ${awayBarClass}`}></div>
              </div>
          </div>
      </div>
      {isExpanded && <InlineBettingWidget statDef={statDef} activeContext={activeContext} onAdd={onExpand.handleAdd} ticketGroups={ticketGroups} onAddGroup={onAddGroup}/>}
    </div>
  );
};

const MatchDetailView = ({ match, leagueName, onClose, onAddTicket, onToggleMonitor, isMonitored, ticketGroups, onAddGroup }) => {
  const [mockStats] = useState(() => {
      const stats = {};
      STAT_CATEGORIES.forEach(cat => {
          if (cat.id === 'goals') {
              stats[cat.id] = [match.score[0], match.score[1]];
          } else {
              if (match.stats && match.stats[cat.id]) {
                  stats[cat.id] = [Math.floor(match.stats[cat.id]/2), Math.ceil(match.stats[cat.id]/2)]; 
              } else {
                  stats[cat.id] = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
              }
          }
      });
      return stats;
  });

  const [expandedStatId, setExpandedStatId] = useState(null);
  const [activeContext, setActiveContext] = useState({ side: null, val: 0 });
  const [activeTab, setActiveTab] = useState("STATISTICHE"); 
  const [showMainBets, setShowMainBets] = useState(false); 

  const toggleExpand = (statId, side, val) => { if (expandedStatId === statId && activeContext.side === side) { setExpandedStatId(null); } else { setExpandedStatId(statId); setActiveContext({ side, val }); }};
  toggleExpand.handleAdd = (label, type, line, side, groupName) => { onAddTicket(match, label, type, line, side, groupName); setExpandedStatId(null); setShowMainBets(false); };
  
  const handleAddMainBet = (label, type, line, side, groupName) => {
      onAddTicket(match, label, type, line, side, groupName);
      setShowMainBets(false);
  }

  const TABS = ["TABELLINO", "STATISTICHE", "STATS GIOCATORI", "FORMAZIONI", "PRECEDENTI"];
  
  return (
    <div className="pb-24 bg-[#0f172a] min-h-screen relative z-30 flex flex-col animate-in slide-in-from-right duration-300 select-none">
      <div className="bg-[#1e293b] sticky top-0 z-50 border-b border-[#334155] flex justify-between items-center p-4 shadow-md">
         <ArrowLeft className="text-gray-400 cursor-pointer btn-active" onClick={onClose} />
         <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400 btn-active cursor-pointer" />
            <Star size={22} className={`cursor-pointer btn-active ${isMonitored ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-white'}`} onClick={() => onToggleMonitor(match)}/>
         </div>
      </div>
      <div className="bg-[#020617] h-8 flex items-center justify-center border-b border-[#334155]"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{leagueName} • {match.round || "Giornata --"}</span></div>
      
      <div className="bg-[#1e293b] px-6 py-6 flex justify-between items-center border-b border-[#334155]">
            <div className="flex flex-col items-center w-1/3"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xl text-white font-bold border-2 border-[#334155] mb-2 shadow-lg" style={{ borderColor: match.colors ? match.colors[0] : '#333' }}>{match.teams[0].substring(0,1)}</div><span className="text-sm font-bold text-white text-center leading-tight">{match.teams[0]}</span></div>
            
            <div className="flex flex-col items-center cursor-pointer btn-active p-2 rounded row-active" onClick={() => setShowMainBets(!showMainBets)}>
                <div className="text-3xl font-black text-white tracking-widest mb-1">{match.score[0]} - {match.score[1]}</div>
                <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${match.status === 'LIVE' ? 'bg-gray-600 text-white' : 'bg-[#334155] text-gray-400'}`}>{match.minute !== '-' ? match.minute : match.time}</div>
            </div>

            <div className="flex flex-col items-center w-1/3"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xl text-white font-bold border-2 border-[#334155] mb-2 shadow-lg" style={{ borderColor: match.colors ? match.colors[1] : '#333' }}>{match.teams[1].substring(0,1)}</div><span className="text-sm font-bold text-white text-center leading-tight">{match.teams[1]}</span></div>
      </div>

      {showMainBets && <MainBettingWidget onAdd={handleAddMainBet} ticketGroups={ticketGroups} onAddGroup={onAddGroup} />}

      <div className="bg-[#0f172a] border-b border-[#334155] sticky top-[60px] z-40 shadow-lg">
          <div className="flex overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>{TABS.map(tab => (<div key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer border-b-2 row-active ${activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent'}`}>{tab}</div>))}</div>
      </div>
      <div className="flex-1 bg-[#020617]"> 
          {activeTab === "STATISTICHE" && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="border-t border-[#334155]">
                      {STAT_CATEGORIES.map(cat => (
                          <StatRow key={cat.id} statDef={cat} homeVal={mockStats[cat.id][0] || 0} awayVal={mockStats[cat.id][1] || 0} isExpanded={expandedStatId === cat.id} activeContext={activeContext} onExpand={toggleExpand} colors={match.colors} ticketGroups={ticketGroups} onAddGroup={onAddGroup} />
                      ))}
                  </div>
              </div>
          )}
          {activeTab !== "STATISTICHE" && (<div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-in fade-in"><CircleDashed size={40} className="mb-4 opacity-20 animate-spin-slow"/><span className="text-xs font-bold uppercase tracking-widest">Dati {activeTab} in arrivo</span></div>)}
      </div>
    </div>
  );
};

// --- MONITOR AVANZATO ---
const MonitorView = ({ tickets, ticketGroups, leagues, onRemoveTicket, onRenameGroup }) => {
    const [editingGroup, setEditingGroup] = useState(null);
    const [editValue, setEditValue] = useState("");

    const startEdit = (group) => {
        if (group === "MONITOR GENERALE" || group === "MONITOR STATS") return; 
        setEditingGroup(group);
        setEditValue(group);
    };

    const saveEdit = () => {
        if (editValue.trim() !== "" && editValue !== editingGroup) {
            onRenameGroup(editingGroup, editValue);
        }
        setEditingGroup(null);
    };

    const cancelEdit = () => {
        setEditingGroup(null);
    };

    const getMatchData = (matchId) => {
        for (const league of leagues) {
            const match = league.matches.find(m => m.id === matchId);
            if (match) return match;
        }
        return null;
    };

    const calculateProgress = (bet, matchData) => {
        const targetMatch = bet.match(/(\d+(\.\d+)?)/);
        const target = targetMatch ? parseFloat(targetMatch[0]) : 0.5;
        let current = 0;
        
        if (bet.includes("GOL") && !bet.includes("GOL/NOGOL")) { current = matchData.score[0] + matchData.score[1]; } 
        else if (bet.includes("CORNER")) { current = matchData.stats.corners || 0; }
        else if (bet.includes("CARTELLINI")) { current = matchData.stats.yellow_cards || 0; }
        else if (bet.includes("TIRI")) { current = matchData.stats.shots || 0; }
        
        if (bet.includes("ESITO") || bet.includes("GOL/NOGOL") || bet.includes("DOPPIA CHANCE")) {
            let isHit = false;
            let label = "";
            const isFT = matchData.status === 'FT';
            const isNS = matchData.status === 'NS';
            let statusColor = 'yellow';

            if (bet.includes("ESITO")) {
                const choice = bet.split(' ').pop();
                label = choice;
                if (choice === "1") isHit = matchData.score[0] > matchData.score[1];
                else if (choice === "X") isHit = matchData.score[0] === matchData.score[1];
                else if (choice === "2") isHit = matchData.score[1] > matchData.score[0];
            } else if (bet.includes("GOL/NOGOL")) {
                const choice = bet.split(' ').pop();
                label = choice;
                if (choice === "GG") isHit = matchData.score[0] > 0 && matchData.score[1] > 0;
                else if (choice === "NG") isHit = matchData.score[0] === 0 || matchData.score[1] === 0;
            } else if (bet.includes("DOPPIA CHANCE")) {
                const choice = bet.split(' ').pop();
                label = choice;
                if (choice === "1X") isHit = matchData.score[0] >= matchData.score[1];
                else if (choice === "12") isHit = matchData.score[0] !== matchData.score[1];
                else if (choice === "X2") isHit = matchData.score[1] >= matchData.score[0];
            }

            if (isNS) statusColor = 'gray';
            else if (isHit && isFT) statusColor = 'green';
            else if (isHit && !isFT) statusColor = 'green';
            else if (!isHit && isFT) statusColor = 'red';
            else statusColor = 'yellow';

            return { pct: isHit ? 100 : 0, current: label, target: "WIN", statusColor, isBoolean: true };
        }

        else { 
            if (matchData.status === 'FT') { const isWinSimulated = (matchData.id % 2 !== 0); current = isWinSimulated ? Math.ceil(target + 2) : Math.floor(target - 2); if (current < 0) current = 0; } else { current = Math.floor(target * 0.6); } 
        }

        const isOver = bet.includes("Over");
        const isFT = matchData.status === 'FT';
        const isNS = matchData.status === 'NS';
        let statusColor = 'yellow';
        let isWin = false;

        if (isOver) {
            if (current > target) { statusColor = 'green'; isWin = true; } else if (isFT) { statusColor = 'red'; }
        } else {
            if (current > target) { statusColor = 'red'; } else if (isFT) { statusColor = 'green'; isWin = true; }
        }

        if (isNS) statusColor = 'gray';

        const pct = Math.min((current / target) * 100, 100);
        return { pct, current, target, isWin, statusColor, isBoolean: false };
    };

    const TimelineDot = ({ statusColor }) => {
        let dotStyle = "border-gray-500 bg-gray-700";
        if (statusColor === 'yellow') dotStyle = "border-yellow-500 bg-yellow-900 animate-pulse";
        else if (statusColor === 'green') dotStyle = "border-green-500 bg-green-600";
        else if (statusColor === 'red') dotStyle = "border-red-500 bg-red-600";
        return ( <div className={`w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center z-10 ${dotStyle}`}>{statusColor === 'green' ? <Check size={8} strokeWidth={4}/> : statusColor === 'red' ? <X size={8} strokeWidth={4}/> : null}</div> );
    };

    const genericTickets = tickets.filter(t => t.bet === "MONITORAGGIO GENERALE");
    const otherTickets = tickets.filter(t => t.bet !== "MONITORAGGIO GENERALE");

    // Calcolo corretto delle partite LIVE nel Monitor Generale
    const genericLiveCount = genericTickets.filter(t => {
        const m = getMatchData(t.matchId);
        return m && m.status === 'LIVE';
    }).length;

    return (
        <div className="pb-24 px-0"> 
            {/* 1. MONITOR GENERALE */}
            {genericTickets.length > 0 && (
                <div className="animate-in fade-in mb-1">
                    <div className="px-3 py-1 border-b border-[#1e293b] bg-[#020617] flex justify-between items-center shadow-sm">
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest cursor-default">MONITOR GENERALE</span>
                        <div className="flex gap-1">
                             {/* FIX: Mostra contatore live se > 0 */}
                             {genericLiveCount > 0 && (<div className="bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center shadow-sm">{genericLiveCount}</div>)}
                             <div className="bg-[#1e293b] text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center border border-[#334155]">{genericTickets.length}</div>
                        </div>
                    </div>
                    {genericTickets.map(t => {
                        const m = getMatchData(t.matchId);
                        if (!m) return null;
                        return (
                            <div key={t.id} className="bg-[#1e293b] border-b border-[#334155] last:border-0 rounded-none p-3 flex justify-between items-center h-14">
                                <div className="flex items-center gap-3">
                                    <div className={`px-1.5 py-0.5 rounded-sm ${m.status === 'LIVE' ? 'bg-cyan-500 text-black' : 'bg-gray-600 text-gray-300'} text-[10px] font-bold font-mono min-w-[35px] text-center`}>{m.status === 'LIVE' ? m.minute : 'FIN'}</div>
                                    <span className="text-sm font-bold text-white uppercase">{m.teams[0]} - {m.teams[1]}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono font-bold text-white">{m.score[0]} - {m.score[1]}</span>
                                    <Trash2 size={13} className="text-gray-600 hover:text-red-500 cursor-pointer btn-active" onClick={() => onRemoveTicket(t.id)}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 2. ALTRI GRUPPI */}
            {ticketGroups.map(group => {
                if (group === "MONITOR GENERALE") return null; 
                const groupTickets = otherTickets.filter(t => t.group === group);
                if (groupTickets.length === 0) return null;
                
                const matchesInGroup = {};
                groupTickets.forEach(t => { if (!matchesInGroup[t.matchId]) matchesInGroup[t.matchId] = []; matchesInGroup[t.matchId].push(t); });
                let matchList = Object.keys(matchesInGroup).map(matchId => {
                    const matchData = getMatchData(parseInt(matchId));
                    if (!matchData) return null;
                    return { ...matchData, tickets: matchesInGroup[matchId] };
                }).filter(m => m !== null);
                matchList.sort((a, b) => a.time.localeCompare(b.time));

                // FIX: Conta partite LIVE per il badge
                const liveEvents = groupTickets.filter(t => { const m = getMatchData(t.matchId); return m && m.status === 'LIVE'; }).length;

                return (
                    <div key={group} className="animate-in fade-in mb-1">
                         <div className="px-3 py-1 border-b border-[#1e293b] bg-[#020617] flex justify-between items-center shadow-sm">
                             {editingGroup === group ? (
                                 <div className="flex items-center gap-2 w-full max-w-[200px]"><input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} className="bg-transparent text-[9px] font-bold text-cyan-400 uppercase tracking-widest outline-none border-b border-cyan-500 w-full" onKeyDown={(e) => { if(e.key === 'Enter') saveEdit(); }} onBlur={saveEdit}/><Check size={12} className="text-green-500 cursor-pointer btn-active" onClick={saveEdit}/></div>
                             ) : (
                                <span onClick={() => startEdit(group)} className={`text-[9px] font-bold text-cyan-400 uppercase tracking-widest ${group !== "MONITOR STATS" ? 'cursor-pointer hover:underline decoration-dashed' : 'cursor-default'}`}>{group}</span>
                             )}
                             
                             <div className="flex gap-1">
                                 {liveEvents > 0 && (<div className="bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center shadow-sm">{liveEvents}</div>)}
                                 <div className="bg-[#1e293b] text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center border border-[#334155]">{groupTickets.length}</div>
                             </div>
                         </div>

                         {matchList.map(matchData => (
                             <div key={matchData.id} className="bg-[#1e293b] border-b border-[#334155] last:border-0 rounded-none">
                                 <div className="flex items-center justify-between py-1.5 px-3 bg-[#1e293b] border-b border-[#334155] h-8">
                                     <div className="flex items-center gap-3 h-full">
                                         <div className={`px-1.5 py-0.5 rounded-sm ${matchData.status === 'LIVE' ? 'bg-cyan-500 text-black' : 'bg-gray-600 text-gray-300'} text-[10px] font-bold font-mono min-w-[35px] text-center`}>{matchData.status === 'LIVE' ? matchData.minute : 'FIN'}</div>
                                         <div className="h-full flex items-center gap-2 text-sm text-white"><span className="font-normal uppercase tracking-tight text-[13px]">{matchData.teams[0]} - {matchData.teams[1]}</span>
                                         {matchData.status !== 'NS' && <span className={`font-mono font-bold ml-1 ${matchData.status === 'LIVE' ? 'text-cyan-400' : 'text-white'}`}>{matchData.score[0]}-{matchData.score[1]}</span>}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-[#0f172a]">
                                     {matchData.tickets.map(bet => {
                                         const { pct, current, target, statusColor, isBoolean } = calculateProgress(bet.bet, matchData);
                                         
                                         // FIX: Rimuove "null" se presente nelle vecchie scommesse
                                         const displayLabel = bet.bet
                                            .replace(' (Totale)', '')
                                            .replace(' (Finale)', '')
                                            .replace(' (Entrambe)', '')
                                            .replace(' null', '');

                                         return (
                                             <div key={bet.id} className="flex items-center py-3 px-3 group relative z-10 h-12">
                                                 <div className="flex items-center justify-center w-[35px] flex-shrink-0"><TimelineDot statusColor={statusColor} /></div>
                                                 <div className="flex-1 flex flex-col justify-center mx-3">
                                                     <div className="flex justify-between items-center mb-1">
                                                         <span className={`text-[11px] font-bold leading-tight ${matchData.status === 'NS' ? 'text-gray-500' : 'text-gray-300'}`}>{displayLabel}</span>
                                                         {/* FIX DEFINITIVO: Niente testo se è un esito (isBoolean) */}
                                                         {!isBoolean && matchData.status !== 'NS' && <span className="text-[10px] font-mono font-bold text-gray-400">{current} / {target}</span>}
                                                     </div>
                                                     {matchData.status !== 'NS' ? (<div className="h-[3px] bg-[#1e293b] w-full rounded-full overflow-hidden"><div className="h-full bg-gray-400" style={{ width: `${pct}%` }}></div></div>) : (<div className="h-[3px] bg-[#1e293b] w-full rounded-full opacity-50"></div>)}
                                                 </div>
                                                 <div className="flex-shrink-0 ml-1"><Trash2 size={13} className="text-gray-600 hover:text-red-500 cursor-pointer btn-active" onClick={() => onRemoveTicket(bet.id)}/></div>
                                             </div>
                                         );
                                     })}
                                 </div>
                             </div>
                         ))}
                    </div>
                );
            })}
        </div>
    );
};

// --- APP PRINCIPALE ---
export default function App() {
  const [activeTab, setActiveTab] = useState("tutte");
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  
  const [tickets, setTickets] = useState(() => JSON.parse(localStorage.getItem('monitor_tickets')) || []);
  const [ticketGroups, setTicketGroups] = useState(() => {
      const saved = JSON.parse(localStorage.getItem('monitor_groups'));
      return saved ? (saved.includes("MONITOR STATS") ? saved : ["MONITOR STATS", ...saved]) : ["MONITOR STATS"];
  });
  
  const [leagues, setLeagues] = useState(initialLeaguesData);
  const [selectedDateId, setSelectedDateId] = useState(0); 
  const [showToast, setShowToast] = useState(false);
  const [collapsedLeagues, setCollapsedLeagues] = useState([]);
  const [touchStart, setTouchStart] = useState(null);

  // FIX: Scroll reset automatico
  const scrollContainerRef = useRef(null);
  useEffect(() => { if(scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0; }, [activeTab, selectedMatchDetail]);

  useEffect(() => { localStorage.setItem('monitor_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('monitor_groups', JSON.stringify(ticketGroups)); }, [ticketGroups]);

  // LIVE ENGINE
  useEffect(() => {
    const interval = setInterval(() => {
      setLeagues(prev => prev.map(l => ({ ...l, matches: l.matches.map(m => {
        if (m.status !== 'LIVE') return m;
        let minVal = parseInt(m.minute.replace("'", "")) || 0;
        if (minVal < 90) minVal++;
        let newStats = { ...m.stats };
        if (Math.random() > 0.8) newStats.shots = (newStats.shots || 0) + 1;
        if (Math.random() > 0.95) newStats.corners = (newStats.corners || 0) + 1;
        return { ...m, minute: minVal + "'", stats: newStats };
      }) })));
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  // FIX: Creazione corretta della stringa scommessa (niente "null")
  const handleAddTicket = (match, label, type, line, side, groupName) => {
     // Doppia Chance ora trattata come esito puro
     const isBooleanBet = label === "ESITO" || label === "GOL/NOGOL" || label === "DOPPIA CHANCE";
     const betStr = isBooleanBet ? `${label} ${type}` : `${label} (${side}) ${type} ${line}`;
     setTickets([...tickets, { id: Date.now(), matchId: match.id, bet: betStr, group: groupName }]);
     setShowToast(true);
  };

  const handleToggleGenericMonitor = (match) => {
      const exists = tickets.find(t => t.matchId === match.id && t.bet === "MONITORAGGIO GENERALE");
      if (exists) { setTickets(tickets.filter(t => t.id !== exists.id)); } 
      else { setTickets([...tickets, { id: Date.now(), matchId: match.id, bet: "MONITORAGGIO GENERALE", group: "MONITOR GENERALE" }]); setShowToast(true); }
  };

  // SWIPE LOGIC
  const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchEnd = (e) => {
      if (!touchStart) return;
      const touchEnd = e.changedTouches[0].clientX;
      const delta = touchStart - touchEnd;
      if (delta > 70 && selectedDateId < 7) setSelectedDateId(prev => prev + 1);
      if (delta < -70 && selectedDateId > -7) setSelectedDateId(prev => prev - 1);
      setTouchStart(null);
  };

  const LeagueGroup = ({ title, dataList, variant, isLiveTab }) => (
      <div className="animate-in fade-in">
        {dataList.length > 0 && (
            <div className={`${isLiveTab ? 'sticky top-[56px]' : 'sticky top-[112px]'} z-30 px-3 py-2 text-[9px] font-bold uppercase tracking-widest bg-[#020617] ${variant === 'primary' ? 'text-cyan-400' : 'text-gray-300'}`}>{title}</div>
        )}
        <div className="space-y-0">{dataList.map((league) => (
            <div key={league.id} className="bg-[#0f172a] border-b border-[#334155] last:border-0">
                <div onClick={() => !isLiveTab && setCollapsedLeagues(prev => prev.includes(league.id) ? prev.filter(id => id !== league.id) : [...prev, league.id])} className="flex justify-between items-center px-3 py-2 bg-[#334155] cursor-pointer row-active">
                    <div className="flex items-center gap-3">
                        <Star size={16} onClick={(e) => { e.stopPropagation(); setLeagues(leagues.map(l => l.id === league.id ? { ...l, isPinned: !l.isPinned } : l)); }} className={`cursor-pointer ${league.isPinned ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 hover:text-gray-400'}`} />
                        <img src={`https://flagcdn.com/20x15/${league.country}.png`} alt={league.country} className="w-4 h-3 rounded-[1px] shadow-sm"/><span className="text-xs font-bold text-white uppercase">{league.name}</span>
                    </div>
                    {!isLiveTab && <ChevronDown size={14} className={`text-gray-400 transition-transform ${collapsedLeagues.includes(league.id) ? '-rotate-90' : ''}`} />}
                </div>
                {!collapsedLeagues.includes(league.id) && <div>{league.matches.filter(m => isLiveTab ? m.status === 'LIVE' : (m.dateOffset || 0) === selectedDateId).sort((a,b) => a.time.localeCompare(b.time)).map((match) => (
                    <MatchRow key={match.id} match={match} onClick={() => { setSelectedMatchDetail({ ...match, leagueName: league.name }); }} />
                ))}</div>}
            </div>
        ))}</div>
      </div>
  );

  const getLiveLeagues = (list) => {
      return list.map(l => ({
          ...l,
          matches: l.matches
              .filter(m => m.status === 'LIVE')
              .sort((a, b) => a.time.localeCompare(b.time))
      })).filter(l => l.matches.length > 0);
  };

  const pinnedLeagues = leagues.filter(l => l.isPinned && l.matches.some(m => m.dateOffset === selectedDateId));
  const otherLeagues = leagues.filter(l => !l.isPinned && l.matches.some(m => m.dateOffset === selectedDateId));
  const liveLeagues = getLiveLeagues(leagues);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative overflow-hidden flex flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <ToastNotification message="Aggiunto al Monitor" show={showToast} onClose={() => setShowToast(false)} />
      {/* AGGIUNTA CLASSE E STYLE NO-SCROLLBAR ANCHE QUI + REF PER RESET */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-24 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}> 
          {!selectedMatchDetail && <HomeHeader />}
          {selectedMatchDetail ? (
             <MatchDetailView match={selectedMatchDetail} leagueName={selectedMatchDetail.leagueName} onClose={() => setSelectedMatchDetail(null)} onAddTicket={handleAddTicket} onToggleMonitor={handleToggleGenericMonitor} isMonitored={tickets.some(t => t.matchId === selectedMatchDetail.id && t.bet === "MONITORAGGIO GENERALE")} ticketGroups={ticketGroups} onAddGroup={(n) => setTicketGroups([...ticketGroups, n])} />
          ) : (
            <>
                {activeTab === 'tutte' && (
                    <div className={touchStart ? 'opacity-90' : ''}>
                        <DateBar selectedDateId={selectedDateId} onDateClick={setSelectedDateId} />
                        <LeagueGroup title="MONITORATI" dataList={pinnedLeagues} variant="primary" />
                        <LeagueGroup title="TUTTI I CAMPIONATI" dataList={otherLeagues} variant="default" />
                    </div>
                )}
                {activeTab === 'monitor' && <MonitorView tickets={tickets} ticketGroups={ticketGroups} leagues={leagues} onRemoveTicket={(id) => setTickets(tickets.filter(t => t.id !== id))} onRenameGroup={(o, n) => setTickets(tickets.map(t => t.group === o ? { ...t, group: n } : t))} />}
                
                {activeTab === 'live' && (
                    <div className="pt-0"> 
                        {liveLeagues.length > 0 ? <LeagueGroup title="IN CORSO ORA" dataList={liveLeagues} variant="primary" isLiveTab={true} /> : <div className="flex flex-col items-center justify-center py-20 text-gray-500"><Radio size={40} className="mb-2 opacity-20 text-red-500"/><span className="text-xs uppercase font-bold tracking-widest opacity-50">Nessuna partita in corso</span></div>}
                    </div>
                )}
            </>
          )}
      </div>
      <div className="fixed bottom-0 w-full bg-[#0f172a] border-t border-[#1e293b] h-[70px] z-[100]"><div className="relative w-full h-full flex justify-between px-2"><div className="flex w-2/5 justify-around items-center h-full pt-2"><div onClick={() => { setActiveTab('tutte'); setSelectedMatchDetail(null); }} className={`flex flex-col items-center gap-1 cursor-pointer w-full btn-active ${activeTab === 'tutte' && !selectedMatchDetail ? 'opacity-100 text-white' : 'opacity-40 text-gray-500'}`}><Calendar size={20} /> <span className="text-[9px] font-bold">Tutte</span></div><div onClick={() => { setActiveTab('live'); setSelectedMatchDetail(null); }} className={`flex flex-col items-center gap-1 cursor-pointer w-full btn-active ${activeTab === 'live' ? 'opacity-100 text-red-500' : 'opacity-40 text-gray-500'}`}><Radio size={20} /> <span className="text-[9px] font-bold">Live</span></div></div><div onClick={() => { setActiveTab('monitor'); setSelectedMatchDetail(null); }} className="absolute left-0 right-0 mx-auto w-16 -top-2 flex flex-col items-center cursor-pointer z-50 btn-active"><div className={`w-14 h-14 rounded-full border-[6px] border-[#0f172a] shadow-xl flex items-center justify-center transition-transform active:scale-95 ${activeTab === 'monitor' ? 'bg-cyan-500 text-black' : 'bg-[#1e293b] text-gray-400'}`}><BarChart2 size={24} strokeWidth={2.5} /></div><span className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${activeTab === 'monitor' ? 'text-cyan-400' : 'text-gray-500'}`}>Monitor</span></div><div className="flex w-2/5 justify-around items-center h-full pt-2"><div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 text-gray-500 btn-active"><History size={20} /> <span className="text-[9px] font-bold">Storico</span></div><div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 text-gray-500 btn-active"><Trophy size={20} /> <span className="text-[9px] font-bold">Classifica</span></div></div></div></div>
    </div>
  );
}