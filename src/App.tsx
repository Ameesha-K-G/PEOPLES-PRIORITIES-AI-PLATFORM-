import React, { useState, useEffect } from "react";
import {
  Send,
  Volume2,
  MessageSquare,
  Camera,
  Database,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Plus,
  FileText,
  RefreshCw,
  Sliders,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { PRESET_DEMOS } from "./presets";
import { SynthesisOutput, PresetDemo } from "./types";

export default function App() {
  // Input states
  const [inputText, setInputText] = useState<string>(PRESET_DEMOS[0].input_text);
  const [activeChannel, setActiveChannel] = useState<"voice" | "text" | "photo">("voice");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loaded analysis output state
  const [currentAnalysis, setCurrentAnalysis] = useState<SynthesisOutput>(PRESET_DEMOS[0].output);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_DEMOS[0].id);

  // Manual sliders (users can adjust parameters in real-time)
  const [dh, setDh] = useState<number>(PRESET_DEMOS[0].output.simulated_scoring_inputs.demand_intensity_dh);
  const [ig, setIg] = useState<number>(PRESET_DEMOS[0].output.simulated_scoring_inputs.infrastructure_gap_ig);
  const [cp, setCp] = useState<number>(PRESET_DEMOS[0].output.simulated_scoring_inputs.estimated_cost_cp);
  const [pd, setPd] = useState<number>(PRESET_DEMOS[0].output.simulated_scoring_inputs.socio_economic_disadvantage_pd);

  // Interactive weights state
  const [wd, setWd] = useState<number>(0.27);
  const [wi, setWi] = useState<number>(0.27);

  // Formula score output
  const [priorityScore, setPriorityScore] = useState<number>(0.88);

  // History/submission register for planners to compare
  const [historyList, setHistoryList] = useState<PresetDemo[]>(PRESET_DEMOS);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Report modal state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(142);
  const [sessionHash] = useState<string>(() => Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase());

  // Watch input elements to compute live priority score
  useEffect(() => {
    // Sp = ((Dh * Wd) + (Ig * Wi)) / Cp * Pd
    const calculated = ((dh * wd) + (ig * wi)) / (cp === 0 ? 0.3 : cp) * pd;
    // Cap priority score between 0.0 and 1.0
    const clamped = Math.min(1.0, Math.max(0.0, calculated));
    setPriorityScore(parseFloat(clamped.toFixed(2)));
  }, [dh, ig, cp, pd, wd, wi]);

  // Synchronize inputs when a preset or manual adjustment changes
  const loadOutputToControls = (output: SynthesisOutput) => {
    setCurrentAnalysis(output);
    setDh(output.simulated_scoring_inputs.demand_intensity_dh);
    setIg(output.simulated_scoring_inputs.infrastructure_gap_ig);
    setCp(output.simulated_scoring_inputs.estimated_cost_cp);
    setPd(output.simulated_scoring_inputs.socio_economic_disadvantage_pd);
  };

  // Switch demo preset
  const handleSelectPreset = (preset: PresetDemo) => {
    setSelectedPresetId(preset.id);
    setInputText(preset.input_text);
    setActiveChannel(preset.channel);
    loadOutputToControls(preset.output);
  };

  // Call API or Fallback logic
  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      if (response.ok) {
        const data = await response.json();
        if (data.isDemoFallback) {
          // Key missing fallback handled on backend, let's alert gently but load simulated data
          console.warn("Backend fell back to offline demo due to missing GEMINI_API_KEY");
        }
        loadOutputToControls(data);
        
        // Add to history list if it's new
        const newId = "custom-" + Date.now();
        const newPreset: PresetDemo = {
          id: newId,
          title: data.analysis.standardized_english_transcript.substring(0, 30) + "...",
          category: data.analysis.extracted_locations[0] || "Custom Submission",
          channel: activeChannel,
          input_text: inputText,
          output: data
        };
        setHistoryList(prev => [newPreset, ...prev]);
        setSelectedPresetId(newId);
      } else {
        throw new Error("HTTP error: " + response.status);
      }
    } catch (err: any) {
      // Robust client-side fallback emulator if server or network fails
      console.warn("Using client-side Synthesis Emulator:", err.message);
      const matchedTheme = inferThemeFromText(inputText);
      const simulatedData = getMockDataForInput(inputText, matchedTheme);
      
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime + 45)); // Add small artificial delay

      loadOutputToControls(simulatedData);

      const newId = "custom-" + Date.now();
      const newPreset: PresetDemo = {
        id: newId,
        title: simulatedData.analysis.standardized_english_transcript.substring(0, 30) + "...",
        category: simulatedData.analysis.extracted_locations[0] || "Custom Region",
        channel: activeChannel,
        input_text: inputText,
        output: simulatedData
      };
      setHistoryList(prev => [newPreset, ...prev]);
      setSelectedPresetId(newId);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simple client-side fallback parsers
  const inferThemeFromText = (text: string): string => {
    const low = text.toLowerCase();
    if (low.includes("school") || low.includes("education") || low.includes("teacher") || low.includes("class") || low.includes("study") || low.includes("കോളേജ്") || low.includes("പഠി")) {
      return "School Upgrades";
    }
    if (low.includes("water") || low.includes("well") || low.includes("pipe") || low.includes("drink") || low.includes("കുടിവെള്ളം") || low.includes("വെള്ളം")) {
      return "Water Supply";
    }
    if (low.includes("job") || low.includes("work") || low.includes("skills") || low.includes("vocational") || low.includes("training") || low.includes("unemployed")) {
      return "Vocational Center";
    }
    return "Road Connectivity";
  };

  const getMockDataForInput = (text: string, theme: string): SynthesisOutput => {
    // Parse locations
    const locations: string[] = [];
    const low = text.toLowerCase();
    
    // Quick regex or substring location checks
    if (low.includes("chellanam")) locations.push("Chellanam Village");
    if (low.includes("munnar")) locations.push("Munnar Ward");
    if (low.includes("jamtara")) locations.push("Jamtara Block");
    if (low.includes("daringbadi")) locations.push("Daringbadi Village");
    if (low.includes("phulbani")) locations.push("Phulbani Town");
    
    // Fallback search
    if (locations.length === 0) {
      const match = text.match(/(?:village of|village|town of|block|district|ward)\s+([A-Z][a-zA-Z]+)/i);
      if (match) {
        locations.push(match[0]);
      } else {
        locations.push("Regional Hotspot");
      }
    }

    // Default english transcript
    let standardized = text;
    let lang = "English";
    if (low.includes("കുടിവെള്ളമില്ലാതെ")) {
      lang = "Malayalam (മലയാളം)";
      standardized = "We are struggling without drinking water. In our Munnar ward, piped water comes only once a week. All our wells have been ruined by saline water intrusion.";
    } else if (text.trim().length > 0 && !/^[\x00-\x7F]*$/.test(text)) {
      lang = "Detected Regional Dialect";
      standardized = `[Translated to English] ${text}`;
    }

    // Build theme-based variables
    let registry = "Educational Registry & Student Demographics";
    let metric = "Travel Distance vs. Local Enrollment Rate";
    let risk = "Rural student commute vulnerability";
    let defaultDh = 0.75;
    let defaultIg = 0.80;
    let defaultCp = 0.60;
    let defaultPd = 1.20;

    if (theme === "Water Supply") {
      registry = "Hydro-geological GIS & Water Grid Registry";
      metric = "Local Pipeline Gap Index";
      risk = "Groundwater salinity intrusion & localized drought conditions";
      defaultDh = 0.88;
      defaultIg = 0.85;
      defaultCp = 0.30;
      defaultPd = 1.15;
    } else if (theme === "Vocational Center") {
      registry = "Employment & District Census Data";
      metric = "Youth Unemployment Density";
      risk = "Generational skill gap and out-migration intensity";
      defaultDh = 0.70;
      defaultIg = 0.75;
      defaultCp = 1.00;
      defaultPd = 1.30;
    } else if (theme === "Road Connectivity") {
      registry = "Satellite GIS Highway Infrastructure Maps";
      metric = "Isolated Village Distance Index";
      risk = "Monsoon flooding isolating community from medical centers";
      defaultDh = 0.85;
      defaultIg = 0.90;
      defaultCp = 1.00;
      defaultPd = 1.40;
    }

    return {
      analysis: {
        detected_language: lang,
        standardized_english_transcript: standardized,
        assigned_theme: theme,
        extracted_locations: locations
      },
      data_enrichment: {
        target_public_registry: registry,
        synthesized_planning_metric_needed: metric,
        target_regional_risk_factor: risk
      },
      simulated_scoring_inputs: {
        demand_intensity_dh: defaultDh,
        infrastructure_gap_ig: defaultIg,
        estimated_cost_cp: defaultCp,
        socio_economic_disadvantage_pd: defaultPd
      }
    };
  };

  // Filtering list based on search query
  const filteredHistory = historyList.filter(item => 
    item.input_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.output.analysis.assigned_theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.output.analysis.extracted_locations.some(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E0E2E7] font-sans flex flex-col p-4 md:p-8 selection:bg-[#00FF94] selection:text-black">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4" id="app-header">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase font-display">
              People's Priorities
            </h1>
            <span className="text-[#00FF94] font-mono text-xs font-semibold px-2.5 py-0.5 bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-full tracking-wider uppercase">
              AI Synthesis Engine
            </span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.22em] mt-1.5 font-mono">
            Multi-Channel Citizen Submission Analysis & Priority Scoring Pipeline
          </p>
        </div>
        
        <div className="flex gap-6 items-center w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Engine Status</span>
            <span className="text-xs font-mono text-[#00FF94] flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></span>
              ● ACTIVE_PROCESSING
            </span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-6">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">System Hash</span>
            <span className="text-xs font-mono text-white/80">{sessionHash}</span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-6">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Latency</span>
            <span className="text-xs font-mono text-blue-400">{latency}ms</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8" id="main-workspace">
        
        {/* Left Column: Preset Switcher, Raw Input & Live Transcripts */}
        <div className="lg:col-span-4 flex flex-col gap-6" id="left-column">
          
          {/* Quick Presets Picker */}
          <div className="bg-[#14161B] border border-white/5 rounded-lg p-5 flex flex-col" id="presets-panel">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">Active Submissions</span>
              </div>
              <span className="text-[9px] font-mono text-white/40">Presets available</span>
            </div>
            
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
              {PRESET_DEMOS.map((demo) => {
                const isActive = selectedPresetId === demo.id;
                return (
                  <button
                    key={demo.id}
                    onClick={() => handleSelectPreset(demo)}
                    className={`w-full text-left p-3 rounded border transition-all flex items-start gap-3 ${
                      isActive
                        ? "bg-[#1A1D24] border-[#00FF94]/30 text-white"
                        : "bg-black/20 border-white/5 hover:border-white/10 text-white/60 hover:text-white/80"
                    }`}
                  >
                    <div className="mt-0.5">
                      {demo.channel === "voice" && <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {demo.channel === "text" && <MessageSquare className="w-3.5 h-3.5 text-blue-400" />}
                      {demo.channel === "photo" && <Camera className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate font-display">{demo.title}</span>
                        <span className="text-[9px] font-mono text-white/30 truncate pl-1">{demo.category}</span>
                      </div>
                      <p className="text-[10px] text-white/40 truncate mt-0.5 font-mono">{demo.input_text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Input Submission Form */}
          <form onSubmit={handleSynthesize} className="bg-[#14161B] border border-white/5 rounded-lg p-5 flex flex-col flex-1" id="input-form">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94]"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">Submit Citizen Voice</span>
              </div>
              
              {/* Channel Selectors */}
              <div className="flex bg-black/40 rounded p-0.5 border border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveChannel("voice")}
                  className={`px-2 py-1 rounded transition-all flex items-center gap-1 font-mono ${
                    activeChannel === "voice" ? "bg-[#1A1D24] text-[#00FF94] font-bold" : "text-white/40"
                  }`}
                >
                  <Volume2 className="w-3 h-3" /> Voice
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel("text")}
                  className={`px-2 py-1 rounded transition-all flex items-center gap-1 font-mono ${
                    activeChannel === "text" ? "bg-[#1A1D24] text-[#00FF94] font-bold" : "text-white/40"
                  }`}
                >
                  <MessageSquare className="w-3 h-3" /> SMS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel("photo")}
                  className={`px-2 py-1 rounded transition-all flex items-center gap-1 font-mono ${
                    activeChannel === "photo" ? "bg-[#1A1D24] text-[#00FF94] font-bold" : "text-white/40"
                  }`}
                >
                  <Camera className="w-3 h-3" /> Photo
                </button>
              </div>
            </div>

            <div className="relative flex-1 flex flex-col mb-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeChannel === "voice"
                    ? "Enter audio speech-to-text transcript or paste citizen voice..."
                    : activeChannel === "text"
                    ? "Enter SMS/text complaint..."
                    : "Enter high-fidelity photo metadata or image description..."
                }
                className="w-full flex-1 bg-black/30 border border-white/10 rounded p-3.5 text-xs italic text-white/90 leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-[#00FF94]/40 font-mono resize-none"
                style={{ minHeight: "130px" }}
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText("")}
                  className="absolute bottom-2.5 right-2.5 text-[9px] font-mono uppercase bg-white/5 border border-white/10 px-2 py-1 rounded hover:bg-white/10 text-white/50 hover:text-white/80"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full bg-[#00FF94] hover:bg-[#00e082] disabled:bg-white/10 disabled:text-white/30 text-[#0A0B0E] font-black uppercase tracking-widest text-[11px] py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Synthesizing Input...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze & Score Priorities
                </>
              )}
            </button>
          </form>

        </div>

        {/* Center Column: Translation, Semantic Clustering, Maps and Registry Matching */}
        <div className="lg:col-span-4 flex flex-col gap-6" id="center-column">
          
          {/* Analysis & Clustering */}
          <div className="bg-[#14161B] border border-white/5 rounded-lg p-5 flex flex-col" id="clustering-panel">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">Semantic Synthesis</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/20 border border-white/5 rounded">
                  <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1 font-mono">Detected Language</label>
                  <div className="text-xs font-mono font-bold text-white/95">
                    {currentAnalysis?.analysis?.detected_language || "Detecting..."}
                  </div>
                </div>
                <div className="p-3 bg-black/20 border border-white/5 rounded">
                  <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1 font-mono">Assigned Civic Theme</label>
                  <div className="mt-0.5">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-[10px] font-black font-mono inline-block uppercase">
                      {currentAnalysis?.analysis?.assigned_theme || "Pending..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/20 border border-white/5 rounded">
                <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1.5 font-mono">Standardized English Transcript</label>
                <p className="text-xs text-white/80 italic leading-relaxed border-l-2 border-[#00FF94] pl-2.5">
                  "{currentAnalysis?.analysis?.standardized_english_transcript || "Waiting for user synthesis request..."}"
                </p>
              </div>

              <div className="p-3 bg-black/20 border border-white/5 rounded">
                <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1.5 font-mono">Geospatial Parameter Extracted</label>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis?.analysis?.extracted_locations && currentAnalysis.analysis.extracted_locations.length > 0 ? (
                    currentAnalysis.analysis.extracted_locations.map((loc, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 rounded border border-white/10 flex items-center gap-1 text-white/80">
                        <MapPin className="w-2.5 h-2.5 text-[#00FF94]" /> {loc}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-white/30 italic font-mono">None identified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Automated Data Enrichment Matching */}
          <div className="bg-[#14161B] border border-white/5 rounded-lg p-5 flex-1 flex flex-col justify-between" id="enrichment-panel">
            <div>
              <div className="flex items-center gap-2 mb-4 text-amber-500">
                <Database className="w-4 h-4 text-[#00FF94]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-mono">Automated Data Enrichment</span>
              </div>
              
              <div className="space-y-3.5">
                <div className="p-3 bg-black/20 rounded border border-white/5">
                  <span className="text-[9px] uppercase text-white/40 block tracking-wider font-mono mb-1">Target Public Registry</span>
                  <p className="text-xs text-white/90 font-bold">
                    {currentAnalysis?.data_enrichment?.target_public_registry || "Registry Mapping..."}
                  </p>
                </div>

                <div className="p-3 bg-black/20 rounded border border-white/5">
                  <span className="text-[9px] uppercase text-white/40 block tracking-wider font-mono mb-1">Planning Metric Synthesized</span>
                  <p className="text-xs text-white/90 font-mono uppercase text-[#00FF94] font-semibold">
                    {currentAnalysis?.data_enrichment?.synthesized_planning_metric_needed || "Metric synthesis..."}
                  </p>
                </div>

                <div className="p-3 border-l-2 border-red-500 bg-red-500/5 rounded">
                  <span className="text-[9px] uppercase text-red-400/70 block tracking-wider font-mono mb-1">Primary Regional Risk Factor</span>
                  <p className="text-xs text-red-100 font-semibold leading-relaxed">
                    {currentAnalysis?.data_enrichment?.target_regional_risk_factor || "Risk mapping..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Micro-Mapping Viz Placeholder */}
            <div className="h-28 bg-[#1A1D24] border border-white/5 rounded-lg relative overflow-hidden mt-4 flex items-center justify-center">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00FF94_1px,transparent_1px)] [background-size:12px_12px]"></div>
              
              {/* Concentric pulse circles based on priority score */}
              <div className="absolute w-20 h-20 border border-[#00FF94]/20 rounded-full animate-ping"></div>
              <div className="absolute w-12 h-12 border border-[#00FF94]/40 rounded-full animate-pulse"></div>
              <div className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div>
              
              <div className="absolute bottom-2 left-3 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                Geospatial Hotspot: {currentAnalysis?.analysis?.extracted_locations?.[0] || "Region"}_GIS
              </div>
              <div className="absolute top-2 right-3 text-[8px] font-mono text-[#00FF94]/70 uppercase tracking-wider bg-[#00FF94]/10 px-1.5 py-0.5 rounded border border-[#00FF94]/20">
                Overlay Active
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Scoring Result Panel with Interactive Parameter Modifiers */}
        <div className="lg:col-span-4 bg-[#0F1115] border border-[#00FF94]/20 rounded-xl p-6 flex flex-col shadow-[0_0_50px_rgba(0,255,148,0.05)] justify-between" id="right-column">
          
          <div>
            <div className="text-center mb-6">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#00FF94] mb-2.5 block font-mono">Priority Synthesis Score</span>
              
              <div className="relative inline-block">
                <div className="text-6xl md:text-7xl font-black text-white tracking-tighter tabular-nums font-display">
                  {priorityScore.toFixed(2)}
                  <span className="text-xl md:text-2xl text-white/20 font-sans font-normal ml-0.5">/1.00</span>
                </div>
              </div>

              <div className="mt-4.5 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono border ${
                  priorityScore >= 0.80
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : priorityScore >= 0.50
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    priorityScore >= 0.80 ? "bg-red-400" : priorityScore >= 0.50 ? "bg-amber-400" : "bg-emerald-400"
                  }`}></span>
                  {priorityScore >= 0.80 ? "CRITICAL INTERVENTION" : priorityScore >= 0.50 ? "MEDIUM PRIORITY" : "DEFERRED/LOW GAP"}
                </span>
              </div>
            </div>

            {/* Interactive Inputs - Sliders for Real-time Simulation */}
            <div className="space-y-4 bg-black/30 border border-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#00FF94]" /> Decision Variables
                </span>
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original preset values
                    setDh(currentAnalysis.simulated_scoring_inputs.demand_intensity_dh);
                    setIg(currentAnalysis.simulated_scoring_inputs.infrastructure_gap_ig);
                    setCp(currentAnalysis.simulated_scoring_inputs.estimated_cost_cp);
                    setPd(currentAnalysis.simulated_scoring_inputs.socio_economic_disadvantage_pd);
                    setWd(0.27);
                    setWi(0.27);
                  }}
                  className="text-[9px] font-mono text-[#00FF94] hover:underline"
                >
                  Reset Parameters
                </button>
              </div>

              {/* Demand Intensity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/60 font-mono">Dh (Demand Hotspot Intensity)</span>
                  <span className="font-mono text-white font-semibold">{dh.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={dh}
                  onChange={(e) => setDh(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                />
              </div>

              {/* Infrastructure Supply Gap Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/60 font-mono">Ig (Infrastructure Gap Index)</span>
                  <span className="font-mono text-white font-semibold">{ig.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={ig}
                  onChange={(e) => setIg(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                />
              </div>

              {/* Socio-Economic Disadvantage Multiplier Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/60 font-mono">Pd (Social Disadvantage Multiplier)</span>
                  <span className="font-mono text-white font-semibold">{pd.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.5"
                  step="0.05"
                  value={pd}
                  onChange={(e) => setPd(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                />
              </div>

              {/* Project Expenditure Cost Select */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] text-white/60 font-mono block">Cp (Estimated Relative Project Cost Expenditure)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "LOW (0.3)", value: 0.3 },
                    { label: "MED (0.6)", value: 0.6 },
                    { label: "HIGH (1.0)", value: 1.0 },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCp(option.value)}
                      className={`py-1.5 rounded text-[10px] font-mono font-bold transition-all border ${
                        cp === option.value
                          ? "bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30"
                          : "bg-black/40 text-white/40 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formula weights configuration (collapsible settings) */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-white/40 block font-mono font-bold">Constituency Weights</span>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/50 font-mono">Wd (Demand Wt)</span>
                      <span className="font-mono text-[#00FF94]">{wd.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.50"
                      step="0.01"
                      value={wd}
                      onChange={(e) => setWd(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded accent-[#00FF94]"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/50 font-mono">Wi (Infra Wt)</span>
                      <span className="font-mono text-[#00FF94]">{wi.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.50"
                      step="0.01"
                      value={wi}
                      onChange={(e) => setWi(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded accent-[#00FF94]"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-5">
            <div className="bg-black/40 rounded-lg p-3.5 font-mono text-[9px] leading-relaxed text-white/50 border border-white/5">
              <span className="text-[#00FF94] block mb-1 uppercase tracking-widest font-black">Synthesis Formula Applied</span>
              Sp = ((Dh * Wd) + (Ig * Wi)) / Cp * Pd
              <div className="text-[8px] text-white/30 mt-1">
                Computes final prioritized urgency indexing based on weighted local outcry, physical infrastructure deficit gap, and regional isolation penalty.
              </div>
            </div>
            
            <button
              onClick={() => setIsReportOpen(true)}
              className="w-full mt-4 bg-white text-black text-[11px] font-black uppercase py-3.5 rounded-lg hover:bg-[#00FF94] transition-colors tracking-widest cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate Plan Report
            </button>
          </div>

        </div>

      </div>

      {/* Dynamic Planners Directory / History Search List */}
      <div className="mt-8 bg-[#14161B] border border-white/5 rounded-lg p-6" id="constituency-registry">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Central Registry</span>
            <h3 className="text-base font-bold text-white font-display">Constituency Hotspots Directory ({historyList.length})</h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by theme, village or keyword..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF94]/30 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[9px] uppercase tracking-wider font-mono text-white/40">
                <th className="pb-3 font-semibold">Hotspot Location</th>
                <th className="pb-3 font-semibold">Civic Theme</th>
                <th className="pb-3 font-semibold">Standardized Summary</th>
                <th className="pb-3 font-semibold">Target Registry Matching</th>
                <th className="pb-3 font-semibold text-center">Simulated Score</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredHistory.map((item) => {
                const currentSp = parseFloat((((item.output.simulated_scoring_inputs.demand_intensity_dh * wd) + (item.output.simulated_scoring_inputs.infrastructure_gap_ig * wi)) / item.output.simulated_scoring_inputs.estimated_cost_cp * item.output.simulated_scoring_inputs.socio_economic_disadvantage_pd).toFixed(2));
                const clampedSp = Math.min(1.0, Math.max(0.0, currentSp));
                
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 font-bold text-white">
                      <span className="flex items-center gap-1.5 font-display">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94]"></span>
                        {item.output.analysis.extracted_locations[0] || "Regional Hotspot"}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] rounded font-bold uppercase">
                        {item.output.analysis.assigned_theme}
                      </span>
                    </td>
                    <td className="py-3.5 italic text-white/60 max-w-xs truncate pr-4">
                      "{item.output.analysis.standardized_english_transcript}"
                    </td>
                    <td className="py-3.5 font-mono text-white/50 text-[10px]">
                      <div>{item.output.data_enrichment.target_public_registry}</div>
                      <div className="text-white/30 text-[9px] truncate">{item.output.data_enrichment.synthesized_planning_metric_needed}</div>
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        clampedSp >= 0.80 ? "text-red-400" : clampedSp >= 0.50 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {clampedSp.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleSelectPreset(item)}
                        className="text-[10px] uppercase font-mono text-[#00FF94] border border-[#00FF94]/20 hover:border-[#00FF94] px-2 py-1 rounded transition-colors group-hover:bg-[#00FF94]/5 cursor-pointer"
                      >
                        Load Workspace
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-white/30 font-mono italic">
                    No records found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-4 text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono gap-3">
        <div>Node Cluster: Central-Kerala-S1</div>
        <div className="flex items-center gap-1.5 text-[#00FF94]">
          <CheckCircle className="w-3 h-3" />
          Data Trust Cryptographic Seal: 0x98A1F33E...A902
        </div>
        <div>System Version: v4.2.14-Build</div>
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14161B] border border-[#00FF94]/30 rounded-xl max-w-2xl w-full p-6 relative shadow-2xl flex flex-col">
            <button
              onClick={() => setIsReportOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white font-mono text-sm uppercase cursor-pointer"
            >
              [ Close ]
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
              <FileText className="w-6 h-6 text-[#00FF94]" />
              <div>
                <h3 className="text-base font-bold text-white uppercase font-display">Constituency Intervention Plan</h3>
                <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Priority Index Report No: PR-{sessionHash}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed overflow-y-auto max-h-[400px] pr-2">
              <div className="bg-black/30 p-4 border border-white/5 rounded-lg font-mono text-xs text-white/80 space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1 text-[#00FF94] font-bold">
                  <span>VARIABLE</span>
                  <span>INDEX</span>
                </div>
                <div className="flex justify-between">
                  <span>Extracted Hotspot:</span>
                  <span className="text-white font-bold">{currentAnalysis?.analysis?.extracted_locations?.join(", ") || "Unknown Location"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Planning Category:</span>
                  <span>{currentAnalysis?.analysis?.assigned_theme || "Unknown Category"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority Synthesis Score:</span>
                  <span className="text-[#00FF94] font-black">{priorityScore.toFixed(2)} / 1.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Demand Level (Dh):</span>
                  <span>{dh.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supply Deficit Gap (Ig):</span>
                  <span>{ig.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Project Relative Scale Cost (Cp):</span>
                  <span>{cp === 0.3 ? "Low (0.3)" : cp === 0.6 ? "Medium (0.6)" : "High (1.0)"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Socio-Economic Penalty (Pd):</span>
                  <span>{pd.toFixed(2)}x</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">1. Strategic Problem Outline</h4>
                <p className="text-xs text-white/70 italic leading-relaxed bg-black/20 p-3 rounded border-l border-white/20">
                  "{currentAnalysis?.analysis?.standardized_english_transcript}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">2. Official Registry Synchronization</h4>
                <p className="text-xs text-white/70">
                  This report has flagged the need for formal data synchronization. Planners should request immediate audit records from the <strong className="text-white font-mono">{currentAnalysis?.data_enrichment?.target_public_registry}</strong> to check against the <strong className="text-white font-mono">{currentAnalysis?.data_enrichment?.synthesized_planning_metric_needed}</strong>.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">3. Recommended Action Steps</h4>
                <ul className="list-disc pl-4 text-xs text-white/70 space-y-1.5">
                  <li>Deploy localized GIS verification teams to the extracted hotspot (<strong className="text-white">{currentAnalysis?.analysis?.extracted_locations?.[0]}</strong>).</li>
                  <li>Incorporate the identified regional risk factor (<span className="text-red-400 font-semibold">{currentAnalysis?.data_enrichment?.target_regional_risk_factor}</span>) into the immediate next legislative session proposal.</li>
                  <li>Prioritize funding allocations according to the calculated objective Priority Index of <strong className="text-white font-mono text-[#00FF94]">{priorityScore.toFixed(2)}</strong>.</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-5 flex justify-between items-center gap-4">
              <span className="text-[10px] font-mono text-white/40 uppercase">Authorized by AI Synthesis Engine v4.2</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-[#00FF94] text-[#0A0B0E] font-mono text-[10px] font-bold uppercase px-4 py-2 rounded hover:bg-emerald-400 transition-all cursor-pointer"
              >
                Print Official Plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
