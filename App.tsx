/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { GeneratedImage, ComplexityLevel, VisualStyle, Language, SearchResultItem } from './types';
import { 
  researchTopicForPrompt, 
  generateInfographicImage, 
  editInfographicImage,
} from './services/geminiService';
import Infographic from './components/Infographic';
import Loading from './components/Loading';
import IntroScreen from './components/IntroScreen';
import SearchResults from './components/SearchResults';
import { Search, AlertCircle, History, GraduationCap, Palette, Microscope, Atom, Compass, Globe, Key, CreditCard, ExternalLink, DollarSign, Activity, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [topic, setTopic] = useState('');
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('High School');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('Default');
  const [language, setLanguage] = useState<Language>('English');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingFacts, setLoadingFacts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [currentSearchResults, setCurrentSearchResults] = useState<SearchResultItem[]>([]);
  
  // Enforce dark mode for C4 theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  // Check for API Key on Mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        setError(null);
      } catch (e) {
        console.error("Failed to open key selector:", e);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!topic.trim()) {
        setError("Please enter a topic to visualize.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep(1);
    setLoadingFacts([]);
    setCurrentSearchResults([]);
    setLoadingMessage(`INITIATING RESEARCH PROTOCOL...`);

    try {
      const researchResult = await researchTopicForPrompt(topic, complexityLevel, visualStyle, language);
      
      setLoadingFacts(researchResult.facts);
      setCurrentSearchResults(researchResult.searchResults);
      
      setLoadingStep(2);
      setLoadingMessage(`CONSTRUCTING VISUAL MATRIX...`);
      
      let base64Data = await generateInfographicImage(researchResult.imagePrompt);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        data: base64Data,
        prompt: topic,
        timestamp: Date.now(),
        level: complexityLevel,
        style: visualStyle,
        language: language
      };

      setImageHistory([newImage, ...imageHistory]);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("Requested entity was not found") || err.message.includes("404") || err.message.includes("403"))) {
          setError("ACCESS DENIED. API key lacks required permissions. Please select a billing-enabled project.");
          setHasApiKey(false);
      } else {
          setError('SYSTEM FAILURE. The generation service is temporarily unavailable.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleEdit = async (editPrompt: string) => {
    if (imageHistory.length === 0) return;
    const currentImage = imageHistory[0];
    setIsLoading(true);
    setError(null);
    setLoadingStep(2);
    setLoadingMessage(`PROCESSING MODIFICATION: "${editPrompt.toUpperCase()}"...`);

    try {
      const base64Data = await editInfographicImage(currentImage.data, editPrompt);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        data: base64Data,
        prompt: editPrompt,
        timestamp: Date.now(),
        level: currentImage.level,
        style: currentImage.style,
        language: currentImage.language
      };
      setImageHistory([newImage, ...imageHistory]);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("Requested entity was not found") || err.message.includes("404") || err.message.includes("403"))) {
          setError("ACCESS DENIED. Please select a valid API key with billing enabled.");
          setHasApiKey(false);
      } else {
          setError('MODIFICATION FAILED. Try a different command.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const restoreImage = (img: GeneratedImage) => {
     const newHistory = imageHistory.filter(i => i.id !== img.id);
     setImageHistory([img, ...newHistory]);
  };

  const KeySelectionModal = () => (
    <div className="fixed inset-0 z-[200] bg-brand-void/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-slate-900/60 border border-brand-orange/50 rounded-lg shadow-[0_0_50px_rgba(249,115,22,0.2)] max-w-md w-full p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange to-brand-red"></div>
            
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mb-2 border border-brand-orange/30 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <CreditCard className="w-8 h-8" />
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h2 className="text-2xl font-orbitron font-bold text-white tracking-wide">
                        ACCESS RESTRICTED
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                        This interface requires premium Gemini 3 Pro models.
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Authorize with a Google Cloud Project that has <span className="font-bold text-brand-orange">Billing Enabled</span>.
                    </p>
                </div>

                <div className="bg-slate-950/50 border border-white/10 rounded-lg p-4 w-full text-left">
                    <div className="flex items-start gap-3">
                         <div className="p-1.5 bg-brand-orange/10 rounded text-brand-orange shrink-0">
                            <DollarSign className="w-4 h-4" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-bold font-orbitron text-slate-200">BILLING REQUIRED</p>
                            <p className="text-xs text-slate-400">
                                Standard API keys will fail protocol. Verify billing status.
                            </p>
                             <a 
                                href="https://ai.google.dev/gemini-api/docs/billing" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 mt-1"
                            >
                                VIEW DOCUMENTATION <ExternalLink className="w-3 h-3" />
                            </a>
                         </div>
                    </div>
                </div>

                <button 
                    onClick={handleSelectKey}
                    className="w-full py-4 bg-brand-gradient hover:brightness-110 text-white rounded font-orbitron font-bold tracking-wider shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 uppercase"
                >
                    <Key className="w-4 h-4" />
                    <span>Authorize Key</span>
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <>
    {!checkingKey && !hasApiKey && <KeySelectionModal />}

    {showIntro ? (
      <IntroScreen onComplete={() => setShowIntro(false)} />
    ) : (
    <div className="min-h-screen text-slate-200 font-sans pb-20 relative overflow-x-hidden animate-in fade-in duration-1000">
      
      {/* C4 Environmental Layers */}
      <div className="bg-void"></div>
      <div className="noise"></div>
      <div className="scanlines"></div>

      {/* Navbar */}
      <header className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-orange blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="bg-slate-900 p-2 rounded border border-white/10 relative z-10">
                   <Atom className="w-6 h-6 text-brand-orange animate-[spin_10s_linear_infinite]" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-orbitron font-bold text-xl tracking-wider text-white leading-none">
                INFOGENIUS
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-semibold mt-1">C4 Hyper-Glass System</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={handleSelectKey}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-brand-orange text-xs font-orbitron tracking-wide transition-colors border border-white/10 hover:border-brand-orange/30"
              >
                <Key className="w-3.5 h-3.5" />
                <span>API KEY</span>
              </button>
              <div className="flex items-center gap-2 text-[10px] font-orbitron text-slate-500 border border-white/5 px-2 py-1 rounded bg-black/20">
                  <Activity className="w-3 h-3 text-brand-orange" />
                  <span>SYSTEM ONLINE</span>
              </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8 relative z-10">
        
        <div className={`max-w-6xl mx-auto transition-all duration-500 ${imageHistory.length > 0 ? 'mb-8' : 'min-h-[70vh] flex flex-col justify-center'}`}>
          
          {!imageHistory.length && (
            <div className="text-center mb-16 space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-brand-orange/30 text-brand-orange text-[10px] font-orbitron tracking-[0.2em] shadow-[0_0_20px_rgba(249,115,22,0.1)] backdrop-blur-sm">
                <Zap className="w-3 h-3" /> Visual Intelligence Protocol
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-orbitron font-bold text-white tracking-tight leading-none">
                VISUALIZE <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-red-500 to-indigo-600">THE VOID</span>
              </h1>
              <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
                Execute deep-dive research and generate tactical infographics with Google search grounding.
              </p>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleGenerate} className={`relative z-20 transition-all duration-300 ${isLoading ? 'opacity-50 pointer-events-none blur-sm' : ''}`}>
            
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-orange via-red-600 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-xl"></div>
                
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                    
                    {/* Main Input */}
                    <div className="relative flex items-center mb-4">
                        <Search className="absolute left-6 w-5 h-5 text-slate-500 group-focus-within:text-brand-orange transition-colors" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="ENTER QUERY PARAMETERS..."
                            className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-xl outline-none text-lg md:text-xl placeholder:text-slate-600 font-medium text-white focus:border-brand-orange/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all font-sans"
                        />
                        {/* Decorative Corner Markers */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 rounded-tl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 rounded-br pointer-events-none"></div>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-col md:flex-row gap-3">
                    
                    {/* Level Selector */}
                    <div className="flex-1 bg-slate-950/30 rounded-lg border border-white/5 px-4 py-3 flex items-center gap-3 hover:border-brand-orange/30 transition-colors group/item">
                        <div className="p-1.5 bg-slate-800 rounded text-brand-orange shrink-0">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col w-full overflow-hidden">
                            <label className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest">Target Class</label>
                            <select 
                                value={complexityLevel} 
                                onChange={(e) => setComplexityLevel(e.target.value as ComplexityLevel)}
                                className="bg-transparent border-none text-sm font-bold text-slate-200 focus:ring-0 cursor-pointer p-0 w-full hover:text-brand-orange transition-colors [&>option]:bg-slate-950 [&>option]:text-white"
                            >
                                <option value="Elementary">Elementary</option>
                                <option value="High School">High School</option>
                                <option value="College">College</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                    </div>

                    {/* Style Selector */}
                    <div className="flex-1 bg-slate-950/30 rounded-lg border border-white/5 px-4 py-3 flex items-center gap-3 hover:border-indigo-500/30 transition-colors group/item">
                         <div className="p-1.5 bg-slate-800 rounded text-indigo-400 shrink-0">
                            <Palette className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col w-full overflow-hidden">
                            <label className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest">Visual Mode</label>
                            <select 
                                value={visualStyle} 
                                onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                                className="bg-transparent border-none text-sm font-bold text-slate-200 focus:ring-0 cursor-pointer p-0 w-full hover:text-indigo-400 transition-colors [&>option]:bg-slate-950 [&>option]:text-white"
                            >
                                <option value="Default">Standard Scientific</option>
                                <option value="Minimalist">Minimalist</option>
                                <option value="Realistic">Photorealistic</option>
                                <option value="Cartoon">Graphic Novel</option>
                                <option value="Vintage">Vintage Lithograph</option>
                                <option value="Futuristic">Cyberpunk HUD</option>
                                <option value="3D Render">3D Isometric</option>
                                <option value="Sketch">Technical Blueprint</option>
                            </select>
                        </div>
                    </div>

                     {/* Language Selector */}
                     <div className="flex-1 bg-slate-950/30 rounded-lg border border-white/5 px-4 py-3 flex items-center gap-3 hover:border-emerald-500/30 transition-colors group/item">
                         <div className="p-1.5 bg-slate-800 rounded text-emerald-400 shrink-0">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col w-full overflow-hidden">
                            <label className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest">Output Lang</label>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="bg-transparent border-none text-sm font-bold text-slate-200 focus:ring-0 cursor-pointer p-0 w-full hover:text-emerald-400 transition-colors [&>option]:bg-slate-950 [&>option]:text-white"
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Mandarin">Mandarin</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Russian">Russian</option>
                            </select>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="flex flex-col w-full md:w-auto">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto h-full bg-brand-gradient text-white px-8 py-4 rounded-lg font-bold font-orbitron tracking-widest hover:brightness-110 transition-all shadow-[0_0_30px_rgba(249,115,22,0.4)] whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <Microscope className="w-5 h-5" />
                            <span>IGNITE</span>
                        </button>
                    </div>

                    </div>
                </div>
            </div>
          </form>
        </div>

        {isLoading && <Loading status={loadingMessage} step={loadingStep} facts={loadingFacts} />}

        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-950/20 border border-red-500/30 rounded-lg flex items-center gap-4 text-red-200 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-500" />
            <div className="flex-1">
                <p className="font-medium font-sans">{error}</p>
                {(error.includes("ACCESS DENIED") || error.includes("billing")) && (
                    <button 
                        onClick={handleSelectKey}
                        className="mt-2 text-xs font-bold text-red-400 underline hover:text-red-300 font-orbitron tracking-wide"
                    >
                        RE-AUTHENTICATE KEY
                    </button>
                )}
            </div>
          </div>
        )}

        {imageHistory.length > 0 && !isLoading && (
            <>
                <Infographic 
                    image={imageHistory[0]} 
                    onEdit={handleEdit} 
                    isEditing={isLoading}
                />
                <SearchResults results={currentSearchResults} />
            </>
        )}

        {imageHistory.length > 1 && (
            <div className="max-w-7xl mx-auto mt-24 border-t border-white/5 pt-12">
                <h3 className="text-xs font-bold text-slate-500 font-orbitron uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <History className="w-4 h-4 text-brand-orange" />
                    Archive Log
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {imageHistory.slice(1).map((img) => (
                        <div 
                            key={img.id} 
                            onClick={() => restoreImage(img)}
                            className="group relative cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-brand-orange/50 transition-all shadow-lg bg-slate-900/40 backdrop-blur-sm"
                        >
                            <img src={img.data} alt={img.prompt} className="w-full aspect-video object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 pt-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-[10px] text-white font-bold truncate mb-1 font-orbitron tracking-wide">{img.prompt}</p>
                                <div className="flex gap-2">
                                    {img.level && <span className="text-[8px] text-brand-orange uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-orange-950/50 border border-brand-orange/20">{img.level}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
    )}
    </>
  );
};

export default App;