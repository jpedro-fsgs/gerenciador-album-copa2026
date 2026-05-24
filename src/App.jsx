import React, { useState, useEffect, useMemo } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Search, 
  Trash2, 
  RefreshCw, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ClipboardCheck, 
  ArrowUpDown,
  TrendingUp,
  BookmarkCheck,
  PackageCheck,
  Download,
  Upload
} from 'lucide-react';
import checklistData from '../album_checklist_2026.json';

const TEAM_FLAGS = {
  "ALG": "🇩🇿", "ARG": "🇦🇷", "AUS": "🇦🇺", "AUT": "🇦🇹", "BEL": "🇧🇪",
  "BIH": "🇧🇦", "BRA": "🇧🇷", "CAN": "🇨🇦", "CPV": "🇨🇻", "COL": "🇨🇴",
  "COD": "🇨🇩", "CRO": "🇭🇷", "CUW": "🇨🇼", "CZE": "🇨🇿", "ECU": "🇪🇨",
  "EGY": "🇪🇬", "ENG": "🏴\u200d󠁢󠁥󠁮󠁧󠁿", "FRA": "🇫🇷", "GER": "🇩🇪", "GHA": "🇬🇭",
  "HAI": "🇭🇹", "IRN": "🇮🇷", "IRQ": "🇮🇶", "CIV": "🇨🇮", "JPN": "🇯🇵",
  "JOR": "🇯🇴", "MEX": "🇲🇽", "MAR": "🇲🇦", "NED": "🇳🇱", "NZL": "🇳🇿",
  "NOR": "🇳🇴", "PAN": "🇵🇦", "PAR": "🇵🇾", "POR": "🇵🇹", "QAT": "🇶🇦",
  "KSA": "🇸🇦", "SCO": "🏴\u200d󠁢󠁳󠁣󠁴󠁿", "SEN": "🇸🇳", "RSA": "🇿🇦", "KOR": "🇰🇷",
  "ESP": "🇪🇸", "SWE": "🇸🇪", "SUI": "🇨🇭", "TUN": "🇹🇳", "TUR": "🇹🇷",
  "URU": "🇺🇾", "USA": "🇺🇸", "UZB": "🇺🇿",
  "FWC": "✨", "Coca-Cola": "🥤"
};

function getTeamFlag(code) {
  return TEAM_FLAGS[code] || "";
}

// Helper to decode query parameter format (e.g. "FWC:1,5;BRA:2,12;C:4")
function decodeTradeParam(param) {
  if (!param) return [];
  const stickers = [];
  const groups = param.split(';');
  groups.forEach(group => {
    const [prefix, numsStr] = group.split(':');
    if (prefix && numsStr) {
      const nums = numsStr.split(',');
      nums.forEach(num => {
        // Handle whitespace or clean parsing
        const cleanedNum = num.trim();
        if (cleanedNum) {
          stickers.push(`${prefix.trim()}${cleanedNum}`);
        }
      });
    }
  });
  return stickers;
}

// Helper to encode array of sticker IDs back to the grouped format
function encodeTradeParam(stickersArray) {
  const groups = {};
  stickersArray.forEach(id => {
    const match = id.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = match[2];
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(num);
    }
  });
  return Object.entries(groups)
    .map(([prefix, nums]) => `${prefix}:${nums.join(',')}`)
    .join(';');
}

export default function App() {
  // 1. Flatten all stickers from checklist JSON
  const allStickers = useMemo(() => {
    const stickers = [];
    
    // Specials (FWC00, FWC1 to FWC19)
    if (checklistData.special_stickers) {
      Object.entries(checklistData.special_stickers).forEach(([key, val]) => {
        stickers.push({
          id: key,
          name: val,
          type: 'special',
          section: 'FWC',
          code: key === 'FWC00' ? '00' : key,
          number: parseInt(key.replace('FWC', ''), 10)
        });
      });
    }
    
    // Teams (BRA, ARG, GER, ENG, MEX, USA, ALG, RSA)
    if (checklistData.team_checklists) {
      Object.entries(checklistData.team_checklists).forEach(([teamCode, list]) => {
        list.forEach((name, idx) => {
          const num = idx + 1;
          const id = `${teamCode}${num}`;
          stickers.push({
            id: id,
            name: name,
            type: 'team',
            section: teamCode,
            code: `${teamCode} ${num}`,
            number: num
          });
        });
      });
    }
    
    // Coca-Cola (C1 to C12)
    if (checklistData.coca_cola_promos) {
      Object.entries(checklistData.coca_cola_promos).forEach(([key, val]) => {
        stickers.push({
          id: key,
          name: val,
          type: 'coca_cola',
          section: 'Coca-Cola',
          code: key,
          number: parseInt(key.replace('C', ''), 10)
        });
      });
    }
    
    return stickers;
  }, []);

  // 2. States for user's owned and trade inventory
  const [ownedStickers, setOwnedStickers] = useState(() => {
    const saved = localStorage.getItem('copa2026_owned');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tradeStickers, setTradeStickers] = useState(() => {
    const saved = localStorage.getItem('copa2026_trade');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('copa2026_owned', JSON.stringify(ownedStickers));
  }, [ownedStickers]);

  useEffect(() => {
    localStorage.setItem('copa2026_trade', JSON.stringify(tradeStickers));
  }, [tradeStickers]);

  // 3. States for URL Sharing & Comparison
  const [sharerName, setSharerName] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedComparison, setCopiedComparison] = useState(false);

  // States for trade comparison (incoming link)
  const [comparisonTradeList, setComparisonTradeList] = useState([]);
  const [comparisonSharerName, setComparisonSharerName] = useState('');
  const [isComparing, setIsComparing] = useState(false);

  // States and refs for JSON export/import
  const [importData, setImportData] = useState(null);
  const fileInputRef = React.useRef(null);

  // Check URL params on mount & when URL updates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tradeParam = params.get('trade');
    const nameParam = params.get('name');

    if (tradeParam) {
      const decoded = decodeTradeParam(tradeParam);
      setComparisonTradeList(decoded);
      setComparisonSharerName(nameParam || '');
      setIsComparing(true);
    }
  }, []);

  // 4. Filtering and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL', 'FWC', teamCodes, 'Coca-Cola'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'OWNED', 'MISSING', 'TRADE'

  // Generate shareable link when trade list or sharerName changes
  useEffect(() => {
    if (tradeStickers.length > 0) {
      const encoded = encodeTradeParam(tradeStickers);
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('trade', encoded);
      if (sharerName.trim()) {
        url.searchParams.set('name', sharerName.trim());
      }
      setShareLink(url.toString());
    } else {
      setShareLink('');
    }
  }, [tradeStickers, sharerName]);

  // Toggle owned sticker
  const toggleOwned = (id) => {
    setOwnedStickers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle trade sticker
  const toggleTrade = (id) => {
    setTradeStickers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Clear entire user checklist
  const handleClearChecklist = () => {
    if (window.confirm('Tem certeza de que deseja limpar toda a sua coleção e figurinhas marcadas para troca? Esta ação não pode ser desfeita.')) {
      setOwnedStickers([]);
      setTradeStickers([]);
    }
  };

  // Mark all stickers as owned
  const handleMarkAllOwned = () => {
    if (window.confirm('Deseja marcar todas as figurinhas do checklist como obtidas?')) {
      const allIds = allStickers.map(s => s.id);
      setOwnedStickers(allIds);
    }
  };

  // Export checklist data to a JSON file
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({
      version: "1.0",
      owned: ownedStickers,
      trade: tradeStickers,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `album-copa2026-checklist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger file selection for import
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle uploaded file and open verification modal
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || (!Array.isArray(parsed.owned) && !Array.isArray(parsed.trade))) {
          alert("Erro: O arquivo selecionado não é um backup de coleção válido.");
          return;
        }
        
        setImportData({
          owned: Array.isArray(parsed.owned) ? parsed.owned : [],
          trade: Array.isArray(parsed.trade) ? parsed.trade : []
        });
      } catch (err) {
        alert("Erro ao ler o arquivo JSON: " + err.message);
      }
      e.target.value = ''; // Reset
    };
    reader.readAsText(file);
  };

  // Copy share link
  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Close comparison mode
  const handleClearComparison = () => {
    setIsComparing(false);
    setComparisonTradeList([]);
    setComparisonSharerName('');
    // Remove params from URL
    const url = new URL(window.location.origin + window.location.pathname);
    window.history.pushState({}, '', url.toString());
  };



  // Copy plain text summary of the comparison
  const handleCopyComparisonSummary = (neededList, ownedList) => {
    const nameStr = comparisonSharerName ? `de ${comparisonSharerName}` : 'recebida';
    const text = [
      `📊 Comparação da lista de trocas ${nameStr}:`,
      `Preciso (${neededList.length}): ${neededList.join(', ')}`,
      `Já tenho (${ownedList.length}): ${ownedList.join(', ')}`,
      `Gerado via Copa 2026 Sticker Swap Manager`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedComparison(true);
    setTimeout(() => setCopiedComparison(false), 3000);
  };

  // Compute overall counts
  const totalStickersCount = allStickers.length;
  const ownedCount = ownedStickers.length;
  const missingCount = totalStickersCount - ownedCount;
  const tradeCount = tradeStickers.length;
  const completionPercentage = Math.round((ownedCount / totalStickersCount) * 100) || 0;

  // Compute list of stickers inside the comparison view
  const comparisonResults = useMemo(() => {
    if (!isComparing) return { needed: [], owned: [] };
    
    const needed = [];
    const owned = [];
    
    comparisonTradeList.forEach(id => {
      const sticker = allStickers.find(s => s.id === id);
      if (sticker) {
        if (ownedStickers.includes(id)) {
          owned.push(sticker);
        } else {
          needed.push(sticker);
        }
      }
    });

    return { needed, owned };
  }, [isComparing, comparisonTradeList, ownedStickers, allStickers]);

  // Compute list of sections for filtering
  const sectionsList = useMemo(() => {
    const list = [
      { id: 'ALL', name: '🌍 Tudo' },
      { id: 'FWC', name: '✨ Especiais' }
    ];
    // Teams from checklists keys
    if (checklistData.team_checklists) {
      Object.keys(checklistData.team_checklists).forEach(teamCode => {
        const flag = getTeamFlag(teamCode);
        list.push({ id: teamCode, name: flag ? `${flag} ${teamCode}` : teamCode });
      });
    }
    list.push({ id: 'Coca-Cola', name: '🥤 Coca-Cola' });
    return list;
  }, []);

  // Filtered stickers for display
  const filteredStickers = useMemo(() => {
    return allStickers.filter(sticker => {
      // 1. Search text match
      const searchNormalized = searchTerm.toLowerCase().trim();
      const matchesSearch = searchNormalized === '' ||
        sticker.name.toLowerCase().includes(searchNormalized) ||
        sticker.code.toLowerCase().replace(' ', '').includes(searchNormalized.replace(' ', ''));
      
      // 2. Section tab match
      const matchesSection = activeSection === 'ALL' || sticker.section === activeSection;

      // 3. Status filter match
      let matchesStatus = true;
      if (statusFilter === 'OWNED') {
        matchesStatus = ownedStickers.includes(sticker.id);
      } else if (statusFilter === 'MISSING') {
        matchesStatus = !ownedStickers.includes(sticker.id);
      } else if (statusFilter === 'TRADE') {
        matchesStatus = tradeStickers.includes(sticker.id);
      }

      return matchesSearch && matchesSection && matchesStatus;
    });
  }, [allStickers, searchTerm, activeSection, statusFilter, ownedStickers, tradeStickers]);

  // Color theme provider based on sticker status & type
  const getCardStyles = (sticker) => {
    const isOwned = ownedStickers.includes(sticker.id);
    const isTrade = tradeStickers.includes(sticker.id);

    if (isTrade) {
      return {
        borderClass: 'border-cyan-500/50 shadow-glow-cyan',
        bgClass: 'bg-cyan-950/20',
        badgeColor: 'bg-cyan-500/90 text-pitch-950 font-bold',
        textClass: 'text-cyan-100'
      };
    }

    if (isOwned) {
      if (sticker.type === 'special') {
        return {
          borderClass: 'border-trophy-500 shadow-glow-gold',
          bgClass: 'bg-amber-950/20',
          badgeColor: 'bg-trophy-500 text-pitch-950 font-bold',
          textClass: 'text-amber-100'
        };
      }
      if (sticker.type === 'coca_cola') {
        return {
          borderClass: 'border-red-500/50 shadow-glow-red',
          bgClass: 'bg-red-950/20',
          badgeColor: 'bg-red-500 text-white font-bold',
          textClass: 'text-red-100'
        };
      }
      // Normal team owned
      return {
        borderClass: 'border-emerald-500/40 shadow-glow-green',
        bgClass: 'bg-emerald-950/20',
        badgeColor: 'bg-emerald-500 text-pitch-950 font-bold',
        textClass: 'text-emerald-100'
      };
    }

    // Default missing
    return {
      borderClass: 'border-slate-800 hover:border-slate-700',
      bgClass: 'bg-pitch-900/40 hover:bg-pitch-900/60',
      badgeColor: 'bg-slate-800 text-slate-400',
      textClass: 'text-slate-400'
    };
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
      {/* HEADER SECTION */}
      <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-pitch-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight bg-gradient-to-r from-trophy-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Copa 2026
            </h1>
            <span className="bg-pitch-800 text-xs px-2.5 py-1 rounded-full text-emerald-400 border border-emerald-500/20 font-mono">
              v1.0
            </span>
          </div>
          <p className="text-sm md:text-base text-slate-400 mt-2 font-light">
            Gerenciador premium de figurinhas e trocas de figurinhas para a Copa do Mundo.
          </p>
        </div>
        
        {/* Real-time statistics counters */}
        <div className="w-full md:w-auto grid grid-cols-3 gap-3 md:gap-4">
          <div className="glass px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Coleção</span>
            <span className="text-xl md:text-2xl font-display font-extrabold text-emerald-400">
              {ownedCount} <span className="text-xs text-slate-500 font-normal">/ {totalStickersCount}</span>
            </span>
            <span className="text-xs text-slate-500 mt-0.5 font-semibold font-mono">{completionPercentage}%</span>
          </div>
          <div className="glass px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Faltam</span>
            <span className="text-xl md:text-2xl font-display font-extrabold text-slate-300">{missingCount}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">figurinhas</span>
          </div>
          <div className="glass px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center border-cyan-500/10">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Para Troca</span>
            <span className="text-xl md:text-2xl font-display font-extrabold text-cyan-400">{tradeCount}</span>
            <span className="text-[10px] text-cyan-500/60 mt-0.5">repetidas</span>
          </div>
        </div>
      </header>

      {/* COMPARISON BANNER - INCOMING LINK VIEW */}
      {isComparing && (
        <section className="mb-8 glass border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500"></div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/10 text-cyan-400 p-3 rounded-2xl border border-cyan-500/20 mt-1">
                  <RefreshCw className="h-6 w-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-slate-200">
                    Comparação de Trocas Ativa
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Você está visualizando as figurinhas oferecidas por{' '}
                    <strong className="text-cyan-400 font-semibold">
                      {comparisonSharerName || 'outro colecionador'}
                    </strong>
                    . O sistema comparou automaticamente com a sua coleção.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyComparisonSummary(comparisonResults.needed.map(s => s.id), comparisonResults.owned.map(s => s.id))}
                  className="px-4 py-2 bg-pitch-900 hover:bg-pitch-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  {copiedComparison ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
                  {copiedComparison ? 'Copiado!' : 'Copiar Resumo'}
                </button>

                <button
                  onClick={handleClearComparison}
                  className="px-3.5 py-2 bg-pitch-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <X className="h-4 w-4" />
                  Fechar Comparação
                </button>
              </div>
            </div>

            {/* Comparison Results Splits */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* STICKERS YOU NEED */}
              <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                      Figurinhas que você PRECISA ({comparisonResults.needed.length})
                    </h3>
                  </div>
                </div>

                {comparisonResults.needed.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">Nenhuma figurinha desta lista está faltando na sua coleção! 🎉</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                    {comparisonResults.needed.map(s => (
                      <span 
                        key={s.id}
                        className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-mono text-xs px-2.5 py-1 rounded-md flex items-center gap-1"
                        title={s.name}
                      >
                        {getTeamFlag(s.section)} {s.code} - {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* STICKERS YOU HAVE */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-slate-800 text-slate-400 p-1.5 rounded-lg">
                    <PackageCheck className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Figurinhas que você JÁ TEM ({comparisonResults.owned.length})
                  </h3>
                </div>

                {comparisonResults.owned.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">Você ainda não tem nenhuma das figurinhas desta lista.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                    {comparisonResults.owned.map(s => (
                      <span 
                        key={s.id}
                        className="bg-slate-950/60 border border-slate-800 text-slate-400 font-mono text-xs px-2.5 py-1 rounded-md flex items-center gap-1"
                        title={s.name}
                      >
                        {getTeamFlag(s.section)} {s.code} - {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DASHBOARD ACTIONS & URL GENERATOR PANEL */}
      <section className="mb-8 grid md:grid-cols-3 gap-6">
        {/* SHARE TRADE LINK CONTROLS */}
        <div className="md:col-span-2 glass rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-200 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-cyan-400" />
              Compartilhar Minhas Figurinhas para Troca
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Marque as figurinhas que você tem disponíveis para troca na lista abaixo, insira seu nome e copie o link para compartilhar com amigos!
            </p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            {/* User Name input */}
            <div className="w-full sm:w-1/3 flex flex-col gap-1.5">
              <label htmlFor="user-name-input" className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <User className="h-3 w-3" />
                Seu Nome (opcional)
              </label>
              <input
                id="user-name-input"
                type="text"
                value={sharerName}
                onChange={(e) => setSharerName(e.target.value)}
                placeholder="Ex: João Silva"
                className="bg-pitch-900 border border-pitch-700/60 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 w-full transition-colors"
              />
            </div>

            {/* Generated url link display */}
            <div className="w-full sm:w-2/3 flex items-center gap-2 relative">
              <div className="flex-1 bg-pitch-950 border border-pitch-800 rounded-xl px-3 py-2 text-[10px] text-cyan-400 font-mono truncate h-9 leading-5 select-all">
                {shareLink || 'Adicione figurinhas para troca (ícone ⇄) abaixo para gerar o link'}
              </div>
              
              <button
                disabled={!shareLink}
                onClick={handleCopyLink}
                className={`px-4 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
                  shareLink 
                    ? 'bg-cyan-500 text-pitch-950 hover:bg-cyan-400 shadow-glow-cyan/20' 
                    : 'bg-pitch-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedLink ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>
        </div>

        {/* UTILITY QUICK ACTIONS */}
        <div className="glass rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-trophy-400" />
              Ações Rápidas
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ferramentas rápidas de gerenciamento para reiniciar ou preencher rapidamente os dados da sua coleção.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleMarkAllOwned}
              className="py-2.5 px-3 bg-pitch-900 hover:bg-emerald-950/20 hover:text-emerald-400 border border-pitch-800 hover:border-emerald-500/20 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <BookmarkCheck className="h-4 w-4" />
              Marcar Tudo
            </button>
            <button
              onClick={handleClearChecklist}
              className="py-2.5 px-3 bg-pitch-900 hover:bg-red-950/20 hover:text-red-400 border border-pitch-800 hover:border-red-500/20 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Tudo
            </button>
            <button
              onClick={handleExportJSON}
              className="py-2.5 px-3 bg-pitch-900 hover:bg-cyan-950/20 hover:text-cyan-400 border border-pitch-800 hover:border-cyan-500/20 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button
              onClick={handleImportClick}
              className="py-2.5 px-3 bg-pitch-900 hover:bg-trophy-950/20 hover:text-trophy-400 border border-pitch-800 hover:border-trophy-500/20 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Upload className="h-4 w-4" />
              Importar
            </button>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH PANEL */}
      <section className="mb-6 glass rounded-3xl p-6">
        <div className="flex flex-col gap-5">
          {/* Main search and Status Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4.5 w-4.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar figurinha por jogador, escudo, ou código (ex: BRA 14, FWC1)..."
                className="w-full bg-pitch-900 border border-pitch-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-2 font-mono">Status:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'ALL' 
                    ? 'bg-slate-200 text-pitch-950 shadow-md' 
                    : 'bg-pitch-900 text-slate-400 hover:bg-pitch-800 border border-slate-800'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('OWNED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'OWNED' 
                    ? 'bg-emerald-500 text-pitch-950 shadow-glow-green/20' 
                    : 'bg-pitch-900 text-slate-400 hover:bg-pitch-800 border border-slate-800'
                }`}
              >
                Obtidas
              </button>
              <button
                onClick={() => setStatusFilter('MISSING')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'MISSING' 
                    ? 'bg-amber-600/90 text-white shadow-md' 
                    : 'bg-pitch-900 text-slate-400 hover:bg-pitch-800 border border-slate-800'
                }`}
              >
                Faltando
              </button>
              <button
                onClick={() => setStatusFilter('TRADE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'TRADE' 
                    ? 'bg-cyan-500 text-pitch-950 shadow-glow-cyan/20' 
                    : 'bg-pitch-900 text-slate-400 hover:bg-pitch-800 border border-slate-800'
                }`}
              >
                Para Troca
              </button>
            </div>
          </div>

          {/* Section categories tabs */}
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2.5 font-mono">Categorias / Seleções:</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {sectionsList.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    activeSection === tab.id
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40 shadow-glow-green/5'
                      : 'bg-pitch-900/50 text-slate-400 hover:bg-pitch-900 border-slate-800/80 hover:text-slate-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STICKER BOARD GRID */}
      <main className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-extrabold text-slate-200">
            Figurinhas ({filteredStickers.length})
          </h2>
          <span className="text-xs text-slate-500 italic">
            Dica: Clique no card para marcar como obtida. Clique no botão de troca (⇄) para oferecer.
          </span>
        </div>

        {filteredStickers.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <AlertCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-300 font-semibold">Nenhuma figurinha encontrada</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nenhuma figurinha corresponde aos filtros ou termos de pesquisa inseridos. Tente limpar os filtros ou a busca.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setActiveSection('ALL'); setStatusFilter('ALL'); }}
              className="mt-4 px-4 py-2 bg-pitch-900 hover:bg-pitch-800 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-800"
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredStickers.map(sticker => {
              const isOwned = ownedStickers.includes(sticker.id);
              const isTrade = tradeStickers.includes(sticker.id);
              const theme = getCardStyles(sticker);

              return (
                <div
                  key={sticker.id}
                  onClick={() => toggleOwned(sticker.id)}
                  className={`glass p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 select-none relative group ${theme.borderClass} ${theme.bgClass}`}
                >
                  {/* Top: Section Header & Trade Toggle Button */}
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] tracking-wider font-mono font-bold bg-pitch-950/80 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                      {getTeamFlag(sticker.section)} {sticker.code}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent toggling owned status
                        toggleTrade(sticker.id);
                      }}
                      className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                        isTrade 
                          ? 'bg-cyan-500 text-pitch-950 shadow-glow-cyan' 
                          : 'bg-pitch-950/80 text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-slate-800'
                      }`}
                      title={isTrade ? 'Remover da lista de troca' : 'Adicionar à lista de troca'}
                    >
                      ⇄
                    </button>
                  </div>

                  {/* Bottom: Player/Sticker Name */}
                  <div className="mt-auto">
                    <h3 className={`text-xs font-semibold leading-snug line-clamp-2 ${theme.textClass}`}>
                      {sticker.name}
                    </h3>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className={`absolute bottom-0 left-0 w-full h-1 rounded-b-2xl overflow-hidden ${
                    isTrade 
                      ? 'bg-cyan-500' 
                      : isOwned 
                        ? sticker.type === 'special' 
                          ? 'bg-trophy-500' 
                          : sticker.type === 'coca_cola'
                            ? 'bg-red-500'
                            : 'bg-emerald-500'
                        : 'bg-transparent'
                  }`} />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto text-center border-t border-pitch-900 pt-6 text-xs text-slate-500">
        <p>© 2026 Copa 2026 Sticker Swap Manager. Desenvolvido para facilitar trocas de figurinhas.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-600">
          Dados do checklist carregados com sucesso • {allStickers.length} figurinhas no total
        </p>
      </footer>

      {/* IMPORT CONFIRMATION MODAL */}
      {importData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl glass-strong flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-trophy-400" />
                Importar Coleção de Figurinhas
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                O arquivo de backup foi carregado com as seguintes informações:
              </p>
            </div>

            <div className="bg-pitch-950/60 border border-pitch-800 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Figurinhas obtidas:</span>
                <span className="font-bold text-emerald-400">{importData.owned.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Para troca:</span>
                <span className="font-bold text-cyan-400">{importData.trade.length}</span>
              </div>
            </div>

            <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-3 leading-relaxed">
              <strong>Como você deseja prosseguir?</strong> Você pode mesclar as figurinhas com as marcações que já possui neste navegador ou substituir tudo.
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setOwnedStickers(prev => Array.from(new Set([...prev, ...importData.owned])));
                  setTradeStickers(prev => Array.from(new Set([...prev, ...importData.trade])));
                  setImportData(null);
                  alert("Coleção mesclada com sucesso!");
                }}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-pitch-950 rounded-xl text-xs font-bold transition-all shadow-glow-emerald/10 flex items-center justify-center gap-1.5"
              >
                <BookmarkCheck className="h-4 w-4" />
                Mesclar com Coleção Atual
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm("ATENÇÃO: Isso irá apagar completamente as marcações atuais no localStorage deste navegador e substituí-las pelas do arquivo. Tem certeza?")) {
                    setOwnedStickers(importData.owned);
                    setTradeStickers(importData.trade);
                    setImportData(null);
                    alert("Coleção substituída com sucesso!");
                  }
                }}
                className="w-full py-2.5 px-4 bg-pitch-950 hover:bg-red-950/20 hover:text-red-400 border border-pitch-800 hover:border-red-500/20 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Substituir Coleção Atual
              </button>
            </div>

            <button
              onClick={() => setImportData(null)}
              className="py-1 px-4 text-xs text-slate-400 hover:text-slate-200 transition-colors w-fit mx-auto"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
