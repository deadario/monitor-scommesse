import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, X, ChevronDown, Calendar, Search, ArrowLeft, BarChart2, History, Trophy, Radio, User, CircleDashed, Star, Bell, MonitorPlay, Check, Ticket, Save } from 'lucide-react';

// --- STILI CSS GLOBALI ---
const globalStyles = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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
  { id: 'yellow_cards', label: 'CARTELLINI GIALLI', lines: [2.5, 3.5, 4.5, 5.5] },
  { id: 'red_cards', label: 'CARTELLINI ROSSI', lines: [0.5] },
  { id: 'shots', label: 'TIRI TOTALI', lines: [18.5, 19.5, 20.5, 21.5, 22.5] },
  { id: 'shots_og', label: 'TIRI IN PORTA', lines: [6.5, 7.5, 8.5, 9.5] },
];

// --- DATI ---
const initialLeaguesData = [
  {
    id: "L1", name: "SERIE A", country: "it", isPinned: true,
    matches: [
      { id: 501, dateOffset: 0, teams: ["Inter", "Milan"], time: "20:45", status: "LIVE", minute: "'82", score: [1, 0], round: "GIORNATA 23", colors: ['#3b82f6', '#ef4444'] },
      { id: 502, dateOffset: 0, teams: ["Napoli", "Juventus"], time: "18:00", status: "NS", minute: "-", score: [0, 0], round: "GIORNATA 23", colors: ['#0ea5e9', '#9ca3af'] },
    ]
  },
  {
    id: "L2", name: "PREMIER LEAGUE", country: "gb-eng", isPinned: true,
    matches: [
      { id: 504, dateOffset: 0, teams: ["Arsenal", "Liverpool"], time: "16:00", status: "FT", minute: "FIN", score: [2, 2], round: "GIORNATA 21", colors: ['#ef4444', '#dc2626'] },
    ]
  },
  {
    id: "L3", name: "LIGA", country: "es", isPinned: false, 
    matches: [
      { id: 605, dateOffset: 0, teams: ["Real Madrid", "Betis"], time: "21:00", status: "NS", minute: "-", score: [0, 0], round: "GIORNATA 19", colors: ['#f3f4f6', '#16a34a'] } 
    ]
  },
  {
    id: "L4", name: "BUNDESLIGA", country: "de", isPinned: false, 
    matches: [
      { id: 601, dateOffset: 1, teams: ["Bayern", "Dortmund"], time: "15:30", status: "NS", minute: "-", score: [0, 0], round: "GIORNATA 20", colors: ['#dc2626', '#eab308'] } 
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-black px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
            <Check size={16} strokeWidth={3} />
            <span className="text-xs font-bold">{message}</span>
        </div>
    );
};

const HomeHeader = () => (
  <div className="bg-[#18181b] px-4 py-3 flex justify-between items-center sticky top-0 z-20 border-b border-[#27272a]">
      <div className="flex items-center gap-1">
          <div className="bg-[#27272a] p-1.5 rounded-full"><CircleDashed size={18} className="text-green-500" /></div>
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
    <div className="bg-[#121212] border-b border-[#27272a] h-[55px] flex items-center sticky top-[57px] z-10 shadow-lg">
        <div ref={scrollContainerRef} className="flex w-full overflow-x-auto no-scrollbar items-center px-2 gap-1">
            {dateList.map((d) => {
                const isSelected = selectedDateId === d.id;
                return (
                    <div key={d.id} ref={(node) => { if (node) itemsRef.current.set(d.id, node); else itemsRef.current.delete(d.id); }}
                        onClick={() => handleClick(d.id)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[50px] h-[40px] rounded cursor-pointer transition-colors ${isSelected ? 'bg-[#333] border-b-2 border-green-500' : 'bg-transparent text-gray-500'}`}>
                        <span className={`text-[10px] font-bold uppercase leading-none mb-1 ${isSelected ? 'text-white' : ''}`}>{d.label}</span>
                        <span className={`text-[9px] font-mono leading-none ${isSelected ? 'text-green-400' : ''}`}>{d.date}</span>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

// --- WIDGET SCOMMESSA ---
const InlineBettingWidget = ({ statDef, activeContext, onAdd, ticketGroups, onAddGroup }) => {
  const [betType, setBetType] = useState("Over");
  const [selectedLine, setSelectedLine] = useState(statDef.lines[0]);
  const [selectedGroup, setSelectedGroup] = useState(ticketGroups[0]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const handleGroupChange = (e) => { const val = e.target.value; if (val === "___NEW___") { setIsCreatingGroup(true); setNewGroupName(""); } else { setSelectedGroup(val); } };
  const saveNewGroup = () => { if (newGroupName.trim() !== "") { onAddGroup(newGroupName); setSelectedGroup(newGroupName); setIsCreatingGroup(false); } else { setIsCreatingGroup(false); }};
  return (
    <div className="bg-[#1f1f23] p-3 border-t border-[#333] shadow-inner animate-in slide-in-from-top-1">
       <div className="flex justify-between items-center mb-3 h-6">
          <span className="text-[10px] text-green-500 font-mono uppercase tracking-widest font-bold">{statDef.label} • {activeContext.side}</span>
          <div className="flex items-center gap-1 bg-[#121212] px-2 py-0.5 rounded border border-[#333] min-w-[120px] max-w-[160px]">
              <Ticket size={10} className="text-gray-400 flex-shrink-0"/>
              {isCreatingGroup ? (
                  <div className="flex items-center w-full"><input autoFocus type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onBlur={saveNewGroup} onKeyDown={(e) => e.key === 'Enter' && saveNewGroup()} placeholder="Nome..." className="w-full bg-transparent text-[9px] text-white focus:outline-none placeholder-gray-600"/><Save size={10} className="text-green-500 cursor-pointer ml-1" onClick={saveNewGroup}/></div>
              ) : (
                  <div className="relative w-full"><select value={selectedGroup} onChange={handleGroupChange} className="w-full bg-transparent text-[9px] text-gray-300 font-bold appearance-none focus:outline-none">{ticketGroups.map(g => <option key={g} value={g}>{g}</option>)}<option value="___NEW___" className="text-green-400 font-bold">+ NUOVA...</option></select><ChevronDown size={10} className="absolute top-0 right-0 h-full pointer-events-none text-gray-500 flex items-center"/></div>
              )}
          </div>
       </div>
       <div className="flex items-center justify-between h-9 gap-3">
          <div className="flex flex-1 bg-[#121212] rounded p-0.5 border border-[#333] h-full">
              <button onClick={() => setBetType("Under")} className={`flex-1 rounded-[2px] font-bold text-[10px] uppercase transition-all ${betType === 'Under' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Und</button>
              <button onClick={() => setBetType("Over")} className={`flex-1 rounded-[2px] font-bold text-[10px] uppercase transition-all ${betType === 'Over' ? 'bg-gray-200 text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Ovr</button>
          </div>
          <div className="relative h-full w-20">
              <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} className="w-full h-full bg-[#27272a] text-white font-bold text-sm text-center appearance-none rounded border border-[#333] focus:border-green-500 focus:outline-none">{statDef.lines.map(line => <option key={line} value={line}>{line}</option>)}</select>
              <ChevronDown size={12} className="absolute top-0 right-1 h-full pointer-events-none text-gray-400 flex items-center"/>
          </div>
          <button onClick={() => onAdd(statDef.label, betType, selectedLine, activeContext.side, selectedGroup)} className="h-full aspect-square bg-green-600 hover:bg-green-500 text-white rounded flex items-center justify-center shadow-md active:scale-95 transition-transform"><Plus size={20} strokeWidth={3} /></button>
       </div>
    </div>
  );
};

const StatRow = ({ statDef, homeVal, awayVal, onExpand, isExpanded, activeContext, colors, ticketGroups, onAddGroup }) => {
  const total = homeVal + awayVal;
  const pctHome = total === 0 ? 50 : (homeVal / total) * 100;
  const pctAway = total === 0 ? 50 : (awayVal / total) * 100;
  const homeColor = colors ? colors[0] : '#6b7280';
  const awayColor = colors ? colors[1] : '#6b7280';
  return (
    <div className="border-b border-[#27272a] last:border-0">
      <div className={`py-3 px-4 ${isExpanded ? 'bg-[#202023]' : ''}`}>
          <div className="flex justify-between items-center mb-1 text-sm font-medium">
              <div onClick={() => onExpand(statDef.id, "Casa", homeVal)} className={`w-12 text-center py-1 rounded cursor-pointer transition-colors ${isExpanded && activeContext.side === 'Casa' ? 'bg-green-900 text-white border border-green-600' : 'text-white hover:bg-[#27272a]'}`}>{homeVal}</div>
              <div onClick={() => onExpand(statDef.id, "Totale", total)} className={`flex-1 text-center text-[10px] uppercase tracking-widest font-bold cursor-pointer py-1 rounded transition-colors ${isExpanded && activeContext.side === 'Totale' ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'}`}>{statDef.label}</div>
              <div onClick={() => onExpand(statDef.id, "Ospite", awayVal)} className={`w-12 text-center py-1 rounded cursor-pointer transition-colors ${isExpanded && activeContext.side === 'Ospite' ? 'bg-green-900 text-white border border-green-600' : 'text-white hover:bg-[#27272a]'}`}>{awayVal}</div>
          </div>
          <div className="flex gap-1 h-1.5 mt-1.5 opacity-90">
              <div className="flex-1 flex justify-end bg-[#27272a] rounded-l-full overflow-hidden"><div className="h-full" style={{ width: `${pctHome}%`, backgroundColor: homeColor }}></div></div>
              <div className="flex-1 flex justify-start bg-[#27272a] rounded-r-full overflow-hidden"><div className="h-full" style={{ width: `${pctAway}%`, backgroundColor: awayColor }}></div></div>
          </div>
      </div>
      {isExpanded && <InlineBettingWidget statDef={statDef} activeContext={activeContext} onAdd={onExpand.handleAdd} ticketGroups={ticketGroups} onAddGroup={onAddGroup}/>}
    </div>
  );
};

const MatchDetailView = ({ match, leagueName, onClose, onAddTicket, onToggleMonitor, isMonitored, ticketGroups, onAddGroup }) => {
  const [mockStats] = useState(() => STAT_CATEGORIES.reduce((acc, cat) => { acc[cat.id] = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]; return acc; }, {}));
  const [expandedStatId, setExpandedStatId] = useState(null);
  const [activeContext, setActiveContext] = useState({ side: null, val: 0 });
  const [activeTab, setActiveTab] = useState("STATISTICHE"); 
  const toggleExpand = (statId, side, val) => { if (expandedStatId === statId && activeContext.side === side) { setExpandedStatId(null); } else { setExpandedStatId(statId); setActiveContext({ side, val }); }};
  toggleExpand.handleAdd = (label, type, line, side, groupName) => { onAddTicket(match, label, type, line, side, groupName); setExpandedStatId(null); };
  const TABS = ["TABELLINO", "STATISTICHE", "STATS GIOCATORI", "FORMAZIONI", "PRECEDENTI"];
  return (
    <div className="pb-24 bg-[#121212] min-h-screen relative z-30 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="bg-[#18181b] sticky top-0 z-50 border-b border-[#27272a] flex justify-between items-center p-4 shadow-md">
         <ArrowLeft className="text-gray-400 cursor-pointer hover:text-white" onClick={onClose} />
         <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer" />
            <Star size={22} className={`cursor-pointer transition-all active:scale-90 ${isMonitored ? 'text-green-500 fill-green-500' : 'text-gray-400 hover:text-white'}`} onClick={() => onToggleMonitor(match)}/>
         </div>
      </div>
      <div className="bg-[#121212] text-center py-1.5 border-b border-[#27272a]"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{leagueName} • {match.round || "Giornata --"}</span></div>
      <div className="bg-[#18181b] px-6 py-6 flex justify-between items-center border-b border-[#27272a]">
            <div className="flex flex-col items-center w-1/3"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xl text-white font-bold border-2 border-[#333] mb-2 shadow-lg" style={{ borderColor: match.colors ? match.colors[0] : '#333' }}>{match.teams[0].substring(0,1)}</div><span className="text-sm font-bold text-white text-center leading-tight">{match.teams[0]}</span></div>
            <div className="flex flex-col items-center"><div className="text-3xl font-black text-white tracking-widest mb-1">{match.score[0]} - {match.score[1]}</div><div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${match.status === 'LIVE' ? 'bg-green-900 text-green-400' : 'bg-[#333] text-gray-400'}`}>{match.minute !== '-' ? match.minute : match.time}</div></div>
            <div className="flex flex-col items-center w-1/3"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xl text-white font-bold border-2 border-[#333] mb-2 shadow-lg" style={{ borderColor: match.colors ? match.colors[1] : '#333' }}>{match.teams[1].substring(0,1)}</div><span className="text-sm font-bold text-white text-center leading-tight">{match.teams[1]}</span></div>
      </div>
      <div className="bg-[#18181b] border-b border-[#27272a] sticky top-[60px] z-40 shadow-lg">
          <div className="flex overflow-x-auto no-scrollbar">{TABS.map(tab => (<div key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border-b-2 ${activeTab === tab ? 'text-green-500 border-green-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>{tab}</div>))}</div>
      </div>
      <div className="flex-1 bg-[#121212]">
          {activeTab === "STATISTICHE" && (<div className="p-4 animate-in fade-in slide-in-from-bottom-2"><div className="bg-[#18181b] rounded-xl overflow-hidden border border-[#27272a]">{STAT_CATEGORIES.map(cat => (<StatRow key={cat.id} statDef={cat} homeVal={mockStats[cat.id][0]} awayVal={mockStats[cat.id][1]} isExpanded={expandedStatId === cat.id} activeContext={activeContext} onExpand={toggleExpand} colors={match.colors} ticketGroups={ticketGroups} onAddGroup={onAddGroup} />))}</div></div>)}
          {activeTab !== "STATISTICHE" && (<div className="flex flex-col items-center justify-center py-20 text-gray-600 animate-in fade-in"><CircleDashed size={40} className="mb-4 opacity-20 animate-spin-slow"/><span className="text-xs font-bold uppercase tracking-widest">Dati {activeTab} in arrivo</span></div>)}
      </div>
    </div>
  );
};

// --- MONITOR AVANZATO (Final Minimalist Design) ---
const MonitorView = ({ tickets, ticketGroups, leagues, onRemoveTicket }) => {
    
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

        if (bet.includes("GOL")) {
            current = matchData.score[0] + matchData.score[1];
        } else {
            // Simulazione statistiche
            if (matchData.status === 'FT') {
                const isWinSimulated = (matchData.id % 2 !== 0); 
                current = isWinSimulated ? Math.ceil(target + 2) : Math.floor(target - 2); 
                if (current < 0) current = 0;
            } else {
                current = Math.floor(target * 0.6); 
            }
        }

        const pct = Math.min((current / target) * 100, 100);
        const isWin = current > target;
        return { pct, current, target, isWin };
    };

    // NUOVO QUADRATINO STATO (Piccolo e Moderno)
    const StatusBox = ({ pct, isWin, status }) => {
        let bgColor = 'bg-red-600'; 
        let icon = <X size={10} className="text-white opacity-80" strokeWidth={4} />; // X per Persa

        if (isWin) {
            bgColor = 'bg-green-600';
            icon = <Check size={10} className="text-white" strokeWidth={4} />;
        } else if (pct >= 80 && status === 'LIVE') {
            bgColor = 'bg-yellow-600';
            icon = <CircleDashed size={10} className="text-white animate-spin-slow" />;
        } else if (status === 'LIVE') {
            bgColor = 'bg-[#333]'; // Neutro
            icon = <div className="w-1 h-1 bg-gray-500 rounded-full" />;
        }

        return (
            <div className={`w-4 h-4 rounded-sm ${bgColor} flex items-center justify-center flex-shrink-0 shadow-sm transition-colors`}>
                {icon}
            </div>
        );
    };

    return (
        <div className="pb-24">
            {ticketGroups.map(group => {
                const groupTickets = tickets.filter(t => t.group === group);
                if (groupTickets.length === 0) return null;
                const matchesInGroup = {};
                groupTickets.forEach(t => { if (!matchesInGroup[t.matchId]) matchesInGroup[t.matchId] = []; matchesInGroup[t.matchId].push(t); });

                const totalEvents = groupTickets.length;
                const liveEvents = groupTickets.filter(t => {
                    const m = getMatchData(t.matchId);
                    return m && m.status === 'LIVE';
                }).length;

                return (
                    <div key={group} className="animate-in fade-in mb-6">
                         
                         {/* Header Gruppo (NEUTRO) */}
                         <div className="px-4 mt-6 mb-2">
                             <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">{group}</span>
                                
                                {/* BADGES NEUTRI */}
                                <div className="flex gap-1">
                                    {liveEvents > 0 && (
                                        <div className="bg-[#27272a] border border-[#333] text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center">
                                            {liveEvents} <span className="text-green-500">•</span>
                                        </div>
                                    )}
                                    <div className="bg-[#27272a] border border-[#333] text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center">
                                        {totalEvents}
                                    </div>
                                </div>
                             </div>
                             {/* Separatore sottile neutro */}
                             <div className="h-[1px] w-full bg-[#333]"></div>
                         </div>

                         <div className="space-y-0">
                             {Object.keys(matchesInGroup).map(matchId => {
                                 const matchTickets = matchesInGroup[matchId];
                                 const matchData = getMatchData(parseInt(matchId));
                                 if (!matchData) return null;
                                 const specificBets = matchTickets.filter(t => t.bet !== "MONITORAGGIO GENERALE");

                                 return (
                                     <div key={matchId} className="bg-[#18181b] border-b border-[#27272a] last:border-0 rounded-lg mb-2 overflow-hidden mx-2 border shadow-sm">
                                         
                                         {/* MATCH HEADER */}
                                         <div className="flex items-center justify-between p-3 bg-[#18181b]">
                                             <div className="flex items-center gap-3">
                                                 <div className={`text-[10px] font-mono w-8 text-center ${matchData.status === 'LIVE' ? 'text-green-500 animate-pulse font-bold' : 'text-gray-500'}`}>
                                                     {matchData.minute !== '-' ? matchData.minute : matchData.time}
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-sm font-bold text-white">{matchData.teams[0]}</span>
                                                     <span className="text-xs text-gray-500">-</span>
                                                     <span className="text-sm font-bold text-white">{matchData.teams[1]}</span>
                                                 </div>
                                             </div>
                                             <div className="flex gap-1">
                                                 <span className={`text-sm font-bold ${matchData.status === 'LIVE' ? 'text-green-400' : 'text-white'}`}>{matchData.score[0]}</span>
                                                 <span className="text-sm text-gray-500">-</span>
                                                 <span className={`text-sm font-bold ${matchData.status === 'LIVE' ? 'text-green-400' : 'text-white'}`}>{matchData.score[1]}</span>
                                             </div>
                                         </div>

                                         {/* SCOMMESSE (Design Clean) */}
                                         {specificBets.map(bet => {
                                             const { pct, current, target, isWin } = calculateProgress(bet.bet, matchData);
                                             
                                             return (
                                                 <div key={bet.id} className="flex items-center py-2.5 px-3 border-t border-[#27272a]/50 bg-[#202023] hover:bg-[#252529] transition-colors">
                                                     
                                                     {/* 1. QUADRATINO 16px */}
                                                     <StatusBox pct={pct} isWin={isWin} status={matchData.status} />

                                                     {/* 2. DATI */}
                                                     <div className="flex-1 ml-3 mr-3">
                                                         <div className="flex justify-between items-baseline mb-1">
                                                             <span className="text-[11px] font-bold text-gray-200 leading-none">{bet.bet}</span>
                                                             <span className={`text-[11px] font-mono font-bold leading-none ${isWin ? 'text-green-400' : 'text-white'}`}>
                                                                 {current} <span className="text-gray-600 text-[9px] font-normal">/ {target}</span>
                                                             </span>
                                                         </div>
                                                         {/* Linea sottile */}
                                                         <div className="h-[2px] bg-[#333] w-full rounded-full overflow-hidden">
                                                             <div className={`h-full ${isWin ? 'bg-green-500' : 'bg-gray-500'}`} style={{ width: `${pct}%` }}></div>
                                                         </div>
                                                     </div>

                                                     {/* 3. CESTINO */}
                                                     <Trash2 size={13} className="text-gray-600 hover:text-red-500 cursor-pointer ml-1" onClick={() => onRemoveTicket(bet.id)}/>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                 );
                             })}
                         </div>
                    </div>
                );
            })}
            {tickets.length === 0 && <div className="text-center text-gray-600 py-20 flex flex-col items-center"><Ticket size={40} className="mb-2 opacity-20"/><span className="text-xs uppercase font-bold tracking-widest opacity-50">Nessuna scommessa attiva</span></div>}
        </div>
    );
};

// --- APP PRINCIPALE ---
export default function App() {
  const [activeTab, setActiveTab] = useState("tutte");
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  const [leagues, setLeagues] = useState(initialLeaguesData);
  const [selectedDateId, setSelectedDateId] = useState(0); 
  const [tickets, setTickets] = useState([]); 
  const [showToast, setShowToast] = useState(false);
  const [ticketGroups, setTicketGroups] = useState(["Monitor Principale", "Multipla Sabato", "Pazza Weekend"]);

  useEffect(() => { const style = document.createElement('style'); style.innerHTML = globalStyles; document.head.appendChild(style); return () => document.head.removeChild(style); }, []);

  const handleAddTicket = (match, label, type, line, side, groupName) => {
     const newTicket = { id: Date.now(), matchId: match.id, matchTeams: `${match.teams[0]} - ${match.teams[1]}`, bet: `${label} (${side}) ${type} ${line}`, group: groupName, status: 'pending' };
     setTickets([...tickets, newTicket]);
     setShowToast(true);
  };
  const handleToggleGenericMonitor = (match) => {
      const exists = tickets.find(t => t.matchId === match.id && t.bet === "MONITORAGGIO GENERALE");
      if (exists) setTickets(tickets.filter(t => t.id !== exists.id));
      else { setTickets([...tickets, { id: Date.now(), matchId: match.id, matchTeams: `${match.teams[0]} - ${match.teams[1]}`, bet: `MONITORAGGIO GENERALE`, group: "Monitor Principale", status: 'live' }]); setShowToast(true); }
  };
  const handleAddGroup = (newGroup) => setTicketGroups([...ticketGroups, newGroup]);
  const handleRemoveTicket = (id) => setTickets(tickets.filter(t => t.id !== id));
  const handleDateClick = (id) => setSelectedDateId(id);
  const getLeaguesForCurrentDate = (list) => { return list.map(l => ({ ...l, matches: l.matches.filter(m => (m.dateOffset || 0) === selectedDateId) })).filter(l => l.matches.length > 0); };
  const togglePinLeague = (e, leagueId) => { e.stopPropagation(); setLeagues(leagues.map(l => l.id === leagueId ? { ...l, isPinned: !l.isPinned } : l)); };
  const openDetail = (match) => { const league = leagues.find(l => l.matches.some(m => m.id === match.id)); setSelectedMatchDetail({ ...match, leagueName: league ? league.name : "CAMPIONATO" }); };
  const pinnedLeagues = getLeaguesForCurrentDate(leagues.filter(l => l.isPinned));
  const otherLeagues = getLeaguesForCurrentDate(leagues.filter(l => !l.isPinned));
  const LeagueGroup = ({ title, dataList, variant }) => (<div className="pb-2 animate-in fade-in">{dataList.length > 0 && title && (<div className={`sticky top-[112px] z-0 px-3 py-2 text-[11px] font-bold uppercase tracking-widest border-l-4 shadow-sm ${variant === 'primary' ? 'bg-[#151518] text-green-500 border-green-500' : 'bg-[#151518] text-gray-300 border-gray-600'}`}>{title}</div>)}<div className="space-y-0">{dataList.map((league) => (<div key={league.id} className="bg-[#18181b] border-b border-[#27272a] last:border-0"><div className="flex justify-between items-center px-3 py-2 bg-[#202023] hover:bg-[#2a2a2e] cursor-pointer"><div className="flex items-center gap-3"><Star size={16} onClick={(e) => togglePinLeague(e, league.id)} className={`cursor-pointer ${league.isPinned ? 'text-green-500 fill-green-500' : 'text-gray-600 hover:text-gray-400'}`} /><img src={`https://flagcdn.com/20x15/${league.country}.png`} alt={league.country} className="w-4 h-3 rounded-[1px] shadow-sm"/><span className="text-xs font-bold text-white uppercase">{league.name}</span></div><ChevronDown size={14} className="text-gray-500" /></div><div>{league.matches.map((match) => (<div key={match.id} onClick={() => openDetail(match)} className="flex items-center py-3 px-3 hover:bg-[#202023] cursor-pointer border-t border-[#27272a]/50"><div className={`w-10 text-center text-[10px] font-mono flex-shrink-0 ${match.status === 'LIVE' ? 'text-green-500 animate-pulse font-bold' : 'text-gray-500'}`}>{match.minute !== '-' ? match.minute : match.time}</div><div className="flex-1 flex flex-col justify-center gap-1.5 ml-2 border-l border-[#27272a] pl-3 py-0.5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[8px] text-white font-bold border border-gray-500" style={{ borderColor: match.colors ? match.colors[0] : '#666'}}>{match.teams[0].substring(0,1)}</div><span className={`text-sm ${match.score[0] > match.score[1] ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>{match.teams[0]}</span></div><span className={`text-sm font-bold ${match.status === 'LIVE' ? 'text-green-400' : 'text-white'}`}>{match.score[0]}</span></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[8px] text-white font-bold border border-gray-500" style={{ borderColor: match.colors ? match.colors[1] : '#666'}}>{match.teams[1].substring(0,1)}</div><span className={`text-sm ${match.score[1] > match.score[0] ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>{match.teams[1]}</span></div><span className={`text-sm font-bold ${match.status === 'LIVE' ? 'text-green-400' : 'text-white'}`}>{match.score[1]}</span></div></div></div>))}</div></div>))}</div></div>);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans relative overflow-hidden flex flex-col">
      <ToastNotification message="Aggiunto al Monitor" show={showToast} onClose={() => setShowToast(false)} />
      <div className="flex-1 overflow-y-auto pb-24"> 
          {selectedMatchDetail ? (
             <MatchDetailView match={selectedMatchDetail} leagueName={selectedMatchDetail.leagueName} onClose={() => setSelectedMatchDetail(null)} onAddTicket={handleAddTicket} onToggleMonitor={handleToggleGenericMonitor} isMonitored={tickets.some(t => t.matchId === selectedMatchDetail.id && t.bet === "MONITORAGGIO GENERALE")} ticketGroups={ticketGroups} onAddGroup={handleAddGroup} />
          ) : (
            <>
                {activeTab === 'tutte' && (
                    <>
                        <HomeHeader />
                        <DateBar selectedDateId={selectedDateId} onDateClick={handleDateClick} />
                        {(pinnedLeagues.length === 0 && otherLeagues.length === 0) ? (<div className="flex flex-col items-center justify-center py-20 text-gray-600"><Calendar size={40} className="mb-2 opacity-20"/><span className="text-xs uppercase font-bold tracking-widest opacity-50">Nessuna partita</span></div>) : (<><LeagueGroup title="MONITORATI" dataList={pinnedLeagues} variant="primary" /><LeagueGroup title="TUTTI I CAMPIONATI" dataList={otherLeagues} variant="default" /></>)}
                    </>
                )}
                {activeTab === 'monitor' && <MonitorView tickets={tickets} ticketGroups={ticketGroups} leagues={leagues} onRemoveTicket={handleRemoveTicket} />}
                {activeTab === 'live' && <div className="p-10 text-center text-gray-500">Live...</div>}
            </>
          )}
      </div>
      <div className="fixed bottom-0 w-full bg-[#18181b] border-t border-gray-800 h-[70px] z-[100]"><div className="relative w-full h-full flex justify-between px-2"><div className="flex w-2/5 justify-around items-center h-full pt-2"><div onClick={() => { setActiveTab('tutte'); setSelectedMatchDetail(null); }} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'tutte' && !selectedMatchDetail ? 'opacity-100 text-white' : 'opacity-40 text-gray-500'}`}><Calendar size={20} /> <span className="text-[9px] font-bold">Tutte</span></div><div onClick={() => { setActiveTab('live'); setSelectedMatchDetail(null); }} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'live' ? 'opacity-100 text-red-500' : 'opacity-40 text-gray-500'}`}><Radio size={20} /> <span className="text-[9px] font-bold">Live</span></div></div><div onClick={() => { setActiveTab('monitor'); setSelectedMatchDetail(null); }} className="absolute left-0 right-0 mx-auto w-16 -top-6 flex flex-col items-center cursor-pointer z-50"><div className={`w-14 h-14 rounded-full border-[6px] border-[#121212] shadow-xl flex items-center justify-center transition-transform active:scale-95 ${activeTab === 'monitor' ? 'bg-green-500 text-black' : 'bg-[#27272a] text-gray-400'}`}><BarChart2 size={24} strokeWidth={2.5} /></div><span className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${activeTab === 'monitor' ? 'text-green-400' : 'text-gray-500'}`}>Monitor</span></div><div className="flex w-2/5 justify-around items-center h-full pt-2"><div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 text-gray-500"><History size={20} /> <span className="text-[9px] font-bold">Storico</span></div><div className="flex flex-col items-center gap-1 cursor-pointer opacity-40 text-gray-500"><Trophy size={20} /> <span className="text-[9px] font-bold">Classifica</span></div></div></div></div>
    </div>
  );
}