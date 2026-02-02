import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, X, ChevronDown, Calendar, Search, ArrowLeft, BarChart2, History, Trophy, Radio, User, CircleDashed, Star, Bell, MonitorPlay, Check, Ticket, Save, AlertCircle, Edit2 } from 'lucide-react';

// --- STILI CSS GLOBALI ---
const globalStyles = `
  * { -ms-overflow-style: none; scrollbar-width: none; }
  *::-webkit-scrollbar { display: none; }
  body { background-color: #0f172a; color: white; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
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

// --- GENERATORE DATE ---
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

// --- CONFIGURAZIONE STATISTICHE ---
const STAT_CATEGORIES = [
  { id: 'goals', label: 'GOL', lines: [0.5, 1.5, 2.5, 3.5, 4.5] },
  { id: 'corners', label: 'CORNER', lines: [7.5, 8.5, 9.5, 10.5, 11.5, 12.5] },
  { id: 'yellow_cards', label: 'CARTELLINI', lines: [2.5, 3.5, 4.5, 5.5] },
  { id: 'red_cards', label: 'ROSSI', lines: [0.5] },
  { id: 'shots', label: 'TIRI', lines: [18.5, 19.5, 20.5, 21.5, 22.5] },
  { id: 'shots_og', label: 'TIRI PORTA', lines: [6.5, 7.5, 8.5, 9.5] },
];

// --- DATI ---
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

// --- COMPONENTI UI ---

const ToastNotification = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) { const timer = setTimeout(onClose, 2000); return () => clearTimeout(timer); }
    }, [show, onClose]);
    if (!show) return null;
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-cyan-500 text-black px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
            <Check size={16} strokeWidth={3} />
            <span className="text-xs font-bold">{message}</span>
        </div>
    );
};

const HomeHeader = () => (
  <div className="bg-[#1e293b] px-4 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-[#334155]">
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
    <div className="bg-[#0f172a] border-b border-[#1e293b] h-[55px] flex items-center sticky top-[57px] z-40 shadow-lg">
        <div ref={scrollContainerRef} className="flex w-full overflow-x-auto no-scrollbar items-center px-2 gap-1">
            {dateList.map((d) => {
                const isSelected = selectedDateId === d.id;
                return (
                    <div key={d.id} ref={(node) => { if (node) itemsRef.current.set(d.id, node); else itemsRef.current.delete(d.id); }}
                        onClick={() => handleClick(d.id)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[50px] h-[40px] cursor-pointer transition-colors rounded-none border-b-2 ${isSelected ? 'bg-[#1e293b] border-cyan-400' : 'bg-transparent border-transparent text-gray-500'}`}>
                        <span className={`text-[10px] font-bold uppercase leading-none mb-1 ${isSelected ? 'text-white' : ''}`}>{d.label}</span>
                        <span className={`text-[9px] font-mono leading-none ${isSelected ? 'text-cyan-400' : ''}`}>{d.date}</span>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

// --- MATCH ROW ---
const MatchRow = ({ match, onClick }) => {
    const isLive = match.status === 'LIVE';
    const isPre = match.status === 'NS';
    const isPost = match.status === 'FT';

    return (
        <div onClick={onClick} className="flex items-center py-3 px-3 hover:bg-[#25334d] cursor-pointer border-t border-[#334155] bg-[#1e293b]">
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
                    <div className="flex flex-col items-end gap-1.5 w-4">
                        <span className={`text-sm leading-none ${isLive ? 'text-cyan-400 font-bold' : (isPost && match.score[0] > match.score[1] ? 'font-bold text-white' : 'text-gray-400')}`}>{match.score[0]}</span>
                        <span className={`text-sm leading-none ${isLive ? 'text-cyan-400 font-bold' : (isPost && match.score[1] > match.score[0] ? 'font-bold text-white' : 'text-gray-400')}`}>{match.score[1]}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- WIDGET PRINCIPALE (1X2, DC) nel Header ---
const MainBettingWidget = ({ onAdd, ticketGroups, onAddGroup }) => {
    const [selectedGroup, setSelectedGroup] = useState(ticketGroups[0]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const handleGroupChange = (e) => { const val = e.target.value; if (val === "___NEW___") { setIsCreatingGroup(true); setNewGroupName(""); } else { setSelectedGroup(val); } };
    const saveNewGroup = () => { if (newGroupName.trim() !== "") { onAddGroup(newGroupName); setSelectedGroup(newGroupName); setIsCreatingGroup(false); } else { setIsCreatingGroup(false); }};

    return (
        <div className="bg-[#1e293b] p-4 border-b border-[#334155] animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-end items-center mb-3">
               <div className="flex items-center gap-1 bg-[#0f172a] px-2 py-1 rounded border border-[#334155] max-w-[140px]">
                  <Ticket size={10} className="text-gray-500 flex-shrink-0"/>
                  {isCreatingGroup ? (
                      <div className="flex items-center w-full"><input autoFocus type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onBlur={saveNewGroup} onKeyDown={(e) => e.key === 'Enter' && saveNewGroup()} placeholder="Nome..." className="w-full bg-transparent text-[9px] text-white focus:outline-none placeholder-gray-600"/><Save size={10} className="text-cyan-500 cursor-pointer ml-1" onClick={saveNewGroup}/></div>
                  ) : (
                      <div className="relative w-full">
                          <select value={selectedGroup} onChange={handleGroupChange} className="w-full bg-transparent text-[9px] text-gray-400 font-bold appearance-none focus:outline-none pr-3">
                              <option value="MONITOR GENERALE">MONITOR GENERALE</option>
                              <option value="___NEW___" className="text-cyan-400 font-bold">+ NUOVO MONITOR</option>
                              {ticketGroups.filter(g => g !== "MONITOR GENERALE").map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute top-0 right-0 h-full pointer-events-none text-gray-500 flex items-center"/>
                      </div>
                  )}
              </div>
            </div>
            <div className="space-y-2">
               <div className="flex gap-2">
                   {["1", "X", "2"].map(sign => (
                       <button key={sign} onClick={() => onAdd("ESITO", sign, null, "Finale", selectedGroup)} className="flex-1 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-white font-bold py-3 rounded text-xs transition-colors">{sign}</button>
                   ))}
               </div>
               <div className="flex gap-2">
                   {["1X", "12", "X2"].map(sign => (
                       <button key={sign} onClick={() => onAdd("DOPPIA CHANCE", sign, null, "Finale", selectedGroup)} className="flex-1 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-gray-300 font-bold py-2 rounded text-[10px] transition-colors">{sign}</button>
                   ))}
               </div>
           </div>
        </div>
    );
};

// --- WIDGET SCOMMESSA (STATISTICHE + GG/NG) ---
const InlineBettingWidget = ({ statDef, activeContext, onAdd, ticketGroups, onAddGroup }) => {
  const [betType, setBetType] = useState("Over");
  const [selectedLine, setSelectedLine] = useState(statDef.lines[0]);
  const [selectedGroup, setSelectedGroup] = useState(ticketGroups[0]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const handleGroupChange = (e) => { const val = e.target.value; if (val === "___NEW___") { setIsCreatingGroup(true); setNewGroupName(""); } else { setSelectedGroup(val); } };
  const saveNewGroup = () => { if (newGroupName.trim() !== "") { onAddGroup(newGroupName); setSelectedGroup(newGroupName); setIsCreatingGroup(false); } else { setIsCreatingGroup(false); }};
  
  return (
    <div className="bg-[#1e293b] py-3 px-4 border-t border-[#334155] shadow-inner animate-in slide-in-from-top-1">
       <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
             <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
             <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">{statDef.label} <span className="text-gray-500">•</span> <span className="text-white">{activeContext.side}</span></span>
          </div>
          <div className="flex items-center gap-1 bg-[#0f172a] px-2 py-1 rounded border border-[#334155] max-w-[140px]">
              <Ticket size={10} className="text-gray-500 flex-shrink-0"/>
              {isCreatingGroup ? (
                  <div className="flex items-center w-full"><input autoFocus type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onBlur={saveNewGroup} onKeyDown={(e) => e.key === 'Enter' && saveNewGroup()} placeholder="Nome..." className="w-full bg-transparent text-[9px] text-white focus:outline-none placeholder-gray-600"/><Save size={10} className="text-cyan-500 cursor-pointer ml-1" onClick={saveNewGroup}/></div>
              ) : (
                  <div className="relative w-full">
                      <select value={selectedGroup} onChange={handleGroupChange} className="w-full bg-transparent text-[9px] text-gray-400 font-bold appearance-none focus:outline-none pr-3">
                          <option value="MONITOR GENERALE">MONITOR GENERALE</option>
                          <option value="___NEW___" className="text-cyan-400 font-bold">+ NUOVO MONITOR</option>
                          {ticketGroups.filter(g => g !== "MONITOR GENERALE").map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute top-0 right-0 h-full pointer-events-none text-gray-500 flex items-center"/>
                  </div>
              )}
          </div>
       </div>
       <div className="flex items-center justify-between gap-3 h-10">
          <div className="flex flex-1 bg-[#0f172a] rounded-md p-1 border border-[#334155] h-full">
              <button onClick={() => setBetType("Under")} className={`flex-1 rounded-[4px] font-bold text-[11px] uppercase transition-all flex flex-col justify-center items-center leading-none ${betType === 'Under' ? 'bg-[#334155] text-white shadow-sm border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}>Und</button>
              <button onClick={() => setBetType("Over")} className={`flex-1 rounded-[4px] font-bold text-[11px] uppercase transition-all flex flex-col justify-center items-center leading-none ${betType === 'Over' ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Ovr</button>
          </div>
          <div className="relative h-full w-20">
              <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} className="w-full h-full bg-[#0f172a] text-white font-bold text-lg text-center appearance-none rounded-md border border-[#334155] focus:border-cyan-500 focus:outline-none">{statDef.lines.map(line => <option key={line} value={line}>{line}</option>)}</select>
              <ChevronDown size={14} className="absolute top-0 right-1 h-full pointer-events-none text-gray-500 flex items-center"/>
          </div>
          <button onClick={() => onAdd(statDef.label, betType, selectedLine, activeContext.side, selectedGroup)} className="h-full aspect-square bg-cyan-500 hover:bg-cyan-400 text-black rounded-md flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <Plus size={24} strokeWidth={3} />
          </button>
       </div>

       {statDef.id === 'goals' && activeContext.side === 'Totale' && (
           <div className="mt-3 pt-3 border-t border-[#334155] flex gap-2">
               <button onClick={() => onAdd("GOL/NOGOL", "GG", null, "Entrambe", selectedGroup)} className="flex-1 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-white font-bold py-2 rounded text-[10px] transition-colors">GOAL</button>
               <button onClick={() => onAdd("GOL/NOGOL", "NG", null, "Entrambe", selectedGroup)} className="flex-1 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-white font-bold py-2 rounded text-[10px] transition-colors">NO GOAL</button>
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
    <div className="border-b border-[#334155] last:border-0">
      <div className={`py-4 px-4 ${isExpanded ? 'bg-[#1e293b]' : 'bg-[#0f172a] hover:bg-[#172033] transition-colors'}`}>
          <div className="flex justify-between items-center mb-2 text-sm font-medium">
              <div onClick={() => onExpand(statDef.id, "Casa", homeVal)} className={`w-12 text-center py-1 rounded cursor-pointer transition-colors ${isExpanded && activeContext.side === 'Casa' ? 'bg-cyan-900 text-white border border-cyan-600' : 'text-white font-bold'}`}>{homeVal}</div>
              <div onClick={() => onExpand(statDef.id, "Totale", total)} className={`flex-1 text-center text-[10px] uppercase tracking-widest font-bold cursor-pointer py-1 rounded transition-colors ${isExpanded && activeContext.side === 'Totale' ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-300'}`}>{statDef.label}</div>
              <div onClick={() => onExpand(statDef.id, "Ospite", awayVal)} className={`w-12 text-center py-1 rounded cursor-pointer transition-colors ${isExpanded && activeContext.side === 'Ospite' ? 'bg-cyan-900 text-white border border-cyan-600' : 'text-white font-bold'}`}>{awayVal}</div>
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
    <div className="pb-24 bg-[#0f172a] min-h-screen relative z-30 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="bg-[#1e293b] sticky top-0 z-50 border-b border-[#334155] flex justify-between items-center p-4 shadow-md">
         <ArrowLeft className="text-gray-400 cursor-pointer hover:text-white" onClick={onClose} />
         <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer" />
            <Star size={22} className={`cursor-pointer transition-all active:scale-90 ${isMonitored ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-white'}`} onClick={() => onToggleMonitor(match)}/>
         </div>
      </div>
      <div className="bg-[#1e293b] text-center py-1.5 border-b border-[#334155]"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{leagueName} • {match.round || "Giornata --"}</span></div>
      
      <div className="bg-[#1e293b] px-6 py-6 flex justify-between items-center border-b border-[#334155]">
            <div className="flex flex-col items-center w-1/3"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xl text-white font-bold border-2 border-[#334155] mb-2 shadow-lg" style={{ borderColor: match.colors ? match.colors[0] : '#333' }}>{match.teams[0].substring(0,1)}</div><span className="text-sm font-bold text-white text-center leading-tight">{match.teams[0]}</span></div>
            
            <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform p-2 rounded hover:bg-[#334155]" onClick={() => setShowMainBets(!showMainBets)}>
                <div className="text-3xl font-black text-white tracking-widest mb-1">{match.score[0]} - {match.score[1]}</div>
                <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${match.status === 'LIVE' ? 'bg-gray-600 text-white' : 'bg-[#334155] text-gray-400'}`}>{match.minute !== '-' ? match.minute : match.time}</div>
            </div>

            <div className="flex flex-col items-center w-1/3"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xl text-white font-bold border-2 border-[#334155] mb-2 shadow-lg" style={{ borderColor: match.colors ? match.colors[1] : '#333' }}>{match.teams[1].substring(0,1)}</div><span className="text-sm font-bold text-white text-center leading-tight">{match.teams[1]}</span></div>
      </div>

      {showMainBets && <MainBettingWidget onAdd={handleAddMainBet} ticketGroups={ticketGroups} onAddGroup={onAddGroup} />}

      <div className="bg-[#0f172a] border-b border-[#334155] sticky top-[60px] z-40 shadow-lg">
          <div className="flex overflow-x-auto no-scrollbar">{TABS.map(tab => (<div key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border-b-2 ${activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>{tab}</div>))}</div>
      </div>
      <div className="flex-1 bg-[#0f172a]">
          {activeTab === "STATISTICHE" && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="border-t border-[#334155]">
                      {STAT_CATEGORIES.map(cat => (
                          <StatRow key={cat.id} statDef={cat} homeVal={mockStats[cat.id][0]} awayVal={mockStats[cat.id][1]} isExpanded={expandedStatId === cat.id} activeContext={activeContext} onExpand={toggleExpand} colors={match.colors} ticketGroups={ticketGroups} onAddGroup={onAddGroup} />
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
        if (group === "MONITOR GENERALE") return; // BLOCK EDIT
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
        let icon = null;

        if (statusColor === 'yellow') {
            dotStyle = "border-yellow-500 bg-yellow-900 animate-pulse";
        } else if (statusColor === 'green') {
            dotStyle = "border-green-500 bg-green-600";
            icon = <Check size={8} className="text-white" strokeWidth={4}/>;
        } else if (statusColor === 'red') {
            dotStyle = "border-red-500 bg-red-600";
            icon = <X size={8} className="text-white" strokeWidth={4}/>;
        }

        return (
            <div className={`w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center z-10 ${dotStyle}`}>
                {icon}
            </div>
        );
    };

    return (
        <div className="pb-24 px-0"> 
            {ticketGroups.map(group => {
                const groupTickets = tickets.filter(t => t.group === group);
                if (groupTickets.length === 0) return null;
                
                const matchesInGroup = {};
                groupTickets.forEach(t => { if (!matchesInGroup[t.matchId]) matchesInGroup[t.matchId] = []; matchesInGroup[t.matchId].push(t); });
                
                let matchList = Object.keys(matchesInGroup).map(matchId => {
                    const matchData = getMatchData(parseInt(matchId));
                    if (!matchData) return null;
                    return { ...matchData, tickets: matchesInGroup[matchId] };
                }).filter(m => m !== null);

                matchList.sort((a, b) => a.time.localeCompare(b.time));

                const totalEvents = groupTickets.length;
                const liveEvents = groupTickets.filter(t => { const m = getMatchData(t.matchId); return m && m.status === 'LIVE'; }).length;

                return (
                    <div key={group} className="animate-in fade-in mb-1">
                         <div className="px-3 py-1 border-b border-[#1e293b] bg-[#020617] flex justify-between items-center shadow-sm">
                             {editingGroup === group ? (
                                 <div className="flex items-center gap-2 w-full max-w-[200px]">
                                     <input 
                                        autoFocus
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="bg-transparent text-[9px] font-bold text-cyan-400 uppercase tracking-widest outline-none border-b border-cyan-500 w-full"
                                        onKeyDown={(e) => { if(e.key === 'Enter') saveEdit(); if(e.key === 'Escape') cancelEdit(); }}
                                        onBlur={saveEdit}
                                     />
                                     <Check size={12} className="text-green-500 cursor-pointer" onClick={saveEdit}/>
                                 </div>
                             ) : (
                                <span 
                                    onClick={() => startEdit(group)} 
                                    className={`text-[9px] font-bold text-cyan-400 uppercase tracking-widest ${group !== "MONITOR GENERALE" ? 'cursor-pointer hover:text-cyan-300 hover:underline decoration-dashed underline-offset-4' : 'cursor-default'}`}>
                                    {group}
                                </span>
                             )}
                             
                             <div className="flex gap-1">
                                 {liveEvents > 0 && (<div className="bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center shadow-sm">{liveEvents}</div>)}
                                 <div className="bg-[#1e293b] text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center border border-[#334155]">{totalEvents}</div>
                             </div>
                         </div>

                         <div className="space-y-0">
                             {matchList.map(matchData => {
                                 const specificBets = matchData.tickets.filter(t => t.bet !== "MONITORAGGIO GENERALE");
                                 const isNS = matchData.status === 'NS';
                                 const isFT = matchData.status === 'FT';
                                 const isLive = matchData.status === 'LIVE';

                                 return (
                                     <div key={matchData.id} className="bg-[#1e293b] border-b border-[#334155] last:border-0 rounded-none">
                                         
                                         <div className="flex items-center justify-between py-1.5 px-3 bg-[#1e293b] border-b border-[#334155]">
                                             <div className="flex items-center gap-3 h-full">
                                                 <div className={`px-1.5 py-0.5 rounded-sm ${isLive ? 'bg-cyan-500 text-black' : 'bg-gray-600 text-gray-300'} text-[10px] font-bold font-mono min-w-[35px] text-center`}>
                                                     {isNS ? matchData.time : (isLive ? matchData.minute : 'FIN')}
                                                 </div>
                                                 <div className="h-full flex items-center gap-2 text-sm text-white">
                                                     <span className="font-normal uppercase tracking-tight text-[13px]">{matchData.teams[0]} - {matchData.teams[1]}</span>
                                                     {!isNS && (
                                                         <span className={`font-mono font-bold ml-1 ${isLive ? 'text-cyan-400' : 'text-white'}`}>
                                                             {isFT ? (
                                                                 <>
                                                                     <span className={matchData.score[0] > matchData.score[1] ? 'font-black' : 'font-normal'}>{matchData.score[0]}</span>
                                                                     -
                                                                     <span className={matchData.score[1] > matchData.score[0] ? 'font-black' : 'font-normal'}>{matchData.score[1]}</span>
                                                                 </>
                                                             ) : ( `${matchData.score[0]}-${matchData.score[1]}` )}
                                                         </span>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="bg-[#0f172a]">
                                             <div className="space-y-0"> 
                                                 {specificBets.map((bet, index) => {
                                                     const { pct, current, target, statusColor, isBoolean } = calculateProgress(bet.bet, matchData);
                                                     const displayLabel = bet.bet.replace(' (Totale)', '').replace(' (Finale)', '').replace(' (Entrambe)', '');
                                                     
                                                     return (
                                                         <div key={bet.id} className="flex items-center py-3 px-3 group relative z-10">
                                                             
                                                             <div className="flex items-center justify-center w-[35px] flex-shrink-0">
                                                                 <TimelineDot statusColor={statusColor} />
                                                             </div>

                                                             <div className="flex-1 flex flex-col justify-center mx-3">
                                                                 <div className="flex justify-between items-end mb-1">
                                                                     <span className={`text-[11px] font-bold leading-tight ${isNS ? 'text-gray-500' : 'text-gray-300'}`}>{displayLabel}</span>
                                                                     {!isNS && (
                                                                         <span className="text-[10px] font-mono font-bold text-gray-400">
                                                                             {isBoolean ? (statusColor === 'green' ? "WIN" : current) : `${current} / ${target}`}
                                                                         </span>
                                                                     )}
                                                                 </div>
                                                                 
                                                                 {!isNS ? (
                                                                     <div className="h-[3px] bg-[#1e293b] w-full rounded-full overflow-hidden">
                                                                         <div className="h-full bg-gray-400" style={{ width: `${pct}%` }}></div>
                                                                     </div>
                                                                 ) : (
                                                                     <div className="h-[3px] bg-[#1e293b] w-full rounded-full opacity-50"></div>
                                                                 )}
                                                             </div>

                                                             <div className="flex-shrink-0 ml-1">
                                                                 <Trash2 size={13} className="text-gray-600 hover:text-red-500 cursor-pointer" onClick={() => onRemoveTicket(bet.id)}/>
                                                             </div>
                                                         </div>
                                                     );
                                                 })}
                                             </div>
                                         </div>

                                     </div>
                                 );
                             })}
                         </div>
                    </div>
                );
            })}
            {tickets.length === 0 && <div className="text-center text-gray-500 py-20 flex flex-col items-center"><Ticket size={40} className="mb-2 opacity-20"/><span className="text-xs uppercase font-bold tracking-widest opacity-50">Nessuna scommessa attiva</span></div>}
        </div>
    );
};

// --- APP PRINCIPALE ---
export default function App() {
  const [activeTab, setActiveTab] = useState("tutte");
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  
  const [tickets, setTickets] = useState(() => {
      const saved = localStorage.getItem('monitor_tickets');
      return saved ? JSON.parse(saved) : [
          { id: 1, matchId: 504, matchTeams: "Arsenal - Liverpool", bet: "CORNER (Totale) Under 7.5", group: "MONITOR GENERALE", status: 'FT' }, 
          { id: 2, matchId: 505, matchTeams: "Man City - Chelsea", bet: "GOL (Totale) Over 1.5", group: "MONITOR GENERALE", status: 'LIVE' }, 
          { id: 5, matchId: 505, matchTeams: "Man City - Chelsea", bet: "CORNER (Totale) Over 9.5", group: "MONITOR GENERALE", status: 'LIVE' }, 
          { id: 3, matchId: 506, matchTeams: "Man Utd - Tottenham", bet: "TIRI (Totale) Over 20.5", group: "MONITOR GENERALE", status: 'NS' }, 
          { id: 4, matchId: 507, matchTeams: "Aston Villa - Everton", bet: "CARTELLINI (Totale) Under 4.5", group: "MONITOR GENERALE", status: 'FT' }, 
      ];
  });

  const [ticketGroups, setTicketGroups] = useState(() => {
      const saved = localStorage.getItem('monitor_groups');
      return saved ? JSON.parse(saved) : ["MONITOR GENERALE"];
  });

  const [leagues, setLeagues] = useState(initialLeaguesData);
  const [selectedDateId, setSelectedDateId] = useState(0); 
  const [showToast, setShowToast] = useState(false);
  const [collapsedLeagues, setCollapsedLeagues] = useState([]);

  useEffect(() => { localStorage.setItem('monitor_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('monitor_groups', JSON.stringify(ticketGroups)); }, [ticketGroups]);

  // --- LIVE ENGINE ---
  useEffect(() => {
    const interval = setInterval(() => {
      setLeagues(currentLeagues => {
        return currentLeagues.map(league => ({
          ...league,
          matches: league.matches.map(match => {
            if (match.status !== 'LIVE') return match;
            let newMinute = match.minute;
            if (newMinute.includes("+")) return match; 
            let minVal = parseInt(newMinute.replace("'", ""));
            if (minVal < 90) minVal++;
            newMinute = minVal + "'";
            let newStats = { ...match.stats };
            let newScore = [...match.score];
            if (Math.random() > 0.7) newStats.shots = (newStats.shots || 0) + 1;
            if (Math.random() > 0.92) newStats.corners = (newStats.corners || 0) + 1;
            if (Math.random() > 0.98) { if (Math.random() > 0.5) newScore[0]++; else newScore[1]++; }
            return { ...match, minute: newMinute, stats: newStats, score: newScore };
          })
        }));
      });
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { const style = document.createElement('style'); style.innerHTML = globalStyles; document.head.appendChild(style); return () => document.head.removeChild(style); }, []);

  const handleAddTicket = (match, label, type, line, side, groupName) => {
     const betStr = (label === "ESITO" || label === "GOL/NOGOL" || label === "DOPPIA CHANCE") 
        ? `${label} ${type}` 
        : `${label} (${side}) ${type} ${line}`;
        
     const newTicket = { id: Date.now(), matchId: match.id, matchTeams: `${match.teams[0]} - ${match.teams[1]}`, bet: betStr, group: groupName, status: 'pending' };
     setTickets([...tickets, newTicket]);
     setShowToast(true);
  };
  const handleToggleGenericMonitor = (match) => {
      const exists = tickets.find(t => t.matchId === match.id && t.bet === "MONITORAGGIO GENERALE");
      if (exists) setTickets(tickets.filter(t => t.id !== exists.id));
      else { setTickets([...tickets, { id: Date.now(), matchId: match.id, matchTeams: `${match.teams[0]} - ${match.teams[1]}`, bet: `MONITORAGGIO GENERALE`, group: "MONITOR GENERALE", status: 'live' }]); setShowToast(true); }
  };
  const handleAddGroup = (newGroup) => setTicketGroups([...ticketGroups, newGroup]);
  
  const handleRenameGroup = (oldName, newName) => {
      if (!newName.trim() || oldName === newName) return;
      setTicketGroups(groups => groups.map(g => g === oldName ? newName : g));
      setTickets(prev => prev.map(t => t.group === oldName ? { ...t, group: newName } : t));
  };

  const handleRemoveTicket = (id) => setTickets(tickets.filter(t => t.id !== id));
  const handleDateClick = (id) => setSelectedDateId(id);
  
  const getLeaguesForCurrentDate = (list) => { 
      return list.map(l => ({ 
          ...l, 
          matches: l.matches
              .filter(m => (m.dateOffset || 0) === selectedDateId)
              .sort((a, b) => a.time.localeCompare(b.time))
      })).filter(l => l.matches.length > 0); 
  };

  // --- LOGICA FILTRO LIVE (AGGIUNTA) ---
  const getLiveLeagues = (list) => {
      return list.map(l => ({
          ...l,
          matches: l.matches
              .filter(m => m.status === 'LIVE')
              .sort((a, b) => a.time.localeCompare(b.time))
      })).filter(l => l.matches.length > 0);
  };

  const togglePinLeague = (e, leagueId) => { e.stopPropagation(); setLeagues(leagues.map(l => l.id === leagueId ? { ...l, isPinned: !l.isPinned } : l)); };
  const toggleLeagueCollapse = (leagueId) => {
     if (collapsedLeagues.includes(leagueId)) { setCollapsedLeagues(collapsedLeagues.filter(id => id !== leagueId)); } else { setCollapsedLeagues([...collapsedLeagues, leagueId]); }
  };
  const openDetail = (match) => { const league = leagues.find(l => l.matches.some(m => m.id === match.id)); setSelectedMatchDetail({ ...match, leagueName: league ? league.name : "CAMPIONATO" }); };
  const pinnedLeagues = getLeaguesForCurrentDate(leagues.filter(l => l.isPinned));
  const otherLeagues = getLeaguesForCurrentDate(leagues.filter(l => !l.isPinned));
  const liveLeagues = getLiveLeagues(leagues); // Calcolo leghe live

  const LeagueGroup = ({ title, dataList, variant }) => (
      <div className="animate-in fade-in">
        {dataList.length > 0 && title && (
        <div className={`sticky top-[112px] z-30 px-3 py-2 text-[9px] font-bold uppercase tracking-widest shadow-sm bg-[#020617] ${variant === 'primary' ? 'text-cyan-400' : 'text-gray-300'}`}>{title}</div>
      )}<div className="space-y-0">{dataList.map((league) => {
          const isCollapsed = collapsedLeagues.includes(league.id);
          return (
            <div key={league.id} className="bg-[#0f172a] border-b border-[#334155] last:border-0">
                <div onClick={() => toggleLeagueCollapse(league.id)} className="flex justify-between items-center px-3 py-2 bg-[#334155] hover:bg-[#3d4e6b] cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Star size={16} onClick={(e) => { e.stopPropagation(); togglePinLeague(e, league.id); }} className={`cursor-pointer ${league.isPinned ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 hover:text-gray-400'}`} />
                        <img src={`https://flagcdn.com/20x15/${league.country}.png`} alt={league.country} className="w-4 h-3 rounded-[1px] shadow-sm"/>
                        <span className="text-xs font-bold text-white uppercase">{league.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                    </div>
                </div>
                {!isCollapsed && (
                    <div>{league.matches.map((match) => (
                        <MatchRow key={match.id} match={match} onClick={() => openDetail(match)} />
                    ))}</div>
                )}
            </div>
          );
      })}</div></div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative overflow-hidden flex flex-col">
      <ToastNotification message="Aggiunto al Monitor" show={showToast} onClose={() => setShowToast(false)} />
      <div className="flex-1 overflow-y-auto pb-24"> 
          {!selectedMatchDetail && <HomeHeader />}
          {selectedMatchDetail ? (
             <MatchDetailView match={selectedMatchDetail} leagueName={selectedMatchDetail.leagueName} onClose={() => setSelectedMatchDetail(null)} onAddTicket={handleAddTicket} onToggleMonitor={handleToggleGenericMonitor} isMonitored={tickets.some(t => t.matchId === selectedMatchDetail.id && t.bet === "MONITORAGGIO GENERALE")} ticketGroups={ticketGroups} onAddGroup={handleAddGroup} />
          ) : (
            <>
                {activeTab === 'tutte' && (
                    <>
                        <DateBar selectedDateId={selectedDateId} onDateClick={handleDateClick} />
                        {(pinnedLeagues.length === 0 && otherLeagues.length === 0) ? (<div className="flex flex-col items-center justify-center py-20 text-gray-500"><Calendar size={40} className="mb-2 opacity-20"/><span className="text-xs uppercase font-bold tracking-widest opacity-50">Nessuna partita</span></div>) : (<><LeagueGroup title="MONITORATI" dataList={pinnedLeagues} variant="primary" /><LeagueGroup title="TUTTI I CAMPIONATI" dataList={otherLeagues} variant="default" /></>)}
                    </>
                )}
                {activeTab === 'monitor' && <MonitorView tickets={tickets} ticketGroups={ticketGroups} leagues={leagues} onRemoveTicket={handleRemoveTicket} onRenameGroup={handleRenameGroup} />}
                
                {/* MODIFICATO: Renderizzazione effettiva della TAB LIVE */}
                {activeTab === 'live' && (
                    <>
                        {liveLeagues.length > 0 ? (
                            <LeagueGroup title="IN CORSO ORA" dataList={liveLeagues} variant="primary" />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-in fade-in">
                                <Radio size={40} className="mb-2 opacity-20 text-red-500"/>
                                <span className="text-xs uppercase font-bold tracking-widest opacity-50">Nessuna partita in corso</span>
                            </div>
                        )}
                    </>
                )}
            </>
          )}
      </div>
      <div className="fixed bottom-0 w-full bg-[#0f172a] border-t border-[#1e293b] h-[70px] z-[100]"><div className="relative w-full h-full flex justify-between px-2"><div className="flex w-2/5 justify-around items-center h-full pt-2"><div onClick={() => { setActiveTab('tutte'); setSelectedMatchDetail(null); }} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'tutte' && !selectedMatchDetail ? 'opacity-100 text-white' : 'opacity-40 text-gray-500'}`}><Calendar size={20} /> <span className="text-[9px] font-bold">Tutte</span></div><div onClick={() => { setActiveTab('live'); setSelectedMatchDetail(null); }} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'live' ? 'opacity-100 text-red-500' : 'opacity-40 text-gray-500'}`}><Radio size={20} /> <span className="text-[9px] font-bold">Live</span></div></div><div onClick={() => { setActiveTab('monitor'); setSelectedMatchDetail(null); }} className="absolute left-0 right-0 mx-auto w-16 -top-2 flex flex-col items-center cursor-pointer z-50"><div className={`w-14 h-14 rounded-full border-[6px] border-[#0f172a] shadow-xl flex items-center justify-center transition-transform active:scale-95 ${activeTab === 'monitor' ? 'bg-cyan-500 text-black' : 'bg-[#1e293b] text-gray-400'}`}><BarChart2 size={24} strokeWidth={2.5} /></div><span className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${activeTab === 'monitor' ? 'text-cyan-400' : 'text-gray-500'}`}>Monitor</span></div><div className="flex w-2/5 justify-around items-center h-full pt-2"><div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 text-gray-500"><History size={20} /> <span className="text-[9px] font-bold">Storico</span></div><div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 text-gray-500"><Trophy size={20} /> <span className="text-[9px] font-bold">Classifica</span></div></div></div></div>
    </div>
  );
}